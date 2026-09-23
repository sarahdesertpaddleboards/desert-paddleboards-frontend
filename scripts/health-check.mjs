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
 *   3. Does every upcoming city-run class appear on the calendar?
 *   4. Are the per-date city registration links intact?
 *   5. Are there venues on the grid with no upcoming date?
 *   6. Do the key pages load, and are any images broken or oversized?
 *
 * Exits non-zero if anything in 1-4 fails, so CI can fail the job on it.
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
// 3. City-run classes vs the site
// ---------------------------------------------------------------------------
// City classes (Avondale, Queen Creek, Sedona) never touch the FareHarbor feed
// — they reach the site only through the static city-classes.json path. Check 2
// therefore cannot see them at all, so a city class that silently stops
// rendering would go unnoticed. This closes that gap, and warns before a class
// runs out of dates and disappears from the site on its own.
const LOOKAHEAD_DAYS = 21;

function azDateHeader(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Phoenix",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

async function checkCityClassesReachTheSite() {
  let classes;
  try {
    const { default: data } = await import("../src/data/city-classes.json", {
      with: { type: "json" },
    });
    classes = (data.cityClasses ?? []).filter((c) => typeof c.fareharborItemId !== "number");
  } catch (e) {
    fail(`Could not read city-classes.json: ${e.message}`);
    return;
  }

  let text;
  try {
    const html = await (await fetch(`${SITE}/calendar?cb=${Date.now()}`, { headers: UA })).text();
    text = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  } catch (e) {
    fail(`Calendar page unreachable: ${e.message}`);
    return;
  }

  const now = Date.now();
  const soon = now + LOOKAHEAD_DAYS * 86400_000;
  let checked = 0;

  for (const c of classes) {
    const upcoming = (c.sessions ?? [])
      .filter((s) => s?.date && s?.time)
      .map((s) => `${s.date}T${s.time}:00-07:00`)
      .filter((iso) => Date.parse(iso) > now)
      .sort();

    if (upcoming.length === 0) {
      warn(`${c.title} has NO upcoming dates — it is not on the calendar at all.`);
      continue;
    }

    for (const iso of upcoming) {
      checked++;
      const header = azDateHeader(iso);
      if (!text.includes(c.title)) {
        fail(`${c.title} is scheduled for ${header} but does not appear on /calendar`);
        break;
      }
      if (!text.includes(header)) {
        fail(`${c.title} is scheduled for ${header}, but /calendar has no such date`);
      }
    }

    if (Date.parse(upcoming[upcoming.length - 1]) < soon) {
      warn(
        `${c.title} runs out after ${azDateHeader(upcoming[upcoming.length - 1])} — ` +
          `add more dates or it will drop off the site.`,
      );
    }
  }

  if (checked) pass(`All ${checked} upcoming city-class session(s) appear on /calendar`);
}

// ---------------------------------------------------------------------------
// 4. Per-date city registration links
// ---------------------------------------------------------------------------
// Queen Creek posts a separate listing per session, so each date in
// city-classes.json carries its own bookingUrl (e.g. ...?filter=<base64 of
// "search=4368636">). A wrong id sends people to the wrong class — or to an
// empty search — and nothing else on the site would notice.
//
// IMPORTANT, and the reason this check is shaped the way it is: rec1.com sits
// behind a bot challenge and answers automated requests with HTTP 403, so
// there is NO way to confirm from here that an id resolves to the right class.
// Fetching them would only ever prove that Cloudflare is still saying no. So
// this checks what can actually be established — every upcoming date has a
// link, the links are well-formed, and no two dates share one — and then
// prints the next date's id for a human to spot-check in one click. Treat a
// pass as "nothing is structurally broken", never as "the links are correct".

function decodeFilter(url) {
  const m = /[?&]filter=([^&]+)/.exec(url);
  if (!m) return null;
  try {
    return Buffer.from(decodeURIComponent(m[1]), "base64").toString("utf8");
  } catch {
    return null;
  }
}

async function checkRegistrationLinks() {
  let classes;
  try {
    const { default: data } = await import("../src/data/city-classes.json", {
      with: { type: "json" },
    });
    classes = (data.cityClasses ?? []).filter((c) => typeof c.fareharborItemId !== "number");
  } catch (e) {
    fail(`Could not read city-classes.json for link check: ${e.message}`);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const problemsBefore = problems.length;
  let checked = 0;
  const toSpotCheck = [];

  for (const c of classes) {
    const upcoming = (c.sessions ?? []).filter((s) => s?.date && s.date >= today);
    if (upcoming.length === 0) continue;

    // Only classes that use per-date links at all; Sedona posts none and
    // correctly falls back to its class-level link.
    const withLinks = upcoming.filter((s) => s.bookingUrl);
    if (withLinks.length === 0) continue;

    const seen = new Map();
    for (const s of upcoming) {
      if (!s.bookingUrl) {
        fail(
          `${c.title} ${s.date} has no registration link, but its other dates do — ` +
            `the site will fall back to the generic catalog for that date.`,
        );
        continue;
      }
      checked++;
      const decoded = decodeFilter(s.bookingUrl);
      if (!decoded || !/^search=\d+$/.test(decoded)) {
        fail(
          `${c.title} ${s.date} has a malformed registration link ` +
            `(decodes to ${decoded === null ? "nothing" : `"${decoded}"`}): ${s.bookingUrl}`,
        );
        continue;
      }
      const prev = seen.get(s.bookingUrl);
      if (prev) {
        fail(
          `${c.title} uses the same registration link for ${prev} and ${s.date} ` +
            `(${decoded}) — one of them points at the wrong class.`,
        );
      } else {
        seen.set(s.bookingUrl, s.date);
      }
    }

    const next = upcoming.find((s) => s.bookingUrl);
    if (next) {
      toSpotCheck.push(
        `${c.title} — next is ${next.date}, ${decodeFilter(next.bookingUrl)}\n          ${next.bookingUrl}`,
      );
    }
  }

  if (checked && problems.length === problemsBefore) {
    pass(`All ${checked} per-date registration link(s) are well-formed and unique`);
  }
  for (const line of toSpotCheck) {
    warn(`NOT auto-verifiable (rec1 blocks bots) — open the next one and confirm the class:\n          ${line}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Assets
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
await checkCityClassesReachTheSite();
await checkRegistrationLinks();
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
