/** Canonical production site URL (no trailing slash). */
export const SITE_URL = "https://desertpaddleboards.com";

/** Name, address, phone + social — the business "NAP" used across JSON-LD. */
export const business = {
  name: "Desert Paddleboards",
  url: SITE_URL,
  telephone: "+16024560884",
  email: "sarah@desertpaddleboards.com",
  description:
    "Floating soundbaths, paddleboard yoga and water-based wellness experiences across Arizona.",
  logo: `${SITE_URL}/hero-main.webp`,
  sameAs: [
    "https://www.instagram.com/desertpaddleboards/",
    "https://www.facebook.com/desertpaddleboards",
    "https://www.tiktok.com/@desertpaddleboards",
  ],
  address: { locality: "Mesa", region: "AZ", country: "US" },
  geo: { lat: 33.4152, lng: -111.8315 },
  areaServed: [
    "Phoenix",
    "Mesa",
    "Scottsdale",
    "Tempe",
    "Gilbert",
    "Chandler",
    "Apache Junction",
    "Litchfield Park",
  ],
  priceRange: "$$",
};
