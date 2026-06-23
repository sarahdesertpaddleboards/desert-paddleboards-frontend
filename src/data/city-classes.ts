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
  bookingUrl: string;
  bookingLabel: string;
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

// Geocoded venue coordinates, kept in CODE (not the CMS-editable JSON) so that
// saving city-class edits through Pages CMS can never drop them. Add an entry
// when a new city venue gets a confirmed address.
const CITY_VENUE_COORDS: Record<string, { lat: number; lng: number }> = {
  "queen-creek-friday-floats": { lat: 33.26759, lng: -111.60122 }, // Queen Creek Recreation Pool
  "sedona-soundbath": { lat: 34.87137, lng: -111.78573 }, // Sedona Community Pool
  // "avondale-soundbath": add when the venue/address is confirmed
};

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
  ...(CITY_VENUE_COORDS[c.id] ?? {}),
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

/** Slugs of city classes that should get a prerendered detail page — those
 *  with at least one session on the calendar. */
export const cityClassDetailSlugs = cityClasses
  .filter((c) => c.sessions.length > 0)
  .map((c) => c.slug);

/** Soonest still-upcoming session for a city class (ISO), if any. */
export function nextCitySessionIso(c: CityClass): string | undefined {
  const now = Date.now();
  return c.sessions
    .map((s) => s.startAt)
    .filter((iso) => Date.parse(iso) > now)
    .sort()[0];
}
