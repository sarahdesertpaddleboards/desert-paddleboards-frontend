/**
 * POST /staff-api/shifts/:id/apply  { note? }
 * Put your name down for a shift. Needs a complete profile (Sarah has to be able
 * to pay you). Re-applying after withdrawing is fine; a shift Sarah has turned
 * you down for, or one that's full, isn't open to you.
 */
import { isProfileComplete, requireStaff } from "../../../../server/staff/auth.js";
import { HttpError, cleanText, json, newId, nowIso, readJson } from "../../../../server/staff/http.js";
import { getEventWithCounts, toPublicApplication, toPublicEvent } from "../../../../server/staff/shifts.js";

export async function onRequestPost(context) {
  const me = requireStaff(context);
  const db = context.env.STAFF_DB;
  const body = await readJson(context.request);
  const note = cleanText(body.note, 300);

  if (!isProfileComplete(me)) {
    throw new HttpError(400, "profile_incomplete", "Finish your profile (name, phone and payment details) first.");
  }

  const event = await getEventWithCounts(db, context.params.id);
  if (!event) throw new HttpError(404, "not_found", "That shift doesn't exist any more.");
  const existing = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(event.id, me.id)
    .first();

  if (existing?.status === "confirmed") {
    return json(200, { application: toPublicApplication(existing) });
  }
  if (existing?.status === "declined") {
    throw new HttpError(409, "declined", "Sarah has picked someone else for this shift.");
  }
  if (event.status !== "open") throw new HttpError(409, "not_open", "This shift isn't taking names any more.");
  if (Date.parse(event.start_at) < Date.now()) throw new HttpError(409, "past", "This shift has already started.");
  if (toPublicEvent(event).isFull) throw new HttpError(409, "full", "This shift is already fully staffed.");

  const now = nowIso();
  if (existing) {
    await db
      .prepare("UPDATE applications SET status = 'applied', staff_note = ?1, updated_at = ?2 WHERE id = ?3")
      .bind(note, now, existing.id)
      .run();
  } else {
    await db
      .prepare("INSERT INTO applications (id, event_id, staff_id, status, staff_note) VALUES (?1, ?2, ?3, 'applied', ?4)")
      .bind(newId("app"), event.id, me.id, note)
      .run();
  }
  const fresh = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(event.id, me.id)
    .first();
  return json(200, { application: toPublicApplication(fresh) });
}
