/**
 * PATCH  /staff-api/admin/templates/:id — edit a staffing template.
 * DELETE /staff-api/admin/templates/:id — remove one (not the default).
 * Changes apply to shifts posted from now on; existing shifts keep their roles.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { HttpError, json, nowIso, readJson } from "../../../../server/staff/http.js";
import { readTemplateInput, toPublicTemplate } from "../../../../server/staff/templates.js";

export async function onRequestPatch(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const id = context.params.id;
  const existing = await db.prepare("SELECT * FROM shift_templates WHERE id = ?1").bind(id).first();
  if (!existing) throw new HttpError(404, "not_found", "No such template.");
  const fields = readTemplateInput(await readJson(context.request), { partial: true });
  if (existing.is_default) delete fields.match_keywords; // the default catches everything
  const keys = Object.keys(fields);
  if (keys.length) {
    await db
      .prepare(
        `UPDATE shift_templates SET ${keys.map((k, i) => `${k} = ?${i + 1}`).join(", ")}, updated_at = ?${keys.length + 1}
          WHERE id = ?${keys.length + 2}`,
      )
      .bind(...keys.map((k) => fields[k]), nowIso(), id)
      .run();
  }
  const row = await db.prepare("SELECT * FROM shift_templates WHERE id = ?1").bind(id).first();
  return json(200, { template: toPublicTemplate(row) });
}

export async function onRequestDelete(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const row = await db.prepare("SELECT is_default FROM shift_templates WHERE id = ?1").bind(context.params.id).first();
  if (!row) throw new HttpError(404, "not_found", "No such template.");
  if (row.is_default) throw new HttpError(409, "default_template", "The default template can't be deleted. Edit it instead.");
  await db.prepare("DELETE FROM shift_templates WHERE id = ?1").bind(context.params.id).run();
  return json(200, { ok: true });
}
