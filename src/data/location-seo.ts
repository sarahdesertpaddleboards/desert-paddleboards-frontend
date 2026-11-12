/**
 * Location-page SEO — the page <title>, H1, meta description and a short,
 * unique intro for every /locations/[slug] page.
 *
 * Keyed by the page slug (FareHarbor venues in locations.ts AND city classes in
 * city-classes.json). Kept in code rather than the CMS JSON because Pages CMS
 * drops fields it doesn't know about.
 *
 * A venue with no entry here (e.g. a new FareHarbor venue that auto-surfaced)
 * still gets a unique "Floating Sound Bath at [Venue], [City]" title + H1 from
 * the template in `locationSeoFor` — add an entry when you write its copy.
 *
 * Rules of thumb: "floating sound bath" (two words) leads; titles ≤ ~60 chars
 * (the " | Desert Paddleboards" suffix is added only when it fits);
 * descriptions ~120–160 chars, naming the venue, the city and one real detail.
 * No emojis. Non-sound-bath pages keep their own keywords.
 */
import { experiences } from "./locations";
import { cityClasses } from "./city-classes";

export interface LocationSeo {
  /** Title WITHOUT the brand suffix — `seoTitle()` adds it when it fits. */
  title: string;
  h1: string;
  description: string;
  /** 2–3 sentences of unique copy shown at the top of the page. */
  intro?: string;
}

const BRAND_SUFFIX = " | Desert Paddleboards";
const MAX_TITLE = 60;

/** Append " | Desert Paddleboards" only when the full title stays ≤ 60 chars. */
export function seoTitle(title: string): string {
  return title.length + BRAND_SUFFIX.length <= MAX_TITLE ? `${title}${BRAND_SUFFIX}` : title;
}

export const LOCATION_SEO: Record<string, LocationSeo> = {
  // --- Phoenix -------------------------------------------------------------
  "floating-soundbath-jw-marriott-desert-ridge-phoenix": {
    title: "Floating Sound Bath at JW Marriott Desert Ridge, Phoenix",
    h1: "Resort Floating Sound Bath at JW Marriott Desert Ridge",
    description:
      "Floating sound bath at the Revive Spa pool, JW Marriott Desert Ridge in Phoenix, with live Native American flute and sound healing. Our most popular class.",
    intro:
      "Our most popular floating sound bath happens at the Revive Spa pool at JW Marriott Desert Ridge in north Phoenix, and it sells out often, so plan ahead. Award-winning Native American flutist Cody Blackbird joins a sound bath practitioner while you float, tucked under a blanket. Spa lovers, couples and anyone overdue for a serious reset: this is your spot.",
  },
  "resort-floating-soundbath-arizona-grand-phoenix": {
    title: "Resort Floating Sound Bath at Arizona Grand, Phoenix",
    h1: "Resort Floating Sound Bath at Arizona Grand Resort",
    description:
      "Resort floating sound bath at Arizona Grand Resort in Phoenix, beside South Mountain. Float on the water as live sound bath musicians play into the evening.",
    intro:
      "Arizona Grand Resort sits at the edge of South Mountain in Phoenix, which makes it a pretty dreamy place to lie on your back and do absolutely nothing. You'll settle onto a floating water bed (okay, it's a paddleboard, but we're sticking with water bed) while live musicians fill the pool with sound. Great for resort guests, staycationers and locals who need a night off from adulting.",
  },
  "hilton-phoenix-resort-at-the-peak-phoenix": {
    title: "Floating Sound Bath at Hilton at the Peak, Phoenix",
    h1: "Resort Floating Sound Bath at Hilton Phoenix Resort at the Peak",
    description:
      "Resort floating sound bath at Hilton Phoenix Resort at the Peak, at the foot of Piestewa Peak in Phoenix. Float on the water with live sound healing.",
    intro:
      "Hilton Phoenix Resort at the Peak sits at the foot of Piestewa Peak, so you get mountain views without the hike. Float in the resort pool on a floating water bed while live musicians play. A good one for central Phoenix locals, resort guests and anyone who'd rather look at a mountain than climb it.",
  },

  // --- Scottsdale ----------------------------------------------------------
  "floating-soundbath-at-westin-kierland-resort-spa-scottsdale": {
    title: "Floating Sound Bath at Westin Kierland Resort, Scottsdale",
    h1: "Resort Floating Sound Bath at Westin Kierland Resort & Spa",
    description:
      "Floating sound bath at Westin Kierland Resort & Spa in north Scottsdale. Float in the resort pool while live sound bath musicians play. Open to everyone.",
    intro:
      "Westin Kierland is a north Scottsdale favorite, right by Kierland Commons, and its resort pool is a gorgeous place to float while live musicians play. You don't need to be a hotel guest: anyone can book. It's made for resort guests, girls' nights and couples who want a fancy evening that doesn't involve heels.",
  },
  "floating-soundbath-grand-hyatt-scottsdale": {
    title: "Floating Sound Bath at Grand Hyatt Scottsdale",
    h1: "Resort Floating Sound Bath at Grand Hyatt Scottsdale",
    description:
      "Floating sound bath in the adults-only pool at Grand Hyatt Scottsdale, with live Native American flute played from the tiered waterfall. Stay for dinner after.",
    intro:
      "Grand Hyatt Scottsdale's newly renovated adults-only pool comes with palm trees, a tiered waterfall and, for one evening, a live Native American flutist playing from it. Float through the sunset, then stay for cocktails or dinner on property. Date night, girls' night or a very smug staycation: all covered.",
  },
  "floating-soundbath-hotel-adeline-scottsdale": {
    title: "Floating Sound Bath at Hotel Adeline, Scottsdale",
    h1: "Floating Sound Bath at Hotel Adeline",
    description:
      "Floating sound bath at Hotel Adeline in Scottsdale. Swap the pool-party scene for a floating nap with live sound bath musicians, then stay for a cocktail.",
    intro:
      "Hotel Adeline is better known for pool parties than deep breathing, which is exactly why we love it. For one evening its signature pool becomes a floating sound bath, a short hop from Old Town Scottsdale, so you can float first and grab a cocktail at the hotel bar after. Made for girls' nights, staycations and couples who like a little fun with their calm.",
  },
  "hotel-solaya-floating-soundbath-scottsdale": {
    title: "Floating Sound Bath at Hotel Solaya, Scottsdale",
    h1: "Floating Sound Bath at Hotel Solaya",
    description:
      "Floating sound bath at Hotel Solaya in Scottsdale, close to Old Town. Drift in the hotel pool as live sound bath musicians carry you into deep rest.",
    intro:
      "Hotel Solaya is a stylish stay a few minutes from Old Town Scottsdale, and its pool is a lovely, low-key setting for a floating sound bath. Float, breathe and let the live sound do its thing, then wander into Old Town for dinner. A great pick for couples, girls' nights and Scottsdale visitors.",
  },
  "floating-sound-bath-spa-camelback-inn-scottsdale": {
    title: "Floating Sound Bath at The Spa at Camelback Inn, Scottsdale",
    h1: "Resort Floating Sound Bath at The Spa at Camelback Inn",
    description:
      "Floating sound bath at The Spa at Camelback Inn in Scottsdale. Float in the spa pool under Camelback Mountain while live sound bath musicians play.",
    intro:
      "The Spa at Camelback Inn is one of Scottsdale's classic resort spas, tucked right in the heart of town with Camelback Mountain looking on. Float in the spa pool on a floating water bed (okay, it's a paddleboard, but we're sticking with water bed) while live musicians fill the evening with sound healing. Made for spa lovers, couples and anyone who'd like a resort night without booking a room.",
  },
  "hilton-villas-scottsdale-floating-sound-bath-scottsdale": {
    title: "Floating Sound Bath at Hilton Scottsdale Resort & Villas",
    h1: "Resort Floating Sound Bath at Hilton Scottsdale Resort & Villas",
    description:
      "Resort floating sound bath at Hilton Scottsdale Resort & Villas on Scottsdale Road. Float in the resort pool while live sound bath musicians play.",
    intro:
      "Hilton Scottsdale Resort & Villas sits right on Scottsdale Road, a quick hop from Old Town, with a resort pool made for floating. You'll drift on the water while live sound healing fills the evening. Great for resort guests, Scottsdale staycations and friends who need a calmer kind of night out.",
  },

  // --- Tempe ---------------------------------------------------------------
  "rooftop-floating-soundbath-skysill-westin-tempe": {
    title: "Rooftop Floating Sound Bath at The Westin Tempe",
    h1: "Rooftop Floating Sound Bath at Skysill, The Westin Tempe",
    description:
      "Rooftop floating sound bath at Skysill Rooftop Lounge, 18 stories up at The Westin Tempe. Float with 360° Valley views while live sound bath music plays.",
    intro:
      "Skysill sits 18 stories above Tempe on top of The Westin, with views that run from Downtown Phoenix to Camelback Mountain. You float in the rooftop pool as the city lights come on, while a Native American flutist and a sound bath practitioner play. Meditation with a view, and a seriously good date night.",
  },
  "floating-soundbath-canopy-hilton-tempe": {
    title: "Rooftop Floating Sound Bath at Canopy by Hilton, Tempe",
    h1: "Rooftop Floating Sound Bath at Canopy by Hilton Tempe",
    description:
      "Rooftop floating sound bath at Canopy by Hilton in downtown Tempe. Float in the rooftop pool with city views while live musicians play a sound bath.",
    intro:
      "This one's a rooftop pool above downtown Tempe, so you get city lights, a warm Arizona evening and live sound healing without ever leaving your floating water bed. It's an easy pick for date nights, girls' nights and locals who want a night out that ends calmer than it started.",
  },
  "rooftop-floating-soundbath-omni-tempe": {
    title: "Rooftop Floating Sound Bath at Omni Tempe Hotel",
    h1: "Rooftop Floating Sound Bath at Omni Tempe Hotel",
    description:
      "Rooftop floating sound bath at Omni Tempe Hotel at ASU. Float above downtown Tempe with skyline and mountain views while live sound bath musicians play.",
    intro:
      "The rooftop pool at Omni Tempe Hotel at ASU serves up skyline, campus and mountain views from your floating water bed. Downtown Tempe's restaurants and nightlife are steps away, so it's easy to turn into a full night out with friends or a date.",
  },
  "indoor-floating-soundbath-kiwanis-tempe": {
    title: "Indoor Floating Sound Bath at Kiwanis Rec Center, Tempe",
    h1: "Indoor Floating Sound Bath at Kiwanis Recreation Center",
    description:
      "Indoor floating sound bath at Kiwanis Recreation Center in Tempe. Float on the indoor wave pool in climate-controlled comfort with live sound healing.",
    intro:
      "When it's too hot, too cold or too windy outside, Kiwanis in Tempe has you covered: the indoor wave pool is climate-controlled, so the floating sound bath happens whatever the weather is doing. Indoor acoustics make the singing bowls and gongs feel even bigger. A smart pick for Tempe and Chandler locals and winter floaters.",
  },

  // --- Mesa ----------------------------------------------------------------
  "floating-soundbath-kino-aquatics-mesa": {
    title: "Floating Sound Bath at Kino Aquatic Center, Mesa",
    h1: "Floating Sound Bath at Kino Aquatic Center",
    description:
      "Floating sound bath at Kino Aquatic Center in Mesa: a live sound bath class held on the water by Desert Paddleboards. No experience needed. Book online.",
    intro:
      "Kino Aquatic Center is a recently renovated pool near downtown Mesa, tucked away from busy roads, so it gets surprisingly quiet once the music starts. This page is for our floating sound bath class held at the pool (for pool hours and swim programs, check with the City of Mesa). It's an affordable, first-timer-friendly pick, and dinner downtown afterwards is never a bad idea.",
  },
  "sunset-floating-soundbath-skyline-pool-mesa": {
    title: "Sunset Floating Sound Bath at Skyline Pool, Mesa",
    h1: "Sunset Floating Sound Bath at Skyline Pool",
    description:
      "Sunset floating sound bath at Skyline Aquatic Center in Mesa, with Superstition Mountain views. The TikTok-famous Floating Nap™ with live sound bath music.",
    intro:
      "Skyline Aquatic Center in east Mesa is where the Floating Nap™ went viral on TikTok, and the Superstition Mountains still steal the show at sunset. It's a city pool, so the price is friendly and the vibe is pure community night: neighbors, first-timers and a few people who swear they didn't fall asleep.",
  },
  "mulberry-community-floating-soundbath-mesa": {
    title: "Floating Sound Bath at Mulberry Community, Mesa",
    h1: "Community Floating Sound Bath at Mulberry, Mesa",
    description:
      "Community floating sound bath at the Mulberry neighborhood pool in southeast Mesa, now open to the public. Float on the water while live musicians play.",
    intro:
      "Mulberry is a neighborhood pool in southeast Mesa, and its floating sound bath is now open to everyone, not just the folks who live next door. Expect a friendly community-night crowd, a floating water bed (okay, it's a paddleboard, but we're sticking with water bed) and live sound healing. Bring a neighbor.",
  },
  "floating-soundbath-revel-surf-park": {
    title: "Floating Sound Bath at Revel Surf Park, Mesa",
    h1: "Floating Sound Bath at Revel Surf Park",
    description:
      "Floating sound bath in the surf lagoon at Revel Surf Park in Mesa. A pop-up night of sound waves instead of surf waves, offered on select dates only.",
    intro:
      "For a few select nights a year, the lagoon at Revel Surf in Mesa swaps surf waves for sound waves. You float on crystal-clear water under the open sky while live musicians play, and beach access comes with your ticket. Great for adventure-seekers, date nights and anyone who wants a story for Monday. Check back for new dates.",
  },

  // --- Chandler / Gilbert / Queen Creek / East Valley ----------------------
  "floating-soundbath-aji-spa-sheraton-grand-chandler": {
    title: "Floating Sound Bath at Aji Spa, Wild Horse Pass, Chandler",
    h1: "Resort Floating Sound Bath at Aji Spa, Sheraton Grand at Wild Horse Pass",
    description:
      "Floating sound bath at Aji Spa, Sheraton Grand at Wild Horse Pass in Chandler. Float under desert stars with live Native American flute and sound healing.",
    intro:
      "Aji Spa sits in open Sonoran Desert at Sheraton Grand at Wild Horse Pass, far from traffic and city glow. You'll float under the stars with Native American flute and singing bowls, and every so often a coyote adds a solo. Perfect for resort guests, couples and anyone who wants a desert night without the camping.",
  },
  "floating-soundbath-doubletree-gilbert": {
    title: "Floating Sound Bath at DoubleTree by Hilton, Gilbert",
    h1: "Floating Sound Bath at DoubleTree by Hilton Gilbert",
    description:
      "Floating sound bath at DoubleTree by Hilton in Gilbert. Float in the newly renovated pool with live sound healing, and yes, the warm cookie is included.",
    intro:
      "Gilbert's floating sound bath comes with a warm DoubleTree chocolate chip cookie, which we consider a wellness practice. The newly renovated pool is tucked behind the hotel, away from the noise, so East Valley locals can float, breathe and be home in time for bed. Lovely for friends, families and first-timers.",
  },
  "lazy-river-floating-soundbath-queen-creek": {
    title: "Lazy River Floating Sound Bath in Queen Creek",
    h1: "Lazy River Floating Sound Bath at Queen Creek Recreation Pool",
    description:
      "Lazy river floating sound bath at Queen Creek Recreation Pool. The current is switched off, so you drift on still water while live sound healing plays.",
    intro:
      "Yes, a floating sound bath in a lazy river. At Queen Creek Recreation Pool the current is switched off for the session, so you drift on calm, still water while the music plays. It's a Friday-night favorite for Queen Creek neighbors and friends, and it's booked through the Town of Queen Creek.",
  },
  "superstition-shadows-floating-soundbath-apache-junction": {
    title: "Floating Sound Bath at Superstition Shadows, Apache Junction",
    h1: "Floating Sound Bath at Superstition Shadows",
    description:
      "Floating sound bath at Superstition Shadows in Apache Junction. Float beneath the Superstition Mountains as the desert light fades and live sound plays.",
    intro:
      "Out in Apache Junction, the Superstition Mountains do half the work before the music even starts. Float on the water as the desert light fades and live sound healing takes over. A laid-back night for East Valley locals, winter visitors and anyone who likes their sunsets with a soundtrack.",
  },

  // --- West Valley ---------------------------------------------------------
  "floating-soundbath-lemonds-spa-wigwam-litchfield-park": {
    title: "Floating Sound Bath at The Wigwam, Litchfield Park",
    h1: "Resort Floating Sound Bath at LeMonds Spa, The Wigwam",
    description:
      "Floating sound bath at LeMonds Spa at The Wigwam, the historic resort in Litchfield Park. Float on the water while live sound bath musicians play.",
    intro:
      "The Wigwam is one of the West Valley's historic resorts, and its LeMonds Spa pool is a quiet, old-school-glam home for a floating sound bath. It's a handy one for West Valley locals tired of driving to Scottsdale for nice things, and for resort guests who want an evening that's actually relaxing.",
  },
  "floating-soundbath-pebblecreek-goodyear": {
    title: "Floating Sound Bath at PebbleCreek, Goodyear",
    h1: "Community Floating Sound Bath at PebbleCreek",
    description:
      "Community floating sound bath at PebbleCreek in Goodyear. Float on the water with guided breathwork and live sound bath music. No experience needed.",
    intro:
      "PebbleCreek brings the floating sound bath to Goodyear, so West Valley locals can skip the cross-Valley drive and go straight to the floating part. Expect guided breathwork, live singing bowls and gongs, and a floating water bed (okay, it's a paddleboard, but we're sticking with water bed). Great for neighbors, friends and first-timers. Check back for new dates.",
  },
  "floating-soundbath-avondale": {
    title: "Floating Sound Bath in Avondale, Arizona",
    h1: "Floating Sound Bath in Avondale",
    description:
      "Floating sound bath in Avondale with City of Avondale Parks & Recreation. A West Valley night of live sound healing on the water. Register with the city.",
    intro:
      "West Valley, this one's for you. We team up with City of Avondale Parks & Recreation to bring the floating sound bath closer to home, no cross-Valley drive required. It's a relaxed community night for locals, friends and first-timers, booked through the city.",
  },

  // --- Sedona --------------------------------------------------------------
  "floating-soundbath-sedona": {
    title: "Floating Sound Bath at Sedona Community Pool",
    h1: "Floating Sound Bath at Sedona Community Pool",
    description:
      "Floating sound bath at Sedona Community Pool, with red rock views as the sun goes down. Float while live musicians play. Booked via the City of Sedona.",
    intro:
      "Sedona was practically built for sound healing, and floating with the red rocks on the horizon is next-level. This class runs at the Sedona Community Pool and is booked through the City of Sedona. Make a weekend of it, bring a friend, and let the red rocks do the rest.",
  },

  // --- Not sound baths: these keep their own keywords ----------------------
  "paddleboard-yoga-mulberry-mesa": {
    title: "Paddleboard Yoga at Mulberry Community, Mesa",
    h1: "Paddleboard Yoga at Mulberry Community",
    description:
      "Paddleboard yoga at the Mulberry neighborhood pool in southeast Mesa. A gentle floating flow on stable boards, beginner-friendly and more fun than a mat.",
    intro:
      "Yoga, but make it float. This class runs in the Mulberry neighborhood pool in southeast Mesa, and it's gentler than it looks: stable boards, easy flows and the occasional splash for good measure. Great for beginners, friends and anyone bored of their living-room mat.",
  },
  "lazy-river-water-aerobics-floating-yoga-mesa": {
    title: "Lazy River Water Aerobics & Paddleboard Yoga, Mesa",
    h1: "Lazy River Water Aerobics & Paddleboard Yoga at Mesa Aquatics Complex",
    description:
      "Lazy river water aerobics, pool pilates and paddleboard yoga at the Mesa Aquatics Complex. A 90-minute, high-energy water workout that's easy on the joints.",
    intro:
      "This is the high-energy cousin of our floating sound bath: 90 minutes of water aerobics, pool pilates, floating yoga and surf fitness at the Mesa Aquatics Complex. The water takes the pressure off your joints, which we think is only fair. A fun one to drag a friend to.",
  },
  "salt-river-paddleboarding-outing": {
    title: "Salt River Paddleboarding Outing near Mesa, Arizona",
    h1: "Salt River Paddleboarding Outing",
    description:
      "Paddleboard the lower Salt River near Mesa: saguaros, cottonwoods and wild horses on calm desert water. About 2.5 hours, boards included, all levels welcome.",
    intro:
      "Leave the city behind for a paddleboard float down the lower Salt River, past saguaros, cottonwoods and, if they're feeling social, the wild horses. We carpool from northeast Mesa and float downstream for about two and a half hours, and you're welcome to stay seated the whole way. Our golden retriever comes too, so you'll have at least one very good friend on the water.",
  },
  "witches-regatta-tempe-town-lake": {
    title: "Witches Regatta on Tempe Town Lake | Halloween SUP Event",
    h1: "Witches Regatta on Tempe Town Lake",
    description:
      "The Witches Regatta: our free annual Halloween paddleboard event on Tempe Town Lake. Wear your witch or warlock best and float the lake as a coven.",
    intro:
      "Since 2017, witches and warlocks have taken over Tempe Town Lake every October for the Witches Regatta. It's free, it's festive and it's open to anyone, whether you bring your own board or rent one from us. Costumes strongly encouraged; brooms optional.",
  },
  "witches-regatta-board-tshirt-bundle": {
    title: "Witches Regatta Board + T-Shirt Bundle, Tempe",
    h1: "Witches Regatta Board Rental + T-Shirt Bundle",
    description:
      "Need a board for the Witches Regatta? This bundle pairs an inflatable paddleboard rental with a Witches Regatta t-shirt on Tempe Town Lake. Limited spots.",
    intro:
      "No board, no problem. This bundle gets you an inflatable paddleboard rental plus a Witches Regatta t-shirt, so you can join the coven on Tempe Town Lake in style. Spots are limited, and you'll still need a $10 City of Tempe boat permit for the rental board.",
  },
  "santa-paddle-tempe-town-lake": {
    title: "Santa Paddle: Free Holiday Paddle on Tempe Town Lake",
    h1: "Santa Paddle on Tempe Town Lake",
    description:
      "The Santa Paddle: our free holiday paddleboard and kayak meetup on Tempe Town Lake. Costumes encouraged, dogs in antlers welcome. Bring your own board.",
    intro:
      "Santas, elves, reindeer and the occasional dog in antlers take over Tempe Town Lake for our free holiday paddle. Bring your own board or kayak, put on your silliest costume, and meet us on the hill by the boat marina. It's festive, slightly ridiculous and the best kind of holiday tradition.",
  },
};

interface SeoInput {
  slug: string;
  title: string;
  venue: string;
  city: string;
  blurb: string;
}

function trimTo(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** SEO for a location page — the curated entry, or a unique templated fallback. */
export function locationSeoFor(v: SeoInput): LocationSeo {
  const curated = LOCATION_SEO[v.slug];
  if (curated) return curated;
  const at = v.venue ? ` at ${v.venue}` : "";
  return {
    title: `${v.title}${at}, ${v.city}`,
    h1: `${v.title}${at}`,
    description: trimTo(`${v.title}${at} in ${v.city}, Arizona. ${v.blurb}`, 160),
  };
}

/** Descriptive alt text for a venue photo (finder cards, grids, page hero). */
export function venueImageAlt(title: string, venue: string, city: string): string {
  const kind = title.toLowerCase();
  const what = /sound bath/i.test(title)
    ? `Guests floating on the water during ${/^[aeiou]/.test(kind) ? "an" : "a"} ${kind}`
    : title;
  const place = venue.replace(/\s+—\s+/g, ", ");
  return `${what}${place ? ` at ${place}` : ""} in ${city}, Arizona`;
}

// ---------------------------------------------------------------------------
// Nearby locations (internal links at the bottom of each location page)
// ---------------------------------------------------------------------------

interface Place {
  slug: string;
  city: string;
  lat: number;
  lng: number;
  isSoundBath: boolean;
  label: string;
}

/** Anchor text: the page H1 in sentence case, plus the city when it's missing. */
function anchorFor(h1: string, city: string): string {
  const text = h1.replace(/Floating Sound Bath/g, "floating sound bath");
  return text.includes(city) ? text : `${text}, ${city}`;
}

const PLACES: Place[] = [
  ...experiences.map((e) => ({
    slug: e.slug,
    city: e.city,
    lat: e.lat,
    lng: e.lng,
    isSoundBath: e.kind === "soundbath",
  })),
  ...cityClasses
    .filter((c) => typeof c.lat === "number" && typeof c.lng === "number")
    .map((c) => ({
      slug: c.slug,
      city: c.city,
      lat: c.lat as number,
      lng: c.lng as number,
      isSoundBath: /sound bath/i.test(c.title),
    })),
]
  .filter((p) => p.lat && p.lng)
  .map((p) => {
    const src =
      experiences.find((e) => e.slug === p.slug) ?? cityClasses.find((c) => c.slug === p.slug)!;
    const seo = locationSeoFor({ ...src, blurb: "" });
    return { ...p, label: anchorFor(seo.h1, p.city) };
  });

function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

/** The `n` closest OTHER floating sound bath pages to this one. */
export function nearbySoundBaths(slug: string, n = 3): { slug: string; label: string }[] {
  const here = PLACES.find((p) => p.slug === slug);
  if (!here) return [];
  return PLACES.filter((p) => p.isSoundBath && p.slug !== slug)
    .map((p) => ({ p, d: milesBetween(here, p) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map(({ p }) => ({ slug: p.slug, label: p.label }));
}
