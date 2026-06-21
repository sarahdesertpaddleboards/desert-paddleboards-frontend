import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { experiences } from "@/data/locations";
import { cityClasses } from "@/data/city-classes";
import { getUpcomingSessions, type UpcomingSession } from "@/lib/experiencesApi";
import FareHarborButton, { useFareHarborEmbed } from "@/components/FareHarborButton";

/**
 * Upcoming Sessions calendar — a single chronological, date-grouped list that
 * MERGES two booking sources:
 *   1. FareHarbor sessions (live, from getUpcomingSessions) → "Book" lightframe.
 *   2. City-run classes (src/data/city-classes.ts) that book through the
 *      cities' own systems → external "Register with …" link.
 * This is why we render our own calendar instead of embedding FareHarbor's —
 * the FareHarbor widget can't show the city classes.
 */

const TZ = "America/Phoenix";

const dateKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateKey(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateKeyFmt.format(d);
}

function fmtDateHeader(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

interface CalSession {
  startAt: string;
  title: string;
  venue: string;
  city: string;
  state: string;
  spotsLeft?: number | null;
  source: "fareharbor" | "city";
  itemId?: number;
  bookingUrl?: string;
  bookingLabel?: string;
}

interface UpcomingSessionsProps {
  /** Cap the number of sessions shown (e.g. a homepage teaser). */
  limit?: number;
  heading?: string;
  /** Show a "full calendar" link (used on the compact homepage version). */
  showAllHref?: string;
  className?: string;
}

export default function UpcomingSessions({
  limit,
  heading = "Upcoming sessions",
  showAllHref,
  className = "",
}: UpcomingSessionsProps) {
  const [fhSessions, setFhSessions] = useState<UpcomingSession[]>([]);
  useFareHarborEmbed();

  useEffect(() => {
    let cancelled = false;
    getUpcomingSessions().then((s) => {
      if (!cancelled) setFhSessions(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const byItemId = useMemo(
    () => new Map(experiences.map((e) => [e.itemId, e])),
    [],
  );

  const sessions = useMemo<CalSession[]>(() => {
    const now = Date.now();
    const out: CalSession[] = [];

    for (const s of fhSessions) {
      if (s.isSoldOut) continue;
      const exp = byItemId.get(s.itemId);
      if (!exp) continue; // only show FareHarbor sessions we have a venue for
      out.push({
        startAt: s.startAt,
        title: exp.title,
        venue: exp.venue,
        city: exp.city,
        state: exp.state,
        spotsLeft: s.spotsLeft,
        source: "fareharbor",
        itemId: s.itemId,
      });
    }

    for (const c of cityClasses) {
      for (const cs of c.sessions) {
        out.push({
          startAt: cs.startAt,
          title: c.title,
          venue: c.venue,
          city: c.city,
          state: c.state,
          source: "city",
          bookingUrl: c.bookingUrl,
          bookingLabel: c.bookingLabel,
        });
      }
    }

    return out
      .filter((s) => Date.parse(s.startAt) > now)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [fhSessions, byItemId]);

  const shown = typeof limit === "number" ? sessions.slice(0, limit) : sessions;

  const groups = useMemo(() => {
    const m = new Map<string, CalSession[]>();
    for (const s of shown) {
      const key = dateKey(s.startAt);
      const arr = m.get(key) ?? [];
      arr.push(s);
      m.set(key, arr);
    }
    return [...m.entries()];
  }, [shown]);

  if (sessions.length === 0) return null;

  return (
    <section className={`mx-auto max-w-4xl px-4 ${className}`}>
      {heading || showAllHref ? (
        <div className="mb-6 flex items-end justify-between gap-4">
          {heading ? (
            <h2 className="text-3xl md:text-4xl font-bold">{heading}</h2>
          ) : (
            <span />
          )}
          {showAllHref ? (
            <Link
              to={showAllHref}
              className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
            >
              See the full calendar →
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-8">
        {groups.map(([key, items]) => (
          <div key={key}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">
              {fmtDateHeader(items[0].startAt)}
            </h3>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {items.map((s, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <time className="w-20 flex-shrink-0 text-sm font-semibold text-foreground">
                      {fmtTime(s.startAt)}
                    </time>
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug">{s.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.venue ? `${s.venue} · ` : ""}
                        {s.city}, {s.state}
                        {s.source === "city" ? " · city class" : ""}
                      </p>
                    </div>
                  </div>

                  {s.source === "fareharbor" ? (
                    <FareHarborButton
                      itemId={s.itemId!}
                      className="inline-flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Book
                    </FareHarborButton>
                  ) : s.bookingUrl ? (
                    <a
                      href={s.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                    >
                      {s.bookingLabel ?? "Register"} →
                    </a>
                  ) : (
                    <span className="flex-shrink-0 text-sm text-muted-foreground">
                      Registration link coming soon
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
