/**
 * GET    /staff-api/admin/events/:id — the shift plus everyone who applied or was
 *        confirmed, with their contact and payment details.
 * PATCH  /staff-api/admin/events/:id — edit title/time/venue/city/notes/
 *        staffNeeded/defaultPay, or status: 'open' | 'cancelled' | 'completed'.
 * DELETE /staff-api/admin/events/:id — only while nobody is on it (else cancel).
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, nowIso, readJson } from "../../../../server/staff/http.js";
import { loadEventDetail, readEventInput } from "../../../../server/staff/shifts.js";

export async function onRequestGet(context) {
  requireAdmin(context);
  return json(200, await loadEventDetail(context.env.STAFF_DB, context.params.id));
}

export async function onRequestPatch(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const id = context.params.id;
  const existing = await db.prepare("SELECT * FROM events WHERE id = ?1").bind(id).first();
  if (!existing) throw new HttpError(404, "not_found", "No such shift.");

  const body = await readJson(context.request);
  const updates = readEventInput(body, { partial: true });
  // Re-check end vs start when only one of them changed.
  const start = updates.start_at ?? existing.start_at;
  const end = updates.end_at !== undefined ? updates.end_at : existing.end_at;
  if (end && Date.parse(end) <= Date.parse(start)) {
    throw new HttpError(400, "end_before_start", "The end time needs to be after the start.");
  }

  const keys = Object.keys(updates);
  if (keys.length) {
    const sets = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    await db
      .prepare(`UPDATE events SET ${sets}, updated_at = ?${keys.length + 1} WHERE id = ?${keys.length + 2}`)
      .bind(...keys.map((k) => updates[k]), nowIso(), id)
      .run();
  }
  return json(200, await loadEventDetail(db, id));
}

export async function onRequestDelete(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const id = context.params.id;
  const { c } = await db
    .prepare("SELECT COUNT(*) AS c FROM applications WHERE event_id = ?1 AND status IN ('applied','confirmed')")
    .bind(id)
    .first();
  if (c > 0) {
    throw new HttpError(409, "has_people", "People have applied or are confirmed. Cancel the shift instead.");
  }
  await db.prepare("DELETE FROM events WHERE id = ?1").bind(id).run();
  return json(200, { ok: true });
}
