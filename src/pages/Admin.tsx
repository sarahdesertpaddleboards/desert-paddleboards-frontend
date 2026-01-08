import { useState } from "react";
import ProductsEditor from "@/components/admin/ProductsEditor";
import OrdersManager from "@/components/admin/OrdersManager"; // empty for now

export default function Admin() {
  const [tab, setTab] = useState<"products" | "orders">("products");

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Sarah's Admin Dashboard</h1>

      {/* Simple tab switcher */}
      <div className="flex gap-4 border-b pb-2">
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
      </div>

      {tab === "products" && <ProductsEditor />}
      {tab === "orders" && <OrdersManager />}
    </div>
  );
}
