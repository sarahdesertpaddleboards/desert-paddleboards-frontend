/**
 * POST /staff-api/admin/events/:id/confirm
 *   { staffId | email (+ name), role, pay, trailer? }
 * Put someone on the shift in a role at a locked-in pay and email them. Works
 * for an applicant, as a direct assignment, or for someone not on the team yet
 * (by email): they're added to the roster and get one email with the shift and
 * a link to set up their profile. Sarah types the pay for this person on this
 * shift (it varies by person and event); if they're also driving the trailer,
 * that one amount covers it. Pay can't be changed once confirmed: remove them
 * and confirm again.
 */
import { createLoginToken, requireAdmin } from "../../../../../server/staff/auth.js";
import { assignedInviteEmail, isLocalMode, sendEmail, shiftConfirmedEmail } from "../../../../../server/staff/email.js";
import { HttpError, cleanText, json, newId, normalizeEmail, nowIso, readJson } from "../../../../../server/staff/http.js";
import { ROLE_LABELS, readRole } from "../../../../../server/staff/roles.js";
import { getEventWithCounts, loadEventDetail, parsePayCents, toPublicEvent } from "../../../../../server/staff/shifts.js";

async function findOrInvite(db, body, admin) {
  if (body.staffId) {
    const person = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(String(body.staffId)).first();
    if (!person) throw new HttpError(404, "staff_not_found", "No such staff member.");
    return { person, created: false };
  }
  const email = normalizeEmail(body.email);
  if (!email) throw new HttpError(400, "invalid_email", "Choose a person, or enter a valid email address.");
  const existing = await db.prepare("SELECT * FROM staff WHERE email = ?1").bind(email).first();
  if (existing) return { person: existing, created: false };
  const id = newId("stf");
  const now = nowIso();
  await db
    .prepare(
      `INSERT INTO staff (id, email, name, role, status, invited_by, invited_at)
       VALUES (?1, ?2, ?3, 'staff', 'invited', ?4, ?5)`,
    )
    .bind(id, email, cleanText(body.name, 80), admin.id, now)
    .run();
  return { person: await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(id).first(), created: true };
}

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);

  const row = await getEventWithCounts(db, context.params.id);
  if (!row) throw new HttpError(404, "not_found", "No such shift.");
  const event = toPublicEvent(row);
  if (event.status === "cancelled") throw new HttpError(409, "cancelled", "This shift is cancelled. Reopen it first.");

  // Validate everything before possibly adding a new person to the roster.
  const role = readRole(body.role);
  const slot = event.roles.find((r) => r.role === role);
  if (!slot) throw new HttpError(400, "role_not_on_shift", `This shift doesn't have a ${ROLE_LABELS[role].toLowerCase()} spot. Edit the shift to add one.`);
  const payCents = parsePayCents(body.pay, { required: true });
  const trailer = body.trailer ? 1 : 0;
  if (trailer && !event.trailerOpen) {
    throw new HttpError(409, "trailer_full", event.trailerNeeded ? "Someone is already driving the trailer." : "This shift doesn't need a trailer driver. Edit the shift first.");
  }
  if (slot.confirmed >= slot.needed) {
    throw new HttpError(
      409,
      "full",
      `All ${slot.needed} ${ROLE_LABELS[role].toLowerCase()} spot${slot.needed === 1 ? " is" : "s are"} filled. Edit the shift to add more.`,
    );
  }

  const { person, created } = await findOrInvite(db, body, admin);
  if (person.status === "inactive") throw new HttpError(409, "inactive", "That person is deactivated. Reactivate them on the People page first.");

  const existing = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(event.id, person.id)
    .first();
  if (existing?.status === "confirmed") {
    throw new HttpError(409, "already_confirmed", "They're already confirmed. Remove them first to change the role or pay.");
  }

  const now = nowIso();
  if (existing) {
    await db
      .prepare(
        `UPDATE applications SET status = 'confirmed', role = ?1, trailer = ?2, pay_cents = ?3, trailer_pay_cents = NULL,
                confirmed_at = ?4, confirmed_by = ?5, updated_at = ?4
          WHERE id = ?6`,
      )
      .bind(role, trailer, payCents, now, admin.id, existing.id)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO applications (id, event_id, staff_id, status, role, trailer, pay_cents, confirmed_at, confirmed_by)
         VALUES (?1, ?2, ?3, 'confirmed', ?4, ?5, ?6, ?7, ?8)`,
      )
      .bind(newId("app"), event.id, person.id, role, trailer, payCents, now, admin.id)
      .run();
  }

  // Someone who has never logged in gets the shift + an invite link in one email.
  const origin = new URL(request.url).origin;
  const needsInvite = person.status === "invited";
  const token = needsInvite ? await createLoginToken(db, person.id, "invite") : null;
  const details = { name: person.name, event: row, payCents, role, trailer: Boolean(trailer) };
  let emailed = false;
  let emailError;
  let devLink;
  if (isLocalMode(env)) {
    devLink = token ? `${origin}/staff/verify?token=${token}` : undefined;
    console.log(`[staff-api] LOCAL confirmation for ${person.email}: ${event.title} as ${role} at ${payCents} cents${devLink ? ` — invite ${devLink}` : ""}`);
  } else {
    const mail = token
      ? assignedInviteEmail({ ...details, url: `${origin}/staff/verify?token=${token}`, invitedBy: admin.name })
      : shiftConfirmedEmail({ ...details, url: `${origin}/staff`, confirmedBy: admin.name });
    const result = await sendEmail(env, db, { ...mail, to: person.email, kind: token ? "invite" : "confirmation", staffId: person.id });
    emailed = result.ok;
    emailError = result.ok ? undefined : result.error;
  }

  return json(200, {
    ...(await loadEventDetail(db, event.id)),
    emailed,
    emailError,
    invited: Boolean(token),
    addedToTeam: created,
    devLink,
    localMode: isLocalMode(env),
  });
}
