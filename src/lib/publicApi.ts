// src/lib/publicApi.ts
import axios from "axios";

// Public axios instance (NO COOKIES REQUIRED)
export const publicApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://desert-paddleboards-railway.up.railway.app",
  withCredentials: false
});

// Simple helpers
export function apiGet(path: string) {
  return publicApi.get(path).then((r) => r.data);
}

export function apiPost(path: string, body: any) {
  return publicApi.post(path, body).then((r) => r.data);
}

export default publicApi;
