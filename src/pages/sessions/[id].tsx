import { useEffect, useState } from "react";
import { fetchSession } from "@/lib/classApi";
import { useRoute } from "wouter";

export default function SessionDetail() {
  const [match, params] = useRoute("/sessions/:id");
  const id = Number(params?.id);

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchSession(id).then(setSession);
  }, [id]);

  if (!session) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Session Details</h1>
      <div>{new Date(session.date).toLocaleString()}</div>
      <div>Capacity: {session.capacity}</div>
    </div>
  );
}
