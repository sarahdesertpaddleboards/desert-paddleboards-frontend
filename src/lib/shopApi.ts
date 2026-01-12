import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export type ShopProduct = {
  productKey: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
};

export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
}

