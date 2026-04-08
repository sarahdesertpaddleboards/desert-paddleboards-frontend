import axios from "axios";
import { ADMIN_API_BASE } from "@/lib/adminBase";

axios.defaults.withCredentials = true;

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
  const res = await axios.get(`${ADMIN_API_BASE}/admin/orders`, {
    withCredentials: true,
  });
  return res.data;
}

export async function resendDownload(id: number): Promise<void> {
  await axios.post(
    `${ADMIN_API_BASE}/admin/orders/${id}/resend`,
    {},
    { withCredentials: true }
  );
}
