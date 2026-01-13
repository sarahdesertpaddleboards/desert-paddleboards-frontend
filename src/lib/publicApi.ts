import axios from "axios";

// Public axios instance (used across Shop, Classes, etc.)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL 
    || "https://desert-paddleboards-railway.up.railway.app",
  withCredentials: false,
});

// Generic GET helper
export function apiGet(path: string) {
  return publicApi.get(path).then((res) => res.data);
}

// Generic POST helper
export function apiPost(path: string, body: any) {
  return publicApi.post(path, body).then((res) => res.data);
}

// SPECIFIC EXPORTS EXPECTED BY FRONTEND PAGES -----------------

// Shop.tsx expects this:
export function fetchPublicProducts() {
  return apiGet("/products/public");
}

// BuyProductPage.tsx uses publicApi
// classApi.ts imports publicApi
// Old code may still import default:
export default publicApi;
