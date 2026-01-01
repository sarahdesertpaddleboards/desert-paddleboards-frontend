import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Download, Gift, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Backend response contract
 * DO NOT guess or extend this on the frontend
 */
type Delivery = {
  purchaseId: number;
  productKey: string;
  type: "digital" | "gift" | "booking";
};

type CheckoutSuccessResponse = {
  sessionId: string;
  status: "paid" | "fulfilled";
  customerEmail?: string | null;
  deliveries: Delivery[];
};

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CheckoutSuccessResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * On page load:
   * 1) Read session_id from URL (Stripe redirect)
   * 2) Ask backend what was purchased and how to deliver it
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/checkout/success/${sessionId}`
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to load order");
        return res.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your order…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50 py-16">
      <div className="container max-w-4xl">

        {/* Success header */}
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

        {/* Delivery cards */}
        <div className="space-y-6">
          {data.deliveries.map(delivery => {
            switch (delivery.type) {
              case "digital":
                return (
                  <Card key={delivery.purchaseId}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          Your digital download
                        </h3>
                        <p className="text-gray-600">
                          Your file is ready
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          (window.location.href = `/downloads/${delivery.purchaseId}`)
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
                  <Card key={delivery.purchaseId}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <Gift className="w-8 h-8 text-amber-600" />
                      <div>
                        <h3 className="text-xl font-bold">
                          Gift certificate
                        </h3>
                        <p className="text-gray-600">
                          This will arrive by email shortly
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );

              case "booking":
                return (
                  <Card key={delivery.purchaseId}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-teal-600" />
                      <div>
                        <h3 className="text-xl font-bold">
                          Experience booking
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
