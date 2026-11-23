/** POST /staff-api/auth/logout — end the current session. */
import { clearSessionCookie, destroySession } from "../../../server/staff/auth.js";
import { json } from "../../../server/staff/http.js";

export async function onRequestPost(context) {
  await destroySession(context.env.STAFF_DB, context.request);
  return json(200, { ok: true }, { "set-cookie": clearSessionCookie(context.request) });
}
