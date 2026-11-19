/**
 * /go/* — short-link redirects. Cloudflare Pages Function.
 *
 * Catch-all route: every request under /go/ lands here, known slug or not.
 * The slug → destination map lives in config/short-links.json (single source
 * of truth); config/short-links.js does the resolving.
 *
 * Contract:
 *  - 302, never 301. Destinations change as pages change, and a 301 gets
 *    pinned in browser caches essentially forever.
 *  - `Cache-Control: no-store` so neither the browser nor Cloudflare's edge
 *    holds onto the mapping either.
 *  - The incoming query string is merged onto the destination, so UTMs on the
 *    inbound link survive the hop.
 *  - Unknown slugs redirect to the homepage instead of 404ing — these links
 *    are printed on flyers and pasted into Instagram bios where a dead link
 *    is worse than a wrong one.
 *
 * The Location header is left site-relative on purpose: the same code works on
 * desert-paddleboards.pages.dev and desertpaddleboards.com without knowing
 * which host it's serving (the DNS cutover is still pending).
 */
import { resolveShortLink } from "../../config/short-links.js";

export function onRequest({ request }) {
  const url = new URL(request.url);
  // "/go/Rentals/" -> "Rentals/" ; the resolver handles casing and slashes.
  const slug = url.pathname.replace(/^\/go\/?/i, "");

  return new Response(null, {
    status: 302,
    headers: {
      Location: resolveShortLink(slug, url.search),
      "Cache-Control": "no-store",
    },
  });
}
