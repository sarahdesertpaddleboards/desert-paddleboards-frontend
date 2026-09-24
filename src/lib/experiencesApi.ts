import { apiGet } from "./publicApi";

/** One upcoming bookable FareHarbor session (from our backend feed). */
export interface UpcomingSession {
  itemId: number;
  availabilityPk: number;
  /** Local start time incl. offset, e.g. 2026-06-14T18:30:00-0700 */
  startAt: string;
  endAt: string;
  spotsLeft: number | null;
  isSoldOut: boolean;
  isBookable: boolean;
}

/**
 * In-flight/most-recent request, shared across callers. The homepage mounts
 * useUpcomingSessions (venue grid) and useMergedSessions (calendar) together,
 * and each used to fetch the feed separately — two identical requests for the
 * same payload on every page load, and on a cold edge cache two concurrent
 * ~10s feed builds instead of one. Effects don't run during prerender, so this
 * module-level state is only ever touched in the browser.
 */
let pending: Promise<UpcomingSession[]> | null = null;

/**
 * Fetch upcoming sessions across all experiences. Degrades gracefully to an
 * empty list if the backend / FareHarbor is unavailable, so the homepage map
 * and venue list still render.
 */
export function getUpcomingSessions(): Promise<UpcomingSession[]> {
  if (pending) return pending;

  pending = (async () => {
    try {
      const data = await apiGet("/experiences/upcoming");
      return Array.isArray(data?.sessions) ? (data.sessions as UpcomingSession[]) : [];
    } catch {
      return [];
    }
  })();

  // An empty result means the feed failed or was unavailable — drop the cached
  // promise so a later mount can try again instead of inheriting the failure.
  void pending.then((sessions) => {
    if (sessions.length === 0) pending = null;
  });

  return pending;
}
