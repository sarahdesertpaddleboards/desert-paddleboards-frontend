import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getClassSessions } from "../lib/classApi";

// Home page shows upcoming sessions list
export default function Home() {
  const [, navigate] = useLocation();

  // NOTE: Backend returns sessions with startTime/endTime (ISO strings), NOT "date"
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Small helper: safe Date parsing
  function toDateSafe(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Small helper: format a session nicely
  function formatSessionTime(session: any): string {
    const start = toDateSafe(session?.startTime);
    const end = toDateSafe(session?.endTime);

    if (!start) return "TBA";

    // If end exists, show range. Otherwise show start only.
    if (end) {
      return `${start.toLocaleString()} - ${end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return start.toLocaleString();
  }

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);

        // This calls GET /classes/sessions
        const data = await getClassSessions();

        // Filter to future sessions (optional but nice)
        const now = new Date();
        const cleaned = (Array.isArray(data) ? data : [])
          .filter((s) => {
            const start = toDateSafe(s?.startTime);
            return start ? start.getTime() >= now.getTime() : true;
          })
          .sort((a, b) => {
            const aStart = toDateSafe(a?.startTime)?.getTime() ?? 0;
            const bStart = toDateSafe(b?.startTime)?.getTime() ?? 0;
            return aStart - bStart;
          });

        if (isMounted) setSessions(cleaned);
      } catch (err) {
        console.error("HOME: failed to load sessions", err);
        if (isMounted) setSessions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Desert Paddleboards</h1>
      <p className="text-gray-600 mb-6">Book a class and get on the water.</p>

      <h2 className="text-xl font-semibold mb-3">Upcoming sessions</h2>

      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions available.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <button
              key={s.id}
              className="w-full text-left border rounded-lg p-4 hover:bg-gray-50"
              onClick={() => navigate(`/sessions/${s.id}`)}
            >
              <div className="font-semibold">
                {s.className ?? s.name ?? "Class session"}
              </div>

              {/* IMPORTANT: use startTime/endTime, not date */}
              <div className="text-sm text-gray-600">{formatSessionTime(s)}</div>

              {/* Useful debug-ish info, but harmless */}
              {typeof s.seatsAvailable === "number" && typeof s.seatsTotal === "number" ? (
                <div className="text-sm text-gray-600">
                  Seats: {s.seatsAvailable}/{s.seatsTotal}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
