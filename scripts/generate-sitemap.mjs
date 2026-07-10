/**
 * Post-build step: scan the built dist/ folder for pre-rendered .html pages
 * and write dist/sitemap.xml + dist/robots.txt. Driving it off the actual
 * built files means the sitemap always matches what shipped — no hardcoded
 * route list to drift out of sync.
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "../dist");
const SITE_URL = "https://desertpaddleboards.com";

// Pages that should not be indexed / listed.
const EXCLUDE = [
  /^admin(\/|$)/,
  /^admin-login$/,
  /^success$/,
  /^404$/,
  /^mockups(\/|$)/, // temporary design mockups, never index
  /^custom-boards$/, // unlisted preview page — remove when it goes live
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (entry.endsWith(".html")) files.push(full);
  }
  return files;
}

function toRoute(htmlPath) {
  let rel = relative(DIST, htmlPath).replace(/\\/g, "/").replace(/\.html$/, "");
  if (rel === "index") return "/";
  rel = rel.replace(/\/index$/, "");
  return `/${rel}`;
}

const routes = [
  ...new Set(
    walk(DIST)
      .map(toRoute)
      .filter((r) => !EXCLUDE.some((re) => re.test(r.replace(/^\//, "")))),
  ),
].sort();

const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${SITE_URL}${r === "/" ? "/" : r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r === "/" ? "daily" : "weekly"}</changefreq>\n    <priority>${r === "/" ? "1.0" : "0.7"}</priority>\n  </url>`,
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(DIST, "sitemap.xml"), sitemap);

const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin-login\nDisallow: /success\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
writeFileSync(join(DIST, "robots.txt"), robots);

console.log(`[sitemap] wrote ${routes.length} urls to dist/sitemap.xml + robots.txt`);
