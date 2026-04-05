import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getClassSessionById } from "../../lib/classApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatInTimeZone } from "@/lib/sessionTime";

export default function SessionDetailPage() {
  const [match, params] = useRoute("/sessions/:id");
  const sessionId = params?.id;
  const [location, navigate] = useLocation();

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const cityFilter = searchParams.get("city") || "";
  const venueFilter = searchParams.get("venue") || "";

  const backToSessionsHref = useMemo(() => {
    const params = new URLSearchParams();
    if (cityFilter) params.set("city", cityFilter);
    if (venueFilter) params.set("venue", venueFilter);
    const query = params.toString();
    return query ? `/sessions?${query}` : "/sessions";
  }, [cityFilter, venueFilter]);

  function toDateSafe(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatRange(s: any): string {
    const start = toDateSafe(s?.startTime);
    const end = toDateSafe(s?.endTime);
    const timeZone = s?.venueTimezone;

    if (!start) return "TBA";

    if (end) {
      return `${formatInTimeZone(s.startTime, timeZone, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} – ${new Date(s.endTime).toLocaleTimeString([], {
        timeZone: timeZone || undefined,
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return formatInTimeZone(s.startTime, timeZone, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    if (!match || !sessionId) return;

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await getClassSessionById(sessionId);
        if (isMounted) setSession(data ?? null);
      } catch (err) {
        console.error("SESSION DETAIL: failed to load session", err);
        if (isMounted) setSession(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [match, sessionId]);

  if (!match) return null;

  if (loading) {
    return <div className="p-6 max-w-3xl mx-auto">Loading session…</div>;
  }

  if (!session) {
    return <div className="p-6 max-w-3xl mx-auto">Session not found.</div>;
  }

  const seatsAvailable = typeof session.seatsAvailable === "number" ? session.seatsAvailable : null;
  const seatsTotal = typeof session.seatsTotal === "number" ? session.seatsTotal : null;
  const soldOut = seatsAvailable !== null && seatsAvailable <= 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={() => navigate(backToSessionsHref)}>
          Back to sessions
        </Button>
        <div className="space-y-2">
          <div className="text-sm uppercase tracking-wide text-muted-foreground">Session details</div>
          <h1 className="text-3xl font-bold">{session.className ?? session.name ?? "Session"}</h1>
          <p className="text-muted-foreground">Review this session and continue into the booking flow when you’re ready.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Date & time</div>
            <div className="font-medium">{formatRange(session)}</div>
          </div>

          {(session.venueName || session.venueCity) && (
            <div>
              <div className="text-sm text-muted-foreground">Venue</div>
              <div className="font-medium">
                {session.venueName ?? "Venue TBD"}
                {session.venueCity && session.venueState ? ` • ${session.venueCity}, ${session.venueState}` : ""}
              </div>
            </div>
          )}

          {seatsAvailable !== null && seatsTotal !== null && (
            <div>
              <div className="text-sm text-muted-foreground">Availability</div>
              <div className="font-medium">{seatsAvailable} of {seatsTotal} seats available</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" disabled={soldOut || !session.productKey} onClick={() => navigate(`/buy/${session.productKey}?sessionId=${session.id}`)}>
          {soldOut ? "Sold out" : "Book this session"}
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate(`/classes/${session.classProductId}`)}>
          View all sessions for this class
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        This booking continues through the same secure checkout flow as the rest of the store, with your selected session attached.
      </div>
    </div>
  );
}
