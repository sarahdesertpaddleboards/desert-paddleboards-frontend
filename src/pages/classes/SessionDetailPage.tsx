// src/pages/classes/SessionDetailPage.tsx
// Shows details of one session + checkout button

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { publicApi } from "@/lib/publicApi";

export default function SessionDetailPage() {
  // Read :id param from URL
  const [, params] = useRoute("/sessions/:id");
  const sessionId = params?.id;

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Get the session
        const res = await publicApi.get(`/class-sessions/${sessionId}`);
        setSession(res.data || null);
      } catch (err) {
        console.error("SESSION DETAIL ERROR", err);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) load();
  }, [sessionId]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;

  if (!session) return <div className="p-6 text-center">Session not found.</div>;

  const start = new Date(session.startTime);
  const end = new Date(session.endTime);

  // Build checkout link
  // We pass both productKey and sessionId
  const checkoutUrl = `/buy/${session.productKey}?sessionId=${session.id}`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{session.className}</h1>

      {/* Time */}
      <div className="text-gray-700 mb-4">
        {start.toLocaleDateString()} •{" "}
        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
        {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>

      {/* Seats */}
      <div className="mb-6">
        Available seats:{" "}
        <span className="font-semibold">
          {session.seatsAvailable} / {session.seatsTotal}
        </span>
      </div>

      {/* Checkout button */}
      <a
        href={checkoutUrl}
        className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Book this session
      </a>
    </div>
  );
}
