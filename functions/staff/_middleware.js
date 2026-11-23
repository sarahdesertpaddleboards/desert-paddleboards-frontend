/**
 * The staff tool moved to desertpaddleboards.com/staff on 23 Nov 2026. The old
 * preview address (staff.desert-paddleboards.pages.dev) now sends people there,
 * keeping the path and query so sign-in links already emailed still work.
 * Other preview URLs (per-deploy hashes) are left alone for testing.
 */
const OLD_HOST = "staff.desert-paddleboards.pages.dev";
const LIVE = "https://desertpaddleboards.com";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === OLD_HOST) return Response.redirect(`${LIVE}${url.pathname}${url.search}`, 302);
  return context.next();
}
