// src/lib/publicApi.ts
import axios from "axios";

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL 
    || "https://desert-paddleboards-railway.up.railway.app",
  withCredentials: false,
});

export function apiGet(path: string) {
  return publicApi.get(path).then(res => res.data);
}

export function apiPost(path: string, data: any) {
  return publicApi.post(path, data).then(res => res.data);
}
