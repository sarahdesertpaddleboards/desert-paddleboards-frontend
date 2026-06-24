import { useMemo } from "react";
import { Link } from "react-router-dom";
import FareHarborButton, { useFareHarborEmbed } from "@/components/FareHarborButton";
import {
  useMergedSessions,
  dateKey,
  fmtTime,
  fmtDateHeader,
  type CalSession,
} from "@/lib/sessions";

/**
 * Upcoming Sessions — a chronological, date-grouped list merging live
 * FareHarbor sessions with city-run classes (shared logic in lib/sessions).
 * FareHarbor → "Book" lightframe; city → external "Register with …" link.
 */
interface UpcomingSessionsProps {
  limit?: number;
  heading?: string;
  showAllHref?: string;
  className?: string;
}

export default function UpcomingSessions({
  limit,
  heading = "Upcoming sessions",
  showAllHref,
  className = "",
}: UpcomingSessionsProps) {
  useFareHarborEmbed();
  const sessions = useMergedSessions();

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
                      {s.slug ? (
                        <Link to={`/locations/${s.slug}`}>
                          <p className="font-semibold leading-snug hover:text-brand-dark">
                            {s.title}
                          </p>
                        </Link>
                      ) : (
                        <p className="font-semibold leading-snug">{s.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {s.venue ? `${s.venue} · ` : ""}
                        {s.city}, {s.state}
                        {s.source === "city" ? " · city class" : ""}
                      </p>
                      {s.note ? (
                        <p className="mt-1 text-xs text-muted-foreground/90">
                          {s.note}
                        </p>
                      ) : null}
                      {s.slug ? (
                        <Link
                          to={`/locations/${s.slug}`}
                          className="mt-1 inline-block text-xs font-semibold text-brand hover:underline"
                        >
                          More info →
                        </Link>
                      ) : null}
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
