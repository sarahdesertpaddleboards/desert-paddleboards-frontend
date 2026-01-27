// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getClassSessions } from "../lib/classApi";

type Session = {
  id: number;
  classProductId: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  seatsTotal: number;
  seatsAvailable: number;
};

export default function Home() {
  const [, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // Fetch sessions from backend
        const data = await getClassSessions();

        // Defensive: ensure array
        const list = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setSessions(list);
        }
      } catch (err) {
        console.error("HOME: failed to load sessions", err);
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();

    return sessions
      .filter((s) => {
        // Parse startTime safely
        const t = new Date(s.startTime).getTime();
        // Keep only valid dates in the future
        return Number.isFinite(t) && t >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 6); // show first 6 upcoming
  }, [sessions]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Desert Paddleboards</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Book a class and get on the water.</p>

      <h2 style={{ marginTop: 28, fontSize: 20 }}>Upcoming sessions</h2>

      {loading ? (
        <p>Loading…</p>
      ) : upcoming.length === 0 ? (
        <p>No sessions available.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {upcoming.map((s) => {
            const start = new Date(s.startTime);
            const end = new Date(s.endTime);

            return (
              <button
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                style={{
                  textAlign: "left",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {start.toLocaleDateString()}{" "}
                  {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>

                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  Seats: {s.seatsAvailable}/{s.seatsTotal}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
