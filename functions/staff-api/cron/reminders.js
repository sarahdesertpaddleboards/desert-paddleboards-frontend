/**
 * POST /staff-api/cron/reminders — send due day-before reminders now.
 *
 * Called every 30 minutes by the Cloudflare Worker in workers/staff-cron
 * (Pages has no cron of its own). That Worker shares this D1 database: before
 * each call it writes a fresh random token to staff_settings "cron_token" and
 * sends it as `Authorization: Bearer <token>`. A token older than 10 minutes
 * is refused, so there's no long-lived secret to set or leak.
 *
 * Also accepted: Bearer <STAFF_CRON_SECRET> (if that Pages secret is set), or
 * a logged-in admin.
 */
import { HttpError, json } from "../../../server/staff/http.js";
import { sendDueReminders } from "../../../server/staff/reminders.js";

const TOKEN_MAX_AGE_MS = 10 * 60 * 1000;

function sameString(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function workerTokenOk(db, bearer) {
  if (bearer.length < 32) return false;
  const row = await db.prepare("SELECT value, updated_at FROM staff_settings WHERE key = 'cron_token'").first();
  if (!row?.value || row.value.length < 32) return false;
  if (Date.now() - Date.parse(row.updated_at) > TOKEN_MAX_AGE_MS) return false;
  return sameString(bearer, row.value);
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const secret = env.STAFF_CRON_SECRET;
  const ok =
    context.data.staff?.role === "admin" ||
    (bearer && secret && sameString(bearer, secret)) ||
    (bearer && (await workerTokenOk(env.STAFF_DB, bearer)));
  if (!ok) throw new HttpError(401, "unauthorized", "Not allowed.");
  const origin = new URL(request.url).origin;
  return json(200, await sendDueReminders(env, origin, { force: true }));
}
