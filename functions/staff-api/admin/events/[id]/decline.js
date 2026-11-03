/**
 * POST /staff-api/admin/events/:id/decline  { staffId }
 * Turn down an applicant, or take a confirmed person off the shift (frees the
 * spot). No email: Sarah tells them herself. Paid shifts can't be undone here.
 */
import { requireAdmin } from "../../../../../server/staff/auth.js";
import { HttpError, json, nowIso, readJson } from "../../../../../server/staff/http.js";
import { loadEventDetail } from "../../../../../server/staff/shifts.js";

export async function onRequestPost(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const body = await readJson(context.request);
  const app = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(context.params.id, String(body.staffId || ""))
    .first();
  if (!app) throw new HttpError(404, "not_found", "That person isn't on this shift.");
  if (app.paid_at) throw new HttpError(409, "paid", "This shift is already marked paid.");
  if (app.status === "applied" || app.status === "confirmed") {
    await db
      .prepare(
        "UPDATE applications SET status = 'declined', confirmed_at = NULL, confirmed_by = NULL, updated_at = ?1 WHERE id = ?2",
      )
      .bind(nowIso(), app.id)
      .run();
  }
  return json(200, await loadEventDetail(db, context.params.id));
}
