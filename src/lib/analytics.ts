/**
 * Web analytics — Google Analytics 4 and the Meta (Facebook) Pixel. Each loads
 * ONLY when its ID env var is set, so the site runs fine with neither, one, or
 * both. Client-only and SSG-safe (no-ops during prerender).
 *
 *   - GA4:        VITE_GA4_ID        (e.g. "G-XXXXXXX")
 *   - Meta Pixel: VITE_META_PIXEL_ID (a 15–16 digit number)
 *
 * Both IDs are public by design and get added as GitHub repo secrets of the
 * same name (the deploy workflow passes them through at build time).
 *
 * Page views are sent manually on each route change because this is a single-
 * page app — the vendors' automatic page_view only fires on the first load.
 */
export const GA_ID = import.meta.env.VITE_GA4_ID as string | undefined;
export const META_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

/** True if any analytics provider is configured. */
export const ANALYTICS_ENABLED = Boolean(GA_ID || META_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: unknown;
    };
    _fbq?: unknown;
  }
}

// Map our internal event names to Meta's standard events (which Meta optimizes
// ad delivery for). Anything not listed is sent as a Meta custom event.
const META_STANDARD_EVENTS: Record<string, string> = {
  book_click: "Schedule", // heading to FareHarbor to book a session
  generate_lead: "Lead", // event/contact inquiry submitted
  lead_contact_click: "Contact", // tapped the phone CTA on an event page
  shop_click: "InitiateCheckout", // heading to Stripe checkout
};

/**
 * Events the site emits, for reference when configuring GA4. Registering the
 * conversions as *key events* is a GA4 dashboard step (Admin → Events → mark as
 * key event) — it can't be done from code.
 *
 *   generate_lead       KEY EVENT. Params: form, event_type, headcount_bucket,
 *                       preferred_venue, page_path
 *   lead_contact_click  Phone CTA tapped. Params: method, form, page_path
 *   form_start          First field interaction — pair with generate_lead to get
 *                       form abandonment. Params: form, page_path
 *   book_click          Opening the FareHarbor booking lightframe
 *   shop_click          Heading to Stripe checkout
 */
export const TRACKED_EVENTS = [
  "generate_lead",
  "lead_contact_click",
  "form_start",
  "book_click",
  "shop_click",
] as const;

let loaded = false;

/** Inject the analytics scripts once (client-side). Safe to call repeatedly. */
export function initAnalytics(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  if (GA_ID) {
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

  if (META_ID) {
    // Standard Meta Pixel bootstrap, minus its automatic PageView — we fire
    // PageView ourselves on every route change (including the first).
    const fbq: Window["fbq"] = function fbq() {
      // eslint-disable-next-line prefer-rest-params
      fbq!.callMethod
        ? fbq!.callMethod!.apply(fbq, arguments as unknown as unknown[])
        : fbq!.queue!.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq("init", META_ID);
  }
}

/** Record a SPA page view in every configured provider. */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  if (window.gtag && GA_ID) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (window.fbq && META_ID) {
    window.fbq("track", "PageView");
  }
}

/** Record a conversion event (e.g. a Book click) in every provider. */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;

  if (window.gtag) window.gtag("event", name, params);

  if (window.fbq && META_ID) {
    const standard = META_STANDARD_EVENTS[name];
    if (standard === "InitiateCheckout") {
      window.fbq("track", standard, {
        value: params.value,
        currency: "USD",
        content_name: params.product,
      });
    } else if (standard) {
      window.fbq("track", standard);
    } else {
      window.fbq("trackCustom", name, params);
    }
  }
}
