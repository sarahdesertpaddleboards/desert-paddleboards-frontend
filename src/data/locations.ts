/**
 * FareHarbor experiences — single source of truth for /locations pages.
 *
 * HOW THIS WORKS (catalog + editorial overlay):
 *  - The live ITEM CATALOG (venue, city, coords, image, visibility flags)
 *    comes from FareHarbor's public API, snapshotted at build time into
 *    `fareharbor-items.generated.json` by scripts/generate-seo-data.mjs.
 *  - The EDITORIAL OVERLAY below holds only what humans own and FareHarbor
 *    can't give us cleanly: SEO slug, clean title, evergreen blurb, the
 *    `kind`, and `featured`. Overlay values win over catalog values.
 *  - `experiences` is the merge of the two, filtered to fixed-location
 *    soundbath/class venues. A NEW fixed-location venue added in FareHarbor
 *    appears on the site automatically (with a derived title/blurb) even
 *    before anyone writes an overlay for it — see AUTO-SURFACED below.
 *
 * Honouring visibility: items flagged Unlisted/Private/Archived/retail in
 * FareHarbor are excluded — even if they have an overlay entry. So unlisting
 * a venue in the dashboard removes it from the site on the next build.
 *
 * IMPORTANT — content model:
 *  - `blurb` is EVERGREEN copy and is currently DRAFT. Sarah should
 *    review/refine. Do NOT paste FareHarbor's date-specific headlines here
 *    ("Join us June 6th!") — those go stale weekly. Live dates/availability/
 *    pricing come from the FareHarbor embed at booking time, not this file.
 *  - `image` defaults to FareHarbor's CDN (via the catalog). An overlay
 *    `image` overrides it when we have a deliberately chosen shot.
 *    TODO (pre-launch): self-host these for performance + reliability.
 */
import catalogJson from "./fareharbor-items.generated.json";

export const FAREHARBOR_SHORTNAME = "desertpaddleboards";

/** Lightframe booking URL for a FareHarbor item. */
export function fareHarborBookUrl(itemId: number): string {
  return `https://fareharbor.com/embeds/book/${FAREHARBOR_SHORTNAME}/items/${itemId}/?full-items=yes`;
}

export type ExperienceKind = "soundbath" | "class" | "membership" | "private";

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
  /** Image URL (FareHarbor CDN by default; TODO: self-host) */
  image: string;
  featured?: boolean;
  /** True when this venue has no editorial overlay yet (auto-surfaced from FareHarbor). */
  needsCuration?: boolean;
}

// ---------------------------------------------------------------------------
// Catalog (generated)
// ---------------------------------------------------------------------------

interface CatalogItem {
  itemId: number;
  name: string;
  isUnlisted: boolean;
  isRetail: boolean;
  venue: string;
  city: string;
  state: string;
  street: string;
  postalCode: string;
  googlePlaceId: string;
  lat: number | null;
  lng: number | null;
  image: string;
}

const catalog: CatalogItem[] = (catalogJson.items ?? []) as CatalogItem[];
const byId = new Map(catalog.map((c) => [c.itemId, c]));

/**
 * Fixed-location venues whose FareHarbor primary_location has no lat/lng, so
 * the coords heuristic would miss them. Aji Spa's coords are supplied here.
 * Keep in sync with FORCE_LOCATION_IDS in scripts/generate-seo-data.mjs.
 */
const FORCE_LOCATION_IDS = new Set<number>([626146]);

/**
 * Venues to hide from the site even though FareHarbor still lists them.
 * (Sarah should also unlist/archive these in FareHarbor so they stop taking
 * bookings — this just removes them from the website.)
 */
const EXCLUDED_ITEM_IDS = new Set<number>([
  714583, // Arizona Grand Resort & Spa — no longer running this location (Sarah, Jun 2026)
]);

/** Is this catalog item a fixed-location experience the site should surface? */
function isLocationCatalogItem(c: CatalogItem): boolean {
  if (EXCLUDED_ITEM_IDS.has(c.itemId)) return false;
  if (c.isUnlisted || c.isRetail) return false;
  return (c.lat !== null && c.lng !== null) || FORCE_LOCATION_IDS.has(c.itemId);
}

// ---------------------------------------------------------------------------
// Editorial overlay
// ---------------------------------------------------------------------------

/** Human-owned metadata for a venue. Everything else comes from the catalog. */
interface Overlay {
  itemId: number;
  slug: string;
  title: string;
  blurb: string;
  kind?: ExperienceKind; // default "soundbath"
  /** Override the catalog venue name (e.g. nicer formatting). */
  venue?: string;
  /** Override the catalog city (e.g. FareHarbor has it wrong). */
  city?: string;
  /** Override coords (used when FareHarbor has none). */
  lat?: number;
  lng?: number;
  /** Override the catalog image with a deliberately chosen shot. */
  image?: string;
  featured?: boolean;
}

/**
 * Curated venues, in display order. The 8 venues without an explicit `image`
 * use FareHarbor's catalog image. Blurbs are DRAFT — Sarah to review.
 */
const LOCATION_OVERLAYS: Overlay[] = [
  {
    itemId: 709135,
    slug: "floating-soundbath-canopy-hilton-tempe",
    title: "Rooftop Floating Soundbath",
    venue: "Canopy by Hilton",
    blurb:
      "Float weightlessly on the water as live sound washes over you, high above the city on the Canopy by Hilton rooftop pool in Tempe.",
    image: "https://cdn.filestackcontent.com/i0Np2qm1SHa2nzK9wMXx",
    featured: true,
  },
  {
    itemId: 627535,
    slug: "sunset-floating-soundbath-skyline-pool-mesa",
    title: "Sunset Floating Soundbath at Skyline Pool",
    venue: "Skyline Pool",
    blurb:
      "The Floating Nap™ — as seen on TikTok. A sunset soundbath on the water at Skyline Pool in Mesa.",
    image: "https://cdn.filestackcontent.com/yKfM7hUnRuexWsM6b0KL",
    featured: true,
  },
  {
    itemId: 725981,
    slug: "floating-soundbath-hotel-adeline-scottsdale",
    title: "Floating Soundbath with Live Music",
    venue: "Hotel Adeline",
    blurb:
      "A floating meditation set to live music at Hotel Adeline in Scottsdale — drift, breathe, and let go.",
    image: "https://cdn.filestackcontent.com/f1OgGIzzRFmzbAYHYnqW",
  },
  {
    itemId: 728366,
    slug: "floating-soundbath-doubletree-gilbert",
    title: "Floating Soundbath with Live Music",
    venue: "DoubleTree by Hilton",
    blurb:
      "Unwind on the water with a floating meditation and live music at the DoubleTree by Hilton in Gilbert.",
    image: "https://cdn.filestackcontent.com/N1IhadaQJur3pehMENXg",
  },
  {
    itemId: 578969,
    slug: "floating-soundbath-jw-marriott-desert-ridge-phoenix",
    title: "Floating Soundbath",
    venue: "JW Marriott Desert Ridge — Revive Spa",
    blurb:
      "A spa-day soundbath at the Revive Spa pool, JW Marriott Desert Ridge in Phoenix. Float, restore, and reset.",
    image: "https://cdn.filestackcontent.com/CU4nIYeOQodsGhrhZBBw",
  },
  {
    itemId: 626146,
    slug: "floating-soundbath-aji-spa-sheraton-grand-chandler",
    title: "Floating Soundbath",
    venue: "Aji Spa — Sheraton Grand at Wild Horse Pass",
    city: "Chandler",
    // FareHarbor has no coords for Aji; set manually (Wild Horse Pass).
    lat: 33.00863,
    lng: -111.94364,
    blurb:
      "A serene floating soundbath at Aji Spa, Sheraton Grand at Wild Horse Pass — desert calm on the water.",
    image: "https://cdn.filestackcontent.com/VPmBIgASEyIo57cg78j9",
  },
  {
    itemId: 636156,
    slug: "floating-soundbath-lemonds-spa-wigwam-litchfield-park",
    title: "Floating Soundbath",
    venue: "LeMonds Spa — The Wigwam",
    blurb:
      "A floating soundbath at the historic Wigwam resort's LeMonds Spa in Litchfield Park.",
    image: "https://cdn.filestackcontent.com/8vc5VkiQUqWSg9yG0WFF",
  },
  {
    itemId: 344396,
    slug: "superstition-shadows-floating-soundbath-apache-junction",
    title: "Superstition Shadows Floating Soundbath",
    venue: "",
    blurb:
      "Float beneath the Superstition Mountains as the desert light fades — a soundbath in Apache Junction.",
    image: "https://cdn.filestackcontent.com/sqrTR58YQq2Ru4MBETmC",
  },
  {
    itemId: 648798,
    slug: "mulberry-community-floating-soundbath-mesa",
    title: "Mulberry Community Floating Soundbath",
    venue: "Mulberry",
    blurb:
      "A community floating soundbath at Mulberry in Mesa — now open to the public.",
    image: "https://cdn.filestackcontent.com/qJlOZtLS8b3MwCH5Wjtg",
  },
  {
    itemId: 712901,
    slug: "floating-soundbath-grand-hyatt-scottsdale",
    title: "Floating Soundbath",
    venue: "Grand Hyatt Scottsdale",
    blurb:
      "A floating soundbath with live music at the Grand Hyatt Scottsdale — sink into the water and let the desert evening settle.",
  },
  {
    itemId: 698585,
    slug: "rooftop-floating-soundbath-skysill-westin-tempe",
    title: "Rooftop Floating Soundbath",
    venue: "Skysill Rooftop Lounge — The Westin Tempe",
    blurb:
      "A rooftop floating soundbath at the Skysill Lounge atop The Westin Tempe — live music and city skyline above the water.",
  },
  {
    itemId: 708584,
    slug: "rooftop-floating-soundbath-omni-tempe",
    title: "Rooftop Floating Soundbath",
    venue: "Omni Tempe Hotel",
    blurb:
      "A rooftop floating soundbath at the Omni Tempe Hotel — float beneath the open sky as live sound washes over you.",
  },
  {
    itemId: 171055,
    slug: "floating-soundbath-kino-aquatics-mesa",
    title: "Floating Soundbath",
    venue: "Kino Aquatic Center",
    blurb:
      "A floating soundbath at the Kino Aquatic Center in Mesa — weightless on the water while live sound surrounds you.",
  },
  {
    itemId: 612512,
    slug: "floating-soundbath-revel-surf-park",
    title: "Floating Soundbath",
    venue: "Revel Surf Park",
    blurb:
      "A floating soundbath on the still water at Revel Surf Park — a one-of-a-kind setting for live sound and deep rest.",
  },
  {
    itemId: 655636,
    slug: "indoor-floating-soundbath-swimhaus-gilbert",
    title: "Indoor Floating Soundbath",
    venue: "SwimHaus Swim School",
    blurb:
      "An indoor floating soundbath at SwimHaus in Gilbert — climate-controlled calm on the water, any time of year.",
  },
  {
    itemId: 692276,
    slug: "floating-soundbath-pebblecreek-goodyear",
    title: "Floating Soundbath",
    venue: "PebbleCreek Oasis Pool",
    blurb:
      "A floating soundbath at the PebbleCreek Oasis Pool in Goodyear — float, breathe, and let live sound carry you.",
  },
  {
    itemId: 146434,
    slug: "lazy-river-water-aerobics-floating-yoga-mesa",
    title: "Pool Pilates, Water Aerobics & Floating Yoga",
    venue: "Mesa Aquatics Complex",
    kind: "class",
    blurb:
      "A 90-minute high-energy aquatic workout — pool pilates, water aerobics, floating yoga and surf fitness at the Mesa Aquatics Complex.",
    image: "https://cdn.filestackcontent.com/1UEnWJiQLm4Miz06WkdH",
  },
  {
    itemId: 642745,
    slug: "floating-soundbath-at-westin-kierland-resort-spa-scottsdale",
    title: "Floating Soundbath",
    venue: "Westin Kierland Resort & Spa",
    blurb:
      "Float weightlessly on the water as live sound washes over you at the Westin Kierland Resort & Spa pool in Scottsdale.",
  },
  {
    itemId: 722096,
    slug: "hotel-solaya-floating-soundbath-scottsdale",
    title: "Floating Soundbath",
    venue: "Hotel Solaya",
    blurb:
      "A floating soundbath on the water at Hotel Solaya in Scottsdale — drift, breathe, and let the live sound carry you into deep rest.",
  },
];

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strip emoji/symbols and a trailing " - CITY" suffix from a raw item name. */
function cleanName(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}\s&'/-]/gu, "") // drop emoji & decorative symbols
    .replace(/\s*-\s*[A-Z][A-Z\s]+$/u, "") // drop trailing "- MESA" style suffix
    .replace(/\s+/g, " ")
    .trim();
}

function toExperience(cat: CatalogItem, o?: Overlay): Experience {
  const venue = o?.venue ?? cat.venue;
  const city = o?.city ?? cat.city;
  return {
    itemId: cat.itemId,
    slug: o?.slug ?? slugify(`${cleanName(cat.name)}-${city}`),
    title: o?.title ?? cleanName(cat.name),
    venue,
    city,
    state: cat.state || "AZ",
    lat: o?.lat ?? cat.lat ?? 0,
    lng: o?.lng ?? cat.lng ?? 0,
    kind: o?.kind ?? "soundbath",
    blurb:
      o?.blurb ??
      `A floating soundbath${venue ? ` at ${venue}` : ""}${city ? ` in ${city}` : ""}.`,
    image: o?.image || cat.image,
    featured: o?.featured,
    needsCuration: o ? undefined : true,
  };
}

function buildExperiences(): Experience[] {
  const overlayById = new Map(LOCATION_OVERLAYS.map((o) => [o.itemId, o]));
  const out: Experience[] = [];
  const used = new Set<number>();

  // 1. Curated venues, in overlay order — but only if still visible & valid.
  for (const o of LOCATION_OVERLAYS) {
    const cat = byId.get(o.itemId);
    if (!cat) {
      warn(`overlay item ${o.itemId} (${o.slug}) is not in the FareHarbor catalog — skipping`);
      continue;
    }
    if (!isLocationCatalogItem(cat)) {
      warn(`overlay item ${o.itemId} (${o.slug}) is now unlisted/retail in FareHarbor — hiding`);
      continue;
    }
    out.push(toExperience(cat, o));
    used.add(o.itemId);
  }

  // 2. AUTO-SURFACED: fixed-location venues with no overlay yet. They appear
  //    with a derived title/blurb so new venues are never invisible.
  for (const cat of catalog) {
    if (used.has(cat.itemId)) continue;
    if (overlayById.has(cat.itemId)) continue;
    if (!isLocationCatalogItem(cat)) continue;
    warn(
      `venue ${cat.itemId} ("${cat.name}") has no editorial overlay — auto-surfaced with derived copy. Add it to LOCATION_OVERLAYS in src/data/locations.ts.`,
    );
    out.push(toExperience(cat));
  }

  return out;
}

function warn(msg: string) {
  if (import.meta.env?.DEV) console.warn(`[locations] ${msg}`);
}

export const experiences: Experience[] = buildExperiences();

// ---------------------------------------------------------------------------
// Membership (its own page) + the private/bring-to-your-pool experience
// ---------------------------------------------------------------------------

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
    "Classes every Tuesday. $80 a month, no commitment — or $25 per class, so the membership saves you $20. Cancel anytime.",
  image:
    byId.get(633768)?.image || "https://cdn.filestackcontent.com/C3V95cP7Tmqsirm0hh8A",
  featured: true,
};

/**
 * The "Private Floating Soundbath Experience" (bring-it-to-your-pool). Lives
 * on the /private-events page, not in /locations. Exposed for its Book button.
 */
export const PRIVATE_SOUNDBATH_ITEM_ID = 161553;

export function getExperienceBySlug(slug: string): Experience | undefined {
  if (slug === membership.slug) return membership;
  return experiences.find((e) => e.slug === slug);
}
