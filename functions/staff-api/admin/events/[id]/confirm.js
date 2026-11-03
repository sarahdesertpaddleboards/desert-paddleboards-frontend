/**
 * POST /staff-api/admin/events/:id/confirm  { staffId, pay }
 * Put someone on the shift at a locked-in pay and email them a confirmation
 * from Sarah. Works for an applicant or as a direct assignment (no application
 * needed). Pay can't be changed once confirmed: remove them and confirm again.
 */
import { requireAdmin } from "../../../../../server/staff/auth.js";
import { isLocalMode, sendEmail, shiftConfirmedEmail } from "../../../../../server/staff/email.js";
import { HttpError, json, newId, nowIso, readJson } from "../../../../../server/staff/http.js";
import { getEventWithCounts, loadEventDetail, parsePayCents } from "../../../../../server/staff/shifts.js";

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);

  const event = await getEventWithCounts(db, context.params.id);
  if (!event) throw new HttpError(404, "not_found", "No such shift.");
  if (event.status === "cancelled") throw new HttpError(409, "cancelled", "This shift is cancelled. Reopen it first.");

  const person = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(String(body.staffId || "")).first();
  if (!person) throw new HttpError(404, "staff_not_found", "No such staff member.");
  if (person.status === "inactive") throw new HttpError(409, "inactive", "That person is deactivated.");

  const payCents = parsePayCents(body.pay, { required: true });

  const existing = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(event.id, person.id)
    .first();
  if (existing?.status === "confirmed") {
    throw new HttpError(409, "already_confirmed", "They're already confirmed. Remove them first to change the pay.");
  }
  if (event.confirmed_count >= event.staff_needed) {
    throw new HttpError(
      409,
      "full",
      `All ${event.staff_needed} spot${event.staff_needed === 1 ? " is" : "s are"} filled. Raise "staff needed" first.`,
    );
  }

  const now = nowIso();
  if (existing) {
    await db
      .prepare(
        `UPDATE applications SET status = 'confirmed', pay_cents = ?1, confirmed_at = ?2, confirmed_by = ?3, updated_at = ?2
          WHERE id = ?4`,
      )
      .bind(payCents, now, admin.id, existing.id)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO applications (id, event_id, staff_id, status, pay_cents, confirmed_at, confirmed_by)
         VALUES (?1, ?2, ?3, 'confirmed', ?4, ?5, ?6)`,
      )
      .bind(newId("app"), event.id, person.id, payCents, now, admin.id)
      .run();
  }

  const url = `${new URL(request.url).origin}/staff`;
  let emailed = false;
  let emailError;
  if (isLocalMode(env)) {
    console.log(`[staff-api] LOCAL confirmation for ${person.email}: ${event.title} at ${payCents} cents`);
  } else {
    const mail = shiftConfirmedEmail({ name: person.name, event, payCents, url });
    const result = await sendEmail(env, db, { ...mail, to: person.email, kind: "confirmation", staffId: person.id });
    emailed = result.ok;
    emailError = result.ok ? undefined : result.error;
  }

  return json(200, { ...(await loadEventDetail(db, event.id)), emailed, emailError, localMode: isLocalMode(env) });
}
