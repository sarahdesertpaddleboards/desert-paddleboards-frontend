import { useEffect, useMemo, useState } from "react";
import ProductsEditor from "@/components/admin/ProductsEditor";
import OrdersManager from "@/components/admin/OrdersManager";
import GiftCertificatesManager from "@/components/admin/GiftCertificatesManager";
import ClassProductsEditor from "@/components/admin/classes/ClassProductsEditor";
import ClassSessionsEditor from "@/components/admin/classes/ClassSessionsEditor";
import { fetchAdminClassProducts, type AdminClassProduct } from "@/lib/adminApi";

type AdminTab = "products" | "orders" | "giftCertificates" | "classProducts" | "classSessions";

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>("products");
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

  const sessionsTabLabel = useMemo(() => {
    const selected = classProducts.find((p) => p.id === selectedClassProductId);
    return selected ? `Sessions (${selected.name})` : "Sessions";
  }, [classProducts, selectedClassProductId]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Blue Wave Experiences Admin</h1>

      <div className="flex gap-4 border-b pb-2 flex-wrap">
        <button
          onClick={() => setTab("products")}
          className={`pb-2 ${tab === "products" ? "border-b-2 border-blue-600" : ""}`}
        >
          Products
        </button>

        <button
          onClick={() => setTab("orders")}
          className={`pb-2 ${tab === "orders" ? "border-b-2 border-blue-600" : ""}`}
        >
          Orders
        </button>

        <button
          onClick={() => setTab("giftCertificates")}
          className={`pb-2 ${tab === "giftCertificates" ? "border-b-2 border-blue-600" : ""}`}
        >
          Gift Certificates
        </button>

        <button
          onClick={() => setTab("classProducts")}
          className={`pb-2 ${tab === "classProducts" ? "border-b-2 border-blue-600" : ""}`}
        >
          Experience Products
        </button>

        <button
          onClick={() => setTab("classSessions")}
          className={`pb-2 ${tab === "classSessions" ? "border-b-2 border-blue-600" : ""}`}
        >
          {sessionsTabLabel}
        </button>
      </div>

      {tab === "products" && <ProductsEditor />}
      {tab === "orders" && <OrdersManager />}
      {tab === "giftCertificates" && <GiftCertificatesManager />}
      {tab === "classProducts" && <ClassProductsEditor />}
      {tab === "classSessions" && (
        <ClassSessionsEditor
          classProductId={selectedClassProductId}
          classProducts={classProducts}
          onSelectClassProduct={setSelectedClassProductId}
        />
      )}
    </div>
  );
}
