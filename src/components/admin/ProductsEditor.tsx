import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

axios.defaults.withCredentials = true;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://desert-paddleboards-railway.up.railway.app";

export default function ProductsEditor() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  async function loadProducts() {
    const res = await axios.get(`${API_BASE_URL}/admin/store/products`, {
      withCredentials: true,
    });
    setProducts(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function updateProduct(id: number, updates: any) {
    try {
      setSaving(id);

      await axios.patch(`${API_BASE_URL}/admin/store/products/${id}`, updates, {
        withCredentials: true,
      });

      toast.success("Product updated!");
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Products</h2>

      <div className="space-y-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded p-4 space-y-2 bg-white shadow-sm"
          >
            <div className="font-semibold text-lg">{p.overrideName ?? p.name ?? `Product ${p.id}`}</div>
            <div className="text-sm text-gray-600">Override ID: {p.id}</div>
            <div className="text-sm text-gray-600">Product ID: {p.productId}</div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Override price:</span>
              <input
                type="number"
                className="border p-1 rounded w-32"
                defaultValue={typeof p.overridePrice === "number" ? p.overridePrice / 100 : ""}
                onBlur={(e) =>
                  updateProduct(p.id, {
                    overridePrice: e.target.value === "" ? null : Math.round(parseFloat(e.target.value) * 100),
                  })
                }
                disabled={saving === p.id}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Override name:</span>
              <input
                type="text"
                className="border p-1 rounded w-64"
                defaultValue={p.overrideName ?? ""}
                onBlur={(e) => updateProduct(p.id, { overrideName: e.target.value || null })}
                disabled={saving === p.id}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm">Digital object key:</div>
              <input
                type="text"
                className="border p-1 rounded w-full max-w-xl"
                defaultValue={p.digitalObjectKey ?? ""}
                onBlur={(e) => updateProduct(p.id, { digitalObjectKey: e.target.value || null })}
                disabled={saving === p.id}
                placeholder="e.g. sonoran-echoes.zip"
              />
              <div className="text-xs text-gray-500">
                Used for digital download fulfillment when this product maps to a private object in storage.
              </div>
            </div>

            {saving === p.id && (
              <div className="text-blue-600 text-sm">Saving...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
