# CLAUDE.md — Desert Paddleboards website

Context for Claude Code working in this repo. (No secrets here — they live in
GitHub Actions secrets. A separate private handoff doc covers account access.)

## What this is
The **Desert Paddleboards** marketing + booking website for Sarah Williams
(floating soundbaths, water-fitness classes, paddleboard rentals/adventures,
events, merch — Arizona). It's the discovery/SEO funnel and shop; **bookings
happen on FareHarbor**, merch checkout on **Stripe**.

## Stack
- **React 19 + TypeScript**, built with **Vite 7** + **`vite-react-ssg`**
  (every page is pre-rendered to static HTML — SSG, not SSR; no Node server in
  prod). NOT Next.js/WordPress.
- **react-router v6** · **Tailwind CSS v4** · **TanStack Query**
- Package manager: **pnpm**. Node 22.
- Hosted on **Cloudflare Pages**; a Cloudflare **Pages Function**
  (`functions/experiences/upcoming.js`) proxies the live FareHarbor sessions
  feed.

## Commands
- Install: `pnpm install`
- Dev: `VITE_API_BASE_URL=/ pnpm dev` (localhost:5173)
- Build (what CI runs): `VITE_API_BASE_URL=/ pnpm build`
- **Always build after changes to catch type errors.** For visual checks, run dev.

## Deploy
- **Push to `main` → GitHub Actions builds and deploys to Cloudflare Pages
  (~2–3 min).** No manual deploy step.
- Live (parallel-run): `desert-paddleboards.pages.dev`. Canonical/production
  domain `desertpaddleboards.com` (DNS cutover off GoDaddy still pending).
- Public IDs (GA4 `G-1KGN416Q9C`, Meta Pixel `616926074762012`, Maps browser
  key, Map ID) are fine in code/workflow. **Never commit real secrets**
  (Places API key, Cloudflare token) — those are GitHub Actions secrets.

## Project layout
- `src/pages/` — one file per route. Dynamic: `locations/[slug].tsx`,
  `blog/[slug].tsx` (see `getStaticPaths` in `src/App.tsx` for prerendering).
- `src/components/` — shared UI: `LocationFinder` (hero + map + venue finder),
  `SessionCalendar`, `FeaturedEvent`, `FareHarborButton`, `Analytics`, Header,
  Footer, `Seo`, `JsonLd`.
- `src/data/` — content/data:
  - `locations.ts` — FareHarbor venues = generated catalog
    (`fareharbor-items.generated.json`) merged with an editorial overlay
    (`LOCATION_OVERLAYS`). New FareHarbor venues with coords auto-surface.
  - `city-classes.json` — city-run classes **and** featured FareHarbor events
    (Witches Regatta). A `fareharborItemId` makes an entry book via FareHarbor
    ("Book") instead of an external city link ("Register"). CMS-editable.
  - `blog-posts.ts`, `shop.json`, `videos.json`, `legal-content.ts`,
    `location-content.ts`.
- `src/lib/` — `analytics.ts` (GA4 + Meta Pixel + `trackEvent`), `sessions.ts`
  (`useMergedSessions` = FareHarbor feed + city classes), `utm.ts`, `jsonld.ts`.
- `functions/experiences/upcoming.js` — live FareHarbor feed (Cloudflare
  Function).
- `scripts/` — build-time generators (SEO data, Google reviews, sitemap).
- `.pages.yml` — Pages CMS config (no-code editing → commits to this repo).

## Conventions & gotchas
- **SSG-safety:** code runs during prerender (Node) AND in the browser. Guard
  browser-only APIs (`window`, `sessionStorage`, Google Maps) with
  `typeof window !== "undefined"` and/or `useEffect`. Don't break the build.
- **Calendar data:** `useMergedSessions()` is the single source for the calendar
  + finder. The live FareHarbor feed only fetches ~2 months ahead (stays under
  Cloudflare's free-plan 50-subrequest cap), so far-future FareHarbor events
  won't auto-appear — add them as static featured events in `city-classes.json`
  with a `fareharborItemId`.
- **FareHarbor timestamps are naive** (no offset); pin to Phoenix `-07:00`
  (Arizona has no DST). City-class times use that offset.
- **Pages CMS drops any field not declared in `.pages.yml`** — if you add a
  field to `city-classes.json`/`shop.json` etc., add it to `.pages.yml` too, or
  keep it in code (like the geocoded venue coords in `city-classes.ts`).
- **Analytics:** events fire through `trackEvent(name, params)` in
  `src/lib/analytics.ts` (forwards to GA4 + Meta with standard-event mapping).
  Booking happens off-site on FareHarbor, so site events are **intent**; true
  bookings/revenue come from FareHarbor's own GA4 integration.
- **SEO:** every page uses `<Seo>` (title/description/canonical/OG) + `<JsonLd>`.
  Keep titles ≤ ~60 chars and descriptions ~120–160.
- **Local dev shows only city classes** on the calendar (the FareHarbor feed is
  a deployed Cloudflare Function) — that's expected, not a bug.

## Working style
- After edits: build to verify, then commit + push to `main` to deploy.
- If unsure about a live account/secret/state, ask rather than guess.
