import { useEffect, useMemo, useState } from "react";
import { fetchOrders, resendDownload, AdminOrder } from "@/lib/adminOrdersApi";
import { toast } from "sonner";

function formatMoney(amount: number, currency: string) {
  return `$${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function inferOrderType(productKey: string) {
  const key = String(productKey || "").toLowerCase();
  if (key.includes("gift-certificate") || key.includes("gift")) return "Gift certificate";
  if (key.includes("soundbath") || key.includes("session") || key.includes("class") || key.includes("experience")) return "Experience booking";
  if (key.includes("digital") || key.includes("download")) return "Digital product";
  return "Catalog item";
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "experience" | "gift" | "digital" | "catalog">("all");
  const [resendingId, setResendingId] = useState<number | null>(null);

  async function load() {
    try {
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
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
      setResendingId(id);
      await resendDownload(id);
      toast.success("Email re-sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend email");
    } finally {
      setResendingId(null);
    }
  }

  function exportCSV() {
    const rows = orders.map((o) => [
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
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  }

  const summary = useMemo(() => {
    let totalValue = 0;
    let experiences = 0;
    let gifts = 0;
    let digital = 0;

    for (const order of orders) {
      totalValue += order.amount ?? 0;
      const kind = inferOrderType(order.productKey);
      if (kind === "Experience booking") experiences += 1;
      else if (kind === "Gift certificate") gifts += 1;
      else if (kind === "Digital product") digital += 1;
    }

    return {
      total: orders.length,
      totalValue,
      experiences,
      gifts,
      digital,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return orders.filter((order) => {
      const kind = inferOrderType(order.productKey);
      if (typeFilter === "experience" && kind !== "Experience booking") return false;
      if (typeFilter === "gift" && kind !== "Gift certificate") return false;
      if (typeFilter === "digital" && kind !== "Digital product") return false;
      if (typeFilter === "catalog" && kind !== "Catalog item") return false;

      if (!q) return true;
      return [order.productKey, order.email, order.stripeSessionId, kind]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [orders, query, typeFilter]);

  if (loading) return <div className="p-4">Loading orders…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold">Orders</h2>
        <button
          onClick={exportCSV}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">{summary.total} orders</span>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">{summary.experiences} experiences</span>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">{summary.gifts} gifts</span>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">{summary.digital} digital</span>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">Total value: {formatMoney(summary.totalValue, "usd")}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="text"
          className="border rounded-lg px-3 py-2"
          placeholder="Search by product, email, or session id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
        >
          <option value="all">All order types</option>
          <option value="experience">Experience bookings</option>
          <option value="gift">Gift certificates</option>
          <option value="digital">Digital products</option>
          <option value="catalog">Other catalog items</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground space-y-2">
            <div>No orders match the current search/filter.</div>
            <div>Try clearing the search or switching order type.</div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const kind = inferOrderType(order.productKey);
            const isGift = kind === "Gift certificate";
            return (
              <div
                key={order.id}
                className="border rounded-xl p-4 bg-white shadow-sm space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{order.productKey}</div>
                      <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                        {kind}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Customer: {order.email || "—"}</div>
                    <div className="text-sm text-gray-600">Stripe session: {order.stripeSessionId}</div>
                  </div>

                  <div className="text-sm md:text-right">
                    <div className="font-medium">{formatMoney(order.amount, order.currency)}</div>
                    <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleResend(order.id)}
                    disabled={resendingId === order.id}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {resendingId === order.id ? "Resending..." : isGift ? "Resend receipt" : "Resend email"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
