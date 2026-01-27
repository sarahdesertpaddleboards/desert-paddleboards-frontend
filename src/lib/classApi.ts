// src/lib/classApi.ts
import { apiGet } from "./publicApi";

// New "fetch*" names (nice + consistent)
export function fetchClassProducts() {
  return apiGet("/classes/products");
}

export function fetchClassProduct(id: number) {
  return apiGet(`/classes/products/${id}`);
}

export function fetchSessions() {
  return apiGet("/classes/sessions");
}

export function fetchSession(id: number) {
  return apiGet(`/classes/sessions/${id}`);
}

// Backwards-compatible aliases (so older pages still compile)
export const getClassProducts = fetchClassProducts;
export const getClassProductById = fetchClassProduct;

export const getClassSessions = fetchSessions;
export const getClassSessionById = fetchSession;
