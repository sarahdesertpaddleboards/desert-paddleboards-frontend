import axios from "axios";

// Base public axios instance (used by classApi, shopApi, BuyProductPage, etc.)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://desert-paddleboards-railway.up.railway.app",
  withCredentials: false,
});

// Helper: GET
export function apiGet(path: string) {
  return publicApi.get(path).then((res) => res.data);
}

// Helper: POST
export function apiPost(path: string, body: any) {
  return publicApi.post(path, body).then((res) => res.data);
}

// Export default for legacy imports (some old files might use default)
export default publicApi;
