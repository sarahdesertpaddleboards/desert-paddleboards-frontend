/**
 * POST /staff-api/shifts/:id/withdraw — take your name off a shift you applied
 * for. Once Sarah has confirmed you, dropping out goes through her (so she can
 * find cover), not the app.
 */
import { requireStaff } from "../../../../server/staff/auth.js";
import { HttpError, json, nowIso } from "../../../../server/staff/http.js";
import { toPublicApplication } from "../../../../server/staff/shifts.js";

export async function onRequestPost(context) {
  const me = requireStaff(context);
  const db = context.env.STAFF_DB;
  const app = await db
    .prepare("SELECT * FROM applications WHERE event_id = ?1 AND staff_id = ?2")
    .bind(context.params.id, me.id)
    .first();
  if (!app) throw new HttpError(404, "not_found", "You haven't applied for this shift.");
  if (app.status === "confirmed") {
    throw new HttpError(
      409,
      "confirmed",
      "You're confirmed for this one. Text Sarah or reply to your confirmation email so she can find cover.",
    );
  }
  if (app.status === "applied") {
    await db
      .prepare("UPDATE applications SET status = 'withdrawn', updated_at = ?1 WHERE id = ?2")
      .bind(nowIso(), app.id)
      .run();
  }
  const fresh = await db.prepare("SELECT * FROM applications WHERE id = ?1").bind(app.id).first();
  return json(200, { application: toPublicApplication(fresh) });
}
