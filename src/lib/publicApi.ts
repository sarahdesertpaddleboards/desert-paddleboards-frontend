// src/lib/publicApi.ts
import axios from "axios";

export const PUBLIC_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://desert-paddleboards-backend-production.up.railway.app");

export const publicApi = axios.create({
  baseURL: PUBLIC_API_BASE,
  withCredentials: false,
});

export function apiGet(path: string) {
  return publicApi.get(path).then((res) => res.data);
}

export function apiPost(path: string, data: any) {
  return publicApi.post(path, data).then((res) => res.data);
}
