/**
 * Pre-build step. Two outputs, both from FareHarbor's public (no-auth) API:
 *
 *  1. src/data/fareharbor-items.generated.json — the live ITEM CATALOG.
 *     The canonical list of Sarah's FareHarbor items (venue, city, coords,
 *     image, visibility flags). src/data/locations.ts merges this with the
 *     in-code editorial overlay (slugs, blurbs, titles) so new fixed-location
 *     venues appear on the site automatically. COMMITTED to git (rarely
 *     changes; the diff is meaningful) and refreshed on every build.
 *
 *  2. src/data/upcoming.generated.json — upcoming bookable SESSIONS, so the
 *     location pages can bake Event JSON-LD (with real dates) into the static
 *     HTML at SSG build time. Gitignored (regenerated every build).
 *
 * Resilience:
 *  - The catalog is PRESERVED on any fetch failure (we never overwrite a
 *    good venue list with an empty one — that would break the build). If
 *    FareHarbor is unreachable, the committed snapshot is used as-is.
 *  - The session feed degrades to an empty list on failure (sessions are
 *    transient; an empty feed just hides "next date" labels).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEMS_OUT = join(__dirname, "../src/data/fareharbor-items.generated.json");
const UPCOMING_OUT = join(__dirname, "../src/data/upcoming.generated.json");

const SHORTNAME = "desertpaddleboards";
const MONTHS_AHEAD = 2;

// Items that are fixed-location venues but lack lat/lng in FareHarbor's
// primary_location (so the coords heuristic alone would miss them). Aji Spa's
// FareHarbor location has no coordinates; locations.ts supplies them.
const FORCE_LOCATION_IDS = new Set([626146]);

const UA = { "User-Agent": "DesertPaddleboards-SEO/1.0" };

// ---------------------------------------------------------------------------
// Item catalog
// ---------------------------------------------------------------------------

/** Best available CDN image url for an item, or "" if none. */
function pickImage(item) {
  if (item.image_cdn_url) return item.image_cdn_url;
  const imgs = Array.isArray(item.images) ? item.images : [];
  const hiRes = imgs.find((im) => im && !im.is_low_resolution);
  const chosen = hiRes ?? imgs[0];
  if (!chosen) return "";
  return chosen.cropped_cdn_url || chosen.image_cdn_url || chosen.image_url || "";
}

/** Normalise a raw FareHarbor item into the slim shape the site consumes. */
function normaliseItem(item) {
  const pl = item.primary_location ?? {};
  const lat = typeof pl.latitude === "number" ? pl.latitude : null;
  const lng = typeof pl.longitude === "number" ? pl.longitude : null;
  return {
    itemId: item.pk,
    name: item.name ?? "",
    isUnlisted: Boolean(item.is_unlisted),
    isRetail: Boolean(item.is_retail),
    // venue / address from primary_location (may be blank)
    venue: pl.name ?? "",
    city: pl.city ?? "",
    state: pl.province ?? "AZ",
    street: pl.street ?? "",
    postalCode: pl.postal_code ?? "",
    googlePlaceId: pl.google_place_id ?? "",
    lat,
    lng,
    image: pickImage(item),
  };
}

/** True if an item is a fixed-location experience the site should surface. */
function isLocationItem(it) {
  if (it.isUnlisted || it.isRetail) return false;
  return (it.lat !== null && it.lng !== null) || FORCE_LOCATION_IDS.has(it.itemId);
}

async function fetchCatalog() {
  const url = `https://fareharbor.com/api/v1/companies/${SHORTNAME}/items/`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`items list HTTP ${res.status}`);
  const json = await res.json();
  const raw = Array.isArray(json?.items) ? json.items : [];
  // Drop archived/private outright — they never belong on the public site.
  return raw
    .filter((it) => !it.is_archived && !it.is_private)
    .map(normaliseItem)
    .sort((a, b) => a.itemId - b.itemId);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

function monthsToFetch(now) {
  const out = [];
  for (let i = 0; i <= MONTHS_AHEAD; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
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
      if (day?.month !== "current") continue;
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

async function fetchUpcoming(itemIds, now) {
  const months = monthsToFetch(now);
  const tasks = [];
  for (const id of itemIds)
    for (const { year, month } of months)
      tasks.push(fetchItemMonth(id, year, month).catch(() => []));
  const all = (await Promise.all(tasks)).flat();
  const nowMs = now.getTime();
  return all
    .filter((s) => {
      const t = Date.parse(s.startAt);
      return Number.isFinite(t) && t > nowMs;
    })
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

// ---------------------------------------------------------------------------

async function main() {
  const now = new Date();

  // 1. Catalog — derive the item ids to fetch sessions for. On failure, fall
  //    back to the committed catalog so the build keeps the existing venues.
  let catalog = [];
  try {
    catalog = await fetchCatalog();
    if (catalog.length === 0) throw new Error("empty item list");
    writeFileSync(
      ITEMS_OUT,
      JSON.stringify({ generatedAt: now.toISOString(), items: catalog }, null, 2) + "\n",
    );
    const locCount = catalog.filter(isLocationItem).length;
    console.log(
      `[seo] catalog: ${catalog.length} items (${locCount} fixed-location) → fareharbor-items.generated.json`,
    );
  } catch (err) {
    console.warn(`[seo] catalog fetch failed (${err?.message}); keeping committed snapshot`);
    if (existsSync(ITEMS_OUT)) {
      try {
        catalog = JSON.parse(readFileSync(ITEMS_OUT, "utf8")).items ?? [];
      } catch {
        catalog = [];
      }
    }
  }

  // 2. Sessions — only for the fixed-location items the site shows.
  const itemIds = catalog.filter(isLocationItem).map((it) => it.itemId);
  let sessions = [];
  try {
    sessions = await fetchUpcoming(itemIds, now);
    console.log(`[seo] fetched ${sessions.length} upcoming sessions across ${itemIds.length} items`);
  } catch (err) {
    console.warn(`[seo] session fetch failed, writing empty feed:`, err?.message);
  }
  writeFileSync(
    UPCOMING_OUT,
    JSON.stringify({ generatedAt: now.toISOString(), sessions }, null, 0) + "\n",
  );
}

main();
