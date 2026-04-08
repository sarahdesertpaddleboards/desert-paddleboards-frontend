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
  if (filters.window) params.set("window", filters.window);
  if (filters.city) params.set("city", filters.city);
  if (filters.venue) params.set("venue", filters.venue);
  if (filters.date) params.set("date", filters.date);
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

function getDateChipWeekday(value: string, timeZone?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Day";
  return date.toLocaleDateString([], {
    timeZone: timeZone || undefined,
    weekday: "short",
  });
}

function getWeekBucketLabel(dayOffset: number) {
  if (dayOffset <= 6) return "This week";
  if (dayOffset <= 13) return "Next week";
  return "Later";
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

  useEffect(() => {
    const fromUrl = parseFilters(window.location.search);
    const current = buildQuery(filters);
    const next = buildQuery(fromUrl);
    if (next !== current) {
      setFilters(fromUrl);
    }
  }, [location]);

  const upcomingSessions = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((session) => {
        const start = new Date(session.startTime).getTime();
        return Number.isFinite(start) && start >= now;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [sessions]);

  const windowedSessions = useMemo(() => {
    return upcomingSessions.filter((session) =>
      withinWindow(session.startTime, filters.window, session.venueTimezone)
    );
  }, [upcomingSessions, filters.window]);

  const cityOptions = useMemo(() => {
    return [...new Set(
      windowedSessions
        .map((session) => session.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [windowedSessions]);

  const citySessions = useMemo(() => {
    if (!filters.city) return windowedSessions;
    return windowedSessions.filter(
      (session) => normalize(session.venueCity || "") === filters.city
    );
  }, [windowedSessions, filters.city]);

  const venueOptions = useMemo(() => {
    return [...new Set(
      citySessions
        .map((session) => session.venueName)
        .filter((venue): venue is string => Boolean(venue))
        .map((venue) => venue.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [citySessions]);

  const venueSessions = useMemo(() => {
    if (!filters.venue) return citySessions;
    return citySessions.filter(
      (session) => normalize(session.venueName || "") === filters.venue
    );
  }, [citySessions, filters.venue]);

  const dateOptions = useMemo(() => {
    const seen = new Set<string>();
    const dates: { key: string; label: string; weekday: string; count: number; weekBucket: string; dayOffset: number }[] = [];
    const counts = new Map<string, number>();

    for (const session of venueSessions) {
      const key = getDayKey(session.startTime, session.venueTimezone);
      counts.set(key, (counts.get(key) || 0) + 1);
      if (seen.has(key)) continue;
      seen.add(key);
      const dayOffset = dayNumberInZone(session.startTime, session.venueTimezone) - dayNumberInZone(new Date(), session.venueTimezone);
      dates.push({
        key,
        label: getDateChipLabel(session.startTime, session.venueTimezone),
        weekday: getDateChipWeekday(session.startTime, session.venueTimezone),
        count: 0,
        weekBucket: getWeekBucketLabel(dayOffset),
        dayOffset,
      });
      if (dates.length >= 14) break;
    }

    return dates.map((date) => ({ ...date, count: counts.get(date.key) || 0 }));
  }, [venueSessions]);

  const selectedDateOption = selectedDateIndex >= 0 ? dateOptions[selectedDateIndex] : null;

  const selectedDateIndex = useMemo(() => {
    if (!filters.date) return -1;
    return dateOptions.findIndex((date) => date.key === filters.date);
  }, [dateOptions, filters.date]);

  const previousDate = selectedDateIndex > 0 ? dateOptions[selectedDateIndex - 1] : null;
  const nextDate = selectedDateIndex >= 0 && selectedDateIndex < dateOptions.length - 1 ? dateOptions[selectedDateIndex + 1] : null;

  const resultSessions = useMemo(() => {
    if (!filters.date) return venueSessions;
    return venueSessions.filter(
      (session) => getDayKey(session.startTime, session.venueTimezone) === filters.date
    );
  }, [venueSessions, filters.date]);

  useEffect(() => {
    setFilters((prev) => {
      let next = prev;

      if (prev.city && !cityOptions.some((city) => normalize(city) === prev.city)) {
        next = { ...next, city: "", venue: "", date: "" };
      }
      if (next.venue && !venueOptions.some((venue) => normalize(venue) === next.venue)) {
        next = { ...next, venue: "", date: "" };
      }
      if (next.date && !dateOptions.some((date) => date.key === next.date)) {
        next = { ...next, date: "" };
      }

      return next;
    });
  }, [cityOptions, venueOptions, dateOptions]);

  useEffect(() => {
    const query = buildQuery(filters);
    const target = query ? `/sessions?${query}` : "/sessions";
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== target) {
      navigate(target);
    }
  }, [filters, navigate]);

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const session of resultSessions) {
      const key = formatSessionDateHeading(session.startTime, session.venueTimezone || undefined);
      const existing = groups.get(key) || [];
      existing.push(session);
      groups.set(key, existing);
    }
    return Array.from(groups.entries());
  }, [resultSessions]);

  const currentQuery = useMemo(() => buildQuery(filters), [filters]);
  const totalVisibleSessions = resultSessions.length;
  const soldOutVisibleSessions = resultSessions.filter((session) => session.seatsAvailable <= 0).length;
  const lowAvailabilityVisibleSessions = resultSessions.filter((session) => session.seatsAvailable > 0 && session.seatsAvailable <= 3).length;

  function updateFilters(next: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...next }));
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
              <Button variant={!filters.window ? "default" : "outline"} size="sm" onClick={() => updateFilters({ window: "", date: "" })}>All upcoming</Button>
              <Button variant={filters.window === "7d" ? "default" : "outline"} size="sm" onClick={() => updateFilters({ window: "7d", date: "" })}>Next 7 days</Button>
              <Button variant={filters.window === "14d" ? "default" : "outline"} size="sm" onClick={() => updateFilters({ window: "14d", date: "" })}>Next 14 days</Button>
              <Button variant={filters.window === "30d" ? "default" : "outline"} size="sm" onClick={() => updateFilters({ window: "30d", date: "" })}>Next 30 days</Button>
            </div>
          </div>

          {dateOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Jump to date</div>
                  {selectedDateOption ? (
                    <div className="text-xs text-muted-foreground">
                      Viewing <span className="font-medium text-foreground">{selectedDateOption.label}</span> in <span className="font-medium text-foreground">{selectedDateOption.weekBucket.toLowerCase()}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Browse by date across this availability window</div>
                  )}
                </div>
                {filters.date && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={!previousDate} onClick={() => previousDate && updateFilters({ date: previousDate.key })}>
                      Previous date
                    </Button>
                    <Button size="sm" variant="outline" disabled={!nextDate} onClick={() => nextDate && updateFilters({ date: nextDate.key })}>
                      Next date
                    </Button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-2 min-w-max items-stretch">
                  <Button variant={!filters.date ? "secondary" : "outline"} size="sm" onClick={() => updateFilters({ date: "" })}>All dates</Button>
                  {dateOptions.map((date, index) => {
                    const selected = filters.date === date.key;
                    const showBucket = index === 0 || date.weekBucket !== dateOptions[index - 1]?.weekBucket;
                    return (
                      <div key={date.key} className="space-y-1">
                        {showBucket ? (
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground px-1">{date.weekBucket}</div>
                        ) : (
                          <div className="h-[16px]" />
                        )}
                        <button
                          type="button"
                          onClick={() => updateFilters({ date: date.key })}
                          className={selected
                            ? "min-w-[96px] rounded-xl border border-primary bg-primary text-primary-foreground px-3 py-3 text-left shadow-sm"
                            : "min-w-[96px] rounded-xl border bg-background px-3 py-3 text-left hover:bg-muted transition-colors"
                          }
                        >
                          <div className="text-xs uppercase tracking-wide opacity-80">{date.weekday}</div>
                          <div className="text-sm font-semibold">{date.label}</div>
                          <div className="text-xs opacity-80">{date.count} session{date.count === 1 ? "" : "s"}</div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">City</div>
            <div className="flex flex-wrap gap-2">
              <Button variant={!filters.city ? "default" : "outline"} size="sm" onClick={() => updateFilters({ city: "", venue: "", date: "" })}>All cities</Button>
              {cityOptions.map((city) => (
                <Button key={city} variant={normalize(city) === filters.city ? "default" : "outline"} size="sm" onClick={() => updateFilters({ city: normalize(city), venue: "", date: "" })}>
                  {city}
                </Button>
              ))}
            </div>
          </div>

          {venueOptions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Venue</div>
              <div className="flex flex-wrap gap-2">
                <Button variant={!filters.venue ? "secondary" : "outline"} size="sm" onClick={() => updateFilters({ venue: "", date: "" })}>All venues</Button>
                {venueOptions.map((venue) => (
                  <Button key={venue} variant={normalize(venue) === filters.venue ? "secondary" : "outline"} size="sm" onClick={() => updateFilters({ venue: normalize(venue), date: "" })}>
                    {venue}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading sessions…</p>
      ) : groupedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">No upcoming sessions found for this availability window.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totalVisibleSessions} session{totalVisibleSessions === 1 ? "" : "s"} shown</span>
            {lowAvailabilityVisibleSessions > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-medium">
                {lowAvailabilityVisibleSessions} with few spots left
              </span>
            )}
            {soldOutVisibleSessions > 0 && (
              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium">
                {soldOutVisibleSessions} sold out
              </span>
            )}
          </div>

          <div className="space-y-8">
            {groupedSessions.map(([heading, items]) => (
              <section key={heading} className="space-y-3">
                <h2 className="text-xl font-bold">{heading}</h2>
                <div className="grid gap-4">
                  {items.map((session) => {
                    const soldOut = session.seatsAvailable <= 0;
                    const canBook = Boolean(session.productKey) && !soldOut;
                    return (
                      <Card key={session.id} className="cursor-pointer border-border/70 hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => navigate(detailHref(session.id))}>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="text-lg font-semibold leading-tight">{session.className ?? "Session"}</div>
                                <div className="text-sm font-medium text-foreground">
                                  {formatSessionTimeRange(session.startTime, session.endTime, session.venueTimezone || undefined)}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>{session.venueName ?? "Venue TBD"}</span>
                                {session.venueCity && session.venueState ? (
                                  <>
                                    <span>•</span>
                                    <span>{session.venueCity}, {session.venueState}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="lg:text-right space-y-2">
                              <div className="text-sm font-medium text-foreground">{session.seatsAvailable} of {session.seatsTotal} seats left</div>
                              <div className="h-2 w-full lg:w-36 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={soldOut
                                    ? "h-full w-full bg-slate-300"
                                    : session.seatsAvailable <= 3
                                      ? "h-full bg-amber-400"
                                      : "h-full bg-emerald-400"
                                  }
                                  style={{ width: `${Math.max(8, Math.min(100, (session.seatsAvailable / Math.max(1, session.seatsTotal)) * 100))}%` }}
                                />
                              </div>
                              <div>
                                {soldOut ? (
                                  <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium">Sold out</span>
                                ) : session.seatsAvailable <= 3 ? (
                                  <span className="inline-flex rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-medium">Few spots left</span>
                                ) : (
                                  <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-medium">Available now</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap pt-1">
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
        </div>
      )}
    </div>
  );
}
