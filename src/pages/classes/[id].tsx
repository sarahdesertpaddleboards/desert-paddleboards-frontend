import { useEffect, useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { getClassProducts, getClassSessions } from "../../lib/classApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function ClassDetailPage() {
  const [match, params] = useRoute("/classes/:id");
  const [location, navigate] = useLocation();

  const classId = Number(params?.id);

  const [classProduct, setClassProduct] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const cityFilter = normalize(searchParams.get("city") || "");
  const venueFilter = normalize(searchParams.get("venue") || "");

  const backToClassesHref = useMemo(() => {
    const params = new URLSearchParams();
    if (cityFilter) params.set("city", cityFilter);
    if (venueFilter) params.set("venue", venueFilter);
    const query = params.toString();
    return query ? `/classes?${query}` : "/classes";
  }, [cityFilter, venueFilter]);

  function toDateSafe(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatStart(value: string): string {
    const start = toDateSafe(value);
    if (!start) return "TBA";
    return start.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    if (!match || !Number.isFinite(classId)) return;

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);

        const products = await getClassProducts();
        const found = (Array.isArray(products) ? products : []).find(
          (p) => Number(p.id) === classId
        );

        const allSessions = await getClassSessions();

        const filtered = (Array.isArray(allSessions) ? allSessions : [])
          .filter((s) => Number(s.classProductId) === classId)
          .filter((s) => {
            if (cityFilter && normalize(s.venueCity || "") !== cityFilter) return false;
            if (venueFilter && normalize(s.venueName || "") !== venueFilter) return false;
            return true;
          })
          .sort((a, b) => {
            const aStart = toDateSafe(a?.startTime)?.getTime() ?? 0;
            const bStart = toDateSafe(b?.startTime)?.getTime() ?? 0;
            return aStart - bStart;
          });

        if (isMounted) {
          setClassProduct(found ?? null);
          setSessions(filtered);
        }
      } catch (err) {
        console.error("CLASS DETAIL: failed to load", err);
        if (isMounted) {
          setClassProduct(null);
          setSessions([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [match, classId, cityFilter, venueFilter]);

  if (!match) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {loading ? (
        <p>Loading class…</p>
      ) : !classProduct ? (
        <p>Class not found.</p>
      ) : (
        <>
          <div className="space-y-3">
            <Button variant="outline" size="sm" onClick={() => navigate(backToClassesHref)}>
              Back to classes
            </Button>
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wide text-muted-foreground">
                Choose your session
              </div>
              <h1 className="text-3xl font-bold">{classProduct.name}</h1>
              <p className="text-muted-foreground max-w-3xl">{classProduct.description}</p>
            </div>
          </div>

          {(cityFilter || venueFilter) && (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Showing sessions
                {cityFilter ? <span className="font-medium text-foreground"> in {cityFilter}</span> : null}
                {venueFilter ? <span className="font-medium text-foreground"> at {venueFilter}</span> : null}
                .
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 space-y-2">
              <div className="font-medium">
                {sessions.length} upcoming session{sessions.length === 1 ? "" : "s"}
              </div>
              <div className="text-sm text-muted-foreground">
                Pick the date, venue, and availability that works best for you.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  No upcoming sessions for this class right now in the current filter.
                </CardContent>
              </Card>
            ) : (
              sessions.map((s: any) => (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold text-lg">{formatStart(s.startTime)}</div>

                        {s.venueName ? (
                          <div className="text-sm text-muted-foreground">
                            {s.venueName}
                            {s.venueCity && s.venueState
                              ? ` • ${s.venueCity}, ${s.venueState}`
                              : ""}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Venue TBD</div>
                        )}
                      </div>

                      {typeof s.seatsAvailable === "number" && typeof s.seatsTotal === "number" ? (
                        <div className="text-sm text-muted-foreground md:text-right">
                          <div className="font-medium text-foreground">
                            {s.seatsAvailable} of {s.seatsTotal} seats left
                          </div>
                          {s.seatsAvailable <= 0 ? "Sold out" : "Available now"}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => navigate(`/sessions/${s.id}`)}>
                        View details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
