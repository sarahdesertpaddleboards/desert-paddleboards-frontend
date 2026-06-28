import { useEffect, useMemo, useState } from "react";
import { experiences } from "@/data/locations";
import { cityClasses } from "@/data/city-classes";
import { getUpcomingSessions, type UpcomingSession } from "@/lib/experiencesApi";

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
  source: "fareharbor" | "city";
  /** Slug of the detail page at /locations/[slug], for a "more info" link. */
  slug?: string;
  /** FareHarbor item id → lightframe "Book". */
  itemId?: number;
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

export function fmtDateHeader(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Fetch + merge upcoming sessions (live FareHarbor feed + static city classes),
 * filtered to the future and sorted chronologically. Used by both the calendar
 * and the list so they always agree.
 */
export function useMergedSessions(): CalSession[] {
  const [fhSessions, setFhSessions] = useState<UpcomingSession[]>([]);

  useEffect(() => {
    let cancelled = false;
    getUpcomingSessions().then((s) => {
      if (!cancelled) setFhSessions(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const byItemId = useMemo(
    () => new Map(experiences.map((e) => [e.itemId, e])),
    [],
  );

  return useMemo<CalSession[]>(() => {
    const now = Date.now();
    const out: CalSession[] = [];

    for (const s of fhSessions) {
      const exp = byItemId.get(s.itemId);
      if (!exp) continue;
      out.push({
        startAt: s.startAt,
        title: exp.title,
        venue: exp.venue,
        city: exp.city,
        state: exp.state,
        spotsLeft: s.spotsLeft,
        isSoldOut: s.isSoldOut,
        source: "fareharbor",
        slug: exp.slug,
        itemId: s.itemId,
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
        };
        // Featured events with a FareHarbor item book through FareHarbor's
        // lightframe (Book); true city classes link out to the city (Register).
        if (typeof c.fareharborItemId === "number") {
          out.push({ ...base, source: "fareharbor", itemId: c.fareharborItemId });
        } else {
          out.push({
            ...base,
            source: "city",
            bookingUrl: c.bookingUrl,
            bookingLabel: c.bookingLabel,
          });
        }
      }
    }

    return out
      .filter((s) => Date.parse(s.startAt) > now)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [fhSessions, byItemId]);
}
