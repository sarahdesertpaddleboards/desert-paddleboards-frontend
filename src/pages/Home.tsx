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
  className?: string | null;
  productKey?: string | null;
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

function normalize(value: string) {
  return value.trim().toLowerCase();
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

function getDayKey(value: string, timeZone?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getDateChipLabel(value: string, timeZone?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleDateString([], {
    timeZone: timeZone || undefined,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function availabilityLabel(session: Session) {
  if (session.seatsAvailable <= 0) return "Sold out";
  if (session.seatsAvailable <= Math.max(3, Math.ceil(session.seatsTotal * 0.2))) return "Nearly full";
  return "Available";
}

export default function Home() {
  const [, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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
      .map((x) => x.s);
  }, [sessions]);

  const cityOptions = useMemo(() => {
    return [...new Set(
      upcoming
        .map((session) => session.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [upcoming]);

  const cityFiltered = useMemo(() => {
    if (!selectedCity) return upcoming;
    return upcoming.filter((session) => normalize(session.venueCity || "") === selectedCity);
  }, [upcoming, selectedCity]);

  const dateOptions = useMemo(() => {
    const seen = new Set<string>();
    return cityFiltered
      .filter((session) => {
        const key = getDayKey(session.startTime, session.venueTimezone);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8)
      .map((session) => ({
        key: getDayKey(session.startTime, session.venueTimezone),
        label: getDateChipLabel(session.startTime, session.venueTimezone),
      }));
  }, [cityFiltered]);

  const filteredSessions = useMemo(() => {
    const byDate = selectedDate
      ? cityFiltered.filter((session) => getDayKey(session.startTime, session.venueTimezone) === selectedDate)
      : cityFiltered;
    return byDate.slice(0, selectedDate ? 12 : 6);
  }, [cityFiltered, selectedDate]);

  useEffect(() => {
    if (selectedCity && !cityOptions.some((city) => normalize(city) === selectedCity)) {
      setSelectedCity("");
      setSelectedDate("");
    }
  }, [cityOptions, selectedCity]);

  useEffect(() => {
    if (selectedDate && !dateOptions.some((date) => date.key === selectedDate)) {
      setSelectedDate("");
    }
  }, [dateOptions, selectedDate]);

  function buyHref(session: Session) {
    const params = new URLSearchParams();
    params.set("sessionId", String(session.id));
    params.set("from", "/");
    return `/buy/${session.productKey}?${params.toString()}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <section className="space-y-4 text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold">Floating soundbath experiences in Arizona</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Blue Wave Experiences brings meditation, breathwork, and immersive sound healing onto the water for a deeply calming experience.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/sessions")}>Browse Sessions</Button>
          <Button variant="outline" onClick={() => navigate("/shop")}>Visit Shop</Button>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Find your session</h2>
            <p className="text-muted-foreground">Choose a city and date, then go straight to the session you want to book.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/sessions")}>View full availability</Button>
        </div>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">City</div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={!selectedCity ? "default" : "outline"} onClick={() => { setSelectedCity(""); setSelectedDate(""); }}>
                  All cities
                </Button>
                {cityOptions.map((city) => (
                  <Button key={city} size="sm" variant={normalize(city) === selectedCity ? "default" : "outline"} onClick={() => { setSelectedCity(normalize(city)); setSelectedDate(""); }}>
                    {city}
                  </Button>
                ))}
              </div>
            </div>

            {dateOptions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Date</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={!selectedDate ? "secondary" : "outline"} onClick={() => setSelectedDate("")}>All upcoming</Button>
                  {dateOptions.map((date) => (
                    <Button key={date.key} size="sm" variant={selectedDate === date.key ? "secondary" : "outline"} onClick={() => setSelectedDate(date.key)}>
                      {date.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <p>Loading sessions…</p>
        ) : filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">No sessions available for the current selection.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSessions.map((s) => {
              const state = availabilityLabel(s);
              const soldOut = state === "Sold out";
              return (
                <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/sessions/${s.id}`)}>
                  <CardContent className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-lg">{s.className || "Session"}</div>
                      <div className="text-sm text-muted-foreground">{formatHomeSessionRange(s)}</div>
                    </div>

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

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="text-muted-foreground">{s.seatsAvailable} of {s.seatsTotal} seats left</div>
                      <span className={state === "Sold out" ? "rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium" : state === "Nearly full" ? "rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-medium" : "rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-medium"}>
                        {state}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" disabled={soldOut || !s.productKey} onClick={(e) => { e.stopPropagation(); if (!soldOut && s.productKey) navigate(buyHref(s)); }}>
                        {soldOut ? "Sold out" : "Book now"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/sessions/${s.id}`); }}>
                        View details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
