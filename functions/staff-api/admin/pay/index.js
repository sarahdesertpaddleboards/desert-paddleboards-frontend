/**
 * GET /staff-api/admin/pay?year=2026 — Sarah's payroll:
 *   owed:     every worked shift not yet marked paid (oldest first)
 *   upcoming: count + total of confirmed pay for shifts still ahead
 *   paid:     everything marked paid in `year` (Arizona time), newest first
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { json } from "../../../../server/staff/http.js";
import { AZ_YEAR_OF_PAID, LEDGER_SELECT, arizonaYear, toLedgerRow } from "../../../../server/staff/pay.js";

const UNPAID = "a.status = 'confirmed' AND a.paid_at IS NULL AND e.status != 'cancelled'";

export async function onRequestGet(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const raw = Number(new URL(context.request.url).searchParams.get("year"));
  const year = Number.isInteger(raw) && raw >= 2020 && raw <= 2100 ? raw : arizonaYear();

  const [owed, upcoming, paid] = await Promise.all([
    db
      .prepare(`${LEDGER_SELECT} WHERE ${UNPAID} AND datetime(e.start_at) <= datetime('now') ORDER BY e.start_at LIMIT 1000`)
      .all(),
    db
      .prepare(
        `SELECT COUNT(*) AS n, COALESCE(SUM(a.pay_cents), 0) AS cents
           FROM applications a JOIN events e ON e.id = a.event_id
          WHERE ${UNPAID} AND datetime(e.start_at) > datetime('now')`,
      )
      .first(),
    db
      .prepare(`${LEDGER_SELECT} WHERE a.paid_at IS NOT NULL AND ${AZ_YEAR_OF_PAID} = ?1 ORDER BY a.paid_at DESC, e.start_at DESC LIMIT 2000`)
      .bind(String(year))
      .all(),
  ]);

  return json(200, {
    year,
    owed: owed.results.map(toLedgerRow),
    upcoming: { count: upcoming?.n ?? 0, totalCents: upcoming?.cents ?? 0 },
    paid: paid.results.map(toLedgerRow),
  });
}
