/**
 * POST /staff-api/shifts/:id/apply  { role, trailer?, note? }
 * Put your name down for a shift in one role, optionally also offering to drive
 * the trailer. Needs a complete profile (Sarah has to be able to pay you).
 * Re-applying after withdrawing is fine (and can change role); a shift Sarah
 * has turned you down for, or a role that's full, isn't open to you.
 */
import { isProfileComplete, requireStaff } from "../../../../server/staff/auth.js";
import { HttpError, cleanText, json, newId, nowIso, readJson } from "../../../../server/staff/http.js";
import { ROLE_LABELS } from "../../../../server/staff/roles.js";
import { getEventWithCounts, toPublicApplication, toPublicEvent } from "../../../../server/staff/shifts.js";

export async function onRequestPost(context) {
  const me = requireStaff(context);
  const db = context.env.STAFF_DB;
  const body = await readJson(context.request);
  const note = cleanText(body.note, 300);

  if (!isProfileComplete(me)) {
    throw new HttpError(400, "profile_incomplete", "Finish your profile (name, phone and payment details) first.");
  }

  const row = await getEventWithCounts(db, context.params.id);
  if (!row) throw new HttpError(404, "not_found", "That shift doesn't exist any more.");
  const event = toPublicEvent(row);
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
  if (event.isPast) throw new HttpError(409, "past", "This shift has already started.");

  // Role: the one asked for, or the only open one.
  const open = event.roles.filter((r) => r.confirmed < r.needed);
  let role = body.role ? String(body.role) : open.length === 1 ? open[0].role : null;
  const slot = event.roles.find((r) => r.role === role);
  if (!slot) throw new HttpError(400, "role_required", "Pick the role you'd like to work.");
  if (slot.confirmed >= slot.needed) {
    throw new HttpError(409, "role_full", `${ROLE_LABELS[role]} is already filled on this shift.`);
  }
  const trailer = body.trailer ? 1 : 0;
  if (trailer && !event.trailerOpen) throw new HttpError(409, "trailer_full", "The trailer is already covered for this shift.");

  const now = nowIso();
  if (existing) {
    await db
      .prepare("UPDATE applications SET status = 'applied', role = ?1, trailer = ?2, staff_note = ?3, updated_at = ?4 WHERE id = ?5")
      .bind(role, trailer, note, now, existing.id)
      .run();
  } else {
    await db
      .prepare(
        "INSERT INTO applications (id, event_id, staff_id, status, role, trailer, staff_note) VALUES (?1, ?2, ?3, 'applied', ?4, ?5, ?6)",
      )
      .bind(newId("app"), event.id, me.id, role, trailer, note)
      .run();
  }
  const fresh = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(event.id, me.id)
    .first();
  return json(200, { application: toPublicApplication(fresh) });
}
