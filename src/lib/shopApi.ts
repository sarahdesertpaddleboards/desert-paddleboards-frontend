// src/lib/shopApi.ts
import { apiGet, apiPost } from "./publicApi";

// Fetch unified public store products
// GET /store/products
export function fetchStoreProducts() {
  return apiGet("/store/products");
}

// Fetch single store product by its productKey
// (Frontend uses productKey, backend uses id, no problem)
export function fetchStoreProduct(productKey: string) {
  return apiGet(`/store/products?key=${productKey}`);
  // We can refine this later if needed.
}

// Checkout
export function submitCheckout(payload: {
  productId: number;
  quantity: number;
  email: string;
  name: string;
}) {
  return apiPost("/checkout/create", payload);
}

export default {
  fetchStoreProducts,
  fetchStoreProduct,
  submitCheckout
};
