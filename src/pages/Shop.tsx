import { useEffect, useMemo, useState } from "react";
import { fetchStoreProducts } from "@/lib/storeApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, ShoppingBag } from "lucide-react";
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
  const [selectedGiftKey, setSelectedGiftKey] = useState("");
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        const gifts = list.filter((p) => (p.type || "").toLowerCase() === "gift").sort((a, b) => (a.price || 0) - (b.price || 0));
        const defaultGift = gifts[gifts.length - 1];
        if (defaultGift?.productKey) setSelectedGiftKey(defaultGift.productKey);
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
  }, [products]);

  const giftProducts = useMemo(
    () => sortedProducts.filter((p) => (p.type || "").toLowerCase() === "gift"),
    [sortedProducts]
  );

  const otherProducts = useMemo(
    () => sortedProducts.filter((p) => (p.type || "").toLowerCase() !== "gift"),
    [sortedProducts]
  );

  const selectedGiftProduct = useMemo(
    () => giftProducts.find((p) => p.productKey === selectedGiftKey) ?? giftProducts[0] ?? null,
    [giftProducts, selectedGiftKey]
  );

  function renderProductCard(p: StoreProduct) {
    const isGift = (p.type || "").toLowerCase() === "gift";

    return (
      <Card key={p.productKey} className={isGift ? "border-primary/20 hover:shadow-lg transition-shadow" : "hover:shadow-md transition-shadow"}>
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
              {isGift ? "Choose gift certificate" : "Purchase"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <div className="p-6">Loading products…</div>;

  return (
    <div className="p-8 mx-auto max-w-5xl space-y-10">
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-4xl font-bold">Shop</h1>
        <p className="text-muted-foreground text-lg">
          Browse gift certificates, digital sound journeys, and signature Blue Wave Experiences products.
        </p>
      </div>

      {sortedProducts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No products available right now.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {giftProducts.length > 0 && selectedGiftProduct && (
            <section className="space-y-5">
              <div className="rounded-2xl border bg-primary/5 p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Gift className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Gift certificates</span>
                </div>
                <h2 className="text-2xl font-bold">Give a Blue Wave experience</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Choose a gift certificate amount and let someone enjoy floating soundbaths, wellness sessions, and memorable time on the water.
                </p>
              </div>

              <Card className="border-primary/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge variant="secondary">Gift</Badge>
                      <h2 className="text-2xl font-bold">Blue Wave Experiences Gift Certificate</h2>
                    </div>
                    <div className="text-lg font-semibold whitespace-nowrap">
                      ${(selectedGiftProduct.price / 100).toFixed(2)}
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    {selectedGiftProduct.description}
                  </p>

                  <div className="space-y-2 max-w-sm">
                    <label className="text-sm font-medium">Choose amount</label>
                    <select
                      className="border rounded-lg px-3 py-2 w-full"
                      value={selectedGiftProduct.productKey}
                      onChange={(e) => setSelectedGiftKey(e.target.value)}
                    >
                      {giftProducts.map((gift) => (
                        <option key={gift.productKey} value={gift.productKey}>
                          ${(gift.price / 100).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => navigate(`/buy/${selectedGiftProduct.productKey}`)}>
                      Choose gift certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {otherProducts.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                {otherProducts.some((p) => (p.type || "").toLowerCase() === "digital") ? (
                  <Sparkles className="h-5 w-5" />
                ) : (
                  <ShoppingBag className="h-5 w-5" />
                )}
                <h2 className="text-2xl font-bold text-foreground">More from Blue Wave Experiences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherProducts.map(renderProductCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
