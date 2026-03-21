import { useEffect, useMemo, useState } from "react";
import { fetchStoreProducts } from "@/lib/storeApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

type StoreProduct = {
  productKey: string;
  name: string;
  description: string;
  price: number;
  type?: string;
};

function labelForType(type?: string) {
  switch ((type || "").toLowerCase()) {
    case "digital":
      return "Digital";
    case "gift":
      return "Gift";
    case "physical":
      return "Merch";
    default:
      return "Store";
  }
}

export default function Shop() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
  }, [products]);

  if (loading) return <div className="p-6">Loading products…</div>;

  return (
    <div className="p-8 mx-auto max-w-5xl space-y-8">
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-4xl font-bold">Shop</h1>
        <p className="text-muted-foreground text-lg">
          Browse gift certificates, digital sound journeys, and signature Desert Paddleboards products.
        </p>
      </div>

      {sortedProducts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No products available right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedProducts.map((p) => (
            <Card key={p.productKey} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Badge variant="secondary">{labelForType(p.type)}</Badge>
                    <h2 className="text-2xl font-bold">{p.name}</h2>
                  </div>
                  <div className="text-lg font-semibold whitespace-nowrap">
                    ${(p.price / 100).toFixed(2)}
                  </div>
                </div>

                <p className="text-muted-foreground">{p.description}</p>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => navigate(`/buy/${p.productKey}`)}>
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
