/**
 * GET    /staff-api/admin/events/:id — the shift plus everyone who applied or was
 *        confirmed, with their contact and payment details.
 * PATCH  /staff-api/admin/events/:id — edit title/time/venue/city/notes,
 *        roles [{role, needed}], trailerNeeded,
 *        or status: 'open' | 'cancelled' | 'completed'.
 * DELETE /staff-api/admin/events/:id — only while nobody is on it (else cancel).
 *        A deleted calendar shift is remembered so auto-posting won't bring it back.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, nowIso, readJson } from "../../../../server/staff/http.js";
import { readRolesInput, saveRoles } from "../../../../server/staff/roles.js";
import { getEventWithCounts, loadEventDetail, readEventInput } from "../../../../server/staff/shifts.js";

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
  // Head count lives on the roles.
  delete updates.staff_needed;
  const roles = readRolesInput(body.roles);
  if (updates.trailer_needed !== undefined) {
    const { trailer_confirmed } = await getEventWithCounts(db, id);
    if (updates.trailer_needed < trailer_confirmed) {
      throw new HttpError(409, "trailer_in_use", "Someone is confirmed to drive the trailer. Remove them first.");
    }
  }
  // Re-check end vs start when only one of them changed.
  const start = updates.start_at ?? existing.start_at;
  const end = updates.end_at !== undefined ? updates.end_at : existing.end_at;
  if (end && Date.parse(end) <= Date.parse(start)) {
    throw new HttpError(400, "end_before_start", "The end time needs to be after the start.");
  }

  // Hand-edited times on a calendar shift stick: the sync stops moving them.
  const timeChanged =
    (updates.start_at !== undefined && updates.start_at !== existing.start_at) ||
    (updates.end_at !== undefined && updates.end_at !== existing.end_at);
  if (existing.calendar_key && timeChanged) updates.times_edited = 1;
  // Roles first: if they're refused, nothing else has changed.
  if (roles) await saveRoles(db, id, roles);
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
  const admin = requireAdmin(context);
  const db = context.env.STAFF_DB;
  const id = context.params.id;
  const { c } = await db
    .prepare("SELECT COUNT(*) AS c FROM applications WHERE event_id = ?1 AND status IN ('applied','confirmed')")
    .bind(id)
    .first();
  if (c > 0) {
    throw new HttpError(409, "has_people", "People have applied or are confirmed. Cancel the shift instead.");
  }
  const ev = await db.prepare("SELECT calendar_key FROM events WHERE id = ?1").bind(id).first();
  const stmts = [db.prepare("DELETE FROM events WHERE id = ?1").bind(id)];
  if (ev?.calendar_key) {
    stmts.unshift(
      db
        .prepare("INSERT OR IGNORE INTO calendar_dismissed (calendar_key, dismissed_by) VALUES (?1, ?2)")
        .bind(ev.calendar_key, admin.id),
    );
  }
  await db.batch(stmts);
  return json(200, { ok: true });
}
