import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { fetchPublicProducts } from "@/lib/publicApi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function BuyProductPage() {
  const { productKey } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetchPublicProducts().then(products =>
      setProduct(products.find(p => p.productKey === productKey))
    );
  }, [productKey]);

  if (!product) return <div className="p-8">Loading…</div>;

  async function startCheckout() {
    const res = await axios.post(`${API_BASE_URL}/checkout/start`, {
      productKey,
      quantity: 1,
    });

    window.location.href = res.data.url;
  }

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p>{product.description}</p>

      <div className="text-xl font-semibold">
        ${(product.price / 100).toFixed(2)}
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded"
        onClick={startCheckout}
      >
        Buy Now
      </button>
    </div>
  );
}
