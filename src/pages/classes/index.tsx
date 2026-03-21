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

function normalizeCity(value: string) {
  return value.trim().toLowerCase();
}

export default function ClassesPage() {
  const [items, setItems] = useState<ClassProduct[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  const cityFilter = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return normalizeCity(params.get("city") || "");
  }, [location]);

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

  const availableCities = useMemo(() => {
    return [...new Set(
      sessions
        .map((s) => s.venueCity)
        .filter((city): city is string => Boolean(city))
        .map((city) => city.trim())
    )].sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  const filteredItems = useMemo(() => {
    if (!cityFilter) return items;

    const matchingClassIds = new Set(
      sessions
        .filter((s) => normalizeCity(s.venueCity || "") === cityFilter)
        .map((s) => Number(s.classProductId))
    );

    return items.filter((item) => matchingClassIds.has(Number(item.id)));
  }, [items, sessions, cityFilter]);

  const sessionCountByClass = useMemo(() => {
    const filteredSessions = cityFilter
      ? sessions.filter((s) => normalizeCity(s.venueCity || "") === cityFilter)
      : sessions;

    const map = new Map<number, number>();
    for (const session of filteredSessions) {
      map.set(session.classProductId, (map.get(session.classProductId) || 0) + 1);
    }
    return map;
  }, [sessions, cityFilter]);

  function setCity(city?: string) {
    if (!city) {
      navigate("/classes");
      return;
    }
    navigate(`/classes?city=${encodeURIComponent(city)}`);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Classes</h1>
        <p className="text-muted-foreground">
          Browse upcoming floating soundbath experiences by city.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={!cityFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setCity()}
        >
          All cities
        </Button>
        {availableCities.map((city) => (
          <Button
            key={city}
            variant={normalizeCity(city) === cityFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setCity(city)}
          >
            {city}
          </Button>
        ))}
      </div>

      {cityFilter && (
        <div className="text-sm text-muted-foreground">
          Filtering classes for city: <span className="font-medium text-foreground">{cityFilter}</span>
        </div>
      )}

      {loading ? (
        <p>Loading classes…</p>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No classes found for this city yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((c) => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/classes/${c.id}`)}>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-bold">{c.name}</h2>
                <p>{c.description}</p>
                <div className="text-sm text-muted-foreground">
                  {sessionCountByClass.get(c.id) || 0} upcoming session{(sessionCountByClass.get(c.id) || 0) === 1 ? "" : "s"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
