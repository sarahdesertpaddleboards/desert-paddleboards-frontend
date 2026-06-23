# Desert Paddleboards — SEO Tech Sheet

A one-page reference for the SEO/marketing team. Everything you need to audit
and optimise the site — no code or hosting access required.

## The site at a glance
- **Type:** static website — every page is pre-rendered to plain HTML at build time, so all content, headings and structured data are in the initial HTML (great for crawlers; nothing important depends on JavaScript).
- **Stack:** React + TypeScript, built with Vite (`vite-react-ssg`). Tailwind CSS. *(Not WordPress, not Next.js, not a Node server.)*
- **Hosting:** Cloudflare Pages — served from Cloudflare's global edge CDN (fast TTFB worldwide).
- **Deploys:** automatically from a GitHub repo via CI on every change (~2–3 min).

## URLs
- **Production / canonical domain:** `https://desertpaddleboards.com` — all canonical tags, the sitemap and Open Graph URLs point here. *(Note: the new build is currently also live at `desert-paddleboards.pages.dev` during the migration; the DNS cutover to desertpaddleboards.com is pending. Do SEO work against the `desertpaddleboards.com` property.)*
- **Sitemap:** `https://desertpaddleboards.com/sitemap.xml` (~51 URLs, auto-generated on every build).
- **robots.txt:** `https://desertpaddleboards.com/robots.txt` — allows crawling everything except `/admin`, `/admin-login`, `/success`; references the sitemap.

## What's already implemented (so you don't re-do it)
- **Per-page `<title>` and meta description** — written and length-checked (titles ≤ ~60 chars, descriptions ~120–160 chars) across all pages.
- **Canonical tags** on every page (pointing to the canonical domain).
- **Open Graph + Twitter Card** tags on every page (title, description, image, URL, type — `article` for blog posts).
- **Structured data (JSON-LD):**
  - `Organization` + `WebSite` (site-wide)
  - `LocalBusiness` (home)
  - `BreadcrumbList` (all deeper pages)
  - `Event` (each location / class page, generated from real upcoming dates)
  - `Service` (private events, community events, coaching)
- **Image alt text** across pages.
- **Clean semantic HTML** — one `<h1>` per page, logical heading order.
- **301 redirects** from the old GoDaddy URLs to the new structure (migration redirect map in place — ask us for the full list if useful).
- **Mobile-responsive**, HTTPS by default (Cloudflare), and lightweight (static + CDN).

## Page inventory (top-level)
Home · Floating Sessions (`/locations` + a page per venue/class) · Calendar · Adventures · Rentals · Coaching · Private Events · Community Events · Shop · Blog · About · FAQ · Privacy · Terms.
Venue and city-class pages live under `/locations/[slug]`; blog posts under `/blog/[slug]`.

## Analytics & tracking
- **Google Analytics 4** and the **Meta (Facebook) Pixel** are wired into the site and fire on page views plus key conversions (Book clicks, enquiry submits, shop checkouts, city-class registrations). They activate once their IDs are provided.
- For campaign attribution, **use UTM parameters** on the links you run in ads/email (e.g. `?utm_source=facebook&utm_medium=cpc&utm_campaign=summer`). GA4 will then attribute traffic and conversions to each campaign.

## How to audit (all external — no access needed)
- **Crawl** `desertpaddleboards.com` with Screaming Frog / Ahrefs / Sitebleu, etc.
- **Google Search Console** (you'll be granted access) — indexing, queries, coverage, sitemap submission, URL inspection.
- **PageSpeed Insights / Lighthouse** for Core Web Vitals.
- **Rich Results Test** to validate the JSON-LD.

## Requesting changes
On-page and technical SEO changes (titles, meta, headings, schema, internal links, new content, speed) are made in code and deployed by the dev team. **Send a prioritised list of recommendations** and we'll implement and deploy them — usually quickly, since deploys are automated. You won't need repo or hosting access to get changes live.

## Access you'll be given
- **Google Search Console** — Full user (view all data, submit sitemaps, inspect URLs).
- **Google Analytics 4** — Viewer/Analyst.
- **Meta Ads / Pixel** — via Meta Business Manager (already set up for ad campaigns).

For anything you think you need beyond this, just ask and we'll find the safest way to get you what you need.

## Contact
Dev/site questions → the Desert Paddleboards team. Business owner: Sarah Williams · sarah@desertpaddleboards.com · 602.456.0884.
