// src/pages/BuyProductPage.tsx
// Handles ALL product types, including class products + sessions

import { useEffect, useState } from "react";
import { useRoute } from "wouter";

import { publicApi } from "@/lib/publicApi";
import { submitCheckout } from "@/lib/shopApi";
import { Button } from "@/components/ui/button";

export default function BuyProductPage() {
  const [match, params] = useRoute("/buy/:productKey");
  const productKey = params?.productKey;

  const [product, setProduct] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  useEffect(() => {
    if (!productKey) return;

    publicApi
      .get(`/products/${productKey}`)
      .then((res) => {
        setProduct(res.data);

        // If it’s a class product, load sessions immediately
        if (res.data?.type === "class") {
          loadSessions(res.data.id);
        }
      })
      .catch((err) => {
        console.error("LOAD PRODUCT ERROR", err);
      });
  }, [productKey]);

  async function loadSessions(classProductId: number) {
    try {
      const res = await publicApi.get(`/class-products/${classProductId}/sessions`);
      setSessions(res.data || []);
    } catch (err) {
      console.error("LOAD SESSIONS ERROR", err);
    }
  }

  if (!product) {
    return <div className="p-6">Loading product...</div>;
  }

  const priceFormatted = (product.price / 100).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

      <p className="text-gray-700 mb-4">{product.description}</p>

      <p className="text-xl font-semibold mb-6">${priceFormatted}</p>

      {/* CLASS PRODUCT WORKFLOW */}
      {product.type === "class" && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Choose a session:</h2>

          {sessions.length === 0 && (
            <p className="text-gray-500">No sessions available right now.</p>
          )}

          <div className="space-y-3">
            {sessions.map((s) => {
              const start = new Date(s.startTime).toLocaleString();
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s.id)}
                  className={`border p-3 rounded cursor-pointer ${
                    selectedSession === s.id ? "bg-blue-100" : "bg-white"
                  }`}
                >
                  <div className="font-medium">{start}</div>
                  <div className="text-xs text-gray-500">
                    {s.seatsAvailable} seats remaining
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUY BUTTON */}
      <Button
        disabled={product.type === "class" && !selectedSession}
        onClick={() =>
          submitCheckout({
            productKey,
            sessionId: selectedSession || undefined,
          })
        }
        className="mt-6 w-full"
      >
        Buy Now (${priceFormatted})
      </Button>
    </div>
  );
}
