import { useEffect, useState } from "react";
import { fetchStoreProducts } from "@/lib/storeApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading products…</div>;

  return (
    <div className="p-8 mx-auto max-w-4xl space-y-6">
      <h1 className="text-4xl font-bold mb-4">Shop</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p: any) => (
          <Card key={p.productKey}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{p.name}</h2>
              <p>{p.description}</p>

              <div className="text-lg font-semibold">
                ${(p.price / 100).toFixed(2)}
              </div>

              <Button onClick={() => navigate(`/buy/${p.productKey}`)}>
                Purchase
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
