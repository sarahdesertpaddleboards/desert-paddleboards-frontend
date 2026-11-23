/**
 * The public calendar's session list as a pure function: live FareHarbor
 * sessions + city-run classes (src/data/city-classes.json), future only,
 * sorted. No React or browser APIs, so the staff tool's Cloudflare Function can
 * auto-post shifts from exactly what the public calendar shows. Imports are
 * relative (no "@/" alias) because the Functions bundler doesn't know it.
 */
import { experiences } from "../data/locations";
import { cityClasses } from "../data/city-classes";
import type { UpcomingSession } from "./experiencesApi";

/** A single bookable session merged from FareHarbor + city-run classes. */
export interface CalSession {
  startAt: string;
  title: string;
  venue: string;
  city: string;
  state: string;
  spotsLeft?: number | null;
  /** Sold-out FareHarbor session — still shown on the calendar, not bookable. */
  isSoldOut?: boolean;
  /**
   * Live FareHarbor session that's currently bookable online. `false` means a
   * real session that's only closed by the booking cutoff (show "call to book").
   * `undefined` for static featured events / city classes (treat as bookable).
   */
  isBookable?: boolean;
  source: "fareharbor" | "city";
  /** Slug of the detail page at /locations/[slug], for a "more info" link. */
  slug?: string;
  /** FareHarbor item id → lightframe "Book". */
  itemId?: number;
  /** Live FareHarbor feed only: the slot's availability pk + end time (the staff tool links shifts to these). */
  availabilityPk?: number;
  endAt?: string;
  /** City class external registration link. */
  bookingUrl?: string;
  bookingLabel?: string;
  /** Optional note shown under the session (e.g. city-class details). */
  note?: string;
}

export const TZ = "America/Phoenix";

const dateKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD key in Arizona time. */
export function dateKey(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateKeyFmt.format(d);
}

const byItemId = new Map(experiences.map((e) => [e.itemId, e]));

/** Merge live FareHarbor sessions with city classes, future only, sorted by start. */
export function mergeSessions(fhSessions: UpcomingSession[], now: number = Date.now()): CalSession[] {
  const out: CalSession[] = [];

  // A featured event pinned in city-classes.json can ALSO arrive through the
  // live feed, once its date falls inside the feed's window — that is how the
  // Witches Regatta came to be listed twice on the calendar. The pinned entry
  // carries the editorial venue and description, so it wins and the feed copy
  // is dropped. Keyed by Arizona date rather than exact timestamp: when the
  // two disagree on the time, the hand-maintained one is the corrected one.
  const featuredPairs = new Set<string>();
  for (const c of cityClasses) {
    if (typeof c.fareharborItemId !== "number") continue;
    for (const cs of c.sessions) {
      featuredPairs.add(`${c.fareharborItemId}|${dateKey(cs.startAt)}`);
    }
  }

  for (const s of fhSessions) {
    const exp = byItemId.get(s.itemId);
    if (!exp) continue;
    if (featuredPairs.has(`${s.itemId}|${dateKey(s.startAt)}`)) continue;
    out.push({
      startAt: s.startAt,
      title: exp.title,
      venue: exp.venue,
      city: exp.city,
      state: exp.state,
      spotsLeft: s.spotsLeft,
      isSoldOut: s.isSoldOut,
      isBookable: s.isBookable,
      source: "fareharbor",
      slug: exp.slug,
      itemId: s.itemId,
      availabilityPk: s.availabilityPk,
      endAt: s.endAt,
    });
  }

  for (const c of cityClasses) {
    for (const cs of c.sessions) {
      const base = {
        startAt: cs.startAt,
        title: c.title,
        venue: c.venue,
        city: c.city,
        state: c.state,
        slug: c.slug,
        note: c.note,
        ...(cs.endAt ? { endAt: cs.endAt } : {}),
      };
      // Featured events with a FareHarbor item book through FareHarbor's
      // lightframe (Book); true city classes link out to the city (Register).
      if (typeof c.fareharborItemId === "number") {
        out.push({ ...base, source: "fareharbor", itemId: c.fareharborItemId });
      } else {
        out.push({
          ...base,
          source: "city",
          // Per-date link wins (a city may post one listing per session),
          // else the class-level registration link.
          bookingUrl: cs.bookingUrl ?? c.bookingUrl,
          bookingLabel: c.bookingLabel,
        });
      }
    }
  }

  return out
    .filter((s) => Date.parse(s.startAt) > now)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}
