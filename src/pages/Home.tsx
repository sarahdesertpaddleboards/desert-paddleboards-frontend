// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getClassSessions } from "../lib/classApi";

type Session = {
  id: number;
  classProductId: number;
  startTime: string;
  endTime: string;
  seatsTotal: number;
  seatsAvailable: number;

  venueId: number | null;
  venueName: string | null;
  venueCity: string | null;
  venueState: string | null;
  venueSlug: string | null;
};

function unwrapArray(maybe: any): any[] {
  // Handles common API response shapes:
  // 1) array directly
  // 2) { data: [...] }
  // 3) { sessions: [...] }
  if (Array.isArray(maybe)) return maybe;
  if (maybe && Array.isArray(maybe.data)) return maybe.data;
  if (maybe && Array.isArray(maybe.sessions)) return maybe.sessions;
  return [];
}

export default function Home() {
  const [, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setDebug("Loading sessions…");

        const raw = await getClassSessions();
        const list = unwrapArray(raw) as Session[];

        // Super explicit debug so we can see what the frontend *really* got
        const sample = list?.[0]
        ? {
            id: list[0].id,
            startTime: list[0].startTime,
            endTime: list[0].endTime,
            venueName: list[0].venueName,
            venueCity: list[0].venueCity,
            venueState: list[0].venueState,
            seatsAvailable: list[0].seatsAvailable,
            seatsTotal: list[0].seatsTotal,
          }
        : null;
      

        console.log("HOME getClassSessions raw:", raw);
        console.log("HOME sessions list:", list);
        console.log("HOME sample:", sample);

        if (!cancelled) {
          setSessions(Array.isArray(list) ? list : []);
          setDebug(
            `Loaded ${Array.isArray(list) ? list.length : 0} sessions. Sample: ${
              sample ? JSON.stringify(sample) : "none"
            }`
          );
        }
      } catch (err: any) {
        console.error("HOME: failed to load sessions", err);
        if (!cancelled) {
          setSessions([]);
          setDebug(`Error loading sessions: ${String(err?.message || err)}`);
        }
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

    const withParsed = sessions.map((s) => {
      const startMs = new Date(s.startTime).getTime();
      const endMs = new Date(s.endTime).getTime();
      return { s, startMs, endMs };
    });

    const invalid = withParsed.filter((x) => !Number.isFinite(x.startMs));
    if (invalid.length > 0) {
      console.warn("HOME: invalid startTime sessions:", invalid.slice(0, 3));
    }

    // IMPORTANT: for debugging, don’t silently filter everything.
    // If everything is in the past, show the next 6 anyway.
    const future = withParsed.filter((x) => Number.isFinite(x.startMs) && x.startMs >= now);

    const pick = (future.length > 0 ? future : withParsed)
      .filter((x) => Number.isFinite(x.startMs))
      .sort((a, b) => a.startMs - b.startMs)
      .slice(0, 6)
      .map((x) => x.s);

    return pick;
  }, [sessions]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Desert Paddleboards</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Book a class and get on the water.</p>

      <h2 style={{ marginTop: 28, fontSize: 20 }}>Upcoming sessions</h2>

      {/* Debug line (keep until this is stable, then remove) */}
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
        {debug}
      </div>

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
  {s.venueName ? (
    <>
      {s.venueName}
      {s.venueCity && s.venueState ? ` • ${s.venueCity}, ${s.venueState}` : ""}
    </>
  ) : s.venueCity ? (
    <>
      {s.venueCity}
      {s.venueState ? `, ${s.venueState}` : ""}
    </>
  ) : (
    "Venue TBD"
  )}
</div>

                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  Seats: {s.seatsAvailable}/{s.seatsTotal}
                </div>

                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                  Session ID: {s.id} | Class ID: {s.classProductId}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
