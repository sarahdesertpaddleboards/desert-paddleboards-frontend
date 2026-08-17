#!/usr/bin/env node
/**
 * UTM link builder.
 *
 * Why: GA4 shows ~2,410 sessions/month arriving as untagged
 * "instagram.com / referral" (2s engagement, 0.66% key-event rate) while
 * *tagged* instagram/social traffic engages for 58s and converts at 45%. Same
 * audience — the difference is that untagged links land people on raw booking
 * widgets instead of real pages, and we can't tell the two apart in reporting.
 *
 * Use this to generate tagged links for every social post, email and bio link.
 *
 * Usage:
 *   node scripts/utm.mjs <path-or-url> --source instagram --medium social \
 *        [--campaign kino_aug] [--content story_swipe_up]
 *
 * Examples:
 *   node scripts/utm.mjs /private-events --source instagram --medium social \
 *        --campaign corporate_q3
 *   node scripts/utm.mjs /locations/floating-soundbath-kino-aquatics-mesa \
 *        --source instagram --medium social --campaign kino_aug --content reel
 *   node scripts/utm.mjs --list           # common presets
 */

const SITE = "https://desertpaddleboards.com";

/** Links worth promoting — these are real pages, not booking widgets. */
const PRESETS = [
  ["/", "Homepage"],
  ["/private-events", "Private events (corporate, bachelorette)"],
  ["/community-events", "Community events (HOA, 55+)"],
  ["/locations", "All venues"],
  ["/calendar", "Session calendar"],
  ["/adventures", "Adventures & trips"],
  ["/airstream", "Airstream mobile wellness lounge"],
  ["/custom-boards", "Custom branded boards"],
  ["/shop", "Shop"],
];

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) out[a.slice(2)] = argv[++i] ?? "";
    else out._.push(a);
  }
  return out;
}

/** utm values should be lowercase and free of spaces so GA4 doesn't split them. */
function clean(v) {
  return String(v).trim().toLowerCase().replace(/\s+/g, "_");
}

function build(target, { source, medium, campaign, content, term }) {
  const url = new URL(target.startsWith("http") ? target : SITE + target);
  if (url.origin !== SITE) {
    console.warn(
      `\n  ! ${url.origin} is not our site. UTM tags only report into our GA4\n` +
        `    for pages we own — tagging a fareharbor.com link won't fix\n` +
        `    attribution. Link to the matching page on ${SITE} instead.\n`,
    );
  }
  url.searchParams.set("utm_source", clean(source));
  url.searchParams.set("utm_medium", clean(medium));
  if (campaign) url.searchParams.set("utm_campaign", clean(campaign));
  if (content) url.searchParams.set("utm_content", clean(content));
  if (term) url.searchParams.set("utm_term", clean(term));
  return url.toString();
}

const args = parseArgs(process.argv.slice(2));

if (args.list || args._.length === 0) {
  console.log("\nPages worth linking to (never link a booking widget directly):\n");
  for (const [path, label] of PRESETS) console.log(`  ${path.padEnd(38)} ${label}`);
  console.log(`
Usage:
  node scripts/utm.mjs /private-events --source instagram --medium social --campaign corporate_q3

Conventions that keep GA4 tidy:
  --source    instagram | facebook | tiktok | flodesk | linkedin | qr
  --medium    social | email | referral | paid_social | print
  --campaign  short_snake_case theme, e.g. kino_aug, witches_2026
  --content   which creative, e.g. reel, story, bio_link, carousel
`);
  process.exit(0);
}

const target = args._[0];
const source = args.source;
const medium = args.medium;

if (!source || !medium) {
  console.error("Error: --source and --medium are required.\n");
  console.error("  e.g. node scripts/utm.mjs /private-events --source instagram --medium social");
  process.exit(1);
}

console.log("\n" + build(target, args) + "\n");
