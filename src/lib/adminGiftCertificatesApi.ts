import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://desert-paddleboards-backend-production.up.railway.app");

export type AdminGiftCertificate = {
  id: number;
  purchaseId: number;
  productKey: string;
  generatedCode: string;
  originalAmount?: number | null;
  remainingAmount?: number | null;
  currency?: string | null;
  purchaserEmail?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  status?: string | null;
  redeemed?: boolean | null;
  createdAt?: string | null;
};

export async function fetchAdminGiftCertificates(): Promise<AdminGiftCertificate[]> {
  const { data } = await axios.get(`${API_BASE}/admin/gift-certificates`);
  return Array.isArray(data) ? data : [];
}
