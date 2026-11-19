/**
 * GET  /staff-api/admin/venues — the venue directory, plus venue names on
 *      upcoming shifts that have no entry yet (so Sarah can fill them in).
 * POST /staff-api/admin/venues { name, address?, contactName?, contactPhone?, notes? }
 * Contacts are private: only admins see them, and the event lead gets them in
 * the day-before reminder.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, newId, readJson } from "../../../../server/staff/http.js";
import { readVenueInput, toPublicVenue } from "../../../../server/staff/venues.js";

export async function onRequestGet(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const [venues, missing] = await Promise.all([
    db
      .prepare(
        `SELECT v.*,
           (SELECT COUNT(*) FROM events e
             WHERE lower(trim(e.venue)) = v.name_key AND e.status != 'cancelled'
               AND datetime(e.start_at) > datetime('now')) AS shift_count
           FROM venues v ORDER BY lower(v.name)`,
      )
      .all(),
    db
      .prepare(
        `SELECT trim(e.venue) AS name, COUNT(*) AS shift_count FROM events e
          WHERE e.venue IS NOT NULL AND trim(e.venue) != '' AND e.status != 'cancelled'
            AND datetime(e.start_at) > datetime('now')
            AND lower(trim(e.venue)) NOT IN (SELECT name_key FROM venues)
          GROUP BY lower(trim(e.venue)) ORDER BY lower(trim(e.venue))`,
      )
      .all(),
  ]);
  return json(200, {
    venues: venues.results.map(toPublicVenue),
    missing: missing.results.map((r) => ({ name: r.name, shiftCount: r.shift_count })),
  });
}

export async function onRequestPost(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const fields = readVenueInput(await readJson(context.request));
  const dupe = await db.prepare("SELECT id FROM venues WHERE name_key = ?1").bind(fields.name_key).first();
  if (dupe) throw new HttpError(409, "exists", "That venue is already in the list. Edit it instead.");
  const id = newId("ven");
  await db
    .prepare(
      `INSERT INTO venues (id, name, name_key, address, contact_name, contact_phone, notes)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    )
    .bind(id, fields.name, fields.name_key, fields.address ?? null, fields.contact_name ?? null, fields.contact_phone ?? null, fields.notes ?? null)
    .run();
  return json(201, { venue: toPublicVenue(await db.prepare("SELECT * FROM venues WHERE id = ?1").bind(id).first()) });
}
