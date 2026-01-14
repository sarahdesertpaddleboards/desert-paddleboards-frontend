// src/lib/classApi.ts
import { apiGet } from "./publicApi";

// ---------------------------------------
// CLASS PRODUCTS
// ---------------------------------------

// GET /classes/products
export function fetchClassProducts() {
  return apiGet("/classes/products");
}

// GET /classes/products/:id
export function fetchClassProduct(id: number) {
  return apiGet(`/classes/products/${id}`);
}

// ---------------------------------------
// CLASS SESSIONS
// ---------------------------------------

// GET /classes/products/:id/sessions
export function fetchSessionsForClass(classProductId: number) {
  return apiGet(`/classes/products/${classProductId}/sessions`);
}

// GET /classes/sessions/:sessionId
export function fetchSession(sessionId: number) {
  return apiGet(`/classes/sessions/${sessionId}`);
}

export default {
  fetchClassProducts,
  fetchClassProduct,
  fetchSessionsForClass,
  fetchSession
};
