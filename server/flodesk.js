/**
 * Minimal Flodesk API client for Pages Functions.
 * Docs: https://developers.flodesk.com — Basic auth, API key as the username.
 *
 * The key is a Cloudflare Pages secret (FLODESK_API_KEY), never in the repo:
 *   Pages → desert-paddleboards → Settings → Variables and Secrets.
 * Segment ids are not secret, so they live here.
 */

/** Flodesk segment ids (Audience → Segments → the id in each segment's URL). */
export const SEGMENTS = {
  /** Website email sign-ups — triggers the $5 welcome workflow. */
  websiteSignups: "6acd64d723cbd735233b1a38",
  /** Everyone who books on FareHarbor and opts in to emails. */
  fareharbor: "68ee88c44b54eac9a3f6c55e",
};

const API = "https://api.flodesk.com/v1";

/** Same rule as src/lib/web3forms.ts: a dotted domain, no spaces. */
export const DELIVERABLE_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * Create the subscriber (or update an existing one) and put them in
 * `segmentIds`. A second call adds the segments explicitly, because the
 * create-or-update call isn't documented as adding segments to someone who
 * already exists — and an existing subscriber joining a segment is exactly
 * what fires the welcome workflow.
 */
export async function upsertSubscriber(env, { email, firstName, lastName, segmentIds, optinIp }) {
  const headers = {
    authorization: `Basic ${btoa(`${env.FLODESK_API_KEY}:`)}`,
    "content-type": "application/json",
    "user-agent": "Desert Paddleboards website (desertpaddleboards.com)",
  };

  const created = await fetch(`${API}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      segment_ids: segmentIds,
      ...(optinIp ? { optin_ip: optinIp } : {}),
      optin_timestamp: new Date().toISOString(),
    }),
  });
  if (!created.ok) {
    throw new Error(`Flodesk create ${created.status}: ${(await created.text()).slice(0, 300)}`);
  }

  const segmented = await fetch(`${API}/subscribers/${encodeURIComponent(email)}/segments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ segment_ids: segmentIds }),
  });
  if (!segmented.ok) {
    throw new Error(`Flodesk segments ${segmented.status}: ${(await segmented.text()).slice(0, 300)}`);
  }
}
