import { useEffect, useState } from "react";
import { fetchStoreProduct } from "@/lib/storeApi";
import { submitCheckout } from "@/lib/shopApi";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";

export default function BuyProductPage() {
  const [match, params] = useRoute("/buy/:productKey");
  const productKey = params?.productKey;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!match || !productKey) return;

    fetchStoreProduct(productKey)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [match, productKey]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  async function handleBuy() {
    const checkout = await submitCheckout({
      productId: product.id,
      quantity: 1,
      email: "test@example.com",
      name: product.name,
    });

    const url = typeof checkout === "string" ? checkout : checkout?.url;
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p>{product.description}</p>
      <div className="text-xl font-semibold">
        ${(product.price / 100).toFixed(2)}
      </div>
      <Button onClick={handleBuy}>Checkout</Button>
    </div>
  );
}
