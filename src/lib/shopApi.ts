// src/lib/shopApi.ts
import { apiGet, apiPost } from "./publicApi";

export function fetchStoreProducts() {
  return apiGet("/store/products");
}

export function fetchStoreProduct(productKey: string) {
  return apiGet(`/store/products/${productKey}`);
}

export function submitCheckout(payload: {
  productId?: number;
  productKey?: string;
  sessionId?: number;
  quantity?: number;
  email: string;
  name?: string;
  giftCode?: string;
}) {
  return apiPost("/checkout/create-checkout-session", payload);
}

export default {
  fetchStoreProducts,
  fetchStoreProduct,
  submitCheckout,
};
