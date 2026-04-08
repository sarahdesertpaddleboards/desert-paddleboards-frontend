import axios from "axios";
import { ADMIN_API_BASE } from "@/lib/adminBase";

axios.defaults.withCredentials = true;

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
  const { data } = await axios.get(`${ADMIN_API_BASE}/admin/gift-certificates`);
  return Array.isArray(data) ? data : [];
}
