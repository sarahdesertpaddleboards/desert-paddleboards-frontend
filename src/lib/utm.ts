import { defaultUrlTransform } from "react-markdown";

/**
 * UTM capture + forward. Ads/social links arrive with utm_* params; GA4 reads
 * them automatically for its own attribution. We also persist them and append
 * them to the OUTBOUND booking/registration links (FareHarbor, city sites) so
 * attribution survives the hand-off — this pays off once FareHarbor-side
 * tracking is enabled (it fires the conversion on the actual booking).
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Call once on load — store any utm_* from the URL for the session. */
export function persistUtms(): void {
  if (typeof window === "undefined") return;
  try {
    const qs = new URLSearchParams(window.location.search);
    for (const k of UTM_KEYS) {
      const v = qs.get(k);
      if (v) sessionStorage.setItem(k, v);
    }
  } catch {
    /* sessionStorage unavailable (private mode etc.) — ignore */
  }
}

/** Append any stored utm_* to an outbound URL (no-op if none stored). */
export function appendUtms(url: string): string;
export function appendUtms(url: string | undefined): string | undefined;
export function appendUtms(url: string | undefined): string | undefined {
  if (typeof window === "undefined" || !url) return url;
  let pairs: string[] = [];
  try {
    pairs = UTM_KEYS.map((k) => [k, sessionStorage.getItem(k)] as const)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
  } catch {
    return url;
  }
  if (pairs.length === 0) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${pairs.join("&")}`;
}

// ---------------------------------------------------------------------------
// Outbound FareHarbor links
// ---------------------------------------------------------------------------

/** Defaults for a booking hand-off that didn't arrive with a tagged campaign. */
const FAREHARBOR_UTM_SOURCE = "desertpaddleboards.com";
const FAREHARBOR_UTM_MEDIUM = "website";

/** True for any fareharbor.com URL (booking lightframes, gift flows). */
export function isFareHarborUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?fareharbor\.com\//i.test(url);
}

/** utm values: lowercase, no spaces/slashes, so GA4 doesn't split them. */
function utmValue(v: string): string {
  return (
    v
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, "")
      .replace(/[\s/]+/g, "_") || "home"
  );
}

/**
 * THE way to build an outbound FareHarbor href — every booking/gift link on
 * the site goes through here so they're all tagged the same way:
 *
 *   utm_source=desertpaddleboards.com  utm_medium=website
 *   utm_campaign=<page the link is on, e.g. "calendar", "locations_kino-…">
 *   utm_content=<which link on that page, e.g. "book_button", "top_banner">
 *
 * Deterministic on purpose: it produces the same URL at prerender and in the
 * browser, so hydration never mismatches. A visitor who arrived on a tagged ad
 * or email link keeps THAT attribution instead — see forwardVisitorUtms().
 * Non-FareHarbor URLs are returned untouched.
 */
export function fareHarborUrl(
  url: string,
  { page, placement }: { page: string; placement: string },
): string {
  if (!isFareHarborUrl(url)) return url;
  const u = new URL(url);
  for (const k of UTM_KEYS) u.searchParams.delete(k);
  u.searchParams.set("utm_source", FAREHARBOR_UTM_SOURCE);
  u.searchParams.set("utm_medium", FAREHARBOR_UTM_MEDIUM);
  u.searchParams.set("utm_campaign", utmValue(page));
  u.searchParams.set("utm_content", utmValue(placement));
  return u.toString();
}

/**
 * Call once on load. If this visitor arrived with utm_* (stored by
 * persistUtms), swap them onto a FareHarbor link at the moment it's activated,
 * replacing the site defaults — so a booking from an Instagram ad is credited
 * to the ad, not to "desertpaddleboards.com / website".
 *
 * Done at activation rather than render because the prerendered HTML can't
 * know the visitor's UTMs, and React doesn't patch attribute mismatches on
 * hydration. pointerdown/keydown run before FareHarbor's capture-phase click
 * listener reads the href to open the lightframe.
 */
export function forwardVisitorUtms(): void {
  if (typeof window === "undefined") return;
  const swap = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a || !isFareHarborUrl(a.href)) return;
    let stored: [string, string][] = [];
    try {
      stored = UTM_KEYS.map((k) => [k, sessionStorage.getItem(k) ?? ""] as [string, string]).filter(
        ([, v]) => v,
      );
    } catch {
      return;
    }
    if (stored.length === 0) return;
    const u = new URL(a.href);
    for (const k of UTM_KEYS) u.searchParams.delete(k);
    for (const [k, v] of stored) u.searchParams.set(k, v);
    a.href = u.toString();
  };
  document.addEventListener("pointerdown", swap, true);
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") swap(e);
    },
    true,
  );
}

/**
 * react-markdown `urlTransform` that tags FareHarbor links inside markdown
 * content (blog posts, venue copy) the same way.
 */
export function markdownUrlTransform(page: string) {
  return (url: string): string =>
    isFareHarborUrl(url)
      ? fareHarborUrl(url, { page, placement: "content_link" })
      : defaultUrlTransform(url);
}
