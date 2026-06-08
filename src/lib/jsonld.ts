import { SITE_URL, business } from "@/data/site";
import { fareHarborBookUrl, type Experience } from "@/data/locations";
import type { UpcomingSession } from "@/lib/experiencesApi";

const postalAddress = {
  "@type": "PostalAddress",
  addressLocality: business.address.locality,
  addressRegion: business.address.region,
  addressCountry: business.address.country,
};

/** Organization — site-wide identity. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: business.name,
    url: SITE_URL,
    logo: business.logo,
    email: business.email,
    telephone: business.telephone,
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
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** LocalBusiness — richer local entity for the homepage. */
export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: business.name,
    description: business.description,
    url: SITE_URL,
    image: business.logo,
    telephone: business.telephone,
    email: business.email,
    priceRange: business.priceRange,
    address: postalAddress,
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    },
    areaServed: business.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    sameAs: business.sameAs,
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
      addressLocality: exp.city,
      addressRegion: exp.state,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: exp.lat,
      longitude: exp.lng,
    },
  };
}

/** A single dated Event (floating soundbath session). */
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
    organizer: {
      "@type": "Organization",
      name: business.name,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url: fareHarborBookUrl(exp.itemId),
      availability: session.isSoldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };
}

/** Wrap multiple LD nodes in a single @graph for one <script> tag. */
export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
