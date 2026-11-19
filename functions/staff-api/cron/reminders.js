/**
 * POST /staff-api/cron/reminders — send due day-before reminders now.
 * Called every 30 minutes by .github/workflows/staff-reminders.yml with
 *   Authorization: Bearer <STAFF_CRON_SECRET>
 * (a Pages secret per environment, and the same value as a GitHub secret).
 * Admins can also call it while logged in (no secret needed).
 */
import { HttpError, json } from "../../../server/staff/http.js";
import { sendDueReminders } from "../../../server/staff/reminders.js";

export async function onRequestPost(context) {
  const { env, request } = context;
  const secret = env.STAFF_CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  const isCron = Boolean(secret) && auth === `Bearer ${secret}`;
  const isAdmin = context.data.staff?.role === "admin";
  if (!isCron && !isAdmin) throw new HttpError(401, "unauthorized", "Not allowed.");
  const origin = new URL(request.url).origin;
  return json(200, await sendDueReminders(env, origin, { force: true }));
}
