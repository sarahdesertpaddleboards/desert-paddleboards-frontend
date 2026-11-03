import type { Application, Shift } from "./api";
import { azYear } from "./format";

export type MyShift = { application: Application; event: Shift };

/**
 * A staff member's money, from their own shift list. Same rules as Sarah's
 * payroll: owed = worked and not marked paid (cancelled shifts don't count
 * unless Sarah paid them anyway).
 */
export function summarizeEarnings(mine: MyShift[]) {
  const confirmed = mine.filter((m) => m.application.status === "confirmed");
  const pay = (m: MyShift) => m.application.payCents ?? 0;
  const sum = (list: MyShift[]) => list.reduce((t, m) => t + pay(m), 0);
  const live = (m: MyShift) => m.event.status !== "cancelled";
  const thisYear = azYear();

  const owed = confirmed.filter((m) => m.event.isPast && live(m) && !m.application.paidAt);
  const upcoming = confirmed.filter((m) => !m.event.isPast && live(m) && !m.application.paidAt);
  const paid = confirmed.filter((m) => m.application.paidAt);
  const paidThisYear = paid.filter((m) => azYear(m.application.paidAt!) === thisYear);
  // Worked shifts, newest first: everything that earned (or will earn) money.
  const history = confirmed
    .filter((m) => m.application.paidAt || (m.event.isPast && live(m)))
    .sort((a, b) => b.event.startAt.localeCompare(a.event.startAt));

  return {
    owedCents: sum(owed),
    owedCount: owed.length,
    upcomingCents: sum(upcoming),
    upcomingCount: upcoming.length,
    paidThisYearCents: sum(paidThisYear),
    paidAllTimeCents: sum(paid),
    thisYear,
    history,
  };
}
