/**
 * Staffing templates: which roles (and trailer) a kind of session needs.
 * Used when the calendar sync auto-posts a shift, and to pre-fill new shifts.
 */
import { HttpError, cleanText } from "./http.js";
import { readRolesInput } from "./roles.js";

export async function loadTemplates(db) {
  const { results } = await db.prepare("SELECT * FROM shift_templates ORDER BY is_default, sort_order, name").all();
  return results.map(toPublicTemplate);
}

export function toPublicTemplate(row) {
  let roles = [];
  try {
    roles = JSON.parse(row.roles_json) || [];
  } catch {
    roles = [];
  }
  return {
    id: row.id,
    name: row.name,
    keywords: row.match_keywords ? row.match_keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
    roles: roles.map((r) => ({ role: r.role, needed: r.needed })),
    trailerNeeded: row.trailer_needed,
    notes: row.notes,
    autoPost: Boolean(row.auto_post),
    isDefault: Boolean(row.is_default),
    sortOrder: row.sort_order,
  };
}

/** First non-default template with a keyword in the title (or venue), else the default. */
export function matchTemplate(templates, title, venue = "") {
  const hay = `${title} ${venue}`.toLowerCase();
  const hit = templates.find((t) => !t.isDefault && t.keywords.some((k) => k && hay.includes(k.toLowerCase())));
  return hit ?? templates.find((t) => t.isDefault) ?? null;
}

/** Validate a template body → column values. */
export function readTemplateInput(body, { partial = false } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined;
  if (!partial || has("name")) {
    const name = cleanText(body.name, 80);
    if (!name) throw new HttpError(400, "name_required", "Give the template a name.");
    out.name = name;
  }
  if (has("keywords")) {
    const list = (Array.isArray(body.keywords) ? body.keywords : String(body.keywords ?? "").split(","))
      .map((k) => cleanText(k, 40))
      .filter(Boolean);
    out.match_keywords = list.length ? list.join(",") : null;
  }
  if (!partial || has("roles")) {
    const roles = readRolesInput(body.roles);
    if (!roles) throw new HttpError(400, "roles_required", "A template needs at least one role.");
    out.roles_json = JSON.stringify(roles);
  }
  if (has("trailerNeeded")) {
    const n = Number(body.trailerNeeded === true ? 1 : body.trailerNeeded === false ? 0 : body.trailerNeeded);
    if (!Number.isInteger(n) || n < 0 || n > 5) throw new HttpError(400, "invalid_trailer", "Trailer drivers should be 0 to 5.");
    out.trailer_needed = n;
  }
  if (has("notes")) out.notes = cleanText(body.notes, 1000);
  if (has("autoPost")) out.auto_post = body.autoPost ? 1 : 0;
  if (has("sortOrder")) {
    const n = Number(body.sortOrder);
    if (Number.isInteger(n)) out.sort_order = n;
  }
  return out;
}
