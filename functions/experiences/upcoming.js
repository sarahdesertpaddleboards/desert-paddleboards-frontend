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
const MAX_MONTHS_AHEAD = 5; // ceiling: current month + this many following months (~6 months)
// Each item-month is one fetch (subrequest). We're on the Workers PAID plan
// (1000-subrequest cap; the free plan's 50 previously squeezed the feed to
// ~1 month ahead and hid far-future sessions). This budget stays well under
// 1000 with headroom, and the number of months still auto-shrinks if venues
// ever grow enough to approach it (every venue always gets at least the current
// month). If the site is ever downgraded to the free plan, drop this back to 45.
const SUBREQUEST_BUDGET = 900; // Workers PAID plan (1000 cap); ~20 venues × 6 months ≈ 120
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

function monthsToFetch(now, monthsAhead) {
  const out = [];
  for (let i = 0; i <= monthsAhead; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    out.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }
  return out;
}

// Arizona (Phoenix) observes no daylight saving — it's MST / UTC-07:00 all
// year. FareHarbor's public calendar returns naive local timestamps with no
// offset (e.g. "2026-06-30T19:00:00"), so `new Date(...)` parses them in the
// VIEWER's timezone and renders the wrong time for anyone outside Arizona
// (and in JSON-LD). Pin them to Phoenix so every client agrees. Leaves any
// already-offset/UTC string untouched.
function withPhoenixOffset(s) {
  if (typeof s !== "string") return s;
  return /[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}-07:00`;
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
        // Surface a session if it's bookable, sold out, OR only closed because
        // it's past the (short) booking cutoff — so a class never silently
        // vanishes once it fills up or the cutoff passes. The UI shows the right
        // call-to-action per state (Book / waitlist text / call). Anything else
        // (e.g. truly unavailable) is skipped.
        const show =
          av?.is_bookable ||
          av?.is_sold_out ||
          av?.is_past_cutoff_with_bookings ||
          av?.is_past_cutoff_without_bookings;
        if (!show) continue;
        out.push({
          itemId,
          availabilityPk: av.pk,
          startAt: withPhoenixOffset(av.start_at),
          endAt: withPhoenixOffset(av.end_at),
          spotsLeft:
            typeof av.approximate_available_capacity === "number"
              ? av.approximate_available_capacity
              : null,
          isSoldOut: Boolean(av.is_sold_out),
          isBookable: Boolean(av.is_bookable),
        });
      }
    }
  }
  return out;
}

async function buildFeed() {
  const now = new Date();
  const itemIds = await fetchLocationItemIds();

  // Stay under the subrequest cap: one fetch was already spent on the items
  // list, so divide the rest across the venues and fetch as many months as
  // fit (always at least the current month for every venue).
  const itemCount = Math.max(1, itemIds.length);
  const affordableMonths = Math.max(1, Math.floor((SUBREQUEST_BUDGET - 1) / itemCount));
  const monthsAhead = Math.min(MAX_MONTHS_AHEAD, affordableMonths - 1);
  const months = monthsToFetch(now, monthsAhead);

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

// In-memory fallback cache (per isolate). The Cache API below is a no-op on
// *.pages.dev domains (it only works behind a custom domain), so while the
// site runs on pages.dev this keeps warm isolates from rebuilding the feed
// on every request.
let memCache = null; // { at: number, body: string }

export async function onRequestGet(context) {
  // Stable synthetic key — the edge cache entry is shared by all visitors.
  const cacheKey = new Request(
    `https://${SHORTNAME}.feed-cache.local/experiences/upcoming`,
  );
  const cache = caches.default;

  if (memCache && Date.now() - memCache.at < CACHE_TTL_S * 1000) {
    return jsonResponse(memCache.body, CACHE_TTL_S);
  }

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let body;
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
  const text = JSON.stringify(body);
  if (ok) memCache = { at: Date.now(), body: text };

  const res = jsonResponse(text, ok ? CACHE_TTL_S : 60);
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

function jsonResponse(text, ttlS) {
  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Public read-only data; allow cross-origin reads (e.g. the Vercel
      // deployment during the parallel-run phase).
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=${Math.min(ttlS, 300)}, s-maxage=${ttlS}`,
    },
  });
}
