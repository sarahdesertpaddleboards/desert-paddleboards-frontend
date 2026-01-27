import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { getClassSessionById } from "../../lib/classApi";

// Session details page for /sessions/:id
export default function SessionDetailPage() {
  const [match, params] = useRoute("/sessions/:id");
  const sessionId = params?.id;

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  function toDateSafe(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatRange(s: any): string {
    const start = toDateSafe(s?.startTime);
    const end = toDateSafe(s?.endTime);

    if (!start) return "TBA";

    if (end) {
      return `${start.toLocaleString()} - ${end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return start.toLocaleString();
  }

  useEffect(() => {
    if (!match || !sessionId) return;

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);

        // This calls GET /classes/sessions/:id
        const data = await getClassSessionById(sessionId);

        if (isMounted) setSession(data ?? null);
      } catch (err) {
        console.error("SESSION DETAIL: failed to load session", err);
        if (isMounted) setSession(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [match, sessionId]);

  if (!match) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {loading ? (
        <p>Loading...</p>
      ) : !session ? (
        <p>Session not found.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">
            {session.className ?? session.name ?? "Session"}
          </h1>

          {/* IMPORTANT: use startTime/endTime, not session.date */}
          <div className="text-gray-700 mb-4">{formatRange(session)}</div>

          {typeof session.seatsAvailable === "number" && typeof session.seatsTotal === "number" ? (
            <div className="text-gray-700 mb-4">
              Seats available: {session.seatsAvailable}/{session.seatsTotal}
            </div>
          ) : null}

          {/* Optional: show IDs for sanity while you debug */}
          <div className="text-xs text-gray-400">
            Session ID: {session.id} {session.classProductId ? `| Class ID: ${session.classProductId}` : ""}
          </div>
        </>
      )}
    </div>
  );
}
