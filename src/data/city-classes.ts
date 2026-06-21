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
  title: string;
  venue: string;
  city: string;
  state: string;
  address?: string;
  bookingUrl: string;
  bookingLabel: string;
  note?: string;
  sessions: CityClassSession[];
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
  sessions: (c.sessions as RawSession[])
    .filter((s) => s && s.date && s.time)
    .map((s) => ({
      startAt: toIso(s.date, s.time),
      ...(s.endTime ? { endAt: toIso(s.date, s.endTime) } : {}),
    })),
}));
