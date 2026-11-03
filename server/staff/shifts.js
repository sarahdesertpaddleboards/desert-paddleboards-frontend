/**
 * Shared logic for shifts (the `events` table) and applications.
 *
 * Times: every event start/end is stored as an Arizona-local ISO string with a
 * fixed -07:00 offset (Arizona has no DST), e.g. 2026-11-07T17:30:00-07:00.
 * That keeps ORDER BY start_at correct and lets SQLite's datetime() convert to
 * UTC for "upcoming vs past" comparisons.
 */
import { toPublicStaff } from "./auth.js";
import { HttpError, cleanText } from "./http.js";
import { withRoles } from "./roles.js";

export const TZ = "America/Phoenix";
const AZ_OFFSET_MIN = -7 * 60;

/** Any parseable date/time → "YYYY-MM-DDTHH:MM:00-07:00" (Arizona), or null. */
export function toArizonaIso(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim();
  // FareHarbor sometimes sends "-0700" (no colon); Date.parse wants "-07:00".
  s = s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  // A bare local time ("2026-11-07T17:30") means Arizona time.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) s += "-07:00";
  const ms = Date.parse(s);
  if (Number.isNaN(ms)) return null;
  const local = new Date(ms + AZ_OFFSET_MIN * 60_000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:00-07:00`
  );
}

/** Dollars (number or "45", "45.50", "$45") → integer cents. Throws on nonsense. */
export function parsePayCents(raw, { required = false } = {}) {
  if (raw == null || raw === "") {
    if (required) throw new HttpError(400, "pay_required", "Enter the pay for this shift.");
    return null;
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > 5000) {
    throw new HttpError(400, "invalid_pay", "Pay should be a dollar amount between $0 and $5,000.");
  }
  return Math.round(n * 100);
}

export function formatMoney(cents) {
  if (cents == null) return "";
  const dollars = cents / 100;
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

/** "Saturday, November 7 · 5:30 PM – 6:30 PM" in Arizona time. */
export function formatWhen(startAt, endAt) {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return String(startAt);
  const day = start.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
  const time = (d) => d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  const end = endAt ? new Date(endAt) : null;
  return `${day} · ${time(start)}${end && !Number.isNaN(end.getTime()) ? ` – ${time(end)}` : ""}`;
}

/** Validate + normalise the editable event fields from a request body. */
export function readEventInput(body, { partial = false } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has("title")) {
    const title = cleanText(body.title, 120);
    if (!title) throw new HttpError(400, "title_required", "Give the shift a title.");
    out.title = title;
  }
  if (!partial || has("startAt")) {
    const startAt = toArizonaIso(body.startAt);
    if (!startAt) throw new HttpError(400, "start_required", "Pick a date and start time.");
    out.start_at = startAt;
  }
  if (has("endAt")) {
    out.end_at = body.endAt ? toArizonaIso(body.endAt) : null;
    if (body.endAt && !out.end_at) throw new HttpError(400, "invalid_end", "That end time isn't valid.");
  }
  if (has("venue")) out.venue = cleanText(body.venue, 120);
  if (has("city")) out.city = cleanText(body.city, 80);
  if (has("notes")) out.notes = cleanText(body.notes, 1000);
  if (has("staffNeeded")) {
    const n = Number(body.staffNeeded);
    if (!Number.isInteger(n) || n < 1 || n > 50) {
      throw new HttpError(400, "invalid_staff_needed", "Staff needed should be a whole number from 1 to 50.");
    }
    out.staff_needed = n;
  }
  if (has("trailerNeeded")) {
    const n = Number(body.trailerNeeded === true ? 1 : body.trailerNeeded === false ? 0 : body.trailerNeeded);
    if (!Number.isInteger(n) || n < 0 || n > 5) throw new HttpError(400, "invalid_trailer", "Trailer drivers should be 0 to 5.");
    out.trailer_needed = n;
  }
  if (has("status")) {
    if (!["open", "completed", "cancelled"].includes(body.status)) throw new HttpError(400, "invalid_status");
    out.status = body.status;
  }

  if (out.start_at && out.end_at && Date.parse(out.end_at) <= Date.parse(out.start_at)) {
    throw new HttpError(400, "end_before_start", "The end time needs to be after the start.");
  }
  return out;
}

/** events row (+ counts from EVENT_WITH_COUNTS and `roles` from withRoles) → API shape. */
export function toPublicEvent(row) {
  if (!row) return null;
  const confirmed = row.confirmed_count ?? 0;
  const trailerNeeded = row.trailer_needed ?? 0;
  const trailerConfirmed = row.trailer_confirmed ?? 0;
  return {
    id: row.id,
    title: row.title,
    venue: row.venue,
    city: row.city,
    startAt: row.start_at,
    endAt: row.end_at,
    source: row.source,
    fareharborItemId: row.fareharbor_item_id,
    fareharborAvailabilityPk: row.fareharbor_availability_pk,
    staffNeeded: row.staff_needed,
    roles: row.roles ?? [],
    trailerNeeded,
    trailerConfirmed,
    trailerOpen: trailerNeeded > trailerConfirmed,
    autoPosted: Boolean(row.auto_posted),
    offCalendar: Boolean(row.calendar_missing_at),
    notes: row.notes,
    status: row.status,
    confirmedCount: confirmed,
    appliedCount: row.applied_count ?? 0,
    unpaidCount: row.unpaid_count ?? 0,
    isFull: confirmed >= row.staff_needed,
    isPast: Date.parse(row.start_at) < Date.now(),
    createdAt: row.created_at,
  };
}

/** What staff may see of a shift: no admin-only counts. */
export function toStaffEvent(row) {
  const { unpaidCount, offCalendar, ...event } = toPublicEvent(row);
  return event;
}

/** SQL fragment: events plus live counts of confirmed, pending and confirmed-but-unpaid applications. */
export const EVENT_WITH_COUNTS = `
  SELECT e.*,
    (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'confirmed') AS confirmed_count,
    (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'applied')   AS applied_count,
    (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'confirmed' AND a.paid_at IS NULL) AS unpaid_count,
    (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'confirmed' AND a.trailer = 1) AS trailer_confirmed
  FROM events e`;

/** One event row with counts and roles attached (null if missing). */
export async function getEventWithCounts(db, id) {
  const row = await db.prepare(`${EVENT_WITH_COUNTS} WHERE e.id = ?1`).bind(id).first();
  if (row) await withRoles(db, [row]);
  return row;
}

/** Many event rows (from EVENT_WITH_COUNTS) with roles attached. */
export async function listEventsWithRoles(db, stmt) {
  const { results } = await stmt.all();
  return withRoles(db, results);
}

export function toPublicApplication(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    staffId: row.staff_id,
    status: row.status,
    role: row.role,
    trailer: Boolean(row.trailer),
    payCents: row.pay_cents,
    staffNote: row.staff_note,
    confirmedAt: row.confirmed_at,
    paidAt: row.paid_at,
    paidNote: row.paid_note,
    appliedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const STATUS_ORDER = "CASE a.status WHEN 'confirmed' THEN 0 WHEN 'applied' THEN 1 WHEN 'declined' THEN 2 ELSE 3 END";

/** Event + every application on it, with the person's contact/payout details. */
export async function loadEventDetail(db, id) {
  const event = await getEventWithCounts(db, id);
  if (!event) throw new HttpError(404, "not_found", "No such shift.");
  const { results } = await db
    .prepare(
      `SELECT a.*, s.id AS s_id, s.email, s.name, s.phone, s.payout_method, s.payout_handle, s.role AS s_role, s.skills, s.status AS s_status
         FROM applications a JOIN staff s ON s.id = a.staff_id
        WHERE a.event_id = ?1
        ORDER BY ${STATUS_ORDER}, a.created_at`,
    )
    .bind(id)
    .all();
  return {
    event: toPublicEvent(event),
    applications: results.map((r) => ({
      ...toPublicApplication(r),
      staff: toPublicStaff({ ...r, id: r.s_id, role: r.s_role, status: r.s_status }),
    })),
  };
}

