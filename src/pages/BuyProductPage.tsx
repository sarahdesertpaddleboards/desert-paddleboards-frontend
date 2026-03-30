import { useEffect, useMemo, useState } from "react";
import { fetchStoreProduct } from "@/lib/storeApi";
import { submitCheckout } from "@/lib/shopApi";
import { fetchSession, fetchClassProducts } from "@/lib/classApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRoute } from "wouter";

type BuyableProduct = {
  productKey: string;
  name: string;
  description: string;
  price: number;
  type?: string;
  productType?: string;
};

type ClassProduct = {
  id: number;
  productKey: string;
  productType: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
};

type SelectedSession = {
  id: number;
  startTime: string;
  endTime?: string;
  venueName?: string | null;
  venueCity?: string | null;
  venueState?: string | null;
  className?: string | null;
};

function labelForType(type?: string) {
  switch ((type || "").toLowerCase()) {
    case "digital":
      return "Digital product";
    case "gift":
      return "Gift certificate";
    case "physical":
      return "Merchandise";
    case "class":
    case "private-event":
    case "booking":
      return "Booking";
    default:
      return "Store item";
  }
}

function formatSessionRange(session: SelectedSession | null) {
  if (!session?.startTime) return "";
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : null;
  if (Number.isNaN(start.getTime())) return "";
  if (end && !Number.isNaN(end.getTime())) {
    return `${start.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} – ${end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return start.toLocaleString();
}

function looksLikeEmail(value: string) {
  return /.+@.+\..+/.test(value.trim());
}

function isBookingFlow(product: BuyableProduct | null, session: SelectedSession | null) {
  if (session) return true;
  const type = (product?.type || product?.productType || "").toLowerCase();
  return type === "class" || type === "private-event" || type === "booking";
}

async function fetchBuyableProduct(productKey: string): Promise<BuyableProduct | null> {
  try {
    const storeProduct = await fetchStoreProduct(productKey);
    if (storeProduct) return storeProduct;
  } catch {
    // fall through to class product lookup
  }

  try {
    const classProducts = (await fetchClassProducts()) as ClassProduct[];
    const matched = Array.isArray(classProducts)
      ? classProducts.find((item) => item.productKey === productKey)
      : null;

    if (!matched) return null;

    return {
      productKey: matched.productKey,
      name: matched.name,
      description: matched.description,
      price: matched.price,
      type: matched.productType,
      productType: matched.productType,
    };
  } catch {
    return null;
  }
}

export default function BuyProductPage() {
  const [match, params] = useRoute("/buy/:productKey");
  const productKey = params?.productKey;
  const [product, setProduct] = useState<BuyableProduct | null>(null);
  const [session, setSession] = useState<SelectedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const sessionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("sessionId");
    const parsed = raw ? Number(raw) : null;
    return parsed && Number.isFinite(parsed) ? parsed : null;
  }, [window.location.search]);

  const emailValid = looksLikeEmail(email);
  const bookingFlow = isBookingFlow(product, session);

  useEffect(() => {
    if (!match || !productKey) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [productData, sessionData] = await Promise.all([
          fetchBuyableProduct(productKey),
          sessionId ? fetchSession(sessionId) : Promise.resolve(null),
        ]);

        if (!cancelled) {
          setProduct(productData ?? null);
          setSession(sessionData ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [match, productKey, sessionId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  async function handleBuy() {
    if (!emailValid) {
      setTouched(true);
      return;
    }

    try {
      setSubmitting(true);
      const checkout = await submitCheckout({
        productKey: product.productKey,
        sessionId: session?.id,
        quantity: 1,
        email,
        name: product.name,
      });

      const url = typeof checkout === "string" ? checkout : checkout?.url;
      if (url) {
        window.location.href = url;
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary">
          {bookingFlow ? "Booking" : labelForType(product.type || product.productType)}
        </Badge>
        <h1 className="text-3xl font-bold">
          {bookingFlow ? "Complete your booking" : "Complete your purchase"}
        </h1>
        <p className="text-muted-foreground">
          {bookingFlow
            ? "Review your selected session and continue to secure checkout."
            : "Review your selection and continue to secure checkout."}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            <div className="text-2xl font-semibold whitespace-nowrap">
              ${(product.price / 100).toFixed(2)}
            </div>
          </div>

          {session ? (
            <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
              <div className="text-sm font-semibold">Selected session</div>
              <div className="text-sm">{session.className ?? product.name}</div>
              <div className="text-sm text-muted-foreground">{formatSessionRange(session)}</div>
              <div className="text-sm text-muted-foreground">
                {session.venueName ?? "Venue TBD"}
                {session.venueCity && session.venueState
                  ? ` • ${session.venueCity}, ${session.venueState}`
                  : ""}
              </div>
            </div>
          ) : bookingFlow ? (
            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              You are booking this experience. Session selection will be confirmed as part of checkout.
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              You’re purchasing a store item and will be redirected to secure checkout.
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="checkout-email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="checkout-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {touched && !emailValid && (
              <div className="text-sm text-red-600">Please enter a valid email address.</div>
            )}
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            {bookingFlow
              ? "You’ll be redirected to checkout to reserve this booking securely."
              : "You’ll be redirected to checkout to complete this purchase securely."}
          </div>

          <div className="flex gap-3">
            <Button size="lg" onClick={handleBuy} disabled={submitting || !emailValid}>
              {submitting
                ? "Redirecting…"
                : bookingFlow
                ? "Continue to booking checkout"
                : "Continue to checkout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
