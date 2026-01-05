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

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/admin/products`,
    { withCredentials: true } // 🔑 COOKIE GOES HERE
  );
  return res.data;
}
