/**
 * GET  /staff-api/admin/staff          — everyone on the roster (admins only).
 * POST /staff-api/admin/staff          — invite { email, name?, role? }:
 *      creates the staff row and emails a 14-day invite link.
 */
import { requireAdmin, toPublicStaff } from "../../../../server/staff/auth.js";
import { sendInvite } from "../../../../server/staff/invite.js";
import { HttpError, cleanText, json, newId, normalizeEmail, nowIso, readJson } from "../../../../server/staff/http.js";

export async function onRequestGet(context) {
  requireAdmin(context);
  const { results } = await context.env.STAFF_DB.prepare(
    `SELECT * FROM staff
      ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'invited' THEN 1 ELSE 2 END, LOWER(COALESCE(name, email))`,
  ).all();
  return json(200, { staff: results.map((r) => ({ ...toPublicStaff(r), notes: r.notes })) });
}

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);

  const email = normalizeEmail(body.email);
  if (!email) throw new HttpError(400, "invalid_email", "Please enter a valid email address.");
  const name = cleanText(body.name, 80);
  const role = body.role === "admin" ? "admin" : "staff";

  const existing = await db.prepare("SELECT * FROM staff WHERE email = ?1").bind(email).first();
  if (existing && existing.status === "active") {
    throw new HttpError(409, "already_active", "That person already has an account.");
  }

  let staff = existing;
  const now = nowIso();
  if (!staff) {
    const id = newId("stf");
    await db
      .prepare(
        `INSERT INTO staff (id, email, name, role, status, invited_by, invited_at)
         VALUES (?1, ?2, ?3, ?4, 'invited', ?5, ?6)`,
      )
      .bind(id, email, name, role, admin.id, now)
      .run();
    staff = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(id).first();
  } else {
    // Re-invite someone who was deactivated or never finished signing up.
    await db
      .prepare(
        `UPDATE staff SET name = COALESCE(?1, name), status = 'invited', invited_by = ?2, invited_at = ?3, updated_at = ?3
          WHERE id = ?4`,
      )
      .bind(name, admin.id, now, staff.id)
      .run();
    staff = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(staff.id).first();
  }

  const sent = await sendInvite(env, db, request, staff, admin);
  return json(201, { staff: toPublicStaff(staff), ...sent });
}
