// src/pages/classes/ClassDetailPage.tsx
// Shows a single class product + all upcoming sessions for that class

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { publicApi } from "@/lib/publicApi";
import SessionCard from "@/components/classes/SessionCard";

export default function ClassDetailPage() {
  // Read :id param from URL
  const [, params] = useRoute("/classes/:id");
  const classId = params?.id;

  const [cls, setCls] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch class product
        const classRes = await publicApi.get(`/class-products/${classId}`);
        setCls(classRes.data || null);

        // Fetch sessions for this product
        const sessionRes = await publicApi.get(
          `/class-sessions?classProductId=${classId}`
        );

        setSessions(sessionRes.data || []);
      } catch (err) {
        console.error("CLASS DETAIL ERROR", err);
      } finally {
        setLoading(false);
      }
    }

    if (classId) load();
  }, [classId]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;

  if (!cls) return <div className="p-6 text-center">Class not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Class name */}
      <h1 className="text-3xl font-bold mb-4">{cls.name}</h1>

      {/* Description */}
      <p className="text-gray-700 mb-6">{cls.description}</p>

      {/* Price */}
      <div className="font-semibold mb-6">
        Price per person: {cls.price} {cls.currency}
      </div>

      {/* Sessions list */}
      <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>

      {sessions.length === 0 && (
        <div>No upcoming sessions for this class.</div>
      )}

      <div className="space-y-4">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}
