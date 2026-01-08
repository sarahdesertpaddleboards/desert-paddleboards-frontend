import { useEffect, useState } from "react";
import { fetchShopProducts, createCheckout, ShopProduct } from "@/lib/shopApi";
import { toast } from "sonner";

export default function Shop() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchShopProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(productKey: string) {
    try {
      const url = await createCheckout(productKey);
      window.location.href = url; // redirect to Stripe checkout
    } catch (err) {
      console.error(err);
      toast.error("Unable to start checkout");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8">Loading shop…</div>;

  return (
    <div className="p-8 space-y-10 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Shop</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {products.map(p => (
          <div
            key={p.productKey}
            className="border rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-2xl font-semibold">{p.name}</h2>

            <p className="text-gray-600 mt-2 mb-4">{p.description}</p>

            <div className="text-lg font-mono mb-4">
              ${(p.price / 100).toFixed(2)} {p.currency.toUpperCase()}
            </div>

            <button
              onClick={() => handleBuy(p.productKey)}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
