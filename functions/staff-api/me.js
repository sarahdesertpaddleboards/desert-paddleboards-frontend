/**
 * GET   /staff-api/me — the logged-in staff member (401 if none).
 * PATCH /staff-api/me — update own profile: name, phone, payoutMethod, payoutHandle,
 *       skills (what they can do: lead, teacher, artist, general, trailer),
 *       smsOptIn (their own consent to shift texts; only they can turn it on).
 *       Turning texts on (or changing the number while on) sends a welcome
 *       text with the STOP/HELP wording carriers require.
 */
import { requireStaff, toPublicStaff } from "../../server/staff/auth.js";
import { HttpError, cleanText, json, nowIso, readJson } from "../../server/staff/http.js";
import { PAYOUT_METHODS } from "../../server/staff/invite.js";
import { parseSkills } from "../../server/staff/roles.js";
import { sendSms, toE164, welcomeText } from "../../server/staff/sms.js";

export async function onRequestGet(context) {
  const staff = requireStaff(context);
  return json(200, { staff: toPublicStaff(staff) });
}

export async function onRequestPatch(context) {
  const staff = requireStaff(context);
  const db = context.env.STAFF_DB;
  const body = await readJson(context.request);

  const name = cleanText(body.name, 80);
  const phone = cleanText(body.phone, 30);
  const payoutMethod = body.payoutMethod == null || body.payoutMethod === "" ? null : String(body.payoutMethod);
  const payoutHandle = cleanText(body.payoutHandle, 120);

  if (body.name !== undefined && !name) throw new HttpError(400, "name_required", "Please enter your name.");
  if (phone && !/^[+\d][\d\s().-]{6,}$/.test(phone)) {
    throw new HttpError(400, "invalid_phone", "That phone number doesn't look right.");
  }
  if (payoutMethod && !PAYOUT_METHODS.includes(payoutMethod)) {
    throw new HttpError(400, "invalid_payout_method", "Pick a payment method from the list.");
  }

  // Check text consent before saving anything, so a refusal changes nothing.
  if (body.smsOptIn && !toE164(body.phone !== undefined ? phone : staff.phone)) {
    throw new HttpError(400, "phone_required_for_texts", "Add a US mobile number to get texts.");
  }

  await db
    .prepare(
      `UPDATE staff
          SET name = COALESCE(?1, name),
              phone = CASE WHEN ?5 THEN ?2 ELSE phone END,
              payout_method = CASE WHEN ?6 THEN ?3 ELSE payout_method END,
              payout_handle = CASE WHEN ?7 THEN ?4 ELSE payout_handle END,
              skills = CASE WHEN ?10 THEN ?11 ELSE skills END,
              updated_at = ?8
        WHERE id = ?9`,
    )
    .bind(
      name,
      phone,
      payoutMethod,
      payoutHandle,
      body.phone !== undefined ? 1 : 0,
      body.payoutMethod !== undefined ? 1 : 0,
      body.payoutHandle !== undefined ? 1 : 0,
      nowIso(),
      staff.id,
      body.skills !== undefined ? 1 : 0,
      body.skills !== undefined ? parseSkills(body.skills).join(",") || null : null,
    )
    .run();

  let fresh = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(staff.id).first();

  // Text consent. Checked after the phone update so "add my number and turn
  // texts on" works in one save.
  let texted;
  if (body.smsOptIn !== undefined) {
    const on = Boolean(body.smsOptIn);
    const now = nowIso();
    const phoneChanged = toE164(fresh.phone) !== toE164(staff.phone);
    if (on && (!fresh.sms_opt_in || phoneChanged)) {
      await db
        .prepare("UPDATE staff SET sms_opt_in = 1, sms_consent_at = ?1, sms_opted_out_at = NULL, updated_at = ?1 WHERE id = ?2")
        .bind(now, staff.id)
        .run();
      const result = await sendSms(context.env, db, { to: fresh.phone, body: welcomeText(), kind: "welcome", staffId: staff.id });
      texted = result.ok;
    } else if (!on && fresh.sms_opt_in) {
      await db
        .prepare("UPDATE staff SET sms_opt_in = 0, sms_opted_out_at = ?1, updated_at = ?1 WHERE id = ?2")
        .bind(now, staff.id)
        .run();
    }
    fresh = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(staff.id).first();
  }
  return json(200, { staff: toPublicStaff(fresh), texted });
}
