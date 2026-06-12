/**
 * GET /experiences/upcoming — Cloudflare Pages Function.
 *
 * Same-origin replacement for the Railway backend's feed of upcoming
 * FareHarbor sessions (server/routers/experiences.public.ts in the backend
 * repo). FareHarbor's public JSON API sends no CORS headers, so the browser
 * can't call it directly — this function proxies + caches it at the edge.
 *
 * Item ids are derived from FareHarbor's live item list with the same
 * fixed-location heuristic as src/data/locations.ts: listed, non-retail,
 * and coordinates present (or force-listed). New venues flow in
 * automatically.
 *
 * Caching: responses are stored in Cloudflare's edge cache for CACHE_TTL_S
 * via caches.default, so FareHarbor sees at most ~1 request per item-month
 * per TTL per edge location. Degrades to an empty feed on failure — the
 * homepage must never break because FareHarbor is down.
 */

const SHORTNAME = "desertpaddleboards";
const MONTHS_AHEAD = 2; // current month + this many following months
const CACHE_TTL_S = 30 * 60; // 30 minutes

// Fixed-location venues whose FareHarbor primary_location has no lat/lng.
// Keep in sync with FORCE_LOCATION_IDS in src/data/locations.ts.
const FORCE_LOCATION_IDS = new Set([626146]); // Aji Spa

const UA = { "User-Agent": "DesertPaddleboards-Site/1.0" };

async function fetchLocationItemIds() {
  try {
    const res = await fetch(
      `https://fareharbor.com/api/v1/companies/${SHORTNAME}/items/`,
      { headers: UA },
    );
    if (!res.ok) throw new Error(`items list HTTP ${res.status}`);
    const json = await res.json();
    const ids = (json?.items ?? [])
      .filter((it) => {
        if (it?.is_archived || it?.is_private || it?.is_unlisted || it?.is_retail)
          return false;
        const pl = it?.primary_location ?? {};
        const hasCoords =
          typeof pl.latitude === "number" && typeof pl.longitude === "number";
        return hasCoords || FORCE_LOCATION_IDS.has(it.pk);
      })
      .map((it) => it.pk);
    return ids.length > 0 ? ids : [...FORCE_LOCATION_IDS];
  } catch {
    return [...FORCE_LOCATION_IDS];
  }
}

function monthsToFetch(now) {
  const out = [];
  for (let i = 0; i <= MONTHS_AHEAD; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    out.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }
  return out;
}

async function fetchItemMonth(itemId, year, month) {
  const mm = String(month).padStart(2, "0");
  const url = `https://fareharbor.com/api/v1/companies/${SHORTNAME}/items/${itemId}/calendar/${year}/${mm}/`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return [];
  const json = await res.json();
  const out = [];
  for (const week of json?.calendar?.weeks ?? []) {
    for (const day of week?.days ?? []) {
      if (day?.month !== "current") continue; // skip spillover days
      for (const av of day?.availabilities ?? []) {
        if (!av?.is_bookable) continue;
        out.push({
          itemId,
          availabilityPk: av.pk,
          startAt: av.start_at,
          endAt: av.end_at,
          spotsLeft:
            typeof av.approximate_available_capacity === "number"
              ? av.approximate_available_capacity
              : null,
          isSoldOut: Boolean(av.is_sold_out),
        });
      }
    }
  }
  return out;
}

async function buildFeed() {
  const now = new Date();
  const months = monthsToFetch(now);
  const itemIds = await fetchLocationItemIds();

  const tasks = [];
  for (const itemId of itemIds)
    for (const { year, month } of months)
      tasks.push(fetchItemMonth(itemId, year, month).catch(() => []));

  const results = await Promise.all(tasks);
  const nowMs = now.getTime();

  return results
    .flat()
    .filter((s) => {
      const t = Date.parse(s.startAt);
      return Number.isFinite(t) && t > nowMs;
    })
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function onRequestGet(context) {
  // Stable synthetic key — the edge cache entry is shared by all visitors.
  const cacheKey = new Request(
    `https://${SHORTNAME}.feed-cache.local/experiences/upcoming`,
  );
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let body;
  let status = 200;
  try {
    const sessions = await buildFeed();
    body = {
      generatedAt: new Date().toISOString(),
      shortname: SHORTNAME,
      sessions,
    };
  } catch {
    // Never break the homepage — degrade to an empty feed (and don't cache it
    // for the full TTL, so recovery is quick).
    body = {
      generatedAt: new Date().toISOString(),
      shortname: SHORTNAME,
      sessions: [],
      error: "feed_unavailable",
    };
  }

  const ok = !body.error;
  const res = new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Public read-only data; allow cross-origin reads (e.g. the Vercel
      // deployment during the parallel-run phase).
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=${ok ? 300 : 60}, s-maxage=${ok ? CACHE_TTL_S : 60}`,
    },
  });

  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
