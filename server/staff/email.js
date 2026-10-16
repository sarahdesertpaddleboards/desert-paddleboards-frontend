/**
 * Outbound email for the staff tool, via Resend's REST API (no SDK — keeps the
 * Pages Function bundle tiny). Every send is recorded in email_log.
 *
 * Env: RESEND_API_KEY (secret), STAFF_EMAIL_FROM, STAFF_EMAIL_REPLY_TO (vars).
 * Local mode (STAFF_ENV=local and no API key): nothing is sent; the caller may
 * surface the link directly. Never enable that outside local dev.
 */
import { newId } from "./http.js";

const BRAND_NAVY = "#1f3a4d";
const BRAND_TEAL = "#3e7c84";

export function isLocalMode(env) {
  return env.STAFF_ENV === "local" && !env.RESEND_API_KEY;
}

async function logEmail(db, entry) {
  try {
    await db
      .prepare(
        `INSERT INTO email_log (id, staff_id, to_email, kind, subject, provider_id, status, error)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
      )
      .bind(
        newId("eml"),
        entry.staffId ?? null,
        entry.to,
        entry.kind,
        entry.subject,
        entry.providerId ?? null,
        entry.status,
        entry.error ?? null,
      )
      .run();
  } catch (err) {
    console.error("email_log insert failed", String(err));
  }
}

/**
 * Send one email. Resolves to { ok, skipped?, error? } — never throws, so a
 * mail outage can't break the request that triggered it.
 */
export async function sendEmail(env, db, { to, subject, html, text, kind, staffId }) {
  if (!env.RESEND_API_KEY) {
    await logEmail(db, { to, subject, kind, staffId, status: "skipped", error: "RESEND_API_KEY not set" });
    return { ok: false, skipped: true, error: "not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.STAFF_EMAIL_FROM || "Desert Paddleboards <sarah@desertpaddleboards.com>",
        to: [to],
        reply_to: env.STAFF_EMAIL_REPLY_TO || undefined,
        subject,
        html,
        text,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = `${res.status} ${body?.message || body?.name || "resend_error"}`;
      await logEmail(db, { to, subject, kind, staffId, status: "failed", error });
      return { ok: false, error };
    }
    await logEmail(db, { to, subject, kind, staffId, status: "sent", providerId: body?.id });
    return { ok: true, id: body?.id };
  } catch (err) {
    await logEmail(db, { to, subject, kind, staffId, status: "failed", error: String(err) });
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Templates

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Shared wrapper: logo-free (images get blocked), brand colours, big button. */
function layout({ heading, bodyHtml, buttonLabel, buttonUrl, footnote }) {
  const button = buttonUrl
    ? `<p style="margin:28px 0;">
         <a href="${buttonUrl}" style="display:inline-block;background:${BRAND_NAVY};color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 26px;border-radius:999px;">${escapeHtml(buttonLabel)}</a>
       </p>
       <p style="font-size:13px;color:#6b7280;word-break:break-all;">Or copy this link: <a href="${buttonUrl}" style="color:${BRAND_TEAL};">${buttonUrl}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 20px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${BRAND_TEAL};font-weight:700;">Desert Paddleboards · Staff</p>
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,.06);">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${BRAND_NAVY};">${escapeHtml(heading)}</h1>
      <div style="font-size:16px;line-height:1.55;">${bodyHtml}</div>
      ${button}
      ${footnote ? `<p style="margin:24px 0 0;font-size:13px;color:#6b7280;">${footnote}</p>` : ""}
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">Desert Paddleboards · Life is better on the water</p>
  </div></body></html>`;
}

export function loginLinkEmail({ name, url }) {
  const hi = name ? `Hi ${escapeHtml(name.split(" ")[0])},` : "Hi,";
  return {
    subject: "Your Desert Paddleboards staff login link",
    html: layout({
      heading: "Log in to the staff area",
      bodyHtml: `<p>${hi}</p><p>Tap the button to log in. The link works once and expires in 20 minutes.</p>`,
      buttonLabel: "Log me in",
      buttonUrl: url,
      footnote: "Didn't ask for this? You can ignore this email — nobody can log in without it.",
    }),
    text: `${hi}\n\nLog in to the Desert Paddleboards staff area (link works once, expires in 20 minutes):\n${url}\n\nDidn't ask for this? Ignore this email.`,
  };
}

export function inviteEmail({ name, url, invitedBy }) {
  const hi = name ? `Hi ${escapeHtml(name.split(" ")[0])},` : "Hi,";
  const by = invitedBy ? escapeHtml(invitedBy) : "Sarah";
  return {
    subject: "You're invited to the Desert Paddleboards staff area",
    html: layout({
      heading: "Welcome to the team",
      bodyHtml: `<p>${hi}</p>
        <p>${by} has set you up on the Desert Paddleboards staff area. This is where upcoming floats and events are posted — you pick the ones you'd like to work, and get a confirmation (with your pay) once you're on the roster.</p>
        <p>Tap the button to get started. You'll fill in a quick profile (name, phone, how you'd like to be paid) and you're in.</p>`,
      buttonLabel: "Set up my profile",
      buttonUrl: url,
      footnote: "No passwords to remember — whenever you need to log in, we'll email you a fresh link. This invite link is valid for 14 days.",
    }),
    text: `${hi}\n\n${by} has set you up on the Desert Paddleboards staff area, where upcoming floats and events are posted for you to pick the ones you'd like to work.\n\nGet started (valid 14 days):\n${url}\n\nNo passwords — whenever you need to log in, we'll email you a fresh link.`,
  };
}
