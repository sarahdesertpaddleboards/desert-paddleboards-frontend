import { SITE_URL, business } from "@/data/site";
import { fareHarborBookUrl, type Experience } from "@/data/locations";
import type { UpcomingSession } from "@/lib/experiencesApi";

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
    startDate: session.startAt,
    endDate: session.endAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: placeLd(exp),
    image: [exp.image],
    organizer: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      url: fareHarborBookUrl(exp.itemId),
      availability: session.isSoldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };
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
