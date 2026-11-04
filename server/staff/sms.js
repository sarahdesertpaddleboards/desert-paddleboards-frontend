/**
 * Text messages for the staff tool, via Twilio's REST API (no SDK). Texts go
 * out alongside the emails because most staff check their phone, not email.
 * Every send is recorded in sms_log.
 *
 * Env:
 *   TWILIO_ACCOUNT_SID   (var)    the account (starts AC…)
 *   TWILIO_AUTH_TOKEN    (secret) never in code or chat
 *   TWILIO_FROM          (var)    the toll-free number, E.164 (+18885551234)
 *   SMS_TEST_NUMBERS     (var, optional) comma list of E.164 numbers. When
 *       set, ONLY these numbers get texts (everyone else is logged as
 *       "test_mode"). Use it until the toll-free number is verified.
 *
 * Who gets texts: only staff who ticked "Text me shift updates"
 * (staff.sms_opt_in = 1), except login links, which they ask for themselves.
 * Replies of STOP are handled by Twilio; a send that fails with 21610
 * ("unsubscribed") turns their opt-in off here too.
 */
import { newId, nowIso } from "./http.js";
import { formatMoney } from "./shifts.js";

export const SMS_BRAND = "Desert Paddleboards";

/** US-first phone normalising: "(602) 456-0884" → "+16024560884"; null if unusable. */
export function toE164(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  const digits = s.replace(/\D/g, "");
  if (s.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function smsConfigured(env) {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM);
}

function testNumbers(env) {
  return String(env.SMS_TEST_NUMBERS || "")
    .split(",")
    .map((n) => toE164(n))
    .filter(Boolean);
}

/** Can this staff member get notification texts? */
export function wantsTexts(staff) {
  return Boolean(staff && staff.sms_opt_in && toE164(staff.phone));
}

async function logSms(db, entry) {
  try {
    await db
      .prepare(
        `INSERT INTO sms_log (id, staff_id, to_phone, kind, body, provider_id, status, error)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
      )
      .bind(
        newId("sms"),
        entry.staffId ?? null,
        entry.to ?? "",
        entry.kind,
        entry.body,
        entry.providerId ?? null,
        entry.status,
        entry.error ?? null,
      )
      .run();
  } catch (err) {
    console.error("sms_log insert failed", String(err));
  }
}

/**
 * Send one text. Resolves to { ok, skipped?, error? } and never throws, so a
 * texting outage can't break the request that triggered it.
 */
export async function sendSms(env, db, { to, body, kind, staffId }) {
  const phone = toE164(to);
  if (!phone) {
    await logSms(db, { to: String(to ?? ""), body, kind, staffId, status: "skipped", error: "no_valid_phone" });
    return { ok: false, skipped: true, error: "no_valid_phone" };
  }
  if (!smsConfigured(env)) {
    if (env.STAFF_ENV === "local") console.log(`[staff-api] LOCAL text to ${phone}: ${body}`);
    await logSms(db, { to: phone, body, kind, staffId, status: "skipped", error: "twilio_not_configured" });
    return { ok: false, skipped: true, error: "not_configured" };
  }
  const allow = testNumbers(env);
  if (allow.length && !allow.includes(phone)) {
    await logSms(db, { to: phone, body, kind, staffId, status: "skipped", error: "test_mode" });
    return { ok: false, skipped: true, error: "test_mode" };
  }
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, From: env.TWILIO_FROM, Body: body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = `${res.status} ${data?.code ?? ""} ${data?.message ?? "twilio_error"}`.trim();
      await logSms(db, { to: phone, body, kind, staffId, status: "failed", error });
      // 21610: they replied STOP. Respect it here too.
      if (data?.code === 21610 && staffId) {
        await db
          .prepare("UPDATE staff SET sms_opt_in = 0, sms_opted_out_at = ?1, updated_at = ?1 WHERE id = ?2")
          .bind(nowIso(), staffId)
          .run()
          .catch(() => {});
      }
      return { ok: false, error };
    }
    await logSms(db, { to: phone, body, kind, staffId, status: "sent", providerId: data?.sid });
    return { ok: true, id: data?.sid };
  } catch (err) {
    await logSms(db, { to: phone, body, kind, staffId, status: "failed", error: String(err) });
    return { ok: false, error: String(err) };
  }
}

/** Text a staff member if they've opted in. Resolves to the send result or { skipped }. */
export async function textStaff(env, db, staff, kind, body) {
  if (!wantsTexts(staff)) return { ok: false, skipped: true, error: "not_opted_in" };
  return sendSms(env, db, { to: staff.phone, body, kind, staffId: staff.id });
}

// ---------------------------------------------------------------------------
// Message text. Plain ASCII (no emoji or curly quotes) keeps each text to as
// few 160-character segments as possible. Every message starts with the brand.

const ROLE_NAMES = { lead: "team leader", teacher: "teacher", artist: "artist", general: "crew" };

function shortWhen(startAt) {
  const d = new Date(startAt);
  const day = d.toLocaleDateString("en-US", { timeZone: "America/Phoenix", weekday: "short", month: "short", day: "numeric" });
  const time = d
    .toLocaleTimeString("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit" })
    .replace(":00", "")
    .replace(/[\s ]*(AM|PM)/, (_, m) => m.toLowerCase());
  return `${day}, ${time}`;
}

export function welcomeText() {
  return `${SMS_BRAND}: You're signed up for staff shift texts (confirmations, changes, pay). Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to opt out.`;
}

export function loginLinkText(url) {
  return `${SMS_BRAND}: Your staff login link (works once, expires in 20 min): ${url}`;
}

export function shiftConfirmedText({ event, payCents, role, trailer, url }) {
  const roleName = ROLE_NAMES[role] || "crew";
  const where = event.venue ? ` at ${event.venue}` : "";
  const pay = `${formatMoney(payCents)}${trailer ? " incl. trailer" : ""}`;
  return `${SMS_BRAND}: You're confirmed for ${event.title}${where}, ${shortWhen(event.start_at)} as ${roleName}${trailer ? " + trailer driver" : ""}. Pay ${pay}. Details: ${url}`;
}

export function paymentSentText({ totalCents, count, url }) {
  return `${SMS_BRAND}: Sarah has sent ${formatMoney(totalCents)} for ${count} shift${count === 1 ? "" : "s"}. See it here: ${url}`;
}
