/**
 * Pre-build step. Bakes Google reviews into the static site at build time.
 *
 * Output: src/data/reviews.generated.json — overall rating, total review
 * count, and up to 5 individual reviews for the business's Google Business
 * Profile. Rendered as real text on the homepage (and reused elsewhere) so the
 * social proof is in the pre-rendered HTML — SSG-friendly and SEO-clean.
 *
 * Source: Google Places API (New) Place Details endpoint. The official API
 * returns at most ~5 reviews; a full review wall needs a paid widget. We do
 * NOT emit Review/AggregateRating JSON-LD for these — surfacing a third
 * party's Google reviews as our own structured data is against Google policy.
 * They're shown as plain attributed text only.
 *
 * Config (env):
 *  - GOOGLE_PLACES_API_KEY — server-side key restricted to Places API (New),
 *    with NO HTTP-referrer restriction (unlike the browser Maps key). Set as a
 *    GitHub Actions repo secret of the same name.
 *  - GOOGLE_PLACE_ID — optional override; defaults to the known Place ID.
 *
 * Resilience: like the FareHarbor catalog, the committed snapshot is PRESERVED
 * on any failure (missing key, network error, empty result). A local build
 * without the key simply keeps the last-committed reviews — the build never
 * breaks and the page is never left without social proof.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/reviews.generated.json");

const PLACE_ID = process.env.GOOGLE_PLACE_ID || "ChIJmUrrWcZTKocRF_mUKWD84Sc";
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const MAX_REVIEWS = 5;
const MIN_RATING = 4; // only surface 4★ and 5★ reviews as social proof

/** Keep the committed snapshot and exit 0 — never fail the build over reviews. */
function keepSnapshot(reason) {
  const have = existsSync(OUT);
  console.warn(
    `[reviews] ${reason}; ${have ? "keeping committed snapshot" : "no snapshot to keep (skipping)"}`,
  );
  process.exit(0);
}

async function main() {
  if (!API_KEY) {
    keepSnapshot("GOOGLE_PLACES_API_KEY not set");
    return;
  }

  let data;
  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "id,rating,userRatingCount,googleMapsUri,reviews",
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Place Details HTTP ${res.status} ${body.slice(0, 200)}`);
    }
    data = await res.json();
  } catch (err) {
    keepSnapshot(`fetch failed (${err?.message})`);
    return;
  }

  if (!data || typeof data.rating !== "number") {
    keepSnapshot("response missing rating");
    return;
  }

  const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
    .map((rv) => ({
      author: rv.authorAttribution?.displayName || "Google user",
      rating: typeof rv.rating === "number" ? rv.rating : 5,
      relativeTime: rv.relativePublishTimeDescription || "",
      publishTime: rv.publishTime || "",
      text: (rv.text?.text || rv.originalText?.text || "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((rv) => rv.text && rv.rating >= MIN_RATING)
    .sort((a, b) => (b.publishTime || "").localeCompare(a.publishTime || ""))
    .slice(0, MAX_REVIEWS);

  const out = {
    generatedAt: new Date().toISOString(),
    placeId: data.id || PLACE_ID,
    rating: data.rating,
    userRatingCount: data.userRatingCount ?? 0,
    googleMapsUri:
      data.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
    reviews,
  };

  // Don't clobber a good snapshot with an empty review list (the API
  // occasionally returns rating but no review bodies).
  if (reviews.length === 0 && existsSync(OUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUT, "utf8"));
      if (Array.isArray(prev.reviews) && prev.reviews.length > 0) {
        out.reviews = prev.reviews;
        console.warn("[reviews] API returned no review bodies; reusing snapshot reviews");
      }
    } catch {
      /* ignore */
    }
  }

  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `[reviews] ${out.rating}★ from ${out.userRatingCount} ratings, ${out.reviews.length} reviews → reviews.generated.json`,
  );
}

main();
