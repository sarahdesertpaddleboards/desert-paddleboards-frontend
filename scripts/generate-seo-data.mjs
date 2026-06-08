/**
 * Pre-build step: fetch upcoming FareHarbor sessions and write them to
 * src/data/upcoming.generated.json so the location pages can bake Event
 * JSON-LD (with real dates) into the static HTML at SSG build time.
 *
 * Fully resilient: on any failure it writes an empty session list so the
 * build never breaks. Keep ITEM_IDS in sync with src/data/locations.ts.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/upcoming.generated.json");

const SHORTNAME = "desertpaddleboards";
const ITEM_IDS = [
  709135, 725981, 728366, 578969, 626146, 636156, 344396, 627535, 648798,
  146434,
];
const MONTHS_AHEAD = 2;

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
  const res = await fetch(url, {
    headers: { "User-Agent": "DesertPaddleboards-SEO/1.0" },
  });
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

async function main() {
  let sessions = [];
  try {
    const now = new Date();
    const months = monthsToFetch(now);
    const tasks = [];
    for (const id of ITEM_IDS)
      for (const { year, month } of months)
        tasks.push(fetchItemMonth(id, year, month).catch(() => []));
    const all = (await Promise.all(tasks)).flat();
    const nowMs = now.getTime();
    sessions = all
      .filter((s) => {
        const t = Date.parse(s.startAt);
        return Number.isFinite(t) && t > nowMs;
      })
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
    console.log(`[seo] fetched ${sessions.length} upcoming sessions`);
  } catch (err) {
    console.warn(`[seo] FareHarbor fetch failed, writing empty feed:`, err?.message);
  }
  writeFileSync(
    OUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), sessions }, null, 0) + "\n",
  );
}

main();
