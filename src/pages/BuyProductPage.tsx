import { useEffect, useMemo, useState } from "react";
import { fetchStoreProduct } from "@/lib/storeApi";
import { submitCheckout } from "@/lib/shopApi";
import { fetchSession, fetchClassProducts } from "@/lib/classApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRoute } from "wouter";
import { formatSessionTimeRange } from "@/lib/sessionTime";

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
  seatsAvailable?: number | null;
  venueName?: string | null;
  venueCity?: string | null;
  venueState?: string | null;
  venueTimezone?: string | null;
  className?: string | null;
};

type GiftPreview = {
  code: string;
  originalAmount: number;
  amountApplied: number;
  payableAmount: number;
  remainingBalanceAfterPurchase: number;
  currency: string;
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
  return formatSessionTimeRange(
    session.startTime,
    session.endTime || session.startTime,
    session.venueTimezone || undefined
  );
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

async function previewGiftCode(args: {
  productKey: string;
  quantity: number;
  giftCode: string;
}) {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : "https://desert-paddleboards-backend-production.up.railway.app");

  const res = await fetch(`${baseUrl}/checkout/gift-code/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(args),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Failed to validate gift code");
  }

  return data as GiftPreview;
}

export default function BuyProductPage() {
  const [match, params] = useRoute("/buy/:productKey");
  const productKey = params?.productKey;
  const [product, setProduct] = useState<BuyableProduct | null>(null);
  const [session, setSession] = useState<SelectedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [touched, setTouched] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftPreview, setGiftPreview] = useState<GiftPreview | null>(null);
  const [giftPreviewLoading, setGiftPreviewLoading] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);

  const search = typeof window !== "undefined" ? window.location.search : "";
  const sessionId = useMemo(() => {
    const params = new URLSearchParams(search);
    const raw = params.get("sessionId");
    const parsed = raw ? Number(raw) : null;
    return parsed && Number.isFinite(parsed) ? parsed : null;
  }, [search]);

  const emailValid = looksLikeEmail(email);
  const bookingFlow = isBookingFlow(product, session);
  const giftFlow = (product?.type || product?.productType || "").toLowerCase() === "gift";
  const maxQuantity = bookingFlow && typeof session?.seatsAvailable === "number"
    ? Math.max(1, Math.min(10, session.seatsAvailable))
    : giftFlow
      ? 1
      : 10;
  const totalPrice = product ? product.price * quantity : 0;
  const displayedTotal = giftPreview?.payableAmount ?? totalPrice;

  useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
    }
  }, [quantity, maxQuantity]);

  useEffect(() => {
    setGiftPreview(null);
    setGiftError(null);
  }, [productKey, quantity, session?.id]);

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

  async function handleApplyGiftCode() {
    if (!product?.productKey || !giftCode.trim()) return;

    try {
      setGiftPreviewLoading(true);
      setGiftError(null);
      const preview = await previewGiftCode({
        productKey: product.productKey,
        quantity,
        giftCode,
      });
      setGiftPreview(preview);
      setGiftCode(preview.code);
    } catch (err: any) {
      setGiftPreview(null);
      setGiftError(err?.message || "Failed to apply gift code");
    } finally {
      setGiftPreviewLoading(false);
    }
  }

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
        quantity,
        email,
        name: product.name,
        giftCode: giftPreview?.code || undefined,
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
            <div className="text-right whitespace-nowrap">
              <div className="text-sm text-muted-foreground">{bookingFlow ? "Per spot" : giftFlow ? "Gift value" : "Price"}</div>
              <div className="text-2xl font-semibold">${(product.price / 100).toFixed(2)}</div>
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

          <div className="grid gap-4 md:grid-cols-2">
            {!giftFlow && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {bookingFlow ? "Number of spots" : "Quantity"}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </Button>
                  <div className="min-w-[3rem] text-center text-lg font-semibold">{quantity}</div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    +
                  </Button>
                </div>
                {bookingFlow && typeof session?.seatsAvailable === "number" && (
                  <div className="text-sm text-muted-foreground">
                    {session.seatsAvailable} {session.seatsAvailable === 1 ? "spot" : "spots"} remaining
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
              <div className="text-sm text-muted-foreground">{giftFlow ? "Gift value" : "Total"}</div>
              <div className="text-2xl font-semibold">${(displayedTotal / 100).toFixed(2)}</div>
              {giftPreview && (
                <div className="text-sm text-muted-foreground">
                  Gift code <span className="font-medium text-foreground">{giftPreview.code}</span> applied, saving ${(giftPreview.amountApplied / 100).toFixed(2)}
                </div>
              )}
              {bookingFlow && !giftPreview && (
                <div className="text-sm text-muted-foreground mt-1">
                  {quantity} {quantity === 1 ? "spot" : "spots"} reserved
                </div>
              )}
              {giftFlow && (
                <div className="text-sm text-muted-foreground mt-1">
                  One gift certificate
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gift code</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter gift certificate code"
                value={giftCode}
                onChange={(e) => {
                  setGiftCode(e.target.value.toUpperCase());
                  setGiftPreview(null);
                  setGiftError(null);
                }}
              />
              <Button type="button" variant="outline" onClick={handleApplyGiftCode} disabled={giftPreviewLoading || !giftCode.trim()}>
                {giftPreviewLoading ? "Applying…" : "Apply code"}
              </Button>
            </div>
            {giftError && <div className="text-sm text-red-600">{giftError}</div>}
            {giftPreview && (
              <div className="text-sm text-muted-foreground">
                New total ${(giftPreview.payableAmount / 100).toFixed(2)}. Remaining gift balance after this purchase: ${(giftPreview.remainingBalanceAfterPurchase / 100).toFixed(2)} {String(giftPreview.currency || "usd").toUpperCase()}.
              </div>
            )}
          </div>

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
              ? "You’ll be redirected to checkout to reserve these spots securely."
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
