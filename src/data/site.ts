/** Canonical production site URL (no trailing slash). */
export const SITE_URL = "https://desertpaddleboards.com";

/**
 * Name, phone + social — the business identity used across JSON-LD.
 * Desert Paddleboards is MOBILE: the business node gets `areaServed` only and
 * never a street address (the office address stays private). Venue addresses
 * belong on each Event's `location`, not here.
 */
export const business = {
  name: "Desert Paddleboards",
  url: SITE_URL,
  telephone: "+16024560884",
  email: "sarah@desertpaddleboards.com",
  description:
    "Arizona's original floating sound bath. Float on a paddleboard while live sound bath musicians play at resort, rooftop and city pools across Phoenix, Scottsdale, Mesa, Tempe, Chandler and Gilbert.",
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    "https://www.instagram.com/desertpaddleboards/",
    "https://www.facebook.com/desertpaddleboards",
    "https://www.tiktok.com/@desertpaddleboards",
  ],
  areaServed: [
    "Phoenix",
    "Scottsdale",
    "Mesa",
    "Tempe",
    "Chandler",
    "Gilbert",
    "Queen Creek",
    "Apache Junction",
    "Goodyear",
    "Litchfield Park",
    "Avondale",
    "Sedona",
  ],
  priceRange: "$$",
};
