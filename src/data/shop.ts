/**
 * Shop products — sold via Stripe Payment Links (no backend required).
 *
 * The product DATA lives in `shop.json` so it can be edited through the CMS
 * (Pages CMS — see `.pages.yml`). This file just adds the types + helpers.
 *
 * GO LIVE WITH A PRODUCT (or change a price/link): edit it in the CMS, or edit
 * `shop.json` directly. For each product set `paymentLink` to its Stripe
 * Payment Link URL (https://buy.stripe.com/…). Empty `paymentLink` = the
 * product shows "Coming soon".
 */
import shopData from "./shop.json";

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

export const products: Product[] = shopData.products as unknown as Product[];

export function formatPrice(usd: number): string {
  return `$${usd}`;
}
