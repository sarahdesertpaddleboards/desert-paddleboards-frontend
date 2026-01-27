// src/lib/classApi.ts
import { apiGet } from "./publicApi";

/**
 * Canonical (newer) function names
 */
export function fetchClassProducts() {
  return apiGet("/classes/products");
}

export function fetchClassProduct(id: number | string) {
  return apiGet(`/classes/products/${id}`);
}

export function fetchSessions() {
  return apiGet("/classes/sessions");
}

export function fetchSession(id: number | string) {
  return apiGet(`/classes/sessions/${id}`);
}

/**
 * Backwards-compatible aliases (older names used around the app)
 * This stops Vercel build failures without having to edit every page right now.
 */
export const getClassProducts = fetchClassProducts;
export const getClassProductById = fetchClassProduct;

export const getClassSessions = fetchSessions;
export const getClassSessionById = fetchSession;
