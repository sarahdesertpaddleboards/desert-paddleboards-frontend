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
 * Fetch upcoming sessions across all experiences. Degrades gracefully to an
 * empty list if the backend / FareHarbor is unavailable, so the homepage map
 * and venue list still render.
 */
export async function getUpcomingSessions(): Promise<UpcomingSession[]> {
  try {
    const data = await apiGet("/experiences/upcoming");
    return Array.isArray(data?.sessions) ? (data.sessions as UpcomingSession[]) : [];
  } catch {
    return [];
  }
}
