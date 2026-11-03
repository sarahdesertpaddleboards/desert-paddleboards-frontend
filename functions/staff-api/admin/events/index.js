/**
 * GET  /staff-api/admin/events?scope=upcoming|past — shifts for Sarah's schedule.
 *      Upcoming keeps a shift visible until 3 hours after it starts.
 * POST /staff-api/admin/events — post a shift, by hand or from a calendar session:
 *      { title, startAt, endAt?, venue?, city?, staffNeeded?, defaultPay?, notes?,
 *        source?: 'manual'|'fareharbor'|'city', fareharborItemId?, fareharborAvailabilityPk? }
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, newId, readJson } from "../../../../server/staff/http.js";
import { EVENT_WITH_COUNTS, getEventWithCounts, readEventInput, toPublicEvent } from "../../../../server/staff/shifts.js";

const CUTOFF = "datetime('now', '-3 hours')";

export async function onRequestGet(context) {
  requireAdmin(context);
  const scope = new URL(context.request.url).searchParams.get("scope") === "past" ? "past" : "upcoming";
  const sql =
    scope === "past"
      ? `${EVENT_WITH_COUNTS} WHERE datetime(e.start_at) <= ${CUTOFF} ORDER BY e.start_at DESC LIMIT 200`
      : `${EVENT_WITH_COUNTS} WHERE datetime(e.start_at) > ${CUTOFF} ORDER BY e.start_at LIMIT 500`;
  const { results } = await context.env.STAFF_DB.prepare(sql).all();
  return json(200, { scope, events: results.map(toPublicEvent) });
}

function optionalInt(raw, field) {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new HttpError(400, `invalid_${field}`);
  return n;
}

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const db = context.env.STAFF_DB;
  const body = await readJson(context.request);

  const fields = readEventInput(body);
  const source = ["fareharbor", "city"].includes(body.source) ? body.source : "manual";
  const itemId = optionalInt(body.fareharborItemId, "item_id");
  const availabilityPk = optionalInt(body.fareharborAvailabilityPk, "availability_pk");

  // One shift per calendar session: the same FareHarbor slot, or the same
  // title at the same time, is already posted.
  const dupe = availabilityPk != null
    ? await db.prepare("SELECT id FROM events WHERE fareharbor_availability_pk = ?1").bind(availabilityPk).first()
    : await db
        .prepare("SELECT id FROM events WHERE title = ?1 AND start_at = ?2 AND status != 'cancelled'")
        .bind(fields.title, fields.start_at)
        .first();
  if (dupe) {
    return json(409, { error: "already_posted", message: "That session is already posted as a shift.", id: dupe.id });
  }

  const id = newId("evt");
  await db
    .prepare(
      `INSERT INTO events (id, title, venue, city, start_at, end_at, source, fareharbor_item_id,
                           fareharbor_availability_pk, staff_needed, default_pay_cents, notes, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)`,
    )
    .bind(
      id,
      fields.title,
      fields.venue ?? null,
      fields.city ?? null,
      fields.start_at,
      fields.end_at ?? null,
      source,
      itemId,
      availabilityPk,
      fields.staff_needed ?? 1,
      fields.default_pay_cents ?? null,
      fields.notes ?? null,
      admin.id,
    )
    .run();

  return json(201, { event: toPublicEvent(await getEventWithCounts(db, id)) });
}
