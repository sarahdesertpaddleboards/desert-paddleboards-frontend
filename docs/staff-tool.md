# Staff scheduling tool (`/staff`)

A ConnectTeam replacement for Sarah's crew: staff log in with a one-time email
link, see upcoming floats/events, apply to work them; Sarah confirms people,
locks in their pay, and marks them paid. Lives inside this repo so it can reuse
the public session calendar, but is fully separate from the marketing site.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | D1 schema, magic-link login, profile, admin roster + invites | **Built, tested locally** |
| 2 | Shifts: create from the calendar feed or by hand, apply, confirm with pay → confirmation email | todo |
| 3 | Money: earnings view for staff, "mark paid", owed/paid ledger, past events | todo |
| 4 | Reminders the day before, calendar (.ics) attachments, remove the dead `/admin` pages, archive the old backend repo | todo |

## Architecture

- **UI:** `src/staff/` — own shell (`StaffLayout.tsx`, not the marketing `<Layout>`),
  pages in `src/staff/pages/`, API client in `src/staff/api.ts`, session state in
  `StaffContext.tsx`. Routes are mounted at `/staff/*` in `src/App.tsx`.
  Pages are pre-rendered only as empty "Loading…" shells (everything renders
  after mount), carry `noindex`, are excluded from the sitemap and blocked in
  `robots.txt`. Nothing links to them from the public site.
- **API:** Cloudflare Pages Functions in `functions/staff-api/` (same origin, so
  the HttpOnly session cookie needs no CORS). Shared logic in `server/staff/`:
  `auth.js` (tokens, sessions, guards), `email.js` (Resend + templates),
  `invite.js`, `http.js`. `_middleware.js` resolves the session for every route.
- **Database:** Cloudflare **D1** (SQLite), binding `STAFF_DB`. Schema in
  `migrations/` (`wrangler d1 migrations`). Tables: `staff`, `login_tokens`,
  `sessions`, `events`, `applications`, `email_log`.
- **Email:** Resend REST API, from `STAFF_EMAIL_FROM` (Sarah's address), with
  `reply_to` Sarah. Every send is logged to `email_log`.

### Auth model
- No passwords. `POST /staff-api/auth/request-link` emails a 20-minute, single-use
  link (`/staff/verify?token=…`). The verify page POSTs the token (so link-scanning
  mail filters can't consume it) and receives a 90-day HttpOnly cookie.
- Only people already on the roster get a link; unknown emails get a silent OK.
  Max 5 links per person per hour.
- Tokens and cookie secrets are stored **hashed** (SHA-256).
- Invites are the same mechanism with a 14-day token. Admins invite from
  `/staff/admin/people`.
- `STAFF_BOOTSTRAP_ADMIN_EMAILS` (comma list) lets the first admins create
  themselves by simply requesting a login link. Set it to Sarah's and Nick's
  emails in each environment, then it can stay (it only matters when the email
  isn't on the roster yet).

### API (phase 1)
| Method | Path | Who |
|---|---|---|
| POST | `/staff-api/auth/request-link` `{email}` | anyone |
| POST | `/staff-api/auth/verify` `{token}` | anyone |
| POST | `/staff-api/auth/logout` | logged in |
| GET / PATCH | `/staff-api/me` | logged in |
| GET / POST | `/staff-api/admin/staff` (list / invite) | admin |
| PATCH | `/staff-api/admin/staff/:id` (name, phone, payout, notes, role, status) | admin |
| POST | `/staff-api/admin/staff/:id/resend-invite` | admin |

## Local development

```bash
cp .dev.vars.example .dev.vars        # then put your email in STAFF_BOOTSTRAP_ADMIN_EMAILS
pnpm staff:db:local                   # apply migrations to the local SQLite D1
pnpm staff:api                        # wrangler pages dev → http://localhost:8788 (functions + local D1)
VITE_API_BASE_URL=/ pnpm dev          # Vite on :5173, proxies /staff-api → :8788
```

Open http://localhost:5173/staff/login. With `STAFF_ENV=local` and no
`RESEND_API_KEY`, the login/invite link is shown on screen instead of emailed
(also printed in the wrangler terminal). Never set `STAFF_ENV=local` in Cloudflare.

Reset the local database: delete `.wrangler/state/v3/d1` and re-run `pnpm staff:db:local`.

## Environments and deploy

The `staff` branch deploys as a **Pages preview** (GitHub Actions, see
`.github/workflows/deploy.yml`) at `https://staff.desert-paddleboards.pages.dev`,
using the `[env.preview]` section of `wrangler.toml`. `main` is production.

Setup in the Desert Paddleboards Cloudflare account (admin@desertpaddleboards.com).
Run wrangler against that account with `pnpm cf …` (a separate login stored in the
gitignored `.wrangler/dpb-config`; `pnpm cf login --browser=false` to sign in again
and paste the link into a browser signed in to that account).

1. ✅ Databases created (3 Nov 2026), ids in `wrangler.toml`:
   `dpb-staff` (production, WNAM) and `dpb-staff-preview` (WEUR).
2. ✅ Schema applied to both. For new migrations:
   ```bash
   pnpm cf d1 migrations apply dpb-staff-preview --remote --env preview
   pnpm cf d1 migrations apply dpb-staff --remote      # before merging to main
   ```
3. Secrets, per environment (`--env preview`, later `--env production`):
   ```bash
   pnpm cf pages secret put STAFF_BOOTSTRAP_ADMIN_EMAILS --project-name desert-paddleboards --env preview
   pnpm cf pages secret put RESEND_API_KEY --project-name desert-paddleboards --env preview
   ```
   - `STAFF_BOOTSTRAP_ADMIN_EMAILS` — `sarah@desertpaddleboards.com,<nick's email>`
   - `RESEND_API_KEY` — from resend.com, with `desertpaddleboards.com` verified there
     (Resend's DNS records sit on the `send.` subdomain and `resend._domainkey`, so
     they don't touch Google Workspace mail).
   - `STAFF_EMAIL_FROM` / `STAFF_EMAIL_REPLY_TO` come from `wrangler.toml` `[vars]`.
   Secrets apply to the *next* deployment: re-run the deploy workflow on `staff`
   (Actions → Deploy to Cloudflare Pages → Run workflow → branch `staff`).
4. Push `staff` → Actions deploys the preview to `https://staff.desert-paddleboards.pages.dev`.

Do **not** merge `staff` into `main` until the production `dpb-staff` database
exists, its id is in `wrangler.toml`, and migrations have been applied —
otherwise the production deploy breaks.

## Data notes
- Payout details are a method (Venmo / Zelle / Cash App / PayPal / check / other)
  plus a free-text handle. The UI tells people never to enter bank or card numbers.
- Times for events keep the Arizona offset (`-07:00`, no DST), matching the
  public calendar.
- Deactivating someone deletes their sessions immediately; their history stays.
