/**
 * POST /staff-api/admin/staff/import { text, sendInvites? }
 * Add many people at once from a pasted list (one per line, tab- or
 * comma-separated, any order): name, email, mobile. The email and phone are
 * recognised wherever they are; the first other cell is the name. A header
 * row is skipped.
 * New people are added as "invited" WITHOUT any email unless sendInvites is
 * true (Sarah wants to try it on one person first). Existing people get a
 * missing name/phone filled in; nobody is overwritten or re-invited.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { sendInvite } from "../../../../server/staff/invite.js";
import { EMAIL_RE, HttpError, cleanText, json, newId, normalizeEmail, nowIso, readJson } from "../../../../server/staff/http.js";
import { readPhone } from "../../../../server/staff/phone.js";
import { splitCsv } from "../../../../server/staff/venues.js";

function parsePeople(text) {
  const rows = [];
  const skipped = [];
  String(text ?? "")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (!line.trim()) return;
      const cells = (line.includes("\t") ? line.split("\t") : splitCsv(line)).map((c) => c.trim()).filter(Boolean);
      const emailCell = cells.find((c) => EMAIL_RE.test(c));
      if (!emailCell) {
        if (i > 0 || !/name|email/i.test(line)) skipped.push({ line: i + 1, reason: "no email address" });
        return;
      }
      const phoneCell = cells.find((c) => c !== emailCell && readPhone(c));
      const name = cells.find((c) => c !== emailCell && c !== phoneCell) ?? null;
      rows.push({ line: i + 1, email: normalizeEmail(emailCell), name: cleanText(name, 80), phone: phoneCell ? readPhone(phoneCell) : null });
    });
  return { rows, skipped };
}

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);
  const { rows, skipped } = parsePeople(body.text);
  if (!rows.length && !skipped.length) throw new HttpError(400, "empty", "Paste at least one person: name, email, mobile.");
  if (rows.length > 300) throw new HttpError(400, "too_many", "That's more than 300 people. Import in smaller batches.");

  const added = [];
  const updated = [];
  const unchanged = [];
  const invited = [];
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.email)) {
      skipped.push({ line: row.line, reason: "listed twice" });
      continue;
    }
    seen.add(row.email);
    const existing = await db.prepare("SELECT * FROM staff WHERE email = ?1").bind(row.email).first();
    let person = existing;
    if (!existing) {
      const id = newId("stf");
      await db
        .prepare(
          `INSERT INTO staff (id, email, name, phone, role, status, invited_by, invited_at)
           VALUES (?1, ?2, ?3, ?4, 'staff', 'invited', ?5, ?6)`,
        )
        .bind(id, row.email, row.name, row.phone, admin.id, nowIso())
        .run();
      person = await db.prepare("SELECT * FROM staff WHERE id = ?1").bind(id).first();
      added.push(row.name || row.email);
    } else if ((!existing.name && row.name) || (!existing.phone && row.phone)) {
      await db
        .prepare("UPDATE staff SET name = COALESCE(name, ?1), phone = COALESCE(phone, ?2), updated_at = ?3 WHERE id = ?4")
        .bind(row.name, row.phone, nowIso(), existing.id)
        .run();
      updated.push(existing.name || row.name || row.email);
    } else {
      unchanged.push(existing.name || row.email);
    }
    if (body.sendInvites && person.status === "invited" && !existing) {
      try {
        const sent = await sendInvite(env, db, request, person, admin);
        if (sent.emailed || sent.devLink) invited.push(person.name || person.email);
      } catch {
        skipped.push({ line: row.line, reason: "added, but the invite email failed" });
      }
    }
  }
  return json(200, { added, updated, unchanged, invited, skipped: skipped.sort((a, b) => a.line - b.line) });
}
