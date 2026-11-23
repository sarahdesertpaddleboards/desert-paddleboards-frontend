/**
 * POST /staff-api/auth/verify  { token }
 *
 * Redeems a one-time link, starts a session (HttpOnly cookie) and tells the
 * client where to go next. POST (from the /staff/verify page's JS) rather than
 * GET so link-scanning mail security tools don't burn the token.
 */
import {
  createSession,
  isProfileComplete,
  redeemLoginToken,
  sessionCookie,
  toPublicStaff,
} from "../../../server/staff/auth.js";
import { json, nowIso, readJson } from "../../../server/staff/http.js";

export async function onRequestPost(context) {
  const { env, request } = context;
  const db = env.STAFF_DB;
  const { token } = await readJson(request);

  const staff = await redeemLoginToken(db, token);
  const now = nowIso();
  await db
    .prepare(
      `UPDATE staff
          SET status = CASE WHEN status = 'invited' THEN 'active' ELSE status END,
              first_login_at = COALESCE(first_login_at, ?1),
              last_login_at = ?1,
              updated_at = ?1
        WHERE id = ?2`,
    )
    .bind(now, staff.id)
    .run();
  const fresh = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(staff.id).first();

  const { secret, expires } = await createSession(db, staff.id, request);
  const next = isProfileComplete(fresh) ? "/staff" : "/staff/profile?welcome=1";

  return json(
    200,
    { ok: true, staff: toPublicStaff(fresh), next },
    { "set-cookie": sessionCookie(request, secret, expires) },
  );
}
