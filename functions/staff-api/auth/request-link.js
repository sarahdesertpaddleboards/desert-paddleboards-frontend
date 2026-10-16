/**
 * POST /staff-api/auth/request-link  { email }
 *
 * Emails a one-time login link. Always answers { ok: true } for a well-formed
 * email so the form can't be used to discover who is on staff. Only existing
 * staff (or bootstrap admins) ever receive a link.
 */
import { createLoginToken, toPublicStaff } from "../../../server/staff/auth.js";
import { isLocalMode, loginLinkEmail, sendEmail } from "../../../server/staff/email.js";
import { json, newId, normalizeEmail, nowIso, readJson } from "../../../server/staff/http.js";

function bootstrapAdmins(env) {
  return String(env.STAFF_BOOTSTRAP_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);

  // Honeypot — bots fill hidden fields, people never see them.
  if (typeof body.company === "string" && body.company.trim()) return json(200, { ok: true });

  const email = normalizeEmail(body.email);
  if (!email) return json(400, { error: "invalid_email", message: "Please enter a valid email address." });

  let staff = await db.prepare("SELECT * FROM staff WHERE email = ?1").bind(email).first();

  // First-run bootstrap: configured admin emails create themselves on first login.
  if (!staff && bootstrapAdmins(env).includes(email)) {
    const id = newId("stf");
    await db
      .prepare("INSERT INTO staff (id, email, role, status, invited_at) VALUES (?1, ?2, 'admin', 'active', ?3)")
      .bind(id, email, nowIso())
      .run();
    staff = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(id).first();
  }

  // Unknown or deactivated: pretend success, send nothing.
  if (!staff || staff.status === "inactive") return json(200, { ok: true });

  const token = await createLoginToken(db, staff.id, "login");
  if (!token) return json(200, { ok: true }); // rate-limited; silently drop

  const url = `${new URL(request.url).origin}/staff/verify?token=${token}`;

  if (isLocalMode(env)) {
    console.log(`[staff-api] LOCAL login link for ${email}: ${url}`);
    return json(200, { ok: true, devLink: url, staff: toPublicStaff(staff) });
  }

  const mail = loginLinkEmail({ name: staff.name, url });
  const result = await sendEmail(env, db, { ...mail, to: email, kind: "login_link", staffId: staff.id });
  if (!result.ok && result.skipped) {
    return json(503, { error: "email_not_configured", message: "Email sending isn't set up yet." });
  }
  return json(200, { ok: true });
}
