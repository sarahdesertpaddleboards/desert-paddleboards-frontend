// src/pages/sessions/[id].tsx
import { useEffect, useState } from "react";
import { useParams } from "wouter";

import { fetchSession, fetchClassProduct } from "@/lib/classApi";
import { submitCheckout } from "@/lib/shopApi";
import { Button } from "@/components/ui/button";

export default function SessionDetailPage() {
  const { id } = useParams();
  const sessionId = Number(id);

  const [session, setSession] = useState<any>(null);
  const [classProduct, setClassProduct] = useState<any>(null);

  useEffect(() => {
    fetchSession(sessionId).then((s) => {
      setSession(s);
      if (s) fetchClassProduct(s.classProductId).then(setClassProduct);
    });
  }, [sessionId]);

  if (!session || !classProduct) {
    return <div className="p-6">Loading session…</div>;
  }

  const start = new Date(session.startTime);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{classProduct.name}</h1>

      <p className="text-gray-600 mb-4">
        {start.toLocaleDateString()} at{" "}
        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>

      <p className="mb-4">Seats available: {session.seatsAvailable}</p>

      <Button
        onClick={() =>
          submitCheckout({
            productKey: classProduct.productKey,
            sessionId,
          })
        }
      >
        Book Now (${(classProduct.price / 100).toFixed(2)})
      </Button>
    </div>
  );
}
