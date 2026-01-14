// src/pages/Shop.tsx

import { useEffect, useState } from "react";
import { fetchStoreProducts } from "@/lib/shopApi";   // NEW store API
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  // Load unified store products (gift cards, merch, downloads)
  useEffect(() => {
    fetchStoreProducts()
      .then((res) => {
        setProducts(res.products || []);   // backend returns { products: [...] }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading products…</div>;

  return (
    <div className="p-8 mx-auto max-w-4xl space-y-6">
      <h1 className="text-4xl font-bold mb-4">Shop</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product: any) => (
          <Card key={product.productKey}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p>{product.description}</p>

              <div className="text-lg font-semibold">
                ${(product.price / 100).toFixed(2)}
              </div>

              <Button onClick={() => navigate(`/buy/${product.productKey}`)}>
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
