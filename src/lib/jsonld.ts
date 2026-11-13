import { SITE_URL, business } from "@/data/site";
import { experiences, fareHarborBookUrl, type Experience } from "@/data/locations";
import type { UpcomingSession } from "@/lib/experiencesApi";
import upcoming from "@/data/upcoming.generated.json";

const ORG_ID = `${SITE_URL}/#organization`;

/**
 * The business — one LocalBusiness node (a HealthAndBeautyBusiness subtype),
 * referenced by @id from every other node. It's a mobile business, so it has
 * `areaServed` and deliberately NO `address`/`geo` (the office stays private).
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": ORG_ID,
    name: business.name,
    description: business.description,
    url: SITE_URL,
    logo: business.logo,
    image: business.logo,
    email: business.email,
    telephone: business.telephone,
    priceRange: business.priceRange,
    areaServed: [
      ...business.areaServed.map((name) => ({ "@type": "City", name })),
      { "@type": "State", name: "Arizona" },
    ],
    knowsAbout: ["Floating sound bath", "Sound bath", "Sound healing", "Paddleboard yoga"],
    sameAs: business.sameAs,
  };
}

/** WebSite — site-wide. */
export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: business.name,
    publisher: { "@id": ORG_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

/** Place (venue) for an experience. */
function placeLd(exp: Experience) {
  return {
    "@type": "Place",
    name: exp.venue || exp.title,
    address: {
      "@type": "PostalAddress",
      // Full street line — Google needs it to place the event in local
      // "things to do" results.
      ...(exp.street ? { streetAddress: exp.street } : {}),
      addressLocality: exp.city,
      addressRegion: exp.state,
      ...(exp.postalCode ? { postalCode: exp.postalCode } : {}),
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: exp.lat,
      longitude: exp.lng,
    },
  };
}

/** A single dated Event (floating sound bath session). */
export function eventLd(exp: Experience, session: UpcomingSession) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${exp.title}${exp.venue ? ` at ${exp.venue}` : ""} — ${exp.city}`,
    description: exp.blurb,
    url: `${SITE_URL}/locations/${exp.slug}`,
    startDate: session.startAt,
    endDate: session.endAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: placeLd(exp),
    image: [exp.image.startsWith("http") ? exp.image : `${SITE_URL}${exp.image}`],
    organizer: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      // Untagged on purpose: clicks on this URL come from Google, not from our
      // pages, so the site's utm_source would misattribute them.
      url: fareHarborBookUrl(exp.itemId),
      ...(typeof exp.price === "number"
        ? { price: exp.price.toFixed(2), priceCurrency: "USD" }
        : {}),
      availability: session.isSoldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };
}

/**
 * Event nodes for upcoming FareHarbor sessions, soonest first — optionally
 * just one venue's. Built from upcoming.generated.json, which
 * scripts/generate-seo-data.mjs fills from FareHarbor's item-calendar API on
 * every build, so the markup tracks the live schedule as of the last deploy.
 * Sessions for items that aren't a listed venue (no page to describe them)
 * are skipped.
 */
export function fareHarborEventsLd({ itemId, limit }: { itemId?: number; limit?: number } = {}) {
  const byId = new Map(experiences.map((e) => [e.itemId, e]));
  const now = Date.now();
  return (upcoming.sessions as UpcomingSession[])
    .filter((s) => (itemId === undefined || s.itemId === itemId) && Date.parse(s.startAt) > now)
    .filter((s) => byId.has(s.itemId))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, limit)
    .map((s) => eventLd(byId.get(s.itemId)!, s));
}

/** FAQPage — enables rich Q&A results in search. */
export function faqPageLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Wrap a page's LD nodes in a single @graph for one <script> tag. The
 * site-wide business + WebSite nodes are always included, so every page ships
 * exactly one graph. A page node with the same @id (e.g. the About page's
 * richer business node) is merged into the site node instead of duplicated.
 */
export function graph(nodes: object[]) {
  const out: Record<string, unknown>[] = [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const n of [organizationLd(), webSiteLd(), ...nodes]) {
    const { "@context": _ctx, ...node } = n as Record<string, unknown>;
    const id = typeof node["@id"] === "string" ? node["@id"] : undefined;
    const existing = id ? byId.get(id) : undefined;
    if (existing) {
      Object.assign(existing, node);
      continue;
    }
    if (id) byId.set(id, node);
    out.push(node);
  }
  return { "@context": "https://schema.org", "@graph": out };
}
