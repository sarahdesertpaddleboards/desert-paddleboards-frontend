/**
 * Short-link resolver for /go/* — pure logic, no runtime dependencies.
 *
 * The map in short-links.json is the SINGLE SOURCE OF TRUTH: slug →
 * destination path with its UTM query string. It is consumed by
 * functions/go/[[slug]].js (the Cloudflare Pages Function that actually
 * serves the redirect) and by short-links.test.js.
 *
 * Editing a destination is a one-line change here + a push to main. Because
 * the redirects are 302 (never 301) and sent with `Cache-Control: no-store`,
 * a changed destination takes effect on the next click — no browser has the
 * old target pinned. That's the whole point: these links live in Instagram
 * bios and printed QR codes we can't reissue.
 *
 * Destinations may be site-relative ("/shop?...") or absolute
 * ("https://fareharbor.com/..."); both are merged the same way. Only this
 * repo's config feeds the table, so there's no open-redirect surface —
 * arbitrary user input can never become a destination.
 */
import shortLinks from "./short-links.json";

/** Where unknown slugs land. A wrong page beats a 404 in a bio link. */
export const FALLBACK_DESTINATION = "/";

/**
 * Normalize a slug for lookup: decoded, unwrapped from slashes, lowercased.
 * Matching is case-insensitive so /go/Book, /go/BOOK and /go/book all work —
 * people retype these off flyers and stories.
 */
export function normalizeSlug(raw) {
  let slug = String(raw ?? "");
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* malformed % escape — fall through with the raw text, it just won't match */
  }
  return slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

/** Lookup table, built once, keyed by normalized slug. */
const TABLE = new Map(
  Object.entries(shortLinks).map(([slug, destination]) => [
    normalizeSlug(slug),
    destination,
  ]),
);

/** Every slug in the map, normalized. Used by the tests. */
export function shortLinkSlugs() {
  return [...TABLE.keys()];
}

/**
 * Merge an incoming query string onto a destination that already carries its
 * own UTMs.
 *
 * Params the visitor arrived with WIN over the mapped defaults: a link tagged
 * for a specific ad or partner is more specific than the bio-link default, so
 * /go/shop?utm_source=newsletter attributes to the newsletter. Every other
 * mapped param (and any extra the visitor brought, e.g. fbclid) is kept.
 */
function mergeQuery(destination, incomingQuery) {
  const hashAt = destination.indexOf("#");
  const hash = hashAt === -1 ? "" : destination.slice(hashAt);
  const base = hashAt === -1 ? destination : destination.slice(0, hashAt);

  const queryAt = base.indexOf("?");
  const path = queryAt === -1 ? base : base.slice(0, queryAt);
  const params = new URLSearchParams(queryAt === -1 ? "" : base.slice(queryAt));

  // URLSearchParams strips a single leading "?" for us.
  const incoming = new URLSearchParams(incomingQuery ?? "");
  for (const key of new Set(incoming.keys())) {
    params.delete(key);
    for (const value of incoming.getAll(key)) params.append(key, value);
  }

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash}`;
}

/**
 * Resolve a /go/* slug to the path we should redirect to.
 *
 * @param {string} slug          raw slug from the URL (any casing)
 * @param {string} incomingQuery the request's query string, with or without "?"
 * @returns {string} destination with the mapped UTMs + the incoming query
 */
export function resolveShortLink(slug, incomingQuery = "") {
  const destination = TABLE.get(normalizeSlug(slug)) ?? FALLBACK_DESTINATION;
  return mergeQuery(destination, incomingQuery);
}
