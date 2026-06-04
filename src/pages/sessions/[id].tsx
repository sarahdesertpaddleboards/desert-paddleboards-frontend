import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getClassSessionById } from "../../lib/classApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatInTimeZone, formatSessionTimeRange } from "@/lib/sessionTime";

export default function SessionDetailPage() {
  const [match, params] = useRoute("/sessions/:id");
  const sessionId = params?.id;
  const [location, navigate] = useLocation();

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const from = searchParams.get("from");
  const backQuery = searchParams.toString();

  const backToSessionsHref = useMemo(() => {
    if (from) return from;
    return backQuery ? `/sessions?${backQuery}` : "/";
  }, [backQuery, from]);

  function toDateSafe(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatDateLine(s: any): string {
    const start = toDateSafe(s?.startTime);
    if (!start) return "TBA";
    return formatInTimeZone(s.startTime, s?.venueTimezone, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function formatTimeLine(s: any): string {
    const start = toDateSafe(s?.startTime);
    if (!start) return "TBA";
    return formatSessionTimeRange(s.startTime, s.endTime, s?.venueTimezone);
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
  if (loading) return <div className="p-6 max-w-4xl mx-auto">Loading session…</div>;
  if (!session) return <div className="p-6 max-w-4xl mx-auto">Session not found.</div>;

  const seatsAvailable = typeof session.seatsAvailable === "number" ? session.seatsAvailable : null;
  const seatsTotal = typeof session.seatsTotal === "number" ? session.seatsTotal : null;
  const soldOut = seatsAvailable !== null && seatsAvailable <= 0;
  const lowAvailability = seatsAvailable !== null && seatsAvailable > 0 && seatsAvailable <= 3;
  const venueLine = session.venueName ?? "Venue TBD";
  const locationLine = session.venueCity && session.venueState ? `${session.venueCity}, ${session.venueState}` : "";
  const buyHref = session.productKey ? `/buy/${session.productKey}?sessionId=${session.id}` : "";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate(backToSessionsHref)}>
          Back
        </Button>

        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">Selected session</div>
            <h1 className="text-3xl font-bold leading-tight">{session.className ?? session.name ?? "Session"}</h1>
            <p className="text-muted-foreground max-w-2xl">
              Review the session details below and continue into booking when you’re ready.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {soldOut ? (
              <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">Sold out</span>
            ) : lowAvailability ? (
              <span className="inline-flex rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-sm font-medium">Nearly full</span>
            ) : (
              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-medium">Available</span>
            )}
            {seatsAvailable !== null && seatsTotal !== null && (
              <span className="inline-flex rounded-full bg-muted text-foreground px-3 py-1 text-sm font-medium">
                {seatsAvailable} of {seatsTotal} seats left
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="text-lg font-semibold">{formatDateLine(session)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="text-lg font-semibold">{formatTimeLine(session)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Venue</div>
              <div className="text-lg font-semibold">{venueLine}</div>
              {locationLine ? <div className="text-sm text-muted-foreground">{locationLine}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Next step</div>
              <div className="text-lg font-semibold">Continue to booking</div>
            </div>

            <div className="text-sm text-muted-foreground">
              Your selected session will carry through into the booking flow automatically.
            </div>

            <div className="space-y-2">
              <Button size="lg" className="w-full" disabled={soldOut || !session.productKey} onClick={() => buyHref && navigate(buyHref)}>
                {soldOut ? "Sold out" : "Book this session"}
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate(backToSessionsHref)}>
                Back to calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
