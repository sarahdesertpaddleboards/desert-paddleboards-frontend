/** POST /staff-api/admin/staff/:id/resend-invite — email a fresh invite link. */
import { requireAdmin, toPublicStaff } from "../../../../../server/staff/auth.js";
import { HttpError, json } from "../../../../../server/staff/http.js";
import { sendInvite } from "../../../../../server/staff/invite.js";

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const db = context.env.STAFF_DB;
  const staff = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(context.params.id).first();
  if (!staff) throw new HttpError(404, "not_found", "No such staff member.");
  if (staff.status === "inactive") throw new HttpError(400, "inactive", "Reactivate this person first.");
  const sent = await sendInvite(context.env, db, context.request, staff, admin);
  return json(200, { staff: toPublicStaff(staff), ...sent });
}
