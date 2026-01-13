// src/lib/shopApi.ts

import { apiGet, apiPost } from "./publicApi";

// Fetch all public products (same endpoint used by Shop page)
export function fetchPublicProducts() {
  return apiGet("/products/public");
}

// Fetch a single product by ID (used in BuyProductPage)
export function fetchPublicProduct(id: number) {
  return apiGet(`/products/public/${id}`);
}

// Submit checkout (USED IN BuyProductPage.tsx)
export function submitCheckout(payload: {
  productId: number;
  quantity: number;
  email: string;
  name: string;
}) {
  return apiPost("/checkout/create", payload);
}

// Optionally used by old code (safe to keep)
export default {
  fetchPublicProducts,
  fetchPublicProduct,
  submitCheckout,
};
