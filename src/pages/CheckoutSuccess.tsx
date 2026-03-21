import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Download, Gift, Calendar, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CheckoutOrder = {
  id: string;
  productKey: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string | null;
};

type CheckoutSuccessResponse = {
  order: CheckoutOrder | null;
  downloadToken: string | null;
  pending?: boolean;
  sessionId?: string | null;
};

function inferDeliveryType(productKey: string): "digital" | "gift" | "booking" | "merch" {
  const key = productKey.toLowerCase();
  if (key.includes("gift")) return "gift";
  if (key.includes("sound") || key.includes("class") || key.includes("session") || key.includes("bath")) {
    return "booking";
  }
  if (key.includes("album") || key.includes("download") || key.includes("digital")) {
    return "digital";
  }
  return "merch";
}

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CheckoutSuccessResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;

    fetch(`${apiBase}/checkout/success/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as CheckoutSuccessResponse;
      })
      .then((parsed) => setData(parsed))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading your order…</div>;

  if (!data) return <div className="p-8">Order not found</div>;

  if (data.pending) {
    return <div className="p-8">Your order is still being processed. Please refresh in a moment.</div>;
  }

  if (!data.order) return <div className="p-8">Order not found</div>;

  const deliveryType = inferDeliveryType(data.order.productKey);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50 py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex w-20 h-20 justify-center items-center rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold mb-3">Thank you for your purchase</h1>
          <p className="text-gray-600">Your payment was successful</p>
          <p className="text-sm text-gray-400 mt-2">
            Order ID: {data.order.id.slice(-12).toUpperCase()}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold">Order summary</h3>
              <p className="text-gray-600">Product: {data.order.productKey}</p>
            </div>

            <div className="text-lg font-semibold">
              ${(data.order.amount / 100).toFixed(2)} {data.order.currency.toUpperCase()}
            </div>

            {data.order.customerEmail && (
              <p className="text-sm text-gray-600">Confirmation email: {data.order.customerEmail}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 mt-6">
          {deliveryType === "digital" && (
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Your digital download</h3>
                  <p className="text-gray-600">
                    {data.downloadToken
                      ? "Your file is ready."
                      : "Your download is being prepared. Please check back shortly."}
                  </p>
                </div>
                <Button disabled={!data.downloadToken}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          )}

          {deliveryType === "gift" && (
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <Gift className="w-8 h-8 text-amber-600" />
                <div>
                  <h3 className="text-xl font-bold">Gift Certificate</h3>
                  <p className="text-gray-600">Your gift certificate will be emailed shortly.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {deliveryType === "merch" && (
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold">Your merchandise order</h3>
                  <p className="text-gray-600">We will ship it to your provided address.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {deliveryType === "booking" && (
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <Calendar className="w-8 h-8 text-teal-600" />
                <div>
                  <h3 className="text-xl font-bold">Experience booking</h3>
                  <p className="text-gray-600">
                    {data.sessionId
                      ? `Your selected session has been recorded (session ${data.sessionId}). We’ll be in touch to confirm the details.`
                      : "We’ll be in touch to confirm your session."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
