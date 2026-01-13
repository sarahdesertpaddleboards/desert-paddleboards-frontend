// src/lib/classApi.ts

// ---------------------------------------------------------
// PUBLIC API WRAPPER
// ---------------------------------------------------------

import { publicApi } from "./publicApi";

// ---------------------------------------------------------
// CLASS PRODUCTS
// ---------------------------------------------------------

// List all class products
export function fetchClassProducts() {
  return publicApi.get("/class-products").then((r) => r.data);
}

// Get a single class product
export function fetchClassProduct(id: number) {
  return publicApi.get(`/class-products/${id}`).then((r) => r.data);
}

// ---------------------------------------------------------
// CLASS SESSIONS
// ---------------------------------------------------------

// Get all sessions for a class product
export function fetchSessionsForClass(classProductId: number) {
  return publicApi
    .get(`/class-products/${classProductId}/sessions`)
    .then((r) => r.data);
}

// Get a single class session
export function fetchSession(id: number) {
  return publicApi.get(`/class-sessions/${id}`).then((r) => r.data);
}
