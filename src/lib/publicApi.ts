import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function fetchPublicProducts() {
  const res = await axios.get(`${API_BASE_URL}/products`);
  return res.data;
}
