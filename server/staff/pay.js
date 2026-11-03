/**
 * Shared logic for the money side (phase 3): what's owed, what's been paid.
 *
 * Ledger rules:
 *   owed     = confirmed, not paid, shift not cancelled, shift has started
 *   upcoming = confirmed, not paid, shift not cancelled, shift still ahead
 *   paid     = paid_at set (Sarah marked it paid; can be undone)
 * paid_at is UTC; "which year" is judged in Arizona time (UTC-7, no DST).
 */
import { toPublicApplication } from "./shifts.js";

/** applications joined with their shift, the person, and who marked it paid. */
export const LEDGER_SELECT = `
  SELECT a.*,
    e.title AS e_title, e.venue AS e_venue, e.city AS e_city, e.start_at AS e_start_at,
    e.end_at AS e_end_at, e.status AS e_status,
    s.email AS s_email, s.name AS s_name, s.phone AS s_phone,
    s.payout_method AS s_payout_method, s.payout_handle AS s_payout_handle,
    p.name AS paid_by_name
  FROM applications a
  JOIN events e ON e.id = a.event_id
  JOIN staff s ON s.id = a.staff_id
  LEFT JOIN staff p ON p.id = a.paid_by`;

export const AZ_YEAR_OF_PAID = "strftime('%Y', datetime(a.paid_at, '-7 hours'))";

export function toLedgerRow(r) {
  return {
    ...toPublicApplication(r),
    paidByName: r.paid_by_name ?? null,
    event: {
      id: r.event_id,
      title: r.e_title,
      venue: r.e_venue,
      city: r.e_city,
      startAt: r.e_start_at,
      endAt: r.e_end_at,
      status: r.e_status,
      isPast: Date.parse(r.e_start_at) < Date.now(),
    },
    staff: {
      id: r.staff_id,
      email: r.s_email,
      name: r.s_name,
      phone: r.s_phone,
      payoutMethod: r.s_payout_method,
      payoutHandle: r.s_payout_handle,
    },
  };
}

/** Current year in Arizona, e.g. 2026. */
export function arizonaYear(ms = Date.now()) {
  return new Date(ms - 7 * 3_600_000).getUTCFullYear();
}
