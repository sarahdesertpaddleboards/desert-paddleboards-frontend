/**
 * Shop products — sold via Stripe Payment Links (no backend required).
 *
 * HOW TO ADD / GO LIVE WITH A PRODUCT:
 *  1. In the Stripe dashboard → Product catalog → add the product (name, price,
 *     image), then create a **Payment Link** for it.
 *  2. Copy the link URL (looks like https://buy.stripe.com/xxxxxxxx).
 *  3. Paste it into `paymentLink` below. Until it's filled in, the card shows
 *     "Coming soon" instead of a Buy button — so it's safe to ship early.
 *
 * Money goes straight to Stripe; Stripe hosts the checkout and emails the
 * receipt. Nothing runs on our servers.
 */

export interface Product {
  slug: string;
  name: string;
  /** Price in whole US dollars, e.g. 28 → shown as "$28". */
  priceUsd: number;
  /** Short description shown on the card. */
  blurb: string;
  /** Image URL (self-host in /public before launch for reliability). */
  image: string;
  /** Stripe Payment Link URL. Leave "" until it's created → shows "Coming soon". */
  paymentLink: string;
  soldOut?: boolean;
}

export const products: Product[] = [
  {
    slug: "life-is-better-beach-tote",
    name: "Life is Better on the Water — Beach Tote",
    priceUsd: 28, // TODO: confirm price with Sarah
    blurb:
      "Our signature roomy beach tote — perfect for towels, water and sunscreen on the way to the float. (Draft copy — Sarah to review.)",
    image: "https://cdn.filestackcontent.com/Z7xKad6uSQJZrz6oPThV",
    paymentLink: "", // TODO: paste the Stripe Payment Link URL here to go live
  },
];

export function formatPrice(usd: number): string {
  return `$${usd}`;
}
