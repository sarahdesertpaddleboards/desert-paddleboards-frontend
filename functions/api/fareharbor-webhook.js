/**
 * POST /api/fareharbor-webhook?token=… — FareHarbor booking webhook → Flodesk.
 *
 * Replaces the manual FareHarbor CSV uploads: every new booking whose customer
 * ticked FareHarbor's "send me email updates" box is added to Flodesk's
 * "Fareharbor" segment. Customers who didn't opt in are ignored.
 *
 * Setup (once):
 *  1. Cloudflare Pages secrets: FLODESK_API_KEY and FAREHARBOR_WEBHOOK_TOKEN
 *     (any long random string).
 *  2. Ask FareHarbor support to send booking webhooks to
 *     https://desertpaddleboards.com/api/fareharbor-webhook?token=<that string>
 *
 * The payload is assumed to follow FareHarbor's External API booking shape
 * ({ booking: { status, contact: { name, email, is_subscribed_for_email_updates },
 * availability: { item: { pk } } } }). That isn't confirmed for webhooks yet,
 * so anything unrecognised is logged by its keys (never its contents) — check
 * `wrangler pages deployment tail` after the first real booking.
 */
import { DELIVERABLE_EMAIL, SEGMENTS, upsertSubscriber } from "../../server/flodesk.js";

/** Optional per-venue segments, keyed by FareHarbor item id. Add as created. */
const VENUE_SEGMENTS = {};

export async function onRequestPost({ request, env }) {
  const token = new URL(request.url).searchParams.get("token");
  if (!env.FAREHARBOR_WEBHOOK_TOKEN || token !== env.FAREHARBOR_WEBHOOK_TOKEN) {
    return new Response("forbidden", { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const booking = body?.booking ?? body;
  const contact = booking?.contact;
  if (!contact || typeof contact !== "object") {
    console.warn("fareharbor webhook: unrecognised payload", Object.keys(body ?? {}), Object.keys(booking ?? {}));
    return new Response("ignored", { status: 200 });
  }

  const email = String(contact.email ?? "").trim().toLowerCase();
  if (
    booking.status === "cancelled" ||
    contact.is_subscribed_for_email_updates !== true ||
    !DELIVERABLE_EMAIL.test(email)
  ) {
    return new Response("ignored", { status: 200 });
  }

  if (!env.FLODESK_API_KEY) return new Response("not configured", { status: 503 });

  const [firstName, ...rest] = String(contact.name ?? "").trim().split(/\s+/);
  const itemId = booking?.availability?.item?.pk;
  const segmentIds = [SEGMENTS.fareharbor, ...(VENUE_SEGMENTS[itemId] ? [VENUE_SEGMENTS[itemId]] : [])];

  try {
    await upsertSubscriber(env, {
      email,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      segmentIds,
    });
  } catch (err) {
    console.error("fareharbor webhook: flodesk failed", String(err));
    // 502 so FareHarbor retries if it supports retries.
    return new Response("upstream error", { status: 502 });
  }
  return new Response("ok", { status: 200 });
}
