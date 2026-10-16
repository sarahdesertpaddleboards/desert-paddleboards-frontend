/**
 * Passwordless auth for the staff tool: one-time email links + cookie sessions.
 *
 * - Login links are random secrets; only their SHA-256 is stored (login_tokens).
 * - A session cookie holds another random secret; its SHA-256 is the row id in
 *   `sessions`. Stealing the database therefore yields no usable cookies/links.
 * - Sessions last SESSION_DAYS (staff log in roughly once per phone).
 */
import {
  HttpError,
  newId,
  nowIso,
  plusDays,
  plusMinutes,
  randomSecret,
  sha256Hex,
} from "./http.js";

export const COOKIE_NAME = "dpb_staff";
export const SESSION_DAYS = 90;
const LOGIN_LINK_MINUTES = 20;
const INVITE_LINK_DAYS = 14;
const MAX_LINKS_PER_HOUR = 5;

export const PUBLIC_STAFF_FIELDS =
  "id, email, name, phone, payout_method, payout_handle, role, status, first_login_at, last_login_at, invited_at, created_at";

/** True when the staff member has filled in what we need to pay them. */
export function isProfileComplete(staff) {
  return Boolean(staff && staff.name && staff.phone && staff.payout_method && staff.payout_handle);
}

export function toPublicStaff(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    payoutMethod: row.payout_method,
    payoutHandle: row.payout_handle,
    role: row.role,
    status: row.status,
    firstLoginAt: row.first_login_at,
    lastLoginAt: row.last_login_at,
    invitedAt: row.invited_at,
    createdAt: row.created_at,
    profileComplete: isProfileComplete(row),
  };
}

// ---------------------------------------------------------------------------
// One-time links

/**
 * Create a login/invite token for a staff member. Returns the raw token to put
 * in the email link, or null if the per-hour limit has been hit.
 */
export async function createLoginToken(db, staffId, purpose) {
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { c } = await db
    .prepare("SELECT COUNT(*) AS c FROM login_tokens WHERE staff_id = ?1 AND created_at > ?2")
    .bind(staffId, hourAgo)
    .first();
  if (c >= MAX_LINKS_PER_HOUR) return null;

  const token = randomSecret(32);
  const hash = await sha256Hex(token);
  const expires = purpose === "invite" ? plusDays(INVITE_LINK_DAYS) : plusMinutes(LOGIN_LINK_MINUTES);
  await db
    .prepare(
      "INSERT INTO login_tokens (id, token_hash, staff_id, purpose, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
    .bind(newId("tok"), hash, staffId, purpose, expires)
    .run();
  return token;
}

/**
 * Redeem a one-time token. Marks it used and returns the staff row, or throws
 * 400 invalid_token / 410 expired_token.
 */
export async function redeemLoginToken(db, token) {
  if (typeof token !== "string" || token.length < 20 || token.length > 128) {
    throw new HttpError(400, "invalid_token", "That link isn't valid.");
  }
  const hash = await sha256Hex(token);
  const row = await db
    .prepare(
      `SELECT t.id AS token_id, t.expires_at, t.used_at, t.purpose, s.*
         FROM login_tokens t JOIN staff s ON s.id = t.staff_id
        WHERE t.token_hash = ?1`,
    )
    .bind(hash)
    .first();
  if (!row) throw new HttpError(400, "invalid_token", "That link isn't valid.");
  if (row.used_at) throw new HttpError(410, "used_token", "That link has already been used.");
  if (row.expires_at < nowIso()) throw new HttpError(410, "expired_token", "That link has expired.");
  if (row.status === "inactive") throw new HttpError(403, "inactive", "This account is no longer active.");

  await db.prepare("UPDATE login_tokens SET used_at = ?1 WHERE id = ?2").bind(nowIso(), row.token_id).run();
  return row;
}

// ---------------------------------------------------------------------------
// Sessions

export async function createSession(db, staffId, request) {
  const secret = randomSecret(32);
  const id = await sha256Hex(secret);
  const expires = plusDays(SESSION_DAYS);
  const ua = (request.headers.get("user-agent") || "").slice(0, 200);
  await db
    .prepare("INSERT INTO sessions (id, staff_id, expires_at, user_agent) VALUES (?1, ?2, ?3, ?4)")
    .bind(id, staffId, expires, ua)
    .run();
  return { secret, expires };
}

export function sessionCookie(request, secret, expiresIso) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const maxAge = Math.max(0, Math.floor((Date.parse(expiresIso) - Date.now()) / 1000));
  return `${COOKIE_NAME}=${secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/** Resolve the current staff member from the session cookie (or null). */
export async function getSessionStaff(db, request) {
  const secret = readCookie(request, COOKIE_NAME);
  if (!secret || secret.length < 20 || secret.length > 128) return null;
  const id = await sha256Hex(secret);
  const row = await db
    .prepare(
      `SELECT s.*, se.expires_at AS session_expires_at, se.last_seen_at AS session_last_seen_at
         FROM sessions se JOIN staff s ON s.id = se.staff_id
        WHERE se.id = ?1`,
    )
    .bind(id)
    .first();
  if (!row) return null;
  const now = nowIso();
  if (row.session_expires_at < now || row.status === "inactive") {
    await db.prepare("DELETE FROM sessions WHERE id = ?1").bind(id).run();
    return null;
  }
  // Touch last_seen_at at most hourly (keeps writes down).
  if (Date.now() - Date.parse(row.session_last_seen_at) > 3_600_000) {
    await db.prepare("UPDATE sessions SET last_seen_at = ?1 WHERE id = ?2").bind(now, id).run();
  }
  return row;
}

export async function destroySession(db, request) {
  const secret = readCookie(request, COOKIE_NAME);
  if (!secret) return;
  const id = await sha256Hex(secret);
  await db.prepare("DELETE FROM sessions WHERE id = ?1").bind(id).run();
}

// ---------------------------------------------------------------------------
// Guards (used by route handlers; middleware puts `staff` on context.data)

export function requireStaff(context) {
  const staff = context.data && context.data.staff;
  if (!staff) throw new HttpError(401, "unauthenticated", "Please log in.");
  return staff;
}

export function requireAdmin(context) {
  const staff = requireStaff(context);
  if (staff.role !== "admin") throw new HttpError(403, "forbidden", "Admins only.");
  return staff;
}
