import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export type AdminOrder = {
  id: number;
  email: string | null;
  productKey: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  createdAt: string;
};

export async function fetchOrders(): Promise<AdminOrder[]> {
  const res = await axios.get(`${API_BASE}/admin/orders`, {
    withCredentials: true,
  });
  return res.data;
}

export async function resendDownload(id: number): Promise<void> {
  await axios.post(
    `${API_BASE}/admin/orders/${id}/resend`,
    {},
    { withCredentials: true }
  );
}
