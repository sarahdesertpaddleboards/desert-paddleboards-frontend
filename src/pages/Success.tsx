import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Download, Gift, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Purchase = {
  id: number;
  productKey: string;
  title: string;
  type: "digital" | "gift" | "class" | string;
};

type SuccessResponse = {
  sessionId: string;
  customerEmail?: string;
  purchases: Purchase[];
};

export default function Success() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<SuccessResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) return;

    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/checkout/success/${sessionId}`
    )
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center">Loading your order…</div>;
  }

  if (!data) {
    return <div className="p-12 text-center">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50 py-16">
      <div className="container max-w-4xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold mb-3">
            Thank you for your purchase
          </h1>

          <p className="text-gray-600">
            Your payment was successful
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Order ID: {data.sessionId.slice(-12).toUpperCase()}
          </p>
        </div>

        {/* Purchases */}
        <div className="space-y-6">
          {data.purchases.map(purchase => {
            switch (purchase.type) {
              case "digital":
                return (
                  <Card key={purchase.id}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {purchase.title}
                        </h3>
                        <p className="text-gray-600">
                          Your download is ready
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          window.location.href = `/downloads/${purchase.id}`
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                );

              case "gift":
                return (
                  <Card key={purchase.id}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <Gift className="w-8 h-8 text-amber-600" />
                      <div>
                        <h3 className="text-xl font-bold">
                          {purchase.title}
                        </h3>
                        <p className="text-gray-600">
                          Your gift certificate will arrive by email
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );

              case "class":
                return (
                  <Card key={purchase.id}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-teal-600" />
                      <div>
                        <h3 className="text-xl font-bold">
                          {purchase.title}
                        </h3>
                        <p className="text-gray-600">
                          We’ll be in touch to schedule your experience
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );

              default:
                return null;
            }
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
