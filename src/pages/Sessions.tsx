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

type DateChip = {
  key: string;
  label: string;
  heading: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function dayKey(value: string, timeZone?: string | null) {
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

function dayChipLabel(value: string, timeZone?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleDateString([], {
    timeZone: timeZone || undefined,
    month: "short",
    day: "numeric",
  });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [location]);

  const cityFilter = useMemo(() => normalize(searchParams.get("city") || ""), [searchParams]);
  const venueFilter = useMemo(() => normalize(searchParams.get("venue") || ""), [searchParams]);
  const dateFilter = useMemo(() => searchParams.get("date") || "", [searchParams]);
  const windowFilter = useMemo(() => searchParams.get("window") || "", [searchParams]);

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

  const availableCities = useMemo(() => {
    return [...new Set(
      futureSessions
        .map((s) => s.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [futureSessions]);

  const venueOptions = useMemo(() => {
    return [...new Set(
      futureSessions
        .filter((s) => {
          if (!cityFilter) return true;
          return normalize(s.venueCity || "") === cityFilter;
        })
        .map((s) => s.venueName)
        .filter((venue): venue is string => Boolean(venue))
        .map((venue) => venue.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [futureSessions, cityFilter]);

  const dateChips = useMemo(() => {
    const seen = new Set<string>();
    const chips: DateChip[] = [];
    for (const session of futureSessions) {
      const key = dayKey(session.startTime, session.venueTimezone);
      if (seen.has(key)) continue;
      seen.add(key);
      chips.push({
        key,
        label: dayChipLabel(session.startTime, session.venueTimezone),
        heading: formatSessionDateHeading(session.startTime, session.venueTimezone || undefined),
      });
      if (chips.length >= 10) break;
    }
    return chips;
  }, [futureSessions]);

  const filteredSessions = useMemo(() => {
    return futureSessions.filter((s) => {
      if (cityFilter && normalize(s.venueCity || "") !== cityFilter) return false;
      if (venueFilter && normalize(s.venueName || "") !== venueFilter) return false;
      if (dateFilter && dayKey(s.startTime, s.venueTimezone) !== dateFilter) return false;

      if (windowFilter) {
        const start = new Date(s.startTime).getTime();
        const now = Date.now();
        const diffDays = (start - now) / (1000 * 60 * 60 * 24);
        if (windowFilter === "7d" && diffDays > 7) return false;
        if (windowFilter === "14d" && diffDays > 14) return false;
        if (windowFilter === "30d" && diffDays > 30) return false;
      }

      return true;
    });
  }, [futureSessions, cityFilter, venueFilter, dateFilter, windowFilter]);

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const session of filteredSessions) {
      const key = formatSessionDateHeading(session.startTime, session.venueTimezone || undefined);
      const list = groups.get(key) || [];
      list.push(session);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filteredSessions]);

  const currentFilterQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (cityFilter) params.set("city", cityFilter);
    if (venueFilter) params.set("venue", venueFilter);
    if (dateFilter) params.set("date", dateFilter);
    if (windowFilter) params.set("window", windowFilter);
    return params.toString();
  }, [cityFilter, venueFilter, dateFilter, windowFilter]);

  function setFilters(next: { city?: string; venue?: string; date?: string; window?: string }) {
    const params = new URLSearchParams();
    if (next.city) params.set("city", next.city);
    if (next.venue) params.set("venue", next.venue);
    if (next.date) params.set("date", next.date);
    if (next.window) params.set("window", next.window);
    const query = params.toString();
    navigate(query ? `/sessions?${query}` : "/sessions");
  }

  function detailHref(sessionId: number) {
    return currentFilterQuery ? `/sessions/${sessionId}?${currentFilterQuery}` : `/sessions/${sessionId}`;
  }

  function buyHref(session: Session) {
    const params = new URLSearchParams();
    params.set("sessionId", String(session.id));
    if (currentFilterQuery) params.set("from", `/sessions?${currentFilterQuery}`);
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
              <Button variant={!windowFilter ? "default" : "outline"} size="sm" onClick={() => setFilters({ city: cityFilter, venue: venueFilter, date: dateFilter, window: "" })}>
                All upcoming
              </Button>
              <Button variant={windowFilter === "7d" ? "default" : "outline"} size="sm" onClick={() => setFilters({ city: cityFilter, venue: venueFilter, date: "", window: "7d" })}>
                Next 7 days
              </Button>
              <Button variant={windowFilter === "14d" ? "default" : "outline"} size="sm" onClick={() => setFilters({ city: cityFilter, venue: venueFilter, date: "", window: "14d" })}>
                Next 14 days
              </Button>
              <Button variant={windowFilter === "30d" ? "default" : "outline"} size="sm" onClick={() => setFilters({ city: cityFilter, venue: venueFilter, date: "", window: "30d" })}>
                Next 30 days
              </Button>
            </div>
          </div>

          {dateChips.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Jump to date</div>
              <div className="flex flex-wrap gap-2">
                <Button variant={!dateFilter ? "secondary" : "outline"} size="sm" onClick={() => setFilters({ city: cityFilter, venue: venueFilter, date: "", window: windowFilter })}>
                  All dates
                </Button>
                {dateChips.map((chip) => (
                  <Button
                    key={chip.key}
                    variant={dateFilter === chip.key ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ city: cityFilter, venue: venueFilter, date: chip.key, window: windowFilter })}
                  >
                    {chip.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">City</div>
            <div className="flex flex-wrap gap-2">
              <Button variant={!cityFilter ? "default" : "outline"} size="sm" onClick={() => setFilters({ city: "", venue: "", date: dateFilter, window: windowFilter })}>
                All cities
              </Button>
              {availableCities.map((city) => (
                <Button
                  key={city}
                  variant={normalize(city) === cityFilter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ city, venue: "", date: dateFilter, window: windowFilter })}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          {venueOptions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Venue</div>
              <div className="flex flex-wrap gap-2">
                <Button variant={!venueFilter ? "secondary" : "outline"} size="sm" onClick={() => setFilters({ city: cityFilter, venue: "", date: dateFilter, window: windowFilter })}>
                  All venues
                </Button>
                {venueOptions.map((venue) => (
                  <Button
                    key={venue}
                    variant={normalize(venue) === venueFilter ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ city: cityFilter, venue, date: dateFilter, window: windowFilter })}
                  >
                    {venue}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(cityFilter || venueFilter || dateFilter || windowFilter) && (
        <div className="text-sm text-muted-foreground">
          Active filters:
          {windowFilter ? <span className="font-medium text-foreground"> window={windowFilter}</span> : null}
          {dateFilter ? <span className="font-medium text-foreground"> date={dateFilter}</span> : null}
          {cityFilter ? <span className="font-medium text-foreground"> city={cityFilter}</span> : null}
          {venueFilter ? <span className="font-medium text-foreground"> venue={venueFilter}</span> : null}
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
                            <div className="font-medium text-foreground">
                              {session.seatsAvailable} of {session.seatsTotal} seats left
                            </div>
                            {soldOut ? "Sold out" : "Available now"}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            disabled={!canBook}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canBook) navigate(buyHref(session));
                            }}
                          >
                            {soldOut ? "Sold out" : "Book this session"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(detailHref(session.id));
                            }}
                          >
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
