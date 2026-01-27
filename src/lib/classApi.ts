// src/lib/classApi.ts
// Centralised API helpers for class products and sessions.
// These names MUST match what pages import.

import { apiGet } from "./publicApi";

/**
 * Get all class products
 * Backend: GET /classes/products
 */
export function getClassProducts() {
  return apiGet("/classes/products");
}

/**
 * Get one class product by ID
 * Backend: GET /classes/products/:id
 */
export function getClassProduct(id: number) {
  return apiGet(`/classes/products/${id}`);
}

/**
 * Get all class sessions
 * Backend: GET /classes/sessions
 */
export function getClassSessions() {
  return apiGet("/classes/sessions");
}

/**
 * Get one session by ID
 * Backend: GET /classes/sessions/:id
 */
export function getClassSession(id: number) {
  return apiGet(`/classes/sessions/${id}`);
}
