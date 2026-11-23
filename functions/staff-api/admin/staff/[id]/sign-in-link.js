/**
 * POST /staff-api/admin/staff/:id/sign-in-link — mint a 14-day sign-in link and
 * hand it back to Sarah instead of emailing it, so she can text it herself to
 * someone whose email isn't arriving (texting from the app isn't set up).
 */
import { createLoginToken, requireAdmin } from "../../../../../server/staff/auth.js";
import { HttpError, json } from "../../../../../server/staff/http.js";

export async function onRequestPost(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const staff = await db.prepare("SELECT id, status FROM staff WHERE id = ?1").bind(context.params.id).first();
  if (!staff) throw new HttpError(404, "not_found", "No such staff member.");
  if (staff.status === "inactive") throw new HttpError(400, "inactive", "Reactivate this person first.");
  const token = await createLoginToken(db, staff.id, "invite");
  if (!token) throw new HttpError(429, "too_many_links", "Too many links made for this person in the last hour.");
  return json(200, { url: `${new URL(context.request.url).origin}/staff/verify?token=${token}` });
}
