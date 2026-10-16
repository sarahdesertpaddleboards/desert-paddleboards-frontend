/**
 * GET   /staff-api/me — the logged-in staff member (401 if none).
 * PATCH /staff-api/me — update own profile: name, phone, payoutMethod, payoutHandle.
 */
import { requireStaff, toPublicStaff } from "../../server/staff/auth.js";
import { HttpError, cleanText, json, nowIso, readJson } from "../../server/staff/http.js";
import { PAYOUT_METHODS } from "../../server/staff/invite.js";

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

  await db
    .prepare(
      `UPDATE staff
          SET name = COALESCE(?1, name),
              phone = CASE WHEN ?5 THEN ?2 ELSE phone END,
              payout_method = CASE WHEN ?6 THEN ?3 ELSE payout_method END,
              payout_handle = CASE WHEN ?7 THEN ?4 ELSE payout_handle END,
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
    )
    .run();

  const fresh = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(staff.id).first();
  return json(200, { staff: toPublicStaff(fresh) });
}
