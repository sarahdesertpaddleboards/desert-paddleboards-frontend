import axios from "axios";

export type AdminProduct = {
  productKey: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  active: boolean;
  type: string;
  hasOverride: boolean;
};

// 🔑 Single source of truth for backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_BACKEND_URL is not defined in environment variables");
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await axios.get(
    `${API_BASE_URL}/admin/products`,
    {
      withCredentials: true, // ✅ REQUIRED so cookies are sent
    }
  );

  return res.data;
}
