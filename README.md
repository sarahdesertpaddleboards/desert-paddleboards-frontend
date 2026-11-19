# Desert Paddleboards website

Marketing and booking site for Desert Paddleboards (floating sound baths,
water-fitness classes, paddleboard rentals and events in Arizona). Bookings
happen on FareHarbor; merch checkout on Stripe.

React 19 + TypeScript, pre-rendered to static HTML with `vite-react-ssg`,
hosted on Cloudflare Pages. See [CLAUDE.md](CLAUDE.md) for the full stack,
project layout and conventions.

```bash
pnpm install
VITE_API_BASE_URL=/ pnpm dev     # http://localhost:5173
VITE_API_BASE_URL=/ pnpm build   # what CI runs
```

Pushing to `main` deploys (GitHub Actions → Cloudflare Pages).

## Outbound FareHarbor links and UTM tags

Every link from this site to fareharbor.com (Book buttons, the gift
certificate links, FareHarbor links inside blog and venue markdown) gets UTM
parameters from one shared helper, `fareHarborUrl()` in
[`src/lib/utm.ts`](src/lib/utm.ts). FareHarbor's GA4 integration reads these on
the booking page, so bookings can be traced back to the page and button they
started from.

| Parameter      | Value                                     | Example                                   |
| -------------- | ----------------------------------------- | ----------------------------------------- |
| `utm_source`   | always `desertpaddleboards.com`           | `desertpaddleboards.com`                  |
| `utm_medium`   | always `website`                          | `website`                                 |
| `utm_campaign` | the page the link is on (path, `/` → `_`) | `calendar`, `locations_floating-soundbath-kino-aquatics-mesa`, `home` |
| `utm_content`  | which link on the page                    | `book_button`, `calendar`, `finder`, `session_list`, `featured_event`, `top_banner`, `gift_section`, `buy_button`, `content_link` |

**Visitors who arrive with their own UTMs keep them.** If someone lands from a
tagged Instagram ad or email (`?utm_source=instagram&…`), `persistUtms()` stores
those tags for the session and `forwardVisitorUtms()` swaps them onto the
FareHarbor link when it's clicked, replacing the site defaults. The booking is
then credited to the ad, not to the website. The swap happens at click time
(not render) so the pre-rendered HTML stays identical between build and
browser.

### Adding a new FareHarbor link

- **Booking an item:** use `<FareHarborButton itemId={…} />`. It tags the link
  automatically. Pass `placement="…"` when a page has more than one kind of
  booking link and you want to tell them apart.
- **Any other FareHarbor URL:** wrap it:

  ```tsx
  import { fareHarborUrl } from "@/lib/utm";

  <a href={fareHarborUrl(url, { page: pathname, placement: "my_button" })}>…</a>
  ```

  `page` is usually `useLocation().pathname`. Keep `placement` short and
  snake_case.
- **Markdown content:** FareHarbor links in blog posts and venue copy are
  tagged automatically (`markdownUrlTransform()` is passed to `ReactMarkdown`
  on those pages). Use it on any new page that renders markdown with booking
  links.

Never paste a hand-tagged or untagged fareharbor.com link straight into JSX.

Two deliberate exceptions:
- **Event JSON-LD `offers.url`** stays untagged. Those clicks come from Google's
  event listings, not from our pages, so the site defaults would misattribute
  them.
- **The admin-only FareHarbor dashboard link** isn't a booking link.

For links *to* this site (social posts, email, QR codes), use
`node scripts/utm.mjs` instead. That's a separate tool.
