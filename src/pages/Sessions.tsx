import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { fetchSessions } from "@/lib/classApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSessionDateHeading, formatSessionTimeRange } from "@/lib/sessionTime";

type Session = {
  id: number;
  classProductId: number;
  className?: string | null;
  productKey?: string | null;
  startTime: string;
  endTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  venueName?: string | null;
  venueCity?: string | null;
  venueState?: string | null;
  venueTimezone?: string | null;
};

type Filters = {
  city: string;
  venue: string;
  date: string;
  window: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function parseFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  return {
    city: normalize(params.get("city") || ""),
    venue: normalize(params.get("venue") || ""),
    date: params.get("date") || "",
    window: params.get("window") || "",
  };
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.venue) params.set("venue", filters.venue);
  if (filters.date) params.set("date", filters.date);
  if (filters.window) params.set("window", filters.window);
  return params.toString();
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
    month: "short",
    day: "numeric",
  });
}

function dayNumberInZone(value: string | Date, timeZone?: string | null) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return Number.NaN;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return Math.floor(Date.UTC(get("year"), get("month") - 1, get("day")) / 86400000);
}

function withinWindow(startTime: string, windowFilter: string, timeZone?: string | null) {
  if (!windowFilter) return true;
  const startDay = dayNumberInZone(startTime, timeZone);
  const todayDay = dayNumberInZone(new Date(), timeZone);
  if (!Number.isFinite(startDay) || !Number.isFinite(todayDay)) return false;
  const diffDays = startDay - todayDay;
  if (diffDays < 0) return false;
  if (windowFilter === "7d") return diffDays <= 7;
  if (windowFilter === "14d") return diffDays <= 14;
  if (windowFilter === "30d") return diffDays <= 30;
  return true;
}

export default function SessionsPage() {
  const [location, navigate] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(() => parseFilters(window.location.search));

  useEffect(() => {
    setFilters(parseFilters(window.location.search));
  }, [location]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const rows = await fetchSessions();
        if (!cancelled) setSessions(Array.isArray(rows) ? rows : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const futureSessions = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((s) => {
        const start = new Date(s.startTime).getTime();
        return Number.isFinite(start) && start >= now;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [sessions]);

  const windowedSessions = useMemo(() => {
    return futureSessions.filter((s) => withinWindow(s.startTime, filters.window, s.venueTimezone));
  }, [futureSessions, filters.window]);

  const availableCities = useMemo(() => {
    return [...new Set(
      windowedSessions
        .map((s) => s.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [windowedSessions]);

  const cityScopedSessions = useMemo(() => {
    return windowedSessions.filter((s) => {
      if (!filters.city) return true;
      return normalize(s.venueCity || "") === filters.city;
    });
  }, [windowedSessions, filters.city]);

  const availableVenues = useMemo(() => {
    return [...new Set(
      cityScopedSessions
        .map((s) => s.venueName)
        .filter((venue): venue is string => Boolean(venue))
        .map((venue) => venue.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [cityScopedSessions]);

  const venueScopedSessions = useMemo(() => {
    return cityScopedSessions.filter((s) => {
      if (!filters.venue) return true;
      return normalize(s.venueName || "") === filters.venue;
    });
  }, [cityScopedSessions, filters.venue]);

  const dateChips = useMemo(() => {
    const seen = new Set<string>();
    const chips: { key: string; label: string }[] = [];
    for (const session of venueScopedSessions) {
      const key = getDayKey(session.startTime, session.venueTimezone);
      if (seen.has(key)) continue;
      seen.add(key);
      chips.push({
        key,
        label: getDateChipLabel(session.startTime, session.venueTimezone),
      });
      if (chips.length >= 10) break;
    }
    return chips;
  }, [venueScopedSessions]);

  const filteredSessions = useMemo(() => {
    return venueScopedSessions.filter((s) => {
      if (filters.date && getDayKey(s.startTime, s.venueTimezone) !== filters.date) return false;
      return true;
    });
  }, [venueScopedSessions, filters.date]);

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const session of filteredSessions) {
      const key = formatSessionDateHeading(session.startTime, session.venueTimezone || undefined);
      const existing = groups.get(key) || [];
      existing.push(session);
      groups.set(key, existing);
    }
    return Array.from(groups.entries());
  }, [filteredSessions]);

  const currentQuery = useMemo(() => buildQuery(filters), [filters]);

  function applyFilters(next: Partial<Filters>) {
    const merged: Filters = {
      city: next.city ?? filters.city,
      venue: next.venue ?? filters.venue,
      date: next.date ?? filters.date,
      window: next.window ?? filters.window,
    };
    setFilters(merged);
    const query = buildQuery(merged);
    navigate(query ? `/sessions?${query}` : "/sessions");
  }

  function detailHref(sessionId: number) {
    return currentQuery ? `/sessions/${sessionId}?${currentQuery}` : `/sessions/${sessionId}`;
  }

  function buyHref(session: Session) {
    const params = new URLSearchParams();
    params.set("sessionId", String(session.id));
    if (currentQuery) params.set("from", `/sessions?${currentQuery}`);
    return `/buy/${session.productKey}?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Availability browser</h1>
        <p className="text-muted-foreground">
          Browse bookable sessions by time window, date, city, and venue.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Time window</div>
            <div className="flex flex-wrap gap-2">
              <Button variant={!filters.window ? "default" : "outline"} size="sm" onClick={() => applyFilters({ window: "", date: "" })}>All upcoming</Button>
              <Button variant={filters.window === "7d" ? "default" : "outline"} size="sm" onClick={() => applyFilters({ window: "7d", date: "" })}>Next 7 days</Button>
              <Button variant={filters.window === "14d" ? "default" : "outline"} size="sm" onClick={() => applyFilters({ window: "14d", date: "" })}>Next 14 days</Button>
              <Button variant={filters.window === "30d" ? "default" : "outline"} size="sm" onClick={() => applyFilters({ window: "30d", date: "" })}>Next 30 days</Button>
            </div>
          </div>

          {dateChips.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Jump to date</div>
              <div className="flex flex-wrap gap-2">
                <Button variant={!filters.date ? "secondary" : "outline"} size="sm" onClick={() => applyFilters({ date: "" })}>All dates</Button>
                {dateChips.map((chip) => (
                  <Button key={chip.key} variant={filters.date === chip.key ? "secondary" : "outline"} size="sm" onClick={() => applyFilters({ date: chip.key })}>
                    {chip.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">City</div>
            <div className="flex flex-wrap gap-2">
              <Button variant={!filters.city ? "default" : "outline"} size="sm" onClick={() => applyFilters({ city: "", venue: "", date: "" })}>All cities</Button>
              {availableCities.map((city) => (
                <Button key={city} variant={normalize(city) === filters.city ? "default" : "outline"} size="sm" onClick={() => applyFilters({ city, venue: "", date: "" })}>
                  {city}
                </Button>
              ))}
            </div>
          </div>

          {availableVenues.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Venue</div>
              <div className="flex flex-wrap gap-2">
                <Button variant={!filters.venue ? "secondary" : "outline"} size="sm" onClick={() => applyFilters({ venue: "", date: "" })}>All venues</Button>
                {availableVenues.map((venue) => (
                  <Button key={venue} variant={normalize(venue) === filters.venue ? "secondary" : "outline"} size="sm" onClick={() => applyFilters({ venue, date: "" })}>
                    {venue}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(filters.city || filters.venue || filters.date || filters.window) && (
        <div className="text-sm text-muted-foreground">
          Active filters:
          {filters.window ? <span className="font-medium text-foreground"> window={filters.window}</span> : null}
          {filters.date ? <span className="font-medium text-foreground"> date={filters.date}</span> : null}
          {filters.city ? <span className="font-medium text-foreground"> city={filters.city}</span> : null}
          {filters.venue ? <span className="font-medium text-foreground"> venue={filters.venue}</span> : null}
        </div>
      )}

      {loading ? (
        <p>Loading sessions…</p>
      ) : groupedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">No upcoming sessions found for this availability window.</CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedSessions.map(([heading, items]) => (
            <section key={heading} className="space-y-3">
              <h2 className="text-xl font-bold">{heading}</h2>
              <div className="grid gap-4">
                {items.map((session) => {
                  const soldOut = session.seatsAvailable <= 0;
                  const canBook = Boolean(session.productKey) && !soldOut;
                  return (
                    <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(detailHref(session.id))}>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-lg">{session.className ?? "Session"}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatSessionTimeRange(session.startTime, session.endTime, session.venueTimezone || undefined)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.venueName ?? "Venue TBD"}
                              {session.venueCity && session.venueState ? ` • ${session.venueCity}, ${session.venueState}` : ""}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground md:text-right">
                            <div className="font-medium text-foreground">{session.seatsAvailable} of {session.seatsTotal} seats left</div>
                            {soldOut ? "Sold out" : "Available now"}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" disabled={!canBook} onClick={(e) => {
                            e.stopPropagation();
                            if (canBook) navigate(buyHref(session));
                          }}>
                            {soldOut ? "Sold out" : "Book this session"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            navigate(detailHref(session.id));
                          }}>
                            View details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
