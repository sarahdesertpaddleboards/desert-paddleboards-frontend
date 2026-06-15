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
      "Our signature inflatable floating board — the very one we float on at every soundbath. Take Life is Better on the Water home. Choose brand new or gently used.",
    image: "/floating-boards-sunset.jpg",
    options: [
      { label: "New", priceUsd: 250, paymentLink: "" }, // TODO: Stripe link
      { label: "Used", priceUsd: 150, paymentLink: "" }, // TODO: Stripe link
    ],
  },
  {
    slug: "life-is-better-beach-tote",
    name: "Life is Better on the Water — Beach Tote",
    kind: "physical",
    priceUsd: 10,
    blurb:
      "Our signature roomy beach tote — perfect for towels, water and sunscreen on the way to the float.",
    image: "https://cdn.filestackcontent.com/Z7xKad6uSQJZrz6oPThV",
    paymentLink: "", // TODO: Stripe link
  },

  // ── Digital downloads ──────────────────────────────────────────────────
  {
    slug: "sonoran-echoes-album",
    name: "Sonoran Echoes — Album",
    kind: "digital",
    priceUsd: 20,
    blurb:
      "The full album from our floating soundbaths, featuring award-winning Native American flutist Cody Blackbird. Digital download — yours to keep.",
    image: "", // TODO: album cover art
    paymentLink: "", // TODO: Stripe / Gumroad link
  },
  {
    slug: "guide-lees-ferry-horseshoe-bend",
    name: "Guide: Lees Ferry to Horseshoe Bend",
    kind: "digital",
    priceUsd: 5,
    blurb:
      "A practical digital guide to paddleboarding the legendary Lees Ferry → Horseshoe Bend stretch of the Colorado River — what to know before you go.",
    image: "",
    paymentLink: "", // TODO
  },
  {
    slug: "guide-black-canyon",
    name: "Guide: Black Canyon Paddleboarding Adventure",
    kind: "digital",
    priceUsd: 5,
    blurb:
      "Your digital guide to the Black Canyon paddleboarding adventure below Hoover Dam — hot springs, slot canyons and emerald water.",
    image: "",
    paymentLink: "", // TODO
  },
];

export function formatPrice(usd: number): string {
  return `$${usd}`;
}
