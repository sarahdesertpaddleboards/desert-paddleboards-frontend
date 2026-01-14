// src/lib/storeApi.ts
import { apiGet } from "./publicApi";

export function fetchStoreProducts() {
  return apiGet("/store/products");
}

export function fetchStoreProduct(key: string) {
  return apiGet(`/store/products/${key}`);
}
