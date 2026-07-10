/**
 * Pre-build step. Turns a city-class venue's ADDRESS (entered in Pages CMS)
 * into map coordinates, so a venue added through the CMS shows up on the
 * homepage map + finder automatically — no developer needed to hand-add lat/lng.
 *
 * Reads src/data/city-classes.json. For each city class that has an `address`,
 * it looks up coordinates via the Google Places API (New) Text Search endpoint,
 * using the SAME server-side key already used for reviews (GOOGLE_PLACES_API_KEY,
 * no HTTP-referrer restriction).
 *
 * Output: src/data/city-venue-coords.generated.json — { [id]: {lat,lng,address,name} }.
 * Precise, hand-set coordinates in city-classes.ts (CITY_VENUE_COORDS) always
 * WIN over these — this file only fills the gaps for CMS-added venues.
 *
 * Cached: an entry is only (re)geocoded when its address is new or changed, so
 * repeat builds don't burn API calls.
 *
 * Resilience (matches generate-reviews.mjs): the committed snapshot is PRESERVED
 * on any failure (missing key, network error, no result). A local build without
 * the key keeps the last-committed coords — the build never breaks.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLASSES = join(__dirname, "../src/data/city-classes.json");
const OUT = join(__dirname, "../src/data/city-venue-coords.generated.json");
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Venues whose coordinates are set precisely by hand in city-classes.ts
// (CITY_VENUE_COORDS) — no need to geocode them. Keep this in sync with that map.
const MANUAL_IDS = new Set([
  "queen-creek-friday-floats",
  "sedona-soundbath",
  "witches-regatta",
  "salt-river-outing",
]);

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function geocode(address) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.location,places.formattedAddress,places.displayName",
    },
    body: JSON.stringify({ textQuery: address, regionCode: "US" }),
  });
  if (!res.ok) throw new Error(`Places searchText HTTP ${res.status}`);
  const json = await res.json();
  const p = json.places?.[0];
  if (!p?.location || typeof p.location.latitude !== "number") return null;
  return { lat: p.location.latitude, lng: p.location.longitude, name: p.displayName?.text };
}

async function main() {
  const classes = readJson(CLASSES, { cityClasses: [] }).cityClasses ?? [];
  const cache = existsSync(OUT) ? readJson(OUT, {}) : {};
  const out = { ...cache };

  // Venues that need coordinates from an address (skip hand-set ones).
  const targets = classes.filter(
    (c) => c.id && c.address && String(c.address).trim() && !MANUAL_IDS.has(c.id),
  );
  const liveIds = new Set(targets.map((c) => c.id));

  // Drop coords for venues that were removed or lost their address.
  for (const id of Object.keys(out)) {
    if (!liveIds.has(id)) delete out[id];
  }

  if (!API_KEY) {
    console.warn(
      `[coords] GOOGLE_PLACES_API_KEY not set; keeping committed snapshot (${Object.keys(out).length} venues)`,
    );
    writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
    return;
  }

  let geocoded = 0;
  for (const c of targets) {
    const address = String(c.address).trim();
    const cached = out[c.id];
    if (cached && cached.address === address && typeof cached.lat === "number") {
      continue; // unchanged — reuse the cached coordinates, no API call
    }
    try {
      const r = await geocode(address);
      if (r) {
        out[c.id] = { lat: r.lat, lng: r.lng, address, name: r.name || c.venue || "" };
        geocoded++;
        console.log(`[coords] ${c.id}: "${address}" → ${r.lat}, ${r.lng}`);
      } else {
        console.warn(`[coords] no geocode result for ${c.id}: "${address}"`);
      }
    } catch (e) {
      console.warn(`[coords] geocode failed for ${c.id}: ${e.message}`);
    }
  }

  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `[coords] ${geocoded} newly geocoded, ${Object.keys(out).length} venues total → city-venue-coords.generated.json`,
  );
}

main().catch((e) => {
  console.warn(`[coords] ${e.message}; keeping committed snapshot`);
  process.exit(0);
});
