import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProductsEditor() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {products.map((p: any) => (
        <div key={p.productKey} className="border p-4 rounded-md">
          <div className="font-semibold">{p.name}</div>
          <div className="text-sm text-gray-600">
            {p.productKey} · {p.type}
          </div>

          <div className="mt-2">
            ${(p.price / 100).toFixed(2)} {p.currency.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}
