/**
 * GET  /staff-api/admin/reminders — are day-before reminders on, and the last run.
 * POST /staff-api/admin/reminders { paused: boolean } — switch them off / on.
 */
import { requireAdmin } from "../../../server/staff/auth.js";
import { json, readJson } from "../../../server/staff/http.js";
import { reminderStatus, setRemindersPaused } from "../../../server/staff/reminders.js";

export async function onRequestGet(context) {
  requireAdmin(context);
  return json(200, await reminderStatus(context.env.STAFF_DB));
}

export async function onRequestPost(context) {
  requireAdmin(context);
  const body = await readJson(context.request);
  await setRemindersPaused(context.env.STAFF_DB, Boolean(body.paused));
  return json(200, await reminderStatus(context.env.STAFF_DB));
}
