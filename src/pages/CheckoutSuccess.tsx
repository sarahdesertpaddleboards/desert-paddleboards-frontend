import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Download, Gift, Calendar, Package, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSessionTimeRange } from "@/lib/sessionTime";

type CheckoutOrder = {
  id: string;
  productKey: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string | null;
};

type BookedSession = {
  id: number;
  classProductId: number;
  startTime: string;
  endTime?: string | null;
  venueName?: string | null;
  venueCity?: string | null;
  venueState?: string | null;
  venueTimezone?: string | null;
  className?: string | null;
  productKey?: string | null;
};

type Participant = {
  firstName?: string;
  lastName?: string;
  age?: string;
  email?: string;
};

type CheckoutSuccessResponse = {
  order: CheckoutOrder | null;
  downloadToken: string | null;
  pending?: boolean;
  sessionId?: string | null;
  bookedQuantity?: number;
  bookedSession?: BookedSession | null;
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

function successHeadline(deliveryType: "digital" | "gift" | "booking" | "merch") {
  switch (deliveryType) {
    case "booking":
      return "Your booking is confirmed";
    case "digital":
      return "Your digital purchase is ready";
    case "gift":
      return "Your gift purchase is confirmed";
    case "merch":
      return "Your order is confirmed";
    default:
      return "Thank you for your purchase";
  }
}

function successSubcopy(deliveryType: "digital" | "gift" | "booking" | "merch", bookedSession?: BookedSession | null) {
  switch (deliveryType) {
    case "booking":
      return bookedSession
        ? "Your session has been booked successfully. Here are the details for your upcoming experience."
        : "Your session request has been received and your details have been recorded.";
    case "digital":
      return "Your payment was successful and your digital item is being prepared.";
    case "gift":
      return "Your payment was successful and your gift certificate will be sent shortly.";
    case "merch":
      return "Your payment was successful and your order is being processed.";
    default:
      return "Your payment was successful.";
  }
}

function formatSessionRange(session: BookedSession) {
  return formatSessionTimeRange(
    session.startTime,
    session.endTime || session.startTime,
    session.venueTimezone || undefined
  );
}

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CheckoutSuccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);

  const bookingSessionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id");
  }, []);

  useEffect(() => {
    const sessionId = bookingSessionId;

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
  }, [bookingSessionId]);

  useEffect(() => {
    if (!bookingSessionId) return;
    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;

    fetch(`${apiBase}/checkout/booking-details/${bookingSessionId}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return await res.json();
      })
      .then((payload) => {
        if (!payload) return;
        setSpecialRequests(payload.specialRequests || "");
        if (Array.isArray(payload.participants)) {
          setParticipants(payload.participants);
        }
      })
      .catch(() => undefined);
  }, [bookingSessionId]);

  useEffect(() => {
    const count = data?.bookedQuantity || 1;
    setParticipants((prev) => {
      const next = [...prev];
      while (next.length < count) next.push({ firstName: "", lastName: "", age: "", email: "" });
      return next.slice(0, count);
    });
  }, [data?.bookedQuantity]);

  if (loading) return <div className="p-8">Loading your order…</div>;
  if (!data) return <div className="p-8">Order not found</div>;
  if (data.pending) {
    return <div className="p-8">Your order is still being processed. Please refresh in a moment.</div>;
  }
  if (!data.order) return <div className="p-8">Order not found</div>;

  const deliveryType = inferDeliveryType(data.order.productKey);

  async function saveBookingDetails() {
    if (!bookingSessionId) return;
    try {
      setSaving(true);
      setSaved(false);
      const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${apiBase}/checkout/booking-details/${bookingSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialRequests, participants }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50 py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex w-20 h-20 justify-center items-center rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold mb-3">{successHeadline(deliveryType)}</h1>
          <p className="text-gray-600">{successSubcopy(deliveryType, data.bookedSession)}</p>
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
                      ? "Your file is ready now."
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
                  <h3 className="text-xl font-bold">Gift certificate purchased</h3>
                  <p className="text-gray-600">
                    Your gift certificate is queued for delivery and should arrive by email shortly.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {deliveryType === "merch" && (
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold">Merchandise order received</h3>
                  <p className="text-gray-600">
                    Your order has been received and will be processed for fulfillment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {deliveryType === "booking" && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4 items-center">
                  <Calendar className="w-8 h-8 text-teal-600" />
                  <div>
                    <h3 className="text-xl font-bold">Session booking confirmed</h3>
                    <p className="text-gray-600">
                      {data.bookedSession
                        ? "Your place is reserved. Here are the details for your upcoming experience."
                        : "We’ve recorded your booking and will follow up with any final details."}
                    </p>
                  </div>
                </div>

                {data.bookedSession && (
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-lg">
                        {data.bookedSession.className ?? "Booked session"}
                      </div>
                      <div className="text-sm font-medium text-teal-700">
                        {data.bookedQuantity || 1} {(data.bookedQuantity || 1) === 1 ? "spot" : "spots"} booked
                      </div>
                    </div>
                    <div className="flex gap-2 items-start text-sm text-gray-700">
                      <Clock className="w-4 h-4 mt-0.5" />
                      <span>{formatSessionRange(data.bookedSession)}</span>
                    </div>
                    <div className="flex gap-2 items-start text-sm text-gray-700">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>
                        {data.bookedSession.venueName ?? "Venue TBD"}
                        {data.bookedSession.venueCity && data.bookedSession.venueState
                          ? ` • ${data.bookedSession.venueCity}, ${data.bookedSession.venueState}`
                          : ""}
                      </span>
                    </div>
                    <div className="pt-2 flex gap-3 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
                          window.location.href = `${apiBase}/checkout/calendar/${data.order?.id}.ics`;
                        }}
                      >
                        Add to calendar (.ics)
                      </Button>
                    </div>

                    {(data.bookedQuantity || 1) > 1 && (
                      <div className="rounded-lg border bg-white p-4 space-y-4">
                        <div className="space-y-1">
                          <div className="font-semibold">Help us out by providing more information on who will be joining you</div>
                          <div className="text-sm text-muted-foreground">
                            Optional — useful if you’re booking on behalf of a group.
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Any special requests?</label>
                          <textarea
                            className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Anything we should know before your group arrives?"
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Button onClick={saveBookingDetails} disabled={saving}>
                            {saving ? "Saving…" : "Save details"}
                          </Button>
                          {saved && <span className="text-sm text-green-700">Details saved</span>}
                        </div>

                        <div className="space-y-4">
                          {participants.map((participant, i) => (
                            <div key={i} className="rounded-lg border p-3 space-y-3">
                              <div className="font-medium text-sm">Participant {i + 1}</div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <input className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="First name (optional)" value={participant.firstName || ""} onChange={(e) => setParticipants((prev) => prev.map((p, idx) => idx === i ? { ...p, firstName: e.target.value } : p))} />
                                <input className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Last name (optional)" value={participant.lastName || ""} onChange={(e) => setParticipants((prev) => prev.map((p, idx) => idx === i ? { ...p, lastName: e.target.value } : p))} />
                                <input className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Age (optional)" value={participant.age || ""} onChange={(e) => setParticipants((prev) => prev.map((p, idx) => idx === i ? { ...p, age: e.target.value } : p))} />
                                <input className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Email address (optional)" value={participant.email || ""} onChange={(e) => setParticipants((prev) => prev.map((p, idx) => idx === i ? { ...p, email: e.target.value } : p))} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
