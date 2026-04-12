// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getClassSessions } from "../lib/classApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

type CalendarDay = {
  key: string;
  date: Date;
  inMonth: boolean;
  sessions: Session[];
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

function getDayKey(value: string | Date, timeZone?: string | null) {
  const date = typeof value === "string" ? new Date(value) : value;
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

function availabilityLabel(session: Session) {
  if (session.seatsAvailable <= 0) return "Sold out";
  if (session.seatsAvailable <= Math.max(3, Math.ceil(session.seatsTotal * 0.2))) return "Nearly full";
  return "Available";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function weekdayIndexMondayFirst(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
}

function buildMonthGrid(month: Date, sessions: Session[]): CalendarDay[] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const start = addDays(first, -weekdayIndexMondayFirst(first));
  const endPadding = 6 - weekdayIndexMondayFirst(last);
  const end = addDays(last, endPadding);

  const byDay = new Map<string, Session[]>();
  for (const session of sessions) {
    const key = getDayKey(session.startTime, session.venueTimezone);
    const existing = byDay.get(key) ?? [];
    existing.push(session);
    byDay.set(key, existing);
  }

  const days: CalendarDay[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const key = getDayKey(cursor);
    days.push({
      key,
      date: new Date(cursor),
      inMonth: cursor.getMonth() === month.getMonth(),
      sessions: byDay.get(key) ?? [],
    });
  }
  return days;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const raw = await getClassSessions();
        const list = unwrapArray(raw) as Session[];
        if (!cancelled) setSessions(Array.isArray(list) ? list : []);
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

  const calendarDays = useMemo(() => buildMonthGrid(visibleMonth, cityFiltered), [visibleMonth, cityFiltered]);

  const selectedDaySessions = useMemo(() => {
    const key = selectedDate || getDayKey(new Date());
    return cityFiltered.filter((session) => getDayKey(session.startTime, session.venueTimezone) === key);
  }, [cityFiltered, selectedDate]);

  useEffect(() => {
    if (selectedCity && !cityOptions.some((city) => normalize(city) === selectedCity)) {
      setSelectedCity("");
      setSelectedDate("");
    }
  }, [cityOptions, selectedCity]);

  useEffect(() => {
    if (!selectedDate) return;
    const existsInMonth = calendarDays.some((day) => day.key === selectedDate);
    if (!existsInMonth) setSelectedDate("");
  }, [calendarDays, selectedDate]);

  function buyHref(session: Session) {
    const params = new URLSearchParams();
    params.set("sessionId", String(session.id));
    params.set("from", "/");
    return `/buy/${session.productKey}?${params.toString()}`;
  }

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    : monthLabel(visibleMonth);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <section className="space-y-4 text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold">Floating soundbath experiences in Arizona</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Blue Wave Experiences brings meditation, breathwork, and immersive sound healing onto the water for a deeply calming experience.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/shop")}>Visit Shop</Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Find your session</h2>
            <p className="text-muted-foreground">Choose a city, pick a day in the calendar, and go straight into booking.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/sessions")}>Full availability</Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
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
          </CardContent>
        </Card>

        {loading ? (
          <p>Loading sessions…</p>
        ) : selectedDaySessions.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-muted-foreground">No sessions available for the selected day.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {selectedDaySessions.map((s) => {
              const state = availabilityLabel(s);
              const soldOut = state === "Sold out";
              return (
                <Card key={s.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate(`/sessions/${s.id}`)}>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="font-semibold leading-tight">{s.className || "Session"}</div>
                        <div className="text-sm text-muted-foreground">{formatHomeSessionRange(s)}</div>
                      </div>
                      <span className={state === "Sold out" ? "rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium whitespace-nowrap" : state === "Nearly full" ? "rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-medium whitespace-nowrap" : "rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-medium whitespace-nowrap"}>
                        {state}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {s.venueName ? `${s.venueName}${s.venueCity && s.venueState ? ` • ${s.venueCity}, ${s.venueState}` : ""}` : "Venue TBD"}
                    </div>

                    <div className="text-sm text-muted-foreground">{s.seatsAvailable} of {s.seatsTotal} seats left</div>

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

        <Card>
          <CardContent className="p-4">
            <div className="rounded-xl border overflow-hidden bg-white">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-slate-50">
                <div>
                  <div className="text-xl font-semibold">{monthLabel(visibleMonth)}</div>
                  <div className="text-sm text-muted-foreground">{selectedDateLabel}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setVisibleMonth((m) => addMonths(m, -1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setVisibleMonth((m) => addMonths(m, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b text-xs uppercase tracking-wide text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="px-3 py-2 border-r last:border-r-0">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const selected = selectedDate === day.key;
                  const hasSessions = day.sessions.length > 0;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDate(day.key)}
                      className={`min-h-[104px] border-r border-b last:border-r-0 p-2.5 text-left align-top transition-colors ${selected ? "bg-primary/10 ring-1 ring-primary" : hasSessions ? "hover:bg-slate-50" : "bg-background"} ${!day.inMonth ? "text-muted-foreground/50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={`text-xl font-semibold ${selected ? "text-primary" : ""}`}>{day.date.getDate()}</div>
                        {hasSessions ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {day.sessions.length}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {day.sessions.slice(0, 2).map((session) => {
                          const state = availabilityLabel(session);
                          return (
                            <div
                              key={session.id}
                              className={state === "Sold out" ? "rounded-md bg-slate-200 px-2 py-1 text-[11px] text-slate-700" : state === "Nearly full" ? "rounded-md bg-amber-500 px-2 py-1 text-[11px] text-white" : "rounded-md bg-emerald-600 px-2 py-1 text-[11px] text-white"}
                            >
                              {formatInTimeZone(session.startTime, session.venueTimezone || undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          );
                        })}
                        {day.sessions.length > 2 ? (
                          <div className="text-[11px] text-muted-foreground">+{day.sessions.length - 2} more</div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
