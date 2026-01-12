// src/lib/submitCheckout.ts
// -------------------------------------------------------------
// Sends a unified checkout request to your Express API.
// Works for: digital, class, merch, gift
// -------------------------------------------------------------

// Use Vite env var (SAME as your other APIs)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  // Fail fast if backend URL is not configured
  throw new Error("VITE_BACKEND_URL is not defined in environment variables");
}

export async function submitCheckout({
  productKey,   // string - required
  email,        // string - required
  quantity = 1, // number - defaults to 1

  // Optional depending on product type:
  sessionId,    // class bookings
  shipping,     // merch
  recipient,    // gift certificates
}: {
  productKey: string;
  email: string;
  quantity?: number;
  sessionId?: number;
  shipping?: any;
  recipient?: any;
}) {
  try {
    // Build payload without undefined fields
    const payload: any = {
      productKey,
      email,
      quantity,
      ...(sessionId ? { sessionId } : {}),
      ...(shipping ? { shipping } : {}),
      ...(recipient ? { recipient } : {}),
    };

    // Call your Express backend /checkout endpoint
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Checkout error:", data.error);
      throw new Error(data.error || "Checkout failed");
    }

    // Backend returns: { url: "https://checkout.stripe.com/..." }
    return data.url;
  } catch (err) {
    console.error("Checkout request failed:", err);
    throw err;
  }
}
