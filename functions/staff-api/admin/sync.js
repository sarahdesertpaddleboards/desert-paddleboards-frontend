/**
 * GET  /staff-api/admin/sync — when the calendar last auto-posted shifts, and what changed.
 * POST /staff-api/admin/sync — sync now (Schedule → "Sync with calendar").
 */
import { requireAdmin } from "../../../server/staff/auth.js";
import { json } from "../../../server/staff/http.js";
import { AUTO_POST_DAYS, getSyncState, syncCalendar } from "../../../server/staff/sync.js";

export async function onRequestGet(context) {
  requireAdmin(context);
  return json(200, { state: await getSyncState(context.env.STAFF_DB), windowDays: AUTO_POST_DAYS });
}

export async function onRequestPost(context) {
  requireAdmin(context);
  const state = await syncCalendar(context.env, context.request, { force: true });
  return json(200, { state, windowDays: AUTO_POST_DAYS });
}
