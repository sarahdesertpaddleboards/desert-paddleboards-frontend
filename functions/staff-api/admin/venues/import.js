/**
 * POST /staff-api/admin/venues/import { text }
 * Paste rows from a spreadsheet (tab- or comma-separated):
 *   venue name, address, contact name, contact phone, notes
 * A header row is skipped. Existing venues (same name) are updated with any
 * non-blank cells; new ones are added. Returns counts and any skipped lines.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, newId, nowIso, readJson } from "../../../../server/staff/http.js";
import { parseVenueRows, readVenueInput } from "../../../../server/staff/venues.js";

export async function onRequestPost(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const { text } = await readJson(context.request);
  const { rows, skipped } = parseVenueRows(text);
  if (!rows.length && !skipped.length) throw new HttpError(400, "empty", "Paste at least one row.");
  if (rows.length > 500) throw new HttpError(400, "too_many", "That's more than 500 rows. Import in smaller batches.");

  let created = 0;
  let updated = 0;
  for (const row of rows) {
    let fields;
    try {
      // Only the cells that have something in them.
      const input = { name: row.name };
      for (const k of ["address", "contactName", "contactPhone", "notes"]) if (row[k]) input[k] = row[k];
      fields = readVenueInput(input);
    } catch (err) {
      skipped.push({ line: row.line, reason: err.message || "invalid" });
      continue;
    }
    const existing = await db.prepare("SELECT id FROM venues WHERE name_key = ?1").bind(fields.name_key).first();
    if (existing) {
      const keys = Object.keys(fields).filter((k) => k !== "name_key" && k !== "name");
      if (keys.length) {
        await db
          .prepare(`UPDATE venues SET ${keys.map((k, i) => `${k} = ?${i + 1}`).join(", ")}, updated_at = ?${keys.length + 1} WHERE id = ?${keys.length + 2}`)
          .bind(...keys.map((k) => fields[k]), nowIso(), existing.id)
          .run();
      }
      updated++;
    } else {
      await db
        .prepare(
          `INSERT INTO venues (id, name, name_key, address, contact_name, contact_phone, notes)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
        )
        .bind(newId("ven"), fields.name, fields.name_key, fields.address ?? null, fields.contact_name ?? null, fields.contact_phone ?? null, fields.notes ?? null)
        .run();
      created++;
    }
  }
  return json(200, { created, updated, skipped: skipped.sort((a, b) => a.line - b.line) });
}
