/**
 * Shop products — sold via Stripe Payment Links (no backend required).
 *
 * GO LIVE WITH A PRODUCT:
 *  1. In Stripe → Product catalog → add the product (name, price, image) →
 *     create a **Payment Link**. For digital goods, set the link's
 *     post-payment confirmation to deliver/redirect to the file (or use a
 *     digital-goods host like Gumroad and paste its URL instead).
 *  2. Paste the link URL (https://buy.stripe.com/… or Gumroad URL) into
 *     `paymentLink` (or each option's `paymentLink`). Empty = "Coming soon".
 *
 * Stripe hosts checkout, collects shipping where needed, and emails receipts.
 * Nothing runs on our servers.
 */

export type ProductKind = "physical" | "digital";

/** A purchase variant with its own price + Stripe link (e.g. New vs Used). */
export interface PurchaseOption {
  label: string;
  priceUsd: number;
  paymentLink: string; // "" = coming soon
}

export interface Product {
  slug: string;
  name: string;
  kind: ProductKind;
  /** Headline ("from") price in whole USD. */
  priceUsd: number;
  /** Extra note shown by the price, e.g. "+ $40 shipping (US)". */
  priceNote?: string;
  blurb: string;
  /** Image URL. Empty string → a branded placeholder is shown. */
  image: string;
  /** Single-purchase link. Used when there are no `options`. */
  paymentLink?: string;
  /** Multiple variants (e.g. New/Used) — each its own price + link. */
  options?: PurchaseOption[];
  soldOut?: boolean;
}

export const products: Product[] = [
  // ── Boards & gear (physical) ───────────────────────────────────────────
  {
    slug: "floating-meditation-board",
    name: "Floating Meditation Board",
    kind: "physical",
    priceUsd: 150, // "from" — the used price
    priceNote: "+ $40 shipping (US)",
    blurb:
      "The very board we float on at every soundbath — our signature inflatable, stable enough for first-timers and ready for the pool, the lake or the river. Take 'Life is Better on the Water' home with you. Choose brand new or gently used.",
    image: "/floating-boards-sunset.jpg",
    options: [
      { label: "New", priceUsd: 250, paymentLink: "https://buy.stripe.com/8x2bJ1aNX6Uo2lzdAl6oo00" },
      { label: "Used", priceUsd: 150, paymentLink: "https://buy.stripe.com/00w14n3lv4Mg6BP7bX6oo01" },
    ],
  },
  {
    slug: "life-is-better-beach-tote",
    name: "Life is Better on the Water — Beach Tote",
    kind: "physical",
    priceUsd: 20,
    priceNote: "Free US shipping",
    blurb:
      "A roomy, water-ready canvas tote that hauls your towel, water and sunscreen to the pool deck and back — with 'Life is Better on the Water' printed on the side. Free US shipping.",
    image: "https://cdn.filestackcontent.com/Z7xKad6uSQJZrz6oPThV",
    paymentLink: "https://buy.stripe.com/14A14ng8h5Qk9O1dAl6oo02",
  },

  // ── Digital downloads ──────────────────────────────────────────────────
  {
    slug: "sonoran-echoes-album",
    name: "Sonoran Echoes — Album",
    kind: "digital",
    priceUsd: 20,
    blurb:
      "The full album from our floating soundbaths, featuring award-winning Native American flutist Cody Blackbird. Bring the calm of the water home — an instant digital download, yours to keep forever.",
    image: "/sonoran-echoes-album.jpeg",
    paymentLink: "https://buy.stripe.com/4gMaEX6xH4Mgf8leEp6oo05",
  },
  {
    slug: "guide-lees-ferry-horseshoe-bend",
    name: "Guide: Lees Ferry to Horseshoe Bend",
    kind: "digital",
    priceUsd: 5,
    blurb:
      "Everything you need to paddle the legendary Lees Ferry → Horseshoe Bend stretch of the Colorado River — launch points, timing, what to pack and what to expect. Instant digital download.",
    image: "",
    paymentLink: "https://buy.stripe.com/9B69AT6xHdiM2lz53P6oo04",
  },
  {
    slug: "guide-black-canyon",
    name: "Guide: Black Canyon Paddleboarding Adventure",
    kind: "digital",
    priceUsd: 5,
    blurb:
      "Your field guide to the Black Canyon paddle below Hoover Dam — hidden hot springs, slot canyons and emerald water, plus the logistics to do it right. Instant digital download.",
    image: "",
    paymentLink: "https://buy.stripe.com/6oUdR91dna6A6BPfIt6oo03",
  },
];

export function formatPrice(usd: number): string {
  return `$${usd}`;
}
