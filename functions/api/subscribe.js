/**
 * POST /api/subscribe — website email sign-up ("join the list, get $5 off").
 *
 * Body: { email, company? } — `company` is a hidden honeypot field; bots fill
 * it, people never see it. Adds the address to Flodesk's "Website sign-ups"
 * segment, which triggers the welcome workflow that emails the $5 code.
 */
import { DELIVERABLE_EMAIL, SEGMENTS, upsertSubscriber } from "../../server/flodesk.js";

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: "bad_request" });
  }

  // Honeypot: pretend it worked so bots don't retry.
  if (data && typeof data.company === "string" && data.company.trim()) return json(200, { ok: true });

  const email = String(data?.email ?? "").trim().toLowerCase();
  if (email.length > 254 || !DELIVERABLE_EMAIL.test(email)) return json(400, { error: "invalid_email" });

  if (!env.FLODESK_API_KEY) return json(503, { error: "not_configured" });

  try {
    await upsertSubscriber(env, {
      email,
      segmentIds: [SEGMENTS.websiteSignups],
      optinIp: request.headers.get("cf-connecting-ip") ?? undefined,
    });
  } catch (err) {
    console.error("subscribe failed", String(err));
    return json(502, { error: "upstream" });
  }
  return json(200, { ok: true });
}
