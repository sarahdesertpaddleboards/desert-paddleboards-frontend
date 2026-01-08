import { useEffect, useState } from "react";
import { fetchOrders, resendDownload, AdminOrder } from "@/lib/adminOrdersApi";
import { toast } from "sonner";

export default function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleResend(id: number) {
    try {
      await resendDownload(id);
      toast.success("Download email re-sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend email");
    }
  }

  function exportCSV() {
    const rows = orders.map(o => [
      o.id,
      o.email ?? "",
      o.productKey,
      (o.amount / 100).toFixed(2),
      o.currency,
      o.stripeSessionId,
      o.createdAt,
    ]);

    const csv =
      "id,email,productKey,amount,currency,stripeSession,createdAt\n" +
      rows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  }

  if (loading) return <div className="p-4">Loading orders…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
        <button
          onClick={exportCSV}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{order.productKey}</div>
              <div className="text-sm text-gray-600">{order.email}</div>
              <div className="text-sm">
                ${(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">{order.createdAt}</div>
            </div>

            <button
              onClick={() => handleResend(order.id)}
              className="text-blue-600 underline"
            >
              Resend Email
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
