// src/lib/adminApi.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://desert-paddleboards-railway.up.railway.app";

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export type AdminClassProduct = {
  id: number;
  productKey: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  currency: string;
  imageUrl?: string;
  active: boolean;
};

export type AdminClassSession = {
  id: number;
  classProductId: number;
  venueId?: number | null;
  startTime: string;
  endTime: string;
  seatsTotal: number;
  seatsAvailable: number;
};

export function fetchAdminClassProducts(): Promise<AdminClassProduct[]> {
  return adminApi.get("/admin/classes/products").then((res) => res.data);
}

export function createAdminClassProduct(
  payload: Omit<AdminClassProduct, "id">
): Promise<AdminClassProduct> {
  return adminApi.post("/admin/classes/products", payload).then((res) => res.data);
}

export function updateAdminClassProduct(
  id: number,
  payload: Partial<Omit<AdminClassProduct, "id">>
): Promise<AdminClassProduct> {
  return adminApi
    .patch(`/admin/classes/products/${id}`, payload)
    .then((res) => res.data);
}

export function deleteAdminClassProduct(id: number): Promise<{ ok: true }> {
  return adminApi.delete(`/admin/classes/products/${id}`).then((res) => res.data);
}

export function fetchAdminClassSessions(): Promise<AdminClassSession[]> {
  return adminApi.get("/admin/classes/sessions").then((res) => res.data);
}

export function createAdminClassSession(
  payload: Omit<AdminClassSession, "id">
): Promise<AdminClassSession> {
  return adminApi.post("/admin/classes/sessions", payload).then((res) => res.data);
}

export function updateAdminClassSession(
  id: number,
  payload: Partial<Omit<AdminClassSession, "id">>
): Promise<AdminClassSession> {
  return adminApi
    .patch(`/admin/classes/sessions/${id}`, payload)
    .then((res) => res.data);
}

export function deleteAdminClassSession(id: number): Promise<{ ok: true }> {
  return adminApi.delete(`/admin/classes/sessions/${id}`).then((res) => res.data);
}
