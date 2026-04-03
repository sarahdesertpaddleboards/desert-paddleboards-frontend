import { useEffect, useMemo, useState } from "react";
import { fetchClassProducts, fetchSessions } from "@/lib/classApi";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ClassProduct = {
  id: number;
  name: string;
  description: string;
};

type Session = {
  id: number;
  classProductId: number;
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

function formatSessionStart(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClassesPage() {
  const [items, setItems] = useState<ClassProduct[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [location]);

  const cityFilter = useMemo(() => {
    return normalize(searchParams.get("city") || "");
  }, [searchParams]);

  const venueFilter = useMemo(() => {
    return normalize(searchParams.get("venue") || "");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [products, allSessions] = await Promise.all([
          fetchClassProducts(),
          fetchSessions(),
        ]);

        if (!cancelled) {
          setItems(Array.isArray(products) ? products : []);
          setSessions(Array.isArray(allSessions) ? allSessions : []);
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

  const upcomingSessions = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => {
      const startMs = new Date(s.startTime).getTime();
      return Number.isFinite(startMs) && startMs >= now;
    });
  }, [sessions]);

  const availableCities = useMemo(() => {
    return [...new Set(
      upcomingSessions
        .map((s) => s.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [upcomingSessions]);

  const availableVenues = useMemo(() => {
    return [...new Set(
      upcomingSessions
        .filter((s) => {
          if (!cityFilter) return true;
          return normalize(s.venueCity || "") === cityFilter;
        })
        .map((s) => s.venueName)
        .filter((venue): venue is string => Boolean(venue))
        .map((venue) => venue.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [upcomingSessions, cityFilter]);

  const filteredSessions = useMemo(() => {
    return upcomingSessions.filter((s) => {
      if (cityFilter && normalize(s.venueCity || "") !== cityFilter) return false;
      if (venueFilter && normalize(s.venueName || "") !== venueFilter) return false;
      return true;
    });
  }, [upcomingSessions, cityFilter, venueFilter]);

  const filteredItems = useMemo(() => {
    if (!cityFilter && !venueFilter) return items;

    const matchingClassIds = new Set(filteredSessions.map((s) => Number(s.classProductId)));
    return items.filter((item) => matchingClassIds.has(Number(item.id)));
  }, [items, filteredSessions, cityFilter, venueFilter]);

  const sessionCountByClass = useMemo(() => {
    const map = new Map<number, number>();
    for (const session of filteredSessions) {
      map.set(session.classProductId, (map.get(session.classProductId) || 0) + 1);
    }
    return map;
  }, [filteredSessions]);

  const nextSessionByClass = useMemo(() => {
    const map = new Map<number, Session>();

    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    for (const session of sorted) {
      if (!map.has(session.classProductId)) {
        map.set(session.classProductId, session);
      }
    }

    return map;
  }, [filteredSessions]);

  function setFilters(nextCity?: string, nextVenue?: string) {
    const params = new URLSearchParams();
    if (nextCity) params.set("city", nextCity);
    if (nextVenue) params.set("venue", nextVenue);
    const query = params.toString();
    navigate(query ? `/classes?${query}` : "/classes");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Classes</h1>
        <p className="text-muted-foreground">
          Browse floating soundbath experiences by city and venue, then choose the class that fits.
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

        {availableVenues.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={!venueFilter ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilters(cityFilter || undefined, undefined)}
            >
              All venues
            </Button>
            {availableVenues.map((venue) => (
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
        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredItems.length}</span> class
          {filteredItems.length === 1 ? "" : "es"} matching
          {cityFilter ? <span className="font-medium text-foreground"> city={cityFilter}</span> : null}
          {venueFilter ? <span className="font-medium text-foreground"> venue={venueFilter}</span> : null}
          .
        </div>
      )}

      {loading ? (
        <p>Loading classes…</p>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No classes found for this filter yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((c) => {
            const nextSession = nextSessionByClass.get(c.id);
            const sessionCount = sessionCountByClass.get(c.id) || 0;

            return (
              <Card
                key={c.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/classes/${c.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">{c.name}</h2>
                    <p>{c.description}</p>
                    <div className="text-sm text-muted-foreground">
                      {sessionCount} upcoming session{sessionCount === 1 ? "" : "s"}
                    </div>
                  </div>

                  {nextSession ? (
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                      <div className="text-sm font-semibold">Next session</div>
                      <div className="text-sm">{formatSessionStart(nextSession.startTime)}</div>
                      <div className="text-sm text-muted-foreground">
                        {nextSession.venueName ?? "Venue TBD"}
                        {nextSession.venueCity && nextSession.venueState
                          ? ` • ${nextSession.venueCity}, ${nextSession.venueState}`
                          : ""}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {nextSession.seatsAvailable} of {nextSession.seatsTotal} seats available
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sessions/${nextSession.id}`);
                          }}
                        >
                          View next session
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/classes/${c.id}`);
                          }}
                        >
                          View all sessions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                      No upcoming sessions found for this class in the current filter.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
