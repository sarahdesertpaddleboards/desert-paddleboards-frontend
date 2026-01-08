// src/lib/adminApi.ts
import axios from "axios";

export type AdminProduct = {
  productKey: string;
  name: string;
  description: string;
  price: number;      // cents
  currency: string;   // "usd"
  active: boolean;
  type: string;
  hasOverride: boolean;
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_BACKEND_URL is not defined in environment variables");
}

/**
 * Fetch all admin products
 */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await axios.get(`${API_BASE_URL}/admin/products`, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Update a single product by productKey
 */
export async function updateAdminProduct(
  productKey: string,
  payload: Partial<
    Pick<
      AdminProduct,
      "name" | "description" | "price" | "currency" | "active" | "type"
    >
  >
): Promise<AdminProduct> {
  const res = await axios.patch(
    `${API_BASE_URL}/admin/products/${productKey}`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

/**
 * Create a new product
 */
export async function createAdminProduct(
  payload: Omit<AdminProduct, "hasOverride">
): Promise<AdminProduct> {
  const res = await axios.post(
    `${API_BASE_URL}/admin/products`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}
