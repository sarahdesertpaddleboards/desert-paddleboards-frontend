/**
 * GET  /staff-api/admin/templates — staffing templates (roles + trailer per kind of session).
 * POST /staff-api/admin/templates — add one { name, keywords, roles, trailerNeeded?, notes?, autoPost? }
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { json, newId, readJson } from "../../../../server/staff/http.js";
import { loadTemplates, readTemplateInput, toPublicTemplate } from "../../../../server/staff/templates.js";

export async function onRequestGet(context) {
  requireAdmin(context);
  return json(200, { templates: await loadTemplates(context.env.STAFF_DB) });
}

export async function onRequestPost(context) {
  requireAdmin(context);
  const db = context.env.STAFF_DB;
  const fields = readTemplateInput(await readJson(context.request));
  const id = newId("tpl");
  const keys = Object.keys(fields);
  await db
    .prepare(
      `INSERT INTO shift_templates (id, ${keys.join(", ")}, sort_order)
       VALUES (?1, ${keys.map((_, i) => `?${i + 2}`).join(", ")},
               COALESCE((SELECT MAX(sort_order) FROM shift_templates WHERE is_default = 0), 0) + 10)`,
    )
    .bind(id, ...keys.map((k) => fields[k]))
    .run();
  const row = await db.prepare("SELECT * FROM shift_templates WHERE id = ?1").bind(id).first();
  return json(201, { template: toPublicTemplate(row) });
}
