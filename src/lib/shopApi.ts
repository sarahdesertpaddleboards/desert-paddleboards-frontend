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
  quantity?: number;
  email: string;
  name?: string;
}) {
  return apiPost("/checkout", payload);
}

export default {
  fetchStoreProducts,
  fetchStoreProduct,
  submitCheckout,
};
