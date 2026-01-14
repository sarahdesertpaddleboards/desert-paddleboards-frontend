// src/lib/classApi.ts
import { apiGet } from "./publicApi";

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
