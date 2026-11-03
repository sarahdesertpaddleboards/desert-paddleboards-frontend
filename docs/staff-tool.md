# Staff scheduling tool (`/staff`)

A ConnectTeam replacement for Sarah's crew: staff log in with a one-time email
link, see upcoming floats/events, apply to work them; Sarah confirms people,
locks in their pay, and marks them paid. Lives inside this repo so it can reuse
the public session calendar, but is fully separate from the marketing site.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | D1 schema, magic-link login, profile, admin roster + invites | **Live on the preview** (login email tested end to end, 3 Nov 2026) |
| 2 | Shifts: create from the calendar feed or by hand, apply, confirm with pay → confirmation email | **Live on the preview** (3 Nov 2026; confirmation email tested end to end) |
| 3 | Money: payroll (owed by person, mark paid + email, paid history, CSV), staff earnings | **Live on the preview** (3 Nov 2026; payment email tested end to end) |
| 3b | Roles + trailer add-on, calendar auto-posting with staffing templates, staff skills, assign someone new by email | **Live on the preview** (3 Nov 2026; sync posted 23 shifts; invite-by-assign email tested) |
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
  `invite.js`, `shifts.js` (Arizona times, pay parsing, event/application shapes),
  `pay.js` (payroll ledger query + rules), `roles.js` (roles, skills, per-role counts),
  `templates.js` (staffing templates + matching), `sync.js` (calendar auto-posting), `http.js`.
  The calendar session list comes from `src/lib/merge-sessions.ts`, the same pure function
  the public calendar uses (relative imports only, so the Functions bundler can load it). `_middleware.js` resolves the session for every route.
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

### API (phase 2: shifts)
| Method | Path | Who |
|---|---|---|
| GET | `/staff-api/shifts` (open shifts + my applications, past included) | logged in |
| POST | `/staff-api/shifts/:id/apply` `{note?}` (needs a complete profile) | logged in |
| POST | `/staff-api/shifts/:id/withdraw` (only before confirmation) | logged in |
| GET / POST | `/staff-api/admin/events?scope=upcoming\|past` / post a shift | admin |
| GET / PATCH / DELETE | `/staff-api/admin/events/:id` (delete only with nobody applied/confirmed) | admin |
| POST | `/staff-api/admin/events/:id/confirm` `{staffId, pay}` (locks pay, emails confirmation) | admin |
| POST | `/staff-api/admin/events/:id/decline` `{staffId}` (decline or remove; no email) | admin |

UI: staff home `/staff`; admin `/staff/admin/shifts` (Schedule), `/staff/admin/shifts/new`
(post, with a picker of the next 60 days of public-calendar sessions not yet posted),
`/staff/admin/shift?id=…` (detail). The detail page uses a query string because Pages
only serves pre-rendered paths; a `/shifts/:id` URL would 404 on a fresh load.

### API (phase 3: money)
| Method | Path | Who |
|---|---|---|
| GET | `/staff-api/admin/pay?year=2026` (owed, upcoming total, paid in that year) | admin |
| POST | `/staff-api/admin/pay/mark-paid` `{applicationIds, note?, notify?}` (one email per person) | admin |
| POST | `/staff-api/admin/pay/undo` `{applicationId}` | admin |

Staff earnings come from `GET /staff-api/shifts` (`mine` already carries pay and paid status).
UI: admin `/staff/admin/payroll` (To pay / Paid tabs); staff `/staff/earnings` plus a
"Your pay" card on `/staff`; "Mark paid" / "Undo" on a past shift's page.

### Phase 3 rules
- Owed = confirmed, not marked paid, shift not cancelled, shift has started.
  "Coming up" = the same for shifts still ahead. Cancelled shifts never show as owed.
- Marking paid is bookkeeping only: Sarah sends the money by Venmo/Zelle/etc. first.
  The note (e.g. "Venmo Nov 9") is shown to the staff member.
- "Email them" (on by default) sends one "Your pay is on its way" email per person,
  listing the shifts and total. Undo clears the paid mark but can't unsend the email.
- A paid person can't be removed from a shift (undo the payment first).
- Years are Arizona time. The Paid tab's per-person totals and CSV are for tax time.

### API (phase 3b: roles, templates, auto-posting)
| Method | Path | Who |
|---|---|---|
| POST | `/staff-api/shifts/:id/apply` `{role, trailer?, note?}` | logged in |
| POST | `/staff-api/admin/events/:id/confirm` `{staffId \| email (+name), role, pay, trailer?, trailerPay?}` | admin |
| GET / POST | `/staff-api/admin/sync` (last sync / sync now) | admin |
| GET / POST | `/staff-api/admin/templates` | admin |
| PATCH / DELETE | `/staff-api/admin/templates/:id` (default can't be deleted) | admin |

Shifts carry `roles: [{role, needed, confirmed, applied, payCents(admin only)}]`, `trailerNeeded`,
`trailerConfirmed`, `trailerOpen`, `autoPosted`, `offCalendar`. Create/PATCH take `roles` +
`trailerNeeded`/`trailerPay` (`staffNeeded`/`defaultPay` still accepted on create → general staff).
UI: `/staff/admin/templates`; Schedule shows the sync bar and "Sync now".

### Roles and trailer
- Roles: event team leader, teacher (yoga/pilates/aerobics), artist (sound bowls/music),
  general staff. Each shift needs N per role with its own usual pay (pre-fills confirm; staff
  never see it). `events.staff_needed` = sum of roles.
- Trailer driver is an **add-on** to one person's role (the driver always works the event too),
  with extra pay. Locked `pay_cents` = role pay + trailer pay; `trailer_pay_cents` is the part.
- Staff tick skills on their profile (the 4 roles + trailer). Matching open roles are
  highlighted and pre-selected when applying; Sarah sees skills on People and in "Add someone".
- One person, one role per shift.

### Calendar auto-posting
- Every public-calendar session (same list as the public calendar) in the next **90 days**
  becomes an open shift, staffed by the first staffing template whose keyword is in the title
  (else the default). Seeded templates: soundbath → lead + artist + general + trailer;
  yoga/pilates/aerobics/fitness → lead + teacher + trailer; default → lead + general + trailer.
  Pay is blank until Sarah fills it in on the templates.
- Runs lazily (Pages has no cron): in the background at most every 30 min when anyone opens
  the staff area or the Schedule, or on demand ("Sync now"). Keys: `fh:<availability pk>`,
  `fhx:<item>:<start>`, `city:<slug>:<start>` in `events.calendar_key` (unique).
- FareHarbor slot moved → shift times follow, unless Sarah edited the times by hand
  (`times_edited`). Deleted calendar shifts go in `calendar_dismissed` and aren't re-posted.
  A session that leaves the calendar flags the shift "Off the calendar" (never auto-cancelled,
  because the FareHarbor feed occasionally drops items).
- Post a shift is now for private / off-calendar events; it also lists calendar sessions with
  no shift (beyond 90 days, dismissed, or skipped by a template).

### Assigning people who haven't applied
- "Add someone directly" on a shift: anyone on the roster, or **someone new by email**. A new
  person is added to the roster and confirmed, and gets one email ("You're on the team") with
  the shift details and a 14-day invite link. Anyone still "invited" (never logged in) gets
  that same combined email instead of the plain confirmation. Confirmation emails say who
  confirmed them (Sarah or Shellie), from Sarah's address.
- Make Shellie an admin on People ("Make admin").

### Phase 2 rules (assumptions until Sarah says otherwise)
- One locked pay per person per shift (role pay + any trailer pay). Usual pay per role
  pre-fills the confirm box and is never shown to staff.
- Pay is locked once confirmed. To change it, remove the person and confirm again
  (sends a fresh email).
- Staff see "x of y spots open", never other applicants' names. Full shifts can't be
  applied for. A declined person can't re-apply; Sarah can still confirm them.
- Confirmed staff can't withdraw in the app; they reply to the email or text Sarah.
- No emails for applications, declines, removals, cancellations or time changes yet
  (phase 4 candidates). Cancelling warns Sarah to tell confirmed people herself.
- Posting dedupes by FareHarbor availability pk, else by title + start time.

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
2. ✅ Schema applied: `0001` to both; `0002` (roles/templates/auto-post) to **preview only** so
   far. Apply it to production before merging. For new migrations:
   ```bash
   pnpm cf d1 migrations apply dpb-staff-preview --remote --env preview
   pnpm cf d1 migrations apply dpb-staff --remote      # before merging to main
   ```
3. ✅ Preview secrets set (3 Nov 2026). Production still needs them (`--env production`)
   before merging to `main`:
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
4. ✅ Push `staff` → Actions deploys the preview to `https://staff.desert-paddleboards.pages.dev`.

Do **not** merge `staff` into `main` until the production secrets are set with
`--env production` (the production database and schema already exist).

Resend: desertpaddleboards.com is verified and sends from sarah@. Test emails land in
Gmail's Primary inbox. The admin roster page is `/staff/admin/people`.

## Data notes
- Payout details are a method (Venmo / Zelle / Cash App / PayPal / check / other)
  plus a free-text handle. The UI tells people never to enter bank or card numbers.
- Times for events keep the Arizona offset (`-07:00`, no DST), matching the
  public calendar.
- Deactivating someone deletes their sessions immediately; their history stays.
