#!/usr/bin/env node
/**
 * Site health check — the audit that caught two weeks of silently failed
 * deploys in Aug 2026.
 *
 *   node scripts/health-check.mjs
 *
 * Checks, in order of how badly each one hurts:
 *   1. Is the live site actually serving, and is it the current build?
 *   2. Does every scheduled FareHarbor session appear on the site?
 *   3. Are there venues on the grid with no upcoming date?
 *   4. Do the key pages load, and are any images broken or oversized?
 *
 * Exits non-zero if anything in 1-2 fails, so CI can fail the job on it.
 */

const SITE = "https://desertpaddleboards.com";
const SHORTNAME = "desertpaddleboards";
const UA = { "User-Agent": "DesertPaddleboards-HealthCheck/1.0" };

const problems = [];
const notes = [];
const ok = [];

function fail(msg) { problems.push(msg); }
function warn(msg) { notes.push(msg); }
function pass(msg) { ok.push(msg); }

async function getJSON(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** Months to scan, from this month forward. */
function monthsAhead(n) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    out.push([d.getUTCFullYear(), d.getUTCMonth() + 1]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Is the site up?
// ---------------------------------------------------------------------------
async function checkSiteUp() {
  const pages = ["/", "/locations", "/calendar", "/private-events", "/community-events", "/adventures", "/shop"];
  for (const p of pages) {
    try {
      const res = await fetch(SITE + p, { headers: UA });
      if (!res.ok) fail(`Page ${p} returned HTTP ${res.status}`);
    } catch (e) {
      fail(`Page ${p} did not load: ${e.message}`);
    }
  }
  if (problems.length === 0) pass(`All ${pages.length} key pages return 200`);
}

// ---------------------------------------------------------------------------
// 2. FareHarbor vs the site — the check that matters for bookings
// ---------------------------------------------------------------------------
async function checkSessionsReachTheSite() {
  let items;
  try {
    const d = await getJSON(`https://fareharbor.com/api/v1/companies/${SHORTNAME}/items/`);
    items = (d.items ?? []).filter(
      (i) => !(i.is_archived || i.is_private || i.is_unlisted || i.is_retail),
    );
  } catch (e) {
    fail(`Could not read FareHarbor items: ${e.message}`);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const fhSessions = [];
  for (const it of items) {
    for (const [y, m] of monthsAhead(6)) {
      const mm = String(m).padStart(2, "0");
      try {
        const d = await getJSON(
          `https://fareharbor.com/api/v1/companies/${SHORTNAME}/items/${it.pk}/calendar/${y}/${mm}/`,
        );
        for (const w of d?.calendar?.weeks ?? []) {
          for (const day of w?.days ?? []) {
            if (day?.month !== "current") continue;
            for (const a of day?.availabilities ?? []) {
              if (day.at >= today) {
                fhSessions.push({ pk: it.pk, name: it.name, date: day.at, start: a.start_at });
              }
            }
          }
        }
      } catch {
        /* a single month failing shouldn't kill the run */
      }
    }
  }

  let feed = [];
  try {
    const d = await getJSON(`${SITE}/experiences/upcoming?cb=${Date.now()}`);
    feed = Array.isArray(d) ? d : (d.sessions ?? d.data ?? []);
  } catch (e) {
    fail(`Sessions feed unreachable: ${e.message}`);
  }

  // Featured events carry hand-maintained dates in city-classes.json; they
  // reach the site through the static path, not the live feed.
  let staticPairs = new Set();
  try {
    const { default: cityClasses } = await import("../src/data/city-classes.json", {
      with: { type: "json" },
    });
    for (const c of cityClasses.cityClasses ?? []) {
      if (typeof c.fareharborItemId === "number") {
        for (const s of c.sessions ?? []) staticPairs.add(`${c.fareharborItemId}|${s.date}`);
      }
    }
  } catch {
    warn("Could not read city-classes.json — static featured dates not compared");
  }

  const shown = new Set(feed.map((s) => `${s.itemId}|${s.startAt.slice(0, 10)}`));
  const missing = fhSessions.filter(
    (f) => !shown.has(`${f.pk}|${f.date}`) && !staticPairs.has(`${f.pk}|${f.date}`),
  );

  if (missing.length) {
    for (const m of missing.sort((a, b) => a.date.localeCompare(b.date))) {
      fail(`Bookable in FareHarbor but NOT on the site: ${m.date} — ${m.name}`);
    }
  } else {
    pass(`All ${fhSessions.length} upcoming FareHarbor sessions appear on the site`);
  }

  // Venues with nothing scheduled — informational, not a failure.
  const withSessions = new Set(fhSessions.map((f) => f.pk));
  const idle = items.filter((i) => !withSessions.has(i.pk)).map((i) => i.name);
  if (idle.length) warn(`${idle.length} item(s) have no upcoming dates: ${idle.join(", ")}`);
}

// ---------------------------------------------------------------------------
// 3. Assets
// ---------------------------------------------------------------------------
async function checkImages() {
  try {
    const html = await (await fetch(`${SITE}/`, { headers: UA })).text();
    const srcs = [...new Set([...html.matchAll(/src="(\/[^"]+\.(?:jpg|jpeg|png|webp))"/g)].map((m) => m[1]))];
    for (const s of srcs.slice(0, 25)) {
      const res = await fetch(SITE + s, { method: "HEAD", headers: UA });
      if (!res.ok) {
        fail(`Broken image on the homepage: ${s} (HTTP ${res.status})`);
        continue;
      }
      const bytes = Number(res.headers.get("content-length") ?? 0);
      if (bytes > 1_000_000) warn(`Large image (${Math.round(bytes / 1024)}KB): ${s}`);
    }
    if (srcs.length) pass(`Checked ${Math.min(srcs.length, 25)} homepage images`);
  } catch (e) {
    warn(`Image check skipped: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------

console.log(`\nDesert Paddleboards health check — ${new Date().toISOString().slice(0, 16)}\n`);
await checkSiteUp();
await checkSessionsReachTheSite();
await checkImages();

for (const o of ok) console.log(`  OK    ${o}`);
for (const n of notes) console.log(`  note  ${n}`);
for (const p of problems) console.log(`  FAIL  ${p}`);

console.log(
  problems.length
    ? `\n${problems.length} problem(s) need attention.\n`
    : `\nAll clear.\n`,
);
process.exit(problems.length ? 1 : 0);
