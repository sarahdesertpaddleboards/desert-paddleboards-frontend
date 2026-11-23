/**
 * dpb-staff-cron — every 30 minutes, ask each staff site to send its due
 * day-before reminders (POST /staff-api/cron/reminders).
 *
 * No shared secret to manage: this Worker is bound to the same D1 database as
 * the site, so it writes a fresh random token to staff_settings "cron_token"
 * and sends that. The site accepts a token only if it matches and is under 10
 * minutes old.
 *
 * Reminder emails link to whichever address is called, so this calls the
 * main domain.
 */
const SITES = [
  // The old preview copy (staff.desert-paddleboards.pages.dev, dpb-staff-preview)
  // was retired at go-live, 23 Nov 2026; nudging it would double-send.
  { name: "production", db: "PROD_DB", url: "https://desertpaddleboards.com" },
];

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function nudge(site, env) {
  const db = env[site.db];
  const token = randomToken();
  await db
    .prepare(
      `INSERT INTO staff_settings (key, value, updated_at) VALUES ('cron_token', ?1, ?2)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(token, new Date().toISOString())
    .run();
  const res = await fetch(`${site.url}/staff-api/cron/reminders`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  return `${res.status} ${(await res.text()).slice(0, 300)}`;
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      Promise.all(
        SITES.map(async (site) => {
          try {
            console.log(site.name, await nudge(site, env));
          } catch (err) {
            // Production has no staff tables until go-live; that's expected.
            console.log(site.name, "skipped:", String(err?.message || err));
          }
        }),
      ),
    );
  },
};
