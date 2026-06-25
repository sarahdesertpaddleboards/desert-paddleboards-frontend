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
