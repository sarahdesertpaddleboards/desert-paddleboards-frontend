// src/lib/classApi.ts
// Centralised API helpers for class products and sessions.
// IMPORTANT: We export BOTH `getX` and `fetchX` names because the codebase
// currently imports both styles in different pages/components.

import { apiGet } from "./publicApi";

/**
 * Core implementations (single source of truth)
 */
function _getClassProducts() {
  return apiGet("/classes/products");
}

function _getClassProduct(id: number) {
  return apiGet(`/classes/products/${id}`);
}

function _getClassSessions() {
  return apiGet("/classes/sessions");
}

function _getClassSession(id: number) {
  return apiGet(`/classes/sessions/${id}`);
}

/**
 * Preferred names (new convention)
 */
export const getClassProducts = _getClassProducts;
export const getClassProduct = _getClassProduct;
export const getClassSessions = _getClassSessions;
export const getClassSession = _getClassSession;
export const getClassSessionById = _getClassSession;

/**
 * Backwards-compatible names (old convention used in some pages)
 */
export const fetchClassProducts = _getClassProducts;
export const fetchClassProduct = _getClassProduct;
export const fetchSessions = _getClassSessions;
export const fetchSession = _getClassSession;
