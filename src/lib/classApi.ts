// src/lib/classApi.ts
// Handles all API calls for class products + sessions

import axios from "axios";
import { API_BASE_URL } from "../const"; // you already have this in your project

// Helper for consistent error logging
function logError(tag: string, err: any) {
  console.error(`${tag} ERROR`, err);
}

// ----------------------------------------------------------
// GET all class products
// ----------------------------------------------------------
export async function fetchClassProducts() {
  try {
    const res = await axios.get(`${API_BASE_URL}/class-products`);
    return res.data;
  } catch (err) {
    logError("FETCH CLASS PRODUCTS", err);
    return [];
  }
}

// ----------------------------------------------------------
// GET single class product
// ----------------------------------------------------------
export async function fetchClassProduct(id: number) {
  try {
    const res = await axios.get(`${API_BASE_URL}/class-products/${id}`);
    return res.data;
  } catch (err) {
    logError("FETCH CLASS PRODUCT", err);
    return null;
  }
}

// ----------------------------------------------------------
// GET sessions (optionally by date)
// ----------------------------------------------------------
export async function fetchSessions(date?: string) {
  try {
    const url = date 
      ? `${API_BASE_URL}/class-sessions?date=${date}`
      : `${API_BASE_URL}/class-sessions`;

    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    logError("FETCH SESSIONS", err);
    return [];
  }
}

// ----------------------------------------------------------
// GET sessions for a specific class product
// ----------------------------------------------------------
export async function fetchSessionsForClass(classProductId: number) {
  try {
    const all = await fetchSessions();
    return all.filter((s: any) => s.classProductId === classProductId);
  } catch (err) {
    logError("FETCH SESSIONS FOR CLASS", err);
    return [];
  }
}

// ----------------------------------------------------------
// GET a single session by ID
// ----------------------------------------------------------
export async function fetchSession(id: number) {
  try {
    const res = await axios.get(`${API_BASE_URL}/class-sessions`);
    const sessions = res.data;
    return sessions.find((s: any) => s.id === id) || null;
  } catch (err) {
    logError("FETCH SESSION", err);
    return null;
  }
}
// src/lib/classApi.ts
import { publicApi } from "./publicApi";

// List class products
export function fetchClassProducts() {
  return publicApi.get("/class-products").then((r) => r.data);
}

// Single class product
export function fetchClassProduct(id: number) {
  return publicApi.get(`/class-products/${id}`).then((r) => r.data);
}

// List sessions for a class
export function fetchSessionsForClass(id: number) {
  return publicApi.get(`/class-products/${id}/sessions`).then((r) => r.data);
}

// Single session
export function fetchSession(id: number) {
  return publicApi.get(`/class-sessions/${id}`).then((r) => r.data);
}
