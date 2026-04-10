import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminGiftCertificates, type AdminGiftCertificate } from "@/lib/adminGiftCertificatesApi";

function formatMoney(amount?: number | null, currency?: string | null) {
  if (typeof amount !== "number") return "—";
  return `$${(amount / 100).toFixed(2)} ${String(currency || "usd").toUpperCase()}`;
}

function normalizedStatus(item: AdminGiftCertificate) {
  return String(item.status || (item.redeemed ? "redeemed" : "active")).toLowerCase();
}

function statusTone(status: string) {
  switch (status) {
    case "redeemed":
      return "bg-slate-100 text-slate-700";
    case "inactive":
    case "cancelled":
      return "bg-red-50 text-red-600";
    default:
      return "bg-emerald-50 text-emerald-700";
  }
}

export default function GiftCertificatesManager() {
  const [items, setItems] = useState<AdminGiftCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "redeemed">("all");

  useEffect(() => {
    fetchAdminGiftCertificates()
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    let active = 0;
    let redeemed = 0;
    let originalValue = 0;
    let remainingValue = 0;

    for (const item of items) {
      const status = normalizedStatus(item);
      if (status === "redeemed") redeemed += 1;
      else active += 1;
      originalValue += item.originalAmount ?? 0;
      remainingValue += item.remainingAmount ?? 0;
    }

    return {
      total: items.length,
      active,
      redeemed,
      originalValue,
      remainingValue,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const status = normalizedStatus(item);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return [
        item.generatedCode,
        item.productKey,
        item.purchaserEmail,
        item.recipientName,
        item.recipientEmail,
        item.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [items, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Gift Certificates</h2>
        <p className="text-muted-foreground">
          Review issued gift certificates, balances, recipients, and redemption status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1">{summary.total} total</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{summary.active} active</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">{summary.redeemed} redeemed</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Original value: {formatMoney(summary.originalValue, "usd")}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Remaining value: {formatMoney(summary.remainingValue, "usd")}</span>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Search by code, email, recipient, or status"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              className="border rounded-md px-3 py-2 bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading gift certificates…</p>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground space-y-2">
              <div>No gift certificates found.</div>
              <div>Try clearing the search, changing the status filter, or create a gift certificate product in Catalog first.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const status = normalizedStatus(item);
                return (
                  <div key={item.id} className="rounded-xl border p-4 space-y-3 bg-white">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-lg">{item.generatedCode}</div>
                          <span className={`rounded-full px-2.5 py-1 text-xs ${statusTone(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{item.productKey}</div>
                      </div>
                      <div className="text-sm md:text-right">
                        <div className="font-medium">Remaining: {formatMoney(item.remainingAmount, item.currency)}</div>
                        <div className="text-muted-foreground">Original: {formatMoney(item.originalAmount, item.currency)}</div>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                      <div>Purchaser: {item.purchaserEmail || "—"}</div>
                      <div>Recipient: {item.recipientName || item.recipientEmail || "—"}</div>
                      <div>Status: {status}</div>
                      <div>Created: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</div>
                    </div>

                    {item.message ? (
                      <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                        <div className="font-medium">Gift message</div>
                        <div>{item.message}</div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
