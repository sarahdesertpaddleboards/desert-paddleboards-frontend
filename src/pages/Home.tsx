// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getClassSessions } from "../lib/classApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Instagram, Facebook, Music2 } from "lucide-react";
import heroImage from "/images/hero-floating-soundbath.webp";
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

const CITY_COLORS = ["bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-fuchsia-500", "bg-orange-500", "bg-indigo-500"];

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
  const end = Number.isNaN(endDate.getTime()) ? "TBA" : endDate.toLocaleTimeString([], { timeZone, hour: "2-digit", minute: "2-digit" });
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
  return date.toLocaleDateString([], { month: "long", year: "numeric" });
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
    days.push({ key, date: new Date(cursor), inMonth: cursor.getMonth() === month.getMonth(), sessions: byDay.get(key) ?? [] });
  }
  return days;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [chooserDay, setChooserDay] = useState<{ label: string; sessions: Session[] } | null>(null);

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
    return [...new Set(upcoming.map((session) => session.venueCity).filter((city): city is string => Boolean(city)).map((city) => city.trim()))].sort((a, b) => a.localeCompare(b));
  }, [upcoming]);

  const cityColorMap = useMemo(() => {
    const map = new Map<string, string>();
    cityOptions.forEach((city, index) => map.set(normalize(city), CITY_COLORS[index % CITY_COLORS.length]));
    return map;
  }, [cityOptions]);

  const cityFiltered = useMemo(() => {
    if (!selectedCity) return upcoming;
    return upcoming.filter((session) => normalize(session.venueCity || "") === selectedCity);
  }, [upcoming, selectedCity]);

  const calendarDays = useMemo(() => buildMonthGrid(visibleMonth, cityFiltered), [visibleMonth, cityFiltered]);

  function buyHref(session: Session) {
    const params = new URLSearchParams();
    params.set("sessionId", String(session.id));
    params.set("from", "/");
    return `/buy/${session.productKey}?${params.toString()}`;
  }

  function openDay(day: CalendarDay) {
    if (day.sessions.length === 0) return;
    if (day.sessions.length === 1) {
      navigate(`/sessions/${day.sessions[0].id}`);
      return;
    }
    setChooserDay({
      label: day.date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }),
      sessions: day.sessions,
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-stretch">
        <div className="overflow-hidden rounded-2xl">
          <img src={heroImage} alt="Floating soundbath at sunset" className="h-full w-full object-cover min-h-[320px]" />
        </div>
        <div className="rounded-2xl bg-cyan-50 p-8 flex flex-col justify-center space-y-5">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Desert Paddleboards</div>
            <h1 className="text-4xl font-bold leading-tight">Floating soundbath sessions in Arizona</h1>
            <p className="text-muted-foreground">Choose a date in the calendar and go straight into booking.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => document.getElementById("homepage-calendar")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Open calendar</Button>
            <Button variant="outline" onClick={() => navigate("/shop")}>Visit Shop</Button>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <a href="https://www.instagram.com/desertpaddleboards/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </a>
            <a href="https://www.facebook.com/desertpaddleboards" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </a>
            <a href="https://www.tiktok.com/@desertpaddleboards" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <Music2 className="h-4 w-4" />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </section>

      <section id="homepage-calendar" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Book from the calendar</h2>
            <p className="text-muted-foreground">Choose a city, then click a day in the calendar.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/sessions")}>Full availability</Button>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium">City</div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={!selectedCity ? "default" : "outline"} onClick={() => setSelectedCity("")}>All cities</Button>
                {cityOptions.map((city) => (
                  <Button key={city} size="sm" variant={normalize(city) === selectedCity ? "default" : "outline"} onClick={() => setSelectedCity(normalize(city))}>
                    {city}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {cityOptions.map((city) => (
                <div key={city} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${cityColorMap.get(normalize(city)) || "bg-slate-400"}`} />
                  <span>{city}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border overflow-hidden bg-white">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-slate-50">
                <div className="text-xl font-semibold">{monthLabel(visibleMonth)}</div>
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
                  const hasSessions = day.sessions.length > 0;
                  const citiesOnDay = [...new Set(day.sessions.map((session) => normalize(session.venueCity || "")).filter(Boolean))];
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => openDay(day)}
                      disabled={!hasSessions}
                      className={`min-h-[104px] border-r border-b last:border-r-0 p-2.5 text-left align-top transition-colors ${hasSessions ? "hover:bg-slate-50" : "bg-background"} ${!day.inMonth ? "text-muted-foreground/50" : ""} ${!hasSessions ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xl font-semibold">{day.date.getDate()}</div>
                        {hasSessions ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{day.sessions.length}</span> : null}
                      </div>
                      <div className="mt-3 space-y-2">
                        {citiesOnDay.slice(0, 3).map((cityKey) => (
                          <div key={cityKey} className={`h-2 rounded-full ${cityColorMap.get(cityKey) || "bg-slate-300"}`} />
                        ))}
                        {day.sessions.length === 1 ? <div className="text-[11px] text-muted-foreground">Tap to book</div> : null}
                        {day.sessions.length > 1 ? <div className="text-[11px] text-muted-foreground">Choose session</div> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {chooserDay ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <div className="text-lg font-semibold">Choose a session</div>
                <div className="text-sm text-muted-foreground">{chooserDay.label}</div>
              </div>
              <button type="button" onClick={() => setChooserDay(null)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {chooserDay.sessions.map((s) => {
                const state = availabilityLabel(s);
                return (
                  <div key={s.id} className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-semibold">{s.className || "Session"}</div>
                      <div className="text-sm text-muted-foreground">{formatHomeSessionRange(s)}</div>
                      <div className="text-sm text-muted-foreground">{s.venueName ? `${s.venueName}${s.venueCity && s.venueState ? ` • ${s.venueCity}, ${s.venueState}` : ""}` : "Venue TBD"}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap md:justify-end">
                      <span className={state === "Sold out" ? "rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium" : state === "Nearly full" ? "rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-medium" : "rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-medium"}>{state}</span>
                      <Button size="sm" variant="outline" onClick={() => { setChooserDay(null); navigate(`/sessions/${s.id}`); }}>View details</Button>
                      <Button size="sm" disabled={state === "Sold out" || !s.productKey} onClick={() => { setChooserDay(null); if (s.productKey) navigate(buyHref(s)); }}>
                        {state === "Sold out" ? "Sold out" : "Book now"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {loading ? <p>Loading sessions…</p> : null}
    </div>
  );
}
