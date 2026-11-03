/**
 * GET /staff-api/shifts — what a staff member sees on their home page:
 *   shifts: upcoming open shifts, each with `my` (their application, if any)
 *   mine:   every shift they've applied for or been confirmed on (past too),
 *           newest first, with the pay Sarah locked in and whether it's paid.
 * Staff never see other people's names or Sarah's suggested pay.
 */
import { requireStaff } from "../../../server/staff/auth.js";
import { json } from "../../../server/staff/http.js";
import { EVENT_WITH_COUNTS, toPublicApplication, toPublicEvent } from "../../../server/staff/shifts.js";

function forStaff(row) {
  const { defaultPayCents, ...event } = toPublicEvent(row);
  return event;
}

export async function onRequestGet(context) {
  const me = requireStaff(context);
  const db = context.env.STAFF_DB;

  const [upcoming, apps, appEvents] = await Promise.all([
    db
      .prepare(
        `${EVENT_WITH_COUNTS}
          WHERE e.status = 'open' AND datetime(e.start_at) > datetime('now')
          ORDER BY e.start_at LIMIT 200`,
      )
      .all(),
    db
      .prepare("SELECT * FROM applications WHERE staff_id = ?1 AND status != 'withdrawn'")
      .bind(me.id)
      .all(),
    db
      .prepare(
        `${EVENT_WITH_COUNTS}
          WHERE e.id IN (SELECT event_id FROM applications WHERE staff_id = ?1 AND status != 'withdrawn')`,
      )
      .bind(me.id)
      .all(),
  ]);

  const myByEvent = new Map(apps.results.map((a) => [a.event_id, toPublicApplication(a)]));
  const eventById = new Map(appEvents.results.map((e) => [e.id, forStaff(e)]));

  const shifts = upcoming.results.map((e) => ({ ...forStaff(e), my: myByEvent.get(e.id) ?? null }));
  const mine = apps.results
    .filter((a) => eventById.has(a.event_id))
    .map((a) => ({ application: toPublicApplication(a), event: eventById.get(a.event_id) }))
    .sort((x, y) => y.event.startAt.localeCompare(x.event.startAt));

  return json(200, { shifts, mine });
}
