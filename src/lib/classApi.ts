// src/lib/classApi.ts
// Small helper wrapper around our backend class endpoints.
// IMPORTANT: This file must export getClassSessions because Home.tsx imports it.

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "https://desert-paddleboards-railway.up.railway.app"; // sensible default for prod

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include", // keep cookies if you use admin auth
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Fetch all class products.
 * Backend: GET /classes/products
 */
export function getClassProducts() {
  return apiGet("/classes/products");
}

/**
 * Fetch all class sessions.
 * Backend: GET /classes/sessions
 */
export function getClassSessions() {
  return apiGet("/classes/sessions");
}

/**
 * Fetch one class session by id (if your backend supports it).
 * Backend: GET /classes/sessions/:id
 */
export function getClassSessionById(id: number | string) {
  return apiGet(`/classes/sessions/${id}`);
}
