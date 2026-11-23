/**
 * POST /staff-api/admin/events/:id/decline  { staffId, notify? }
 * Turn down an applicant (never notified: Sarah, 19 Nov 2026 — people who
 * apply know they may not be picked), or take a confirmed person off the
 * shift. A confirmed person is told by email (and text, if they opted in)
 * unless Sarah unticks "Let them know" (notify: false). Paid shifts can't be
 * undone here.
 */
import { requireAdmin } from "../../../../../server/staff/auth.js";
import { isLocalMode, removedFromShiftEmail, sendEmail } from "../../../../../server/staff/email.js";
import { HttpError, json, nowIso, readJson } from "../../../../../server/staff/http.js";
import { removedFromShiftText, textStaff } from "../../../../../server/staff/sms.js";
import { loadEventDetail } from "../../../../../server/staff/shifts.js";

export async function onRequestPost(context) {
  requireAdmin(context);
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);
  const app = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(context.params.id, String(body.staffId || ""))
    .first();
  if (!app) throw new HttpError(404, "not_found", "That person isn't on this shift.");
  if (app.paid_at) throw new HttpError(409, "paid", "This shift is already marked paid.");
  const wasConfirmed = app.status === "confirmed";
  if (app.status === "applied" || wasConfirmed) {
    await db
      .prepare(
        "UPDATE applications SET status = 'declined', confirmed_at = NULL, confirmed_by = NULL, reminded_at = NULL, updated_at = ?1 WHERE id = ?2",
      )
      .bind(nowIso(), app.id)
      .run();
  }

  // Tell a confirmed person they're off it (not applicants), unless Sarah chose not to.
  let emailed = false;
  let texted = false;
  const event = await db.prepare("SELECT * FROM events WHERE id = ?1").bind(context.params.id).first();
  const upcoming = event && Date.parse(event.start_at) > Date.now() && event.status !== "cancelled";
  if (wasConfirmed && body.notify !== false && upcoming) {
    const person = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(app.staff_id).first();
    const url = `${new URL(request.url).origin}/staff`;
    if (isLocalMode(env)) {
      console.log(`[staff-api] LOCAL removal notice to ${person.email} for ${event.title}`);
    } else if (person.status !== "inactive") {
      const mail = removedFromShiftEmail({ name: person.name, event, url });
      emailed = (await sendEmail(env, db, { ...mail, to: person.email, kind: "removed", staffId: person.id })).ok;
    }
    texted = (await textStaff(env, db, person, "removed", removedFromShiftText({ event, url }))).ok;
  }
  return json(200, { ...(await loadEventDetail(db, context.params.id)), emailed, texted, notified: emailed || texted });
}
