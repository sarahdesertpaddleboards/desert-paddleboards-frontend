/**
 * PATCH  /staff-api/admin/venues/:id — edit any field (renaming re-links shifts by name).
 * DELETE /staff-api/admin/venues/:id — shifts keep their own overrides.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, nowIso, readJson } from "../../../../server/staff/http.js";
import { readVenueInput, toPublicVenue } from "../../../../server/staff/venues.js";

export async function onRequestPatch(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const id = context.params.id;
  const existing = await db.prepare("SELECT * FROM venues WHERE id = ?1").bind(id).first();
  if (!existing) throw new HttpError(404, "not_found", "No such venue.");
  const fields = readVenueInput(await readJson(context.request), { partial: true });
  if (fields.name_key && fields.name_key !== existing.name_key) {
    const dupe = await db.prepare("SELECT id FROM venues WHERE name_key = ?1").bind(fields.name_key).first();
    if (dupe) throw new HttpError(409, "exists", "Another venue already has that name.");
  }
  const keys = Object.keys(fields);
  if (keys.length) {
    await db
      .prepare(`UPDATE venues SET ${keys.map((k, i) => `${k} = ?${i + 1}`).join(", ")}, updated_at = ?${keys.length + 1} WHERE id = ?${keys.length + 2}`)
      .bind(...keys.map((k) => fields[k]), nowIso(), id)
      .run();
  }
  return json(200, { venue: toPublicVenue(await db.prepare("SELECT * FROM venues WHERE id = ?1").bind(id).first()) });
}

export async function onRequestDelete(context) {
  requireAdmin(context);
  await context.env.STAFF_DB.prepare("DELETE FROM venues WHERE id = ?1").bind(context.params.id).run();
  return json(200, { ok: true });
}
