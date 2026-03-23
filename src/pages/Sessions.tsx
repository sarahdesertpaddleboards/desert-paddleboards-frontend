import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { fetchSessions } from "@/lib/classApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatDateHeading(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming sessions";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeRange(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime())) return "TBA";
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return `${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  const cityFilter = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return normalize(params.get("city") || "");
  }, [location]);

  const venueFilter = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return normalize(params.get("venue") || "");
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

  const availableCities = useMemo(() => {
    return [...new Set(
      sessions
        .map((s) => s.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  const venueOptions = useMemo(() => {
    return [...new Set(
      sessions
        .filter((s) => {
          if (!cityFilter) return true;
          return normalize(s.venueCity || "") === cityFilter;
        })
        .map((s) => s.venueName)
        .filter((venue): venue is string => Boolean(venue))
        .map((venue) => venue.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [sessions, cityFilter]);

  const filteredSessions = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((s) => {
        const start = new Date(s.startTime).getTime();
        if (!Number.isFinite(start) || start < now) return false;
        if (cityFilter && normalize(s.venueCity || "") !== cityFilter) return false;
        if (venueFilter && normalize(s.venueName || "") !== venueFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [sessions, cityFilter, venueFilter]);

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const session of filteredSessions) {
      const key = formatDateHeading(session.startTime);
      const list = groups.get(key) || [];
      list.push(session);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filteredSessions]);

  function setFilters(nextCity?: string, nextVenue?: string) {
    const params = new URLSearchParams();
    if (nextCity) params.set("city", nextCity);
    if (nextVenue) params.set("venue", nextVenue);
    const query = params.toString();
    navigate(query ? `/sessions?${query}` : "/sessions");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upcoming sessions</h1>
        <p className="text-muted-foreground">
          Browse bookable floating soundbath sessions by date, city, and venue.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={!cityFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(undefined, undefined)}
          >
            All cities
          </Button>
          {availableCities.map((city) => (
            <Button
              key={city}
              variant={normalize(city) === cityFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(city, undefined)}
            >
              {city}
            </Button>
          ))}
        </div>

        {venueOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={!venueFilter ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilters(cityFilter || undefined, undefined)}
            >
              All venues
            </Button>
            {venueOptions.map((venue) => (
              <Button
                key={venue}
                variant={normalize(venue) === venueFilter ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilters(cityFilter || undefined, venue)}
              >
                {venue}
              </Button>
            ))}
          </div>
        )}
      </div>

      {(cityFilter || venueFilter) && (
        <div className="text-sm text-muted-foreground">
          Active filters:
          {cityFilter ? (
            <span className="font-medium text-foreground"> city={cityFilter}</span>
          ) : null}
          {venueFilter ? (
            <span className="font-medium text-foreground"> venue={venueFilter}</span>
          ) : null}
        </div>
      )}

      {loading ? (
        <p>Loading sessions…</p>
      ) : groupedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No upcoming sessions found for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedSessions.map(([heading, items]) => (
            <section key={heading} className="space-y-3">
              <h2 className="text-xl font-bold">{heading}</h2>
              <div className="grid gap-4">
                {items.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/sessions/${session.id}`)}>
                    <CardContent className="p-5 space-y-2">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg">
                            {session.className ?? "Session"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimeRange(session.startTime, session.endTime)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.venueName ?? "Venue TBD"}
                            {session.venueCity && session.venueState
                              ? ` • ${session.venueCity}, ${session.venueState}`
                              : ""}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground md:text-right">
                          <div className="font-medium text-foreground">
                            {session.seatsAvailable} of {session.seatsTotal} seats left
                          </div>
                          {session.seatsAvailable <= 0 ? "Sold out" : "Available now"}
                        </div>
                      </div>

                      <div>
                        <Button size="sm">View session</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
