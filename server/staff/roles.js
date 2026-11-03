/**
 * Roles on a shift (event_roles) and the trailer add-on.
 *
 * A shift needs N people per role. Trailer driver isn't a role: it's an add-on
 * to one person's role (the driver always works the event too). There is no
 * preset pay: Sarah types each person's pay when she confirms them (it varies
 * by person and event), and that one amount covers the trailer too. The
 * pay_cents / trailer_pay_cents columns on roles and events are unused.
 */
import { HttpError } from "./http.js";

export const ROLES = ["lead", "teacher", "artist", "general"];
export const SKILLS = [...ROLES, "trailer"];

export const ROLE_LABELS = {
  lead: "Event team leader",
  teacher: "Teacher",
  artist: "Artist",
  general: "General staff",
};

const roleOrder = (r) => ROLES.indexOf(r);

/** "lead,trailer" → ["lead","trailer"] (known skills only, in a stable order). */
export function parseSkills(raw) {
  const list = Array.isArray(raw) ? raw : String(raw ?? "").split(",");
  const set = new Set(list.map((s) => String(s).trim()).filter((s) => SKILLS.includes(s)));
  return SKILLS.filter((s) => set.has(s));
}

export function readRole(raw) {
  const role = String(raw ?? "");
  if (!ROLES.includes(role)) throw new HttpError(400, "invalid_role", "Pick a role.");
  return role;
}

/**
 * Validate a roles list from a request: [{ role, needed }]. Returns null when
 * the body doesn't mention roles.
 */
export function readRolesInput(raw) {
  if (raw === undefined) return null;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new HttpError(400, "roles_required", "A shift needs at least one role.");
  }
  const seen = new Set();
  const out = [];
  for (const r of raw) {
    const role = readRole(r?.role);
    if (seen.has(role)) throw new HttpError(400, "duplicate_role", `${ROLE_LABELS[role]} is listed twice.`);
    seen.add(role);
    const needed = Number(r?.needed);
    if (!Number.isInteger(needed) || needed < 1 || needed > 50) {
      throw new HttpError(400, "invalid_needed", `How many ${ROLE_LABELS[role].toLowerCase()} people? Use 1 to 50.`);
    }
    out.push({ role, needed });
  }
  return out.sort((a, b) => roleOrder(a.role) - roleOrder(b.role));
}

/** Per-role counts of confirmed and pending people on one or more shifts. */
export async function loadRoles(db, eventIds) {
  const byEvent = new Map();
  if (!eventIds.length) return byEvent;
  const { results } = await db
    .prepare(
      `SELECT r.*,
         (SELECT COUNT(*) FROM applications a WHERE a.event_id = r.event_id AND a.role = r.role AND a.status = 'confirmed') AS confirmed,
         (SELECT COUNT(*) FROM applications a WHERE a.event_id = r.event_id AND a.role = r.role AND a.status = 'applied')   AS applied
       FROM event_roles r WHERE r.event_id IN (SELECT value FROM json_each(?1))`,
    )
    .bind(JSON.stringify(eventIds))
    .all();
  for (const r of results) {
    if (!byEvent.has(r.event_id)) byEvent.set(r.event_id, []);
    byEvent.get(r.event_id).push({
      role: r.role,
      needed: r.needed,
      confirmed: r.confirmed,
      applied: r.applied,
    });
  }
  for (const list of byEvent.values()) list.sort((a, b) => roleOrder(a.role) - roleOrder(b.role));
  return byEvent;
}

/** Attach `roles` to event rows (mutates and returns them). */
export async function withRoles(db, rows) {
  const map = await loadRoles(
    db,
    rows.map((r) => r.id),
  );
  for (const r of rows) r.roles = map.get(r.id) ?? [];
  return rows;
}

/**
 * Replace a shift's roles. Refuses to drop a role someone is on, or to need
 * fewer people than are already confirmed. Keeps events.staff_needed in step.
 */
export async function saveRoles(db, eventId, roles, { check = true } = {}) {
  if (check) {
    const current = (await loadRoles(db, [eventId])).get(eventId) ?? [];
    for (const cur of current) {
      const next = roles.find((r) => r.role === cur.role);
      const label = ROLE_LABELS[cur.role];
      if (!next && cur.confirmed + cur.applied > 0) {
        throw new HttpError(409, "role_in_use", `Someone has applied or is confirmed as ${label.toLowerCase()}. Remove or decline them first.`);
      }
      if (next && next.needed < cur.confirmed) {
        throw new HttpError(409, "below_confirmed", `${cur.confirmed} ${label.toLowerCase()} already confirmed. Remove someone first.`);
      }
    }
  }
  const stmts = [db.prepare("DELETE FROM event_roles WHERE event_id = ?1").bind(eventId)];
  for (const r of roles) {
    stmts.push(
      db
        .prepare("INSERT INTO event_roles (event_id, role, needed) VALUES (?1, ?2, ?3)")
        .bind(eventId, r.role, r.needed),
    );
  }
  stmts.push(
    db.prepare("UPDATE events SET staff_needed = ?1 WHERE id = ?2").bind(
      roles.reduce((t, r) => t + r.needed, 0),
      eventId,
    ),
  );
  await db.batch(stmts);
}

/**
 * Statements to insert roles for a brand-new shift (for use inside a batch).
 * No-ops if the shift row wasn't created (INSERT OR IGNORE lost a race).
 */
export function insertRoleStatements(db, eventId, roles) {
  return roles.map((r) =>
    db
      .prepare(
        `INSERT INTO event_roles (event_id, role, needed)
         SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM events WHERE id = ?1)`,
      )
      .bind(eventId, r.role, r.needed),
  );
}
