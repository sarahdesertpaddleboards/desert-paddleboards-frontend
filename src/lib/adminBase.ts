export const ADMIN_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://desert-paddleboards-backend-production.up.railway.app");
