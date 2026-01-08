import axios from "axios";
axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Get all products
export async function fetchAdminProducts() {
  const res = await axios.get(`${API_BASE_URL}/admin/products`);
  return res.data;
}

// Update product
export async function updateAdminProduct(productKey: string, payload: any) {
  const res = await axios.post(
    `${API_BASE_URL}/admin/products/${productKey}`,
    payload
  );
  return res.data;
}
