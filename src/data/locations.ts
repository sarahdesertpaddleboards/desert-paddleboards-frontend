/**
 * FareHarbor experiences — single source of truth for /locations pages.
 *
 * Data was seeded from Sarah's live FareHarbor account (shortname
 * "desertpaddleboards", company pk 38694) in June 2026.
 *
 * IMPORTANT — content model:
 *  - The `blurb` text here is EVERGREEN copy and is currently DRAFT.
 *    Sarah should review/refine these. Do NOT paste FareHarbor's own
 *    headlines in here — those are date-specific ("Join us June 6th!")
 *    and go stale weekly. Live dates/availability/pricing come from the
 *    FareHarbor embed at booking time, not from this file.
 *  - `image` currently hot-links FareHarbor's CDN. TODO: download and
 *    self-host these in /public for performance + reliability before launch.
 */

export const FAREHARBOR_SHORTNAME = "desertpaddleboards";

/** Lightframe booking URL for a FareHarbor item. */
export function fareHarborBookUrl(itemId: number): string {
  return `https://fareharbor.com/embeds/book/${FAREHARBOR_SHORTNAME}/items/${itemId}/?full-items=yes`;
}

export type ExperienceKind = "soundbath" | "class" | "membership";

export interface Experience {
  /** FareHarbor item pk */
  itemId: number;
  slug: string;
  /** Short display title (no dates) */
  title: string;
  /** Host venue, e.g. "Canopy by Hilton" ("" if none) */
  venue: string;
  city: string;
  state: string;
  /** Venue coordinates (from FareHarbor primary_location) for the map + distance */
  lat: number;
  lng: number;
  kind: ExperienceKind;
  /** Evergreen description — DRAFT, pending Sarah's review */
  blurb: string;
  /** FareHarbor CDN image (TODO: self-host) */
  image: string;
  featured?: boolean;
}

export const experiences: Experience[] = [
  {
    itemId: 709135,
    slug: "floating-soundbath-canopy-hilton-tempe",
    title: "Rooftop Floating Soundbath",
    venue: "Canopy by Hilton",
    city: "Tempe",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "Float weightlessly on the water as live sound washes over you, high above the city on the Canopy by Hilton rooftop pool in Tempe.",
    lat: 33.422201,
    lng: -111.937732,
    image: "https://cdn.filestackcontent.com/i0Np2qm1SHa2nzK9wMXx",
    featured: true,
  },
  {
    itemId: 725981,
    slug: "floating-soundbath-hotel-adeline-scottsdale",
    title: "Floating Soundbath with Live Music",
    venue: "Hotel Adeline",
    city: "Scottsdale",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "A floating meditation set to live music at Hotel Adeline in Scottsdale — drift, breathe, and let go.",
    lat: 33.51104,
    lng: -111.92462,
    image: "https://cdn.filestackcontent.com/f1OgGIzzRFmzbAYHYnqW",
  },
  {
    itemId: 728366,
    slug: "floating-soundbath-doubletree-gilbert",
    title: "Floating Soundbath with Live Music",
    venue: "DoubleTree by Hilton",
    city: "Gilbert",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "Unwind on the water with a floating meditation and live music at the DoubleTree by Hilton in Gilbert.",
    lat: 33.317033,
    lng: -111.743508,
    image: "https://cdn.filestackcontent.com/N1IhadaQJur3pehMENXg",
  },
  {
    itemId: 578969,
    slug: "floating-soundbath-jw-marriott-desert-ridge-phoenix",
    title: "Floating Soundbath",
    venue: "JW Marriott Desert Ridge — Revive Spa",
    city: "Phoenix",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "A spa-day soundbath at the Revive Spa pool, JW Marriott Desert Ridge in Phoenix. Float, restore, and reset.",
    lat: 33.684112,
    lng: -111.965534,
    image: "https://cdn.filestackcontent.com/CU4nIYeOQodsGhrhZBBw",
  },
  {
    itemId: 626146,
    slug: "floating-soundbath-aji-spa-sheraton-grand-chandler",
    title: "Floating Soundbath",
    venue: "Aji Spa — Sheraton Grand at Wild Horse Pass",
    city: "Chandler",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "A serene floating soundbath at Aji Spa, Sheraton Grand at Wild Horse Pass — desert calm on the water.",
    lat: 33.00863,
    lng: -111.94364,
    image: "https://cdn.filestackcontent.com/VPmBIgASEyIo57cg78j9",
  },
  {
    itemId: 636156,
    slug: "floating-soundbath-lemonds-spa-wigwam-litchfield-park",
    title: "Floating Soundbath",
    venue: "LeMonds Spa — The Wigwam",
    city: "Litchfield Park",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "A floating soundbath at the historic Wigwam resort's LeMonds Spa in Litchfield Park.",
    lat: 33.496679,
    lng: -112.357527,
    image: "https://cdn.filestackcontent.com/8vc5VkiQUqWSg9yG0WFF",
  },
  {
    itemId: 344396,
    slug: "superstition-shadows-floating-soundbath-apache-junction",
    title: "Superstition Shadows Floating Soundbath",
    venue: "",
    city: "Apache Junction",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "Float beneath the Superstition Mountains as the desert light fades — a soundbath in Apache Junction.",
    lat: 33.392842,
    lng: -111.557638,
    image: "https://cdn.filestackcontent.com/sqrTR58YQq2Ru4MBETmC",
  },
  {
    itemId: 627535,
    slug: "sunset-floating-soundbath-skyline-pool-mesa",
    title: "Sunset Floating Soundbath at Skyline Pool",
    venue: "Skyline Pool",
    city: "Mesa",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "The Floating Nap™ — as seen on TikTok. A sunset soundbath on the water at Skyline Pool in Mesa.",
    lat: 33.399801,
    lng: -111.614372,
    image: "https://cdn.filestackcontent.com/yKfM7hUnRuexWsM6b0KL",
    featured: true,
  },
  {
    itemId: 648798,
    slug: "mulberry-community-floating-soundbath-mesa",
    title: "Mulberry Community Floating Soundbath",
    venue: "Mulberry",
    city: "Mesa",
    state: "AZ",
    kind: "soundbath",
    blurb:
      "A community floating soundbath at Mulberry in Mesa — now open to the public.",
    lat: 33.368099,
    lng: -111.605824,
    image: "https://cdn.filestackcontent.com/qJlOZtLS8b3MwCH5Wjtg",
  },
  {
    itemId: 146434,
    slug: "lazy-river-water-aerobics-floating-yoga-mesa",
    title: "Lazy River Water Aerobics & Floating Yoga",
    venue: "Mesa Aquatics Complex",
    city: "Mesa",
    state: "AZ",
    kind: "class",
    blurb:
      "A 90-minute high-energy aquatic workout — water aerobics plus floating yoga and surf fitness at the Mesa Aquatics Complex.",
    lat: 33.396339,
    lng: -111.795887,
    image: "https://cdn.filestackcontent.com/1UEnWJiQLm4Miz06WkdH",
  },
];

/** The summer membership product (its own page, not a /locations entry). */
export const membership: Experience = {
  itemId: 633768,
  slug: "summer-fitness-paddleboard-yoga-membership",
  title: "Summer Fitness + Paddleboard Yoga Membership",
  venue: "",
  city: "Arizona",
  state: "AZ",
  lat: 33.4484,
  lng: -112.074,
  kind: "membership",
  blurb:
    "Classes every Tuesday all summer long. Buy the whole season as a membership and save.",
  image: "https://cdn.filestackcontent.com/C3V95cP7Tmqsirm0hh8A",
  featured: true,
};

export function getExperienceBySlug(slug: string): Experience | undefined {
  if (slug === membership.slug) return membership;
  return experiences.find((e) => e.slug === slug);
}
