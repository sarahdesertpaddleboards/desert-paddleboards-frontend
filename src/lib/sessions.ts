import { useEffect, useMemo, useState } from "react";
import { getUpcomingSessions, type UpcomingSession } from "@/lib/experiencesApi";
import buildTimeUpcoming from "@/data/upcoming.generated.json";
import { mergeSessions, TZ, type CalSession } from "./merge-sessions";

/**
 * Upcoming FareHarbor sessions. Seeded from the build-time snapshot so the
 * prerendered HTML already knows which venues have dates, then replaced by the
 * live feed on the client. getUpcomingSessions() degrades to [] on failure, so
 * an empty live result keeps the snapshot — a FareHarbor outage must never make
 * every venue look unscheduled.
 */
export function useUpcomingSessions(): UpcomingSession[] {
  const [sessions, setSessions] = useState<UpcomingSession[]>(() => {
    const now = Date.now();
    return (buildTimeUpcoming.sessions as UpcomingSession[]).filter(
      (s) => Date.parse(s.startAt) > now,
    );
  });

  useEffect(() => {
    let cancelled = false;
    getUpcomingSessions().then((s) => {
      if (!cancelled && s.length > 0) setSessions(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return sessions;
}

export { TZ, dateKey, type CalSession } from "./merge-sessions";

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
  // Seeded from the build-time snapshot, like useUpcomingSessions above, so the
  // prerendered HTML already lists the FareHarbor sessions and "Next 7 days"
  // paints with the page instead of waiting on the network. Starting empty cost
  // every visitor the full round trip, and on a cold edge cache the feed takes
  // ~10s to build (it fans out to FareHarbor per item-month), so the schedule
  // could sit blank that long. The live feed still replaces this within a second
  // and widens the range from ~3 months to ~6.
  const [fhSessions, setFhSessions] = useState<UpcomingSession[]>(() => {
    const now = Date.now();
    return (buildTimeUpcoming.sessions as UpcomingSession[]).filter(
      (s) => Date.parse(s.startAt) > now,
    );
  });

  useEffect(() => {
    let cancelled = false;
    getUpcomingSessions().then((s) => {
      // An empty live result is the feed's failure mode — keep the snapshot
      // rather than blanking a schedule that was already on screen.
      if (!cancelled && s.length > 0) setFhSessions(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => mergeSessions(fhSessions), [fhSessions]);
}
