import { useEffect, useMemo, useState } from "react";
import ProductsEditor from "@/components/admin/ProductsEditor";
import OrdersManager from "@/components/admin/OrdersManager";
import ClassProductsEditor from "@/components/admin/classes/ClassProductsEditor";
import ClassSessionsEditor from "@/components/admin/classes/ClassSessionsEditor";
import { fetchAdminClassProducts, type AdminClassProduct } from "@/lib/adminApi";

type AdminTab = "catalog" | "orders" | "experienceProducts" | "scheduleSessions";

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>("catalog");
  const [classProducts, setClassProducts] = useState<AdminClassProduct[]>([]);
  const [selectedClassProductId, setSelectedClassProductId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminClassProducts().then((items) => {
      const list = Array.isArray(items) ? items : [];
      setClassProducts(list);
      if (!selectedClassProductId && list[0]?.id) {
        setSelectedClassProductId(list[0].id);
      }
    });
  }, []);

  const selectedExperienceProduct = useMemo(
    () => classProducts.find((p) => p.id === selectedClassProductId) ?? null,
    [classProducts, selectedClassProductId],
  );

  const pageTitle = useMemo(() => {
    switch (tab) {
      case "catalog":
        return "Catalog";
      case "experienceProducts":
        return "Experience Products";
      case "scheduleSessions":
        return "Schedule Sessions";
      case "orders":
      default:
        return "Orders";
    }
  }, [tab]);

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Blue Wave Experiences Admin</h1>
      </div>

      <div className="flex gap-4 border-b pb-2 flex-wrap">
        <button
          onClick={() => setTab("catalog")}
          className={`pb-2 ${tab === "catalog" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Catalog
        </button>

        <button
          onClick={() => setTab("experienceProducts")}
          className={`pb-2 ${tab === "experienceProducts" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Experience Products
        </button>

        <button
          onClick={() => setTab("scheduleSessions")}
          className={`pb-2 ${tab === "scheduleSessions" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Schedule Sessions
        </button>

        <button
          onClick={() => setTab("orders")}
          className={`pb-2 ${tab === "orders" ? "border-b-2 border-blue-600 font-medium" : ""}`}
        >
          Orders
        </button>
      </div>

      {tab === "scheduleSessions" && selectedExperienceProduct ? (
        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-sm text-muted-foreground">
            {selectedExperienceProduct.name}
          </p>
        </div>
      ) : null}

      {tab === "catalog" && <ProductsEditor />}
      {tab === "orders" && <OrdersManager />}
      {tab === "experienceProducts" && <ClassProductsEditor />}
      {tab === "scheduleSessions" && (
        <ClassSessionsEditor
          classProductId={selectedClassProductId}
          classProducts={classProducts}
          onSelectClassProduct={setSelectedClassProductId}
        />
      )}
    </div>
  );
}
