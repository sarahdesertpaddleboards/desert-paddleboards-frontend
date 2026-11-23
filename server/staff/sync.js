/**
 * Calendar auto-posting: every session on the public calendar in the next
 * AUTO_POST_DAYS becomes an open shift, staffed per the matching template, so
 * staff can apply without Sarah posting each one. Sarah only posts private /
 * off-calendar events by hand.
 *
 * Runs lazily (no cron on Pages): at most every SYNC_EVERY_MIN when someone
 * opens the staff area, in the background via waitUntil, or on demand from
 * Schedule → "Sync now". Same session list as the public calendar
 * (mergeSessions = live FareHarbor feed + city classes).
 *
 * - New session → new shift (unless dismissed by Sarah or its template says
 *   don't auto-post).
 * - FareHarbor slot moved → shift times follow it.
 * - Session gone from the calendar → shift flagged "off calendar" for Sarah to
 *   decide (never auto-cancelled: the FareHarbor feed occasionally drops items).
 */
import { mergeSessions } from "../../src/lib/merge-sessions.ts";
import { newId, nowIso } from "./http.js";
import { insertRoleStatements } from "./roles.js";
import { toArizonaIso } from "./shifts.js";
import { loadTemplates, matchTemplate } from "./templates.js";

export const AUTO_POST_DAYS = 90;
const SYNC_EVERY_MIN = 30;
const MAX_NEW_PER_RUN = 400;
const STATE_KEY = "calendar_sync";

export function calendarKey(s) {
  if (s.availabilityPk) return `fh:${s.availabilityPk}`;
  if (s.source === "fareharbor" && s.itemId) return `fhx:${s.itemId}:${toArizonaIso(s.startAt)}`;
  return `city:${s.slug || s.title}:${toArizonaIso(s.startAt)}`;
}

export async function getSyncState(db) {
  const row = await db.prepare("SELECT value FROM staff_settings WHERE key = ?1").bind(STATE_KEY).first();
  try {
    return row?.value ? JSON.parse(row.value) : null;
  } catch {
    return null;
  }
}

async function setSyncState(db, state) {
  await db
    .prepare(
      `INSERT INTO staff_settings (key, value, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(STATE_KEY, JSON.stringify(state), nowIso())
    .run();
}

/** Run the sync if it's due (or `force`). Never throws; returns the state. */
export async function syncCalendar(env, request, { force = false } = {}) {
  const db = env.STAFF_DB;
  const prev = await getSyncState(db);
  if (!force && prev?.startedAt && Date.now() - Date.parse(prev.startedAt) < SYNC_EVERY_MIN * 60_000) return prev;

  // Claim this run first so simultaneous page loads don't all sync at once.
  const startedAt = nowIso();
  await setSyncState(db, { ...prev, startedAt });

  try {
    const result = await runSync(db, request);
    const state = { startedAt, finishedAt: nowIso(), ok: true, ...result };
    await setSyncState(db, state);
    return state;
  } catch (err) {
    console.error("calendar sync failed", err && err.stack ? err.stack : String(err));
    const state = { ...prev, startedAt, finishedAt: nowIso(), ok: false, error: String(err?.message || err) };
    await setSyncState(db, state);
    return state;
  }
}

async function fetchFareHarborSessions(request) {
  try {
    const res = await fetch(new URL("/experiences/upcoming", request.url), { headers: { accept: "application/json" } });
    if (!res.ok) return { ok: false, sessions: [] };
    const data = await res.json();
    const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
    return { ok: !data?.error && sessions.length > 0, sessions };
  } catch {
    return { ok: false, sessions: [] };
  }
}

async function runSync(db, request) {
  const now = Date.now();
  const until = now + AUTO_POST_DAYS * 86_400_000;
  const fh = await fetchFareHarborSessions(request);
  const sessions = mergeSessions(fh.sessions, now).filter((s) => Date.parse(s.startAt) <= until);

  const [templates, existingRes, dismissedRes] = await Promise.all([
    loadTemplates(db),
    db
      .prepare(
        `SELECT id, calendar_key, start_at, end_at, status, calendar_missing_at, times_edited FROM events
          WHERE calendar_key IS NOT NULL AND datetime(start_at) > datetime('now')`,
      )
      .all(),
    db.prepare("SELECT calendar_key FROM calendar_dismissed").all(),
  ]);
  const existing = new Map(existingRes.results.map((e) => [e.calendar_key, e]));
  const dismissed = new Set(dismissedRes.results.map((d) => d.calendar_key));
  const seen = new Set();
  const stmts = [];
  let created = 0;
  let moved = 0;
  let skipped = 0;
  const stamp = nowIso();

  for (const s of sessions) {
    const key = calendarKey(s);
    if (seen.has(key)) continue;
    seen.add(key);
    const startAt = toArizonaIso(s.startAt);
    const endAt = s.endAt ? toArizonaIso(s.endAt) : null;
    const ev = existing.get(key);
    if (ev) {
      const timesChanged = !ev.times_edited && (ev.start_at !== startAt || (endAt && ev.end_at !== endAt));
      if (timesChanged) {
        if (ev.start_at !== startAt) moved += 1;
        stmts.push(
          db
            .prepare("UPDATE events SET start_at = ?1, end_at = COALESCE(?2, end_at), calendar_missing_at = NULL, updated_at = ?3 WHERE id = ?4")
            .bind(startAt, endAt, stamp, ev.id),
        );
      } else if (ev.calendar_missing_at) {
        stmts.push(db.prepare("UPDATE events SET calendar_missing_at = NULL WHERE id = ?1").bind(ev.id));
      }
      continue;
    }
    if (dismissed.has(key)) continue;
    const tpl = matchTemplate(templates, s.title, s.venue);
    if (tpl && !tpl.autoPost) {
      skipped += 1;
      continue;
    }
    if (created >= MAX_NEW_PER_RUN) continue;
    const roles = tpl?.roles?.length ? tpl.roles : [{ role: "general", needed: 1 }];
    const id = newId("evt");
    stmts.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO events (id, title, venue, city, start_at, end_at, source, fareharbor_item_id,
             fareharbor_availability_pk, staff_needed, notes, trailer_needed, calendar_key, auto_posted)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 1)`,
        )
        .bind(
          id,
          s.title,
          s.venue || null,
          s.city || null,
          startAt,
          endAt,
          s.source === "city" ? "city" : "fareharbor",
          s.itemId ?? null,
          s.availabilityPk ?? null,
          roles.reduce((t, r) => t + r.needed, 0),
          tpl?.notes ?? null,
          tpl?.trailerNeeded ?? 0,
          key,
        ),
      ...insertRoleStatements(db, id, roles),
    );
    created += 1;
  }

  // Shifts whose session left the calendar: flag them (only for sources that
  // answered this time, so a FareHarbor hiccup doesn't flag everything).
  let missing = 0;
  for (const [key, ev] of existing) {
    if (seen.has(key) || ev.calendar_missing_at || ev.status === "cancelled") continue;
    if (Date.parse(ev.start_at) > until) continue;
    if (key.startsWith("fh:") && !fh.ok) continue;
    stmts.push(db.prepare("UPDATE events SET calendar_missing_at = ?1 WHERE id = ?2").bind(stamp, ev.id));
    missing += 1;
  }

  // D1 batches are transactions; keep each one a sensible size.
  for (let i = 0; i < stmts.length; i += 80) await db.batch(stmts.slice(i, i + 80));

  return { created, moved, missing, skipped, sessions: sessions.length, fareharborOk: fh.ok, windowDays: AUTO_POST_DAYS };
}
