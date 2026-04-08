import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminGiftCertificates, type AdminGiftCertificate } from "@/lib/adminGiftCertificatesApi";

function formatMoney(amount?: number | null, currency?: string | null) {
  if (typeof amount !== "number") return "—";
  return `$${(amount / 100).toFixed(2)} ${String(currency || "usd").toUpperCase()}`;
}

export default function GiftCertificatesManager() {
  const [items, setItems] = useState<AdminGiftCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchAdminGiftCertificates()
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [
        item.generatedCode,
        item.productKey,
        item.purchaserEmail,
        item.recipientName,
        item.recipientEmail,
        item.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Gift Certificates</h2>
        <p className="text-muted-foreground">Search issued gift certificates, review balances, and check status.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            placeholder="Search by code, email, recipient, or status"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading gift certificates…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gift certificates found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="rounded-xl border p-4 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <div className="font-semibold text-lg">{item.generatedCode}</div>
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
                    <div>Status: {item.status || (item.redeemed ? "redeemed" : "active")}</div>
                    <div>Created: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
