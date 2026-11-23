/**
 * Day-before reminders (Sarah, 19 Nov 2026: "I've been telling Shellie to send
 * it out 24 hours before... if this is all automatic, that's great").
 *
 * Every confirmed person on a shift starting within the next 24 hours gets one
 * reminder (email, plus a text if they opted in): when, where, address, notes.
 * The person in charge also gets the venue's PRIVATE on-site contact:
 *   - the confirmed event lead(s);
 *   - no lead: whoever is working it if it's just one person, else the
 *     first-confirmed artist, else the first-confirmed person.
 * Someone confirmed later (still before the start) gets theirs on the next run.
 *
 * Triggered every 30 min by the dpb-staff-cron Worker (workers/staff-cron →
 * POST /staff-api/cron/reminders) and,
 * as a fallback, lazily when anyone opens the staff area (throttled).
 */
import { isLocalMode, sendEmail, shiftReminderEmail } from "./email.js";
import { nowIso } from "./http.js";
import { shiftReminderText, textStaff } from "./sms.js";
import { contactForEvent } from "./venues.js";

const STATE_KEY = "reminders";
const PAUSE_KEY = "reminders_paused";
const LAZY_EVERY_MIN = 10;

/** Sarah can switch reminders off (Schedule page) while she's setting up. */
export async function remindersPaused(db) {
  const row = await db.prepare("SELECT value FROM staff_settings WHERE key = ?1").bind(PAUSE_KEY).first();
  return row?.value === "1";
}

export async function setRemindersPaused(db, paused) {
  await db
    .prepare(
      `INSERT INTO staff_settings (key, value, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(PAUSE_KEY, paused ? "1" : "0", nowIso())
    .run();
}

export async function reminderStatus(db) {
  return { paused: await remindersPaused(db), lastRun: await lastRun(db) };
}

/** staff_id of whoever gets the private contact for one shift's confirmed people. */
export function personInCharge(confirmed) {
  if (!confirmed.length) return new Set();
  const byConfirm = [...confirmed].sort((a, b) => String(a.confirmed_at).localeCompare(String(b.confirmed_at)));
  const leads = byConfirm.filter((a) => a.role === "lead");
  if (leads.length) return new Set(leads.map((a) => a.staff_id));
  if (byConfirm.length === 1) return new Set([byConfirm[0].staff_id]);
  const artist = byConfirm.find((a) => a.role === "artist");
  return new Set([(artist ?? byConfirm[0]).staff_id]);
}

async function lastRun(db) {
  const row = await db.prepare("SELECT value FROM staff_settings WHERE key = ?1").bind(STATE_KEY).first();
  try {
    return row?.value ? JSON.parse(row.value) : null;
  } catch {
    return null;
  }
}

async function saveRun(db, state) {
  await db
    .prepare(
      `INSERT INTO staff_settings (key, value, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(STATE_KEY, JSON.stringify(state), nowIso())
    .run();
}

/**
 * Send any reminders that are due. Never throws. `origin` builds the links
 * (https://staff.desert-paddleboards.pages.dev or the live site).
 */
export async function sendDueReminders(env, origin, { force = false } = {}) {
  const db = env.STAFF_DB;
  try {
    // Paused: send nothing and mark nothing, so anyone whose shift is within
    // 24 hours when reminders are switched back on gets theirs then.
    if (await remindersPaused(db)) return { paused: true };
    const prev = await lastRun(db);
    if (!force && prev?.startedAt && Date.now() - Date.parse(prev.startedAt) < LAZY_EVERY_MIN * 60_000) return prev;
    const state = { startedAt: nowIso(), sent: 0, failed: 0 };
    await saveRun(db, state);

    // Every confirmed person on shifts starting in the next 24h (the in-charge
    // rule needs the whole team, not just the ones still to remind).
    const { results } = await db
      .prepare(
        `SELECT a.id AS app_id, a.staff_id, a.role, a.trailer, a.confirmed_at, a.reminded_at,
                e.*, (SELECT v.address FROM venues v WHERE v.name_key = lower(trim(e.venue))) AS venue_address,
                s.name AS s_name, s.email AS s_email, s.phone AS s_phone, s.sms_opt_in AS s_sms_opt_in, s.status AS s_status
           FROM applications a
           JOIN events e ON e.id = a.event_id
           JOIN staff s ON s.id = a.staff_id
          WHERE a.status = 'confirmed' AND e.status != 'cancelled'
            AND datetime(e.start_at) > datetime('now')
            AND datetime(e.start_at) <= datetime('now', '+24 hours')`,
      )
      .all();

    const byEvent = new Map();
    for (const r of results) {
      if (!byEvent.has(r.id)) byEvent.set(r.id, []);
      byEvent.get(r.id).push(r);
    }

    const url = `${origin}/staff`;
    for (const team of byEvent.values()) {
      const due = team.filter((r) => !r.reminded_at && r.s_status !== "inactive");
      if (!due.length) continue;
      const event = team[0];
      const inCharge = personInCharge(team);
      const contact = await contactForEvent(db, event);
      for (const r of due) {
        // Claim it first so two overlapping runs can't both send.
        const claim = await db
          .prepare("UPDATE applications SET reminded_at = ?1 WHERE id = ?2 AND reminded_at IS NULL")
          .bind(nowIso(), r.app_id)
          .run();
        if (!claim.meta?.changes) continue;
        const lead = inCharge.has(r.staff_id);
        if (isLocalMode(env)) {
          console.log(`[staff-api] LOCAL reminder to ${r.s_email} for ${event.title}${lead ? ` (in charge; contact ${contact.contactName ?? "-"} ${contact.contactPhone ?? "-"})` : ""}`);
        } else {
          const mail = shiftReminderEmail({
            name: r.s_name,
            event,
            role: r.role,
            trailer: Boolean(r.trailer),
            inCharge: lead,
            contact: lead ? contact : null,
            url,
            calendar: null,
          });
          const res = await sendEmail(env, db, { ...mail, to: r.s_email, kind: "reminder", staffId: r.staff_id });
          if (res.ok) state.sent++;
          else state.failed++;
        }
        await textStaff(
          env,
          db,
          { id: r.staff_id, phone: r.s_phone, sms_opt_in: r.s_sms_opt_in },
          "reminder",
          shiftReminderText({
            event,
            role: r.role,
            trailer: Boolean(r.trailer),
            inCharge: lead,
            contact: lead ? contact : null,
            address: contact.address,
            url,
          }),
        );
      }
    }
    state.finishedAt = nowIso();
    await saveRun(db, state);
    return state;
  } catch (err) {
    console.error("reminders failed", String(err));
    return { error: String(err) };
  }
}
