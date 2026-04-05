// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getClassSessions } from "../lib/classApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatInTimeZone } from "@/lib/sessionTime";

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
  venueTimezone?: string | null;
};

function unwrapArray(maybe: any): any[] {
  if (Array.isArray(maybe)) return maybe;
  if (maybe && Array.isArray(maybe.data)) return maybe.data;
  if (maybe && Array.isArray(maybe.sessions)) return maybe.sessions;
  return [];
}

function formatHomeSessionRange(session: Session) {
  const timeZone = session.venueTimezone || undefined;
  const start = formatInTimeZone(session.startTime, timeZone, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const endDate = new Date(session.endTime);
  const end = Number.isNaN(endDate.getTime())
    ? "TBA"
    : endDate.toLocaleTimeString([], {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
      });
  return `${start} – ${end}`;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const raw = await getClassSessions();
        const list = unwrapArray(raw) as Session[];

        if (!cancelled) {
          setSessions(Array.isArray(list) ? list : []);
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
      .map((s) => ({ s, startMs: new Date(s.startTime).getTime() }))
      .filter((x) => Number.isFinite(x.startMs) && x.startMs >= now)
      .sort((a, b) => a.startMs - b.startMs)
      .slice(0, 6)
      .map((x) => x.s);
  }, [sessions]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <section className="space-y-4 text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold">Floating soundbath experiences in Arizona</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Desert Paddleboards brings meditation, breathwork, and immersive sound healing onto the water for a deeply calming experience.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/classes")}>Browse Classes</Button>
          <Button variant="outline" onClick={() => navigate("/shop")}>Visit Shop</Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upcoming sessions</h2>
          <Button variant="outline" onClick={() => navigate("/classes")}>View all classes</Button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">No sessions available right now.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((s) => (
              <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/sessions/${s.id}`)}>
                <CardContent className="p-5 space-y-2">
                  <div className="font-semibold text-lg">{formatHomeSessionRange(s)}</div>

                  <div className="text-muted-foreground">
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

                  <div className="text-sm text-muted-foreground">
                    {s.seatsAvailable} of {s.seatsTotal} seats available
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
