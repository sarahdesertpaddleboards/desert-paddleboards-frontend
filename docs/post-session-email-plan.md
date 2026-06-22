# Post-session follow-up — plan (photos · reviews · referral · rebook)

Goal: after each session, every guest gets one polished email with the photo
album, a review request, a "bring a friend" referral offer, and a "book your
next float" button — with the least possible ongoing work for Sarah/Shellie,
and so we can measure what it drives.

## The one hard constraint

Only the **Google Photos album link is unique per session** — someone has to
create the album and paste that link in. *Everything else is evergreen* and can
be templated or fully automated. So the design splits the email into:

| Block | Type | Can be automated? |
|---|---|---|
| 📷 Photo album link | per-session | No — needs the album made + link pasted |
| ⭐ Leave a Google review | evergreen | Yes |
| 🎁 Refer a friend (discount code) | evergreen | Yes |
| 🔁 Book your next session | evergreen | Yes |

## Step 0 — find out what already exists (do this first)

We may be part-way there already.

- **FareHarbor → Settings → Automated emails:** is a post-experience email
  already firing? If so, what's in it and how long after the session? FareHarbor
  knows every guest's email, so this is the natural home for the *evergreen*
  block.
- **Flodesk → Workflows:** is there an automation running today, and is anything
  feeding contacts into Flodesk (FareHarbor directly, or via Zapier)? If Flodesk
  is already sending the post-session note, we extend that instead of building
  new.
- **Google Workspace:** sending from `sarah@desertpaddleboards.com` plus Gmail
  templates ("canned responses") and multi-send (mail merge) covers the
  photo email nicely without any new tool.

## Recommended approach

**Phase 1 — make the email Sarah already sends do more (fast, no new tools).**
Build one reusable template (Gmail canned response) containing all four blocks.
Sarah's only per-session step is pasting the album link, then multi-sending to
that session's guests. Matches her current habit.

**Phase 2 — automate the evergreen half.** Whichever of FareHarbor / Flodesk is
best placed sends the review + referral + rebook automatically a day after each
session. Sarah is then left sending *only* the photos. (City-class guests book
through the city sites, so they aren't in FareHarbor — they'd still get the
manual template, or get added to Flodesk.)

## The pieces (reusable, build once)

**Google review link** (one click straight to the review box):
`https://search.google.com/local/writereview?placeid=ChIJmUrrWcZTKocRF_mUKWD84Sc`

**Referral offer + discount:** create a promo code in **FareHarbor → Discounts**
(e.g. `FRIEND15` = $15 off). The email says "share this code — your friend gets
$15 off and so do you." FareHarbor reports redemptions, so the referral program
is measurable and the discount is real.

**Rebook button:** link to the site calendar (`/calendar`) or straight to a
FareHarbor item.

## Tracking what the email drives (UTM tags)

Add UTM tags to the links so Google Analytics attributes the clicks/bookings to
the email (vs Instagram, search, etc.). Format:

```
https://desertpaddleboards.com/calendar?utm_source=post-session&utm_medium=email&utm_campaign=rebook
```

Suggested tags for each button:

| Button | utm_source | utm_medium | utm_campaign |
|---|---|---|---|
| Book next session | post-session | email | rebook |
| Leave a review | post-session | email | review |
| Refer a friend | post-session | email | referral |

In GA4 these show under **Acquisition → Traffic acquisition** and as the
`book_click` event, so we can see, e.g., "8 bookings came from the post-session
email this month."

## Open decisions for Nick / Sarah

1. Phase 1 template now, or wait to see what FareHarbor/Flodesk already do?
2. Referral discount amount + whether both parties get it (recommended: yes).
3. Should city-class guests be collected into Flodesk so they get the evergreen
   emails too?
