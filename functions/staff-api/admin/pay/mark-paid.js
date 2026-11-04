/**
 * POST /staff-api/admin/pay/mark-paid  { applicationIds: [...], note?, notify? }
 * Record that Sarah has sent the pay for one or more confirmed shifts. With
 * notify (the default) each person gets one email listing what was paid, and
 * a text if they opted in to texts.
 * Nothing moves money: this is a ledger entry.
 */
import { requireAdmin } from "../../../../server/staff/auth.js";
import { isLocalMode, paymentSentEmail, sendEmail } from "../../../../server/staff/email.js";
import { HttpError, cleanText, json, nowIso, readJson } from "../../../../server/staff/http.js";
import { LEDGER_SELECT } from "../../../../server/staff/pay.js";
import { paymentSentText, textStaff } from "../../../../server/staff/sms.js";

export async function onRequestPost(context) {
  const admin = requireAdmin(context);
  const { env, request } = context;
  const db = env.STAFF_DB;
  const body = await readJson(request);

  const ids = [...new Set((Array.isArray(body.applicationIds) ? body.applicationIds : []).map(String))];
  if (ids.length === 0) throw new HttpError(400, "nothing_selected", "Pick at least one shift to mark paid.");
  if (ids.length > 100) throw new HttpError(400, "too_many", "Mark up to 100 shifts at a time.");
  const note = cleanText(body.note, 200);
  const notify = body.notify !== false;
  const idsJson = JSON.stringify(ids);

  const { results: rows } = await db
    .prepare(`${LEDGER_SELECT} WHERE a.id IN (SELECT value FROM json_each(?1))`)
    .bind(idsJson)
    .all();
  if (rows.length !== ids.length) throw new HttpError(404, "not_found", "Some of those shifts no longer exist. Refresh and try again.");
  if (rows.some((r) => r.status !== "confirmed")) {
    throw new HttpError(409, "not_confirmed", "Only confirmed shifts can be marked paid.");
  }
  if (rows.some((r) => r.paid_at)) {
    throw new HttpError(409, "already_paid", "Some of those are already marked paid. Refresh and try again.");
  }

  const now = nowIso();
  await db
    .prepare(
      `UPDATE applications SET paid_at = ?1, paid_by = ?2, paid_note = ?3, updated_at = ?1
        WHERE id IN (SELECT value FROM json_each(?4)) AND status = 'confirmed' AND paid_at IS NULL`,
    )
    .bind(now, admin.id, note, idsJson)
    .run();

  const totalCents = rows.reduce((sum, r) => sum + (r.pay_cents ?? 0), 0);
  let emailed = 0;
  let texted = 0;
  const emailErrors = [];
  const byPerson = new Map();
  for (const r of rows) {
    if (!byPerson.has(r.staff_id)) byPerson.set(r.staff_id, []);
    byPerson.get(r.staff_id).push(r);
  }
  const url = `${new URL(request.url).origin}/staff/earnings`;
  if (notify) {
    const staffIds = [...byPerson.keys()];
    const { results: people } = await db
      .prepare("SELECT id, phone, sms_opt_in FROM staff WHERE id IN (SELECT value FROM json_each(?1))")
      .bind(JSON.stringify(staffIds))
      .all();
    for (const person of people) {
      const items = byPerson.get(person.id);
      const totalForPerson = items.reduce((sum, r) => sum + (r.pay_cents ?? 0), 0);
      const sms = await textStaff(env, db, person, "paid", paymentSentText({ totalCents: totalForPerson, count: items.length, url }));
      if (sms.ok) texted += 1;
    }
  }
  if (notify && !isLocalMode(env)) {
    for (const [staffId, items] of byPerson) {
      const first = items[0];
      const mail = paymentSentEmail({
        name: first.s_name,
        items: items
          .sort((x, y) => x.e_start_at.localeCompare(y.e_start_at))
          .map((r) => ({ title: r.e_title, startAt: r.e_start_at, payCents: r.pay_cents })),
        note,
        payoutMethod: first.s_payout_method,
        payoutHandle: first.s_payout_handle,
        url,
      });
      const result = await sendEmail(env, db, { ...mail, to: first.s_email, kind: "paid", staffId });
      if (result.ok) emailed += 1;
      else emailErrors.push({ name: first.s_name || first.s_email, error: result.error });
    }
  }

  return json(200, { paidCount: rows.length, totalCents, emailed, texted, emailErrors, localMode: isLocalMode(env) });
}
