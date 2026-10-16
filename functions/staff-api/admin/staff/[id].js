/**
 * PATCH /staff-api/admin/staff/:id — admin edits: name, phone, payoutMethod,
 *       payoutHandle, notes, role ('staff'|'admin'), status ('active'|'inactive').
 *       You can't demote or deactivate yourself.
 */
import { requireAdmin, toPublicStaff } from "../../../../server/staff/auth.js";
import { HttpError, cleanText, json, nowIso, readJson } from "../../../../server/staff/http.js";
import { PAYOUT_METHODS } from "../../../../server/staff/invite.js";

export async function onRequestPatch(context) {
  const admin = requireAdmin(context);
  const db = context.env.STAFF_DB;
  const id = context.params.id;
  const body = await readJson(context.request);

  const target = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(id).first();
  if (!target) throw new HttpError(404, "not_found", "No such staff member.");

  const updates = {};
  if (body.name !== undefined) {
    const name = cleanText(body.name, 80);
    if (!name) throw new HttpError(400, "name_required", "Name can't be empty.");
    updates.name = name;
  }
  if (body.phone !== undefined) updates.phone = cleanText(body.phone, 30);
  if (body.payoutMethod !== undefined) {
    const m = body.payoutMethod ? String(body.payoutMethod) : null;
    if (m && !PAYOUT_METHODS.includes(m)) throw new HttpError(400, "invalid_payout_method");
    updates.payout_method = m;
  }
  if (body.payoutHandle !== undefined) updates.payout_handle = cleanText(body.payoutHandle, 120);
  if (body.notes !== undefined) updates.notes = cleanText(body.notes, 1000);
  if (body.role !== undefined) {
    if (!["staff", "admin"].includes(body.role)) throw new HttpError(400, "invalid_role");
    if (target.id === admin.id && body.role !== "admin") {
      throw new HttpError(400, "cannot_demote_self", "You can't remove your own admin access.");
    }
    updates.role = body.role;
  }
  if (body.status !== undefined) {
    if (!["active", "inactive"].includes(body.status)) throw new HttpError(400, "invalid_status");
    if (target.id === admin.id && body.status === "inactive") {
      throw new HttpError(400, "cannot_deactivate_self", "You can't deactivate yourself.");
    }
    // Someone who never logged in stays 'invited' rather than jumping to 'active'.
    updates.status = body.status === "active" && !target.first_login_at ? "invited" : body.status;
  }

  const keys = Object.keys(updates);
  if (keys.length) {
    const sets = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    await db
      .prepare(`UPDATE staff SET ${sets}, updated_at = ?${keys.length + 1} WHERE id = ?${keys.length + 2}`)
      .bind(...keys.map((k) => updates[k]), nowIso(), id)
      .run();
    if (updates.status === "inactive") {
      await db.prepare("DELETE FROM sessions WHERE staff_id = ?1").bind(id).run();
    }
  }

  const fresh = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(id).first();
  return json(200, { staff: { ...toPublicStaff(fresh), notes: fresh.notes } });
}
