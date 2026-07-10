/**
 * CITY-RUN CLASSES — soundbath / water-fitness sessions that book through the
 * cities' OWN registration systems (Queen Creek, Sedona, Avondale), NOT
 * FareHarbor. Merged with the live FareHarbor sessions in the homepage /
 * calendar "Upcoming Sessions" view (src/components/UpcomingSessions.tsx).
 *
 * The DATA lives in `city-classes.json` so dates can be added/edited through
 * the CMS (Pages CMS — see `.pages.yml`). Each session is a simple
 * { date: "2026-07-10", time: "20:00" } — this file converts that to an
 * Arizona-local ISO timestamp. Past sessions drop off the calendar
 * automatically.
 */
import data from "./city-classes.json";
import generatedCoords from "./city-venue-coords.generated.json";

const AZ_OFFSET = "-07:00"; // Arizona does not observe daylight saving.

export interface CityClassSession {
  startAt: string;
  endAt?: string;
}

export interface CityClass {
  id: string;
  /** URL slug for the detail page at /locations/[slug]. */
  slug: string;
  title: string;
  venue: string;
  city: string;
  state: string;
  address?: string;
  /** External (city) registration link. Omitted for FareHarbor-booked events. */
  bookingUrl?: string;
  bookingLabel?: string;
  note?: string;
  /** Venue photo (path under /public or absolute URL). */
  image?: string;
  sessions: CityClassSession[];
  /** Geocoded venue location (for the map). Undefined until we have coords. */
  lat?: number;
  lng?: number;
  /**
   * MIGRATION HOOK toward FareHarbor: when Sarah adds this class to FareHarbor
   * as a product, set its FareHarbor item id here. The detail page and cards
   * then book through FareHarbor's lightframe instead of the city's external
   * registration — no other changes needed.
   */
  fareharborItemId?: number;
}

// PRECISE, hand-set venue coordinates, kept in CODE (not the CMS-editable JSON)
// so saving city-class edits through Pages CMS can never drop them. These WIN
// over the auto-geocoded coords below — use one when a plain address would land
// the pin in the wrong spot (e.g. Tempe Town Lake, or the Salt River meeting
// point) or when you want pixel-accuracy. Otherwise you don't need to add
// anything: a CMS `address` is geocoded automatically (see next).
const CITY_VENUE_COORDS: Record<string, { lat: number; lng: number }> = {
  "queen-creek-friday-floats": { lat: 33.26759, lng: -111.60122 }, // Queen Creek Recreation Pool
  "sedona-soundbath": { lat: 34.87137, lng: -111.78573 }, // Sedona Community Pool
  "witches-regatta": { lat: 33.43344, lng: -111.94048 }, // Tempe Town Lake (not just "Tempe")
  "salt-river-outing": { lat: 33.4671, lng: -111.6856 }, // meeting point: Walgreens, 3624 N Power Rd, Mesa
};

// Auto-geocoded coordinates for any city class that has an `address` in the CMS
// but no precise override above. Produced at build time by
// scripts/generate-venue-coords.mjs (Google Places) → committed as a snapshot.
// This is what makes a CMS-added venue appear on the map with no code change.
const GEOCODED_COORDS = generatedCoords as Record<
  string,
  { lat: number; lng: number; address?: string; name?: string }
>;

/** Best coordinates for a venue: precise override first, then geocoded address. */
function coordsFor(id: string): { lat: number; lng: number } | Record<string, never> {
  if (CITY_VENUE_COORDS[id]) return CITY_VENUE_COORDS[id];
  const g = GEOCODED_COORDS[id];
  if (g && typeof g.lat === "number" && typeof g.lng === "number") {
    return { lat: g.lat, lng: g.lng };
  }
  return {};
}

interface RawSession {
  date: string;
  time: string;
  endTime?: string;
}

/** "2026-07-10" + "20:00" → "2026-07-10T20:00:00-07:00" */
function toIso(date: string, time: string): string {
  const t = /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
  return `${date}T${t}${AZ_OFFSET}`;
}

export const cityClasses: CityClass[] = data.cityClasses.map((c) => ({
  ...c,
  ...coordsFor(c.id),
  sessions: (c.sessions as RawSession[])
    .filter((s) => s && s.date && s.time)
    .map((s) => ({
      startAt: toIso(s.date, s.time),
      ...(s.endTime ? { endAt: toIso(s.date, s.endTime) } : {}),
    })),
}));

/** City venues that have coordinates AND at least one upcoming-or-any session,
 *  shaped for the map. Avondale (no coords/dates yet) is excluded. */
export const cityClassVenues = cityClasses.filter(
  (c) => typeof c.lat === "number" && typeof c.lng === "number",
);

/** Look up a city class by its detail-page slug. */
export function getCityClassBySlug(slug: string): CityClass | undefined {
  return cityClasses.find((c) => c.slug === slug);
}

/** Slugs of city classes that should get a prerendered detail page. We
 *  prerender EVERY city class (not just ones with sessions) so the "More info"
 *  link on the homepage/finder cards always resolves — a CMS-added venue is
 *  reachable the moment it's saved, even before its dates are entered. */
export const cityClassDetailSlugs = cityClasses.map((c) => c.slug);

/** Soonest still-upcoming session for a city class (ISO), if any. */
export function nextCitySessionIso(c: CityClass): string | undefined {
  const now = Date.now();
  return c.sessions
    .map((s) => s.startAt)
    .filter((iso) => Date.parse(iso) > now)
    .sort()[0];
}
