// src/pages/BuyProductPage.tsx
//--------------------------------------------------------------
// FULLY UPDATED BUY PRODUCT PAGE
// Works with the unified backend /checkout API
//--------------------------------------------------------------

import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { fetchPublicProducts } from "@/lib/publicApi";
import { submitCheckout } from "@/lib/submitCheckout";

export default function BuyProductPage() {
  const { productKey } = useParams();

  // The selected product
  const [product, setProduct] = useState<any>(null);

  // Customer email (required for all checkout flows)
  const [email, setEmail] = useState("");

  // Gift certificate fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  // Merch shipping fields
  const [shipName, setShipName] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostal, setShipPostal] = useState("");
  const [shipCountry, setShipCountry] = useState("");

  //--------------------------------------------------------------
  // Load product from public product list
  //--------------------------------------------------------------
  useEffect(() => {
    fetchPublicProducts().then((products) =>
      setProduct(products.find((p) => p.productKey === productKey))
    );
  }, [productKey]);

  if (!product) {
    return <div className="p-8">Loading product…</div>;
  }

  //--------------------------------------------------------------
  // START CHECKOUT (Unified across all product types)
  //--------------------------------------------------------------
  async function startCheckout() {
    try {
      //----------------------------------------------------------
      // Base checkout object
      //----------------------------------------------------------
      const payload: any = {
        productKey: product.productKey,
        email, // must not be empty
        quantity: 1,
      };

      //----------------------------------------------------------
      // GIFT CERTIFICATE
      //----------------------------------------------------------
      if (product.type === "gift") {
        payload.recipient = {
          name: recipientName,
          email: recipientEmail,
          message: giftMessage,
        };
      }

      //----------------------------------------------------------
      // MERCH SHIPPING
      //----------------------------------------------------------
      if (product.type === "merch") {
        payload.shipping = {
          fullName: shipName,
          addressLine1: shipAddress,
          city: shipCity,
          state: shipState,
          postalCode: shipPostal,
          country: shipCountry,
        };
      }

      //----------------------------------------------------------
      // CLASS BOOKING (you can add a session selector later)
      //----------------------------------------------------------
      // if (product.type === "class") {
      //   payload.sessionId = selectedSessionId;
      // }

      //----------------------------------------------------------
      // Send to backend using unified submitCheckout.ts
      //----------------------------------------------------------
      const url = await submitCheckout(payload);

      //----------------------------------------------------------
      // Redirect customer to Stripe Checkout
      //----------------------------------------------------------
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
    }
  }

  //--------------------------------------------------------------
  // RENDER PAGE
  //--------------------------------------------------------------
  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p>{product.description}</p>

      <div className="text-xl font-semibold">
        ${(product.price / 100).toFixed(2)}
      </div>

      {/* EMAIL FIELD (required for all product types) */}
      <div className="space-y-2">
        <h2 className="font-semibold">Your Email</h2>
        <input
          className="w-full border p-2 rounded"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* GIFT CERTIFICATE FORM */}
      {product.type === "gift" && (
        <div className="space-y-4 border p-4 rounded bg-orange-50">
          <h2 className="text-xl font-bold">Gift Certificate Details</h2>

          <input
            className="w-full border p-2 rounded"
            placeholder="Recipient Name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Recipient Email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Message (optional)"
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
          />
        </div>
      )}

      {/* MERCH SHIPPING FORM */}
      {product.type === "merch" && (
        <div className="space-y-4 border p-4 rounded bg-blue-50">
          <h2 className="text-xl font-bold">Shipping Information</h2>

          <input
            className="w-full border p-2"
            placeholder="Full Name"
            value={shipName}
            onChange={(e) => setShipName(e.target.value)}
          />

          <input
            className="w-full border p-2"
            placeholder="Address Line 1"
            value={shipAddress}
            onChange={(e) => setShipAddress(e.target.value)}
          />

          <input
            className="w-full border p-2"
            placeholder="City"
            value={shipCity}
            onChange={(e) => setShipCity(e.target.value)}
          />

          <input
            className="w-full border p-2"
            placeholder="State"
            value={shipState}
            onChange={(e) => setShipState(e.target.value)}
          />

          <input
            className="w-full border p-2"
            placeholder="Postal Code"
            value={shipPostal}
            onChange={(e) => setShipPostal(e.target.value)}
          />

          <input
            className="w-full border p-2"
            placeholder="Country"
            value={shipCountry}
            onChange={(e) => setShipCountry(e.target.value)}
          />
        </div>
      )}

      {/* CHECKOUT BUTTON */}
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded w-full"
        onClick={startCheckout}
      >
        Continue to Checkout
      </button>
    </div>
  );
}
