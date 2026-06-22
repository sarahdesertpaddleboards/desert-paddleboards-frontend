/**
 * Google Analytics 4 — loaded ONLY when VITE_GA4_ID is set. The site runs
 * fine without it; analytics switches on the moment Sarah creates a GA4
 * property and the Measurement ID (G-XXXXXXX) is added as the VITE_GA4_ID
 * env var / GitHub secret. Client-only and SSG-safe (no-ops during prerender).
 *
 * We send page_view manually on each route change because this is a single-
 * page app — gtag's automatic page_view only fires on the first hard load.
 */
export const GA_ID = import.meta.env.VITE_GA4_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

/** Inject gtag.js once (client-side). Safe to call repeatedly. */
export function initAnalytics(): void {
  if (loaded || typeof window === "undefined" || !GA_ID) return;
  loaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // Standard gtag shim — queues calls into dataLayer until gtag.js loads.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

/** Record a SPA page view. */
export function trackPageView(path: string): void {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Record a custom event (e.g. a Book click). No-ops if analytics is off. */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
