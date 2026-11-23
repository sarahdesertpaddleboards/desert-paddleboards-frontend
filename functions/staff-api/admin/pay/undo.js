/**
 * POST /staff-api/admin/pay/undo  { applicationId }
 * Take back a "paid" mark made by mistake. Any payment email already sent
 * stays sent, so Sarah should let the person know.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, nowIso, readJson } from "../../../../server/staff/http.js";

export async function onRequestPost(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const body = await readJson(context.request);
  const app = await db.prepare("SELECT id, paid_at FROM applications WHERE id = ?1").bind(String(body.applicationId || "")).first();
  if (!app) throw new HttpError(404, "not_found", "No such shift.");
  if (!app.paid_at) throw new HttpError(409, "not_paid", "That shift isn't marked paid.");
  await db
    .prepare("UPDATE applications SET paid_at = NULL, paid_by = NULL, paid_note = NULL, updated_at = ?1 WHERE id = ?2")
    .bind(nowIso(), app.id)
    .run();
  return json(200, { ok: true });
}
