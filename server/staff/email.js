/**
 * Outbound email for the staff tool, via Resend's REST API (no SDK — keeps the
 * Pages Function bundle tiny). Every send is recorded in email_log.
 *
 * Env: RESEND_API_KEY (secret), STAFF_EMAIL_FROM, STAFF_EMAIL_REPLY_TO (vars).
 * Local mode (STAFF_ENV=local and no API key): nothing is sent; the caller may
 * surface the link directly. Never enable that outside local dev.
 */
import { newId } from "./http.js";
import { formatMoney, formatWhen } from "./shifts.js";

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

/** "You're confirmed" — sent from Sarah when she puts someone on a shift. Pay is locked in. */
export function shiftConfirmedEmail({ name, event, payCents, url }) {
  const first = name ? name.split(" ")[0] : null;
  const hi = first ? `Hi ${escapeHtml(first)},` : "Hi,";
  const when = formatWhen(event.start_at, event.end_at);
  const where = [event.venue, event.city].filter(Boolean).join(", ");
  const pay = formatMoney(payCents);
  const shortDate = new Date(event.start_at).toLocaleDateString("en-US", {
    timeZone: "America/Phoenix",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
      : "";
  const notes = event.notes
    ? `<p style="margin:16px 0 0;padding:12px 14px;background:#f4f6f7;border-radius:10px;">${escapeHtml(event.notes)}</p>`
    : "";
  return {
    subject: `You're confirmed: ${event.title}, ${shortDate}`,
    html: layout({
      heading: "You're on the roster",
      bodyHtml: `<p>${hi}</p><p>Sarah has confirmed you for this shift:</p>
        <table style="border-collapse:collapse;font-size:16px;margin:8px 0 0;">
          ${row("Shift", event.title)}${row("When", when)}${row("Where", where)}${row("Pay", pay)}
        </table>${notes}
        <p style="margin-top:16px;">Your pay is locked in at <strong>${escapeHtml(pay)}</strong>. Sarah will mark it paid in the staff area once it's sent.</p>`,
      buttonLabel: "View my shifts",
      buttonUrl: url,
      footnote: "Can't make it after all? Reply to this email or text Sarah as soon as you can so she can find cover.",
    }),
    text:
      `${first ? `Hi ${first},` : "Hi,"}\n\nSarah has confirmed you for this shift:\n\n` +
      `Shift: ${event.title}\nWhen: ${when}\n${where ? `Where: ${where}\n` : ""}Pay: ${pay}\n` +
      `${event.notes ? `\n${event.notes}\n` : ""}` +
      `\nYour pay is locked in at ${pay}. Sarah will mark it paid in the staff area once it's sent.\n\n` +
      `View your shifts: ${url}\n\nCan't make it after all? Reply to this email or text Sarah so she can find cover.`,
  };
}

const PAYOUT_LABELS = { venmo: "Venmo", zelle: "Zelle", cashapp: "Cash App", paypal: "PayPal", check: "check", other: "" };

/** "Your pay is on its way" — sent when Sarah marks one or more shifts paid. */
export function paymentSentEmail({ name, items, note, payoutMethod, payoutHandle, url }) {
  const first = name ? name.split(" ")[0] : null;
  const hi = first ? `Hi ${escapeHtml(first)},` : "Hi,";
  const total = formatMoney(items.reduce((sum, i) => sum + (i.payCents ?? 0), 0));
  const day = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Phoenix", weekday: "short", month: "short", day: "numeric" });
  const via = PAYOUT_LABELS[payoutMethod] ? `${PAYOUT_LABELS[payoutMethod]}${payoutHandle ? ` (${payoutHandle})` : ""}` : null;
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;white-space:nowrap;">${escapeHtml(day(i.startAt))}</td><td style="padding:6px 16px 6px 0;">${escapeHtml(i.title)}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(formatMoney(i.payCents))}</td></tr>`,
    )
    .join("");
  const totalRow =
    items.length > 1
      ? `<tr><td></td><td style="padding:10px 16px 0 0;border-top:1px solid #e5e7eb;font-weight:600;">Total</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:700;">${escapeHtml(total)}</td></tr>`
      : "";
  const noteHtml = note
    ? `<p style="margin:16px 0 0;padding:12px 14px;background:#f4f6f7;border-radius:10px;">Note from Sarah: ${escapeHtml(note)}</p>`
    : "";
  return {
    subject: `Paid: ${total} from Desert Paddleboards`,
    html: layout({
      heading: "Your pay is on its way",
      bodyHtml: `<p>${hi}</p><p>Sarah has sent <strong>${escapeHtml(total)}</strong>${via ? ` by ${escapeHtml(via)}` : ""} for:</p>
        <table style="border-collapse:collapse;font-size:16px;margin:8px 0 0;width:100%;">${rows}${totalRow}</table>${noteHtml}
        <p style="margin-top:16px;">It may take a little while to show up, depending on how it was sent. Thanks for your work!</p>`,
      buttonLabel: "See my earnings",
      buttonUrl: url,
      footnote: "Something not right, or it hasn't arrived in a couple of days? Reply to this email.",
    }),
    text:
      `${first ? `Hi ${first},` : "Hi,"}\n\nSarah has sent ${total}${via ? ` by ${via}` : ""} for:\n\n` +
      items.map((i) => `- ${day(i.startAt)}: ${i.title}, ${formatMoney(i.payCents)}`).join("\n") +
      `${items.length > 1 ? `\nTotal: ${total}` : ""}\n${note ? `\nNote from Sarah: ${note}\n` : ""}` +
      `\nSee your earnings: ${url}\n\nSomething not right, or it hasn't arrived in a couple of days? Reply to this email.`,
  };
}
