import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProductsEditor() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function loadProducts() {
    const res = await axios.get(`${API_BASE_URL}/admin/products`, {
      withCredentials: true,
    });
    setProducts(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function updateProduct(productKey: string, updates: any) {
    try {
      setSaving(productKey);

      await axios.post(
        `${API_BASE_URL}/admin/products/${productKey}`,
        updates,
        { withCredentials: true }
      );

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
            key={p.productKey}
            className="border rounded p-4 space-y-2 bg-white shadow-sm"
          >
            <div className="font-semibold text-lg">{p.name}</div>
            <div className="text-sm text-gray-600">{p.productKey}</div>

            {/* ACTIVE TOGGLE */}
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={p.active}
                onChange={(e) =>
                  updateProduct(p.productKey, { active: e.target.checked })
                }
                disabled={saving === p.productKey}
              />
              <span>{p.active ? "Active" : "Inactive"}</span>
            </label>

            {/* PRICE EDITOR */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Price:</span>
              <input
                type="number"
                className="border p-1 rounded w-32"
                defaultValue={p.price / 100}
                onBlur={(e) =>
                  updateProduct(p.productKey, {
                    price: Math.round(parseFloat(e.target.value) * 100),
                  })
                }
                disabled={saving === p.productKey}
              />
              <span className="text-sm">{p.currency.toUpperCase()}</span>
            </div>

            {/* TYPE SELECTOR */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Type:</span>
              <select
                className="border p-1 rounded"
                defaultValue={p.type}
                onChange={(e) =>
                  updateProduct(p.productKey, { type: e.target.value })
                }
                disabled={saving === p.productKey}
              >
                <option value="class">class</option>
                <option value="physical">physical</option>
                <option value="digital">digital</option>
              </select>
            </div>

            {saving === p.productKey && (
              <div className="text-blue-600 text-sm">Saving...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
