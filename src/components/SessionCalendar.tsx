import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FareHarborButton, { useFareHarborEmbed } from "@/components/FareHarborButton";
import {
  useMergedSessions,
  dateKey,
  fmtTime,
  fmtDateHeader,
  type CalSession,
} from "@/lib/sessions";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m0: number, d: number) => `${y}-${pad(m0 + 1)}-${pad(d)}`;

/**
 * Visual month-grid calendar: days with sessions are highlighted; click a day
 * to see + book that day's sessions. Merges FareHarbor + city classes.
 */
export default function SessionCalendar({
  heading = "Find a session by date",
  showAllHref,
  className = "",
}: {
  heading?: string;
  showAllHref?: string;
  className?: string;
}) {
  useFareHarborEmbed();
  const sessions = useMergedSessions();

  const byKey = useMemo(() => {
    const m = new Map<string, CalSession[]>();
    for (const s of sessions) {
      const k = dateKey(s.startAt);
      const arr = m.get(k) ?? [];
      arr.push(s);
      m.set(k, arr);
    }
    return m;
  }, [sessions]);

  const firstKey = sessions.length ? dateKey(sessions[0].startAt) : null;
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  // Once sessions load, jump the view + selection to the first upcoming day.
  useEffect(() => {
    if (firstKey && !selected) {
      const [y, m] = firstKey.split("-").map(Number);
      setView({ y, m: m - 1 });
      setSelected(firstKey);
    }
  }, [firstKey, selected]);

  const todayKey = dateKey(now.toISOString());
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const atCurrentMonth =
    view.y === now.getFullYear() && view.m === now.getMonth();
  const goPrev = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }));
  const goNext = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }));

  if (sessions.length === 0) return null;

  const selectedSessions = selected ? (byKey.get(selected) ?? []) : [];

  return (
    <section className={`mx-auto max-w-5xl px-4 ${className}`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold md:text-4xl">{heading}</h2>
        {showAllHref ? (
          <Link
            to={showAllHref}
            className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
          >
            Full list →
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={atCurrentMonth}
              aria-label="Previous month"
              className="rounded-full p-1.5 text-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold">
              {MONTHS[view.m]} {view.y}
            </span>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next month"
              className="rounded-full p-1.5 text-foreground hover:bg-muted"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="py-1 text-xs font-semibold text-muted-foreground">
                {w}
              </div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const key = ymd(view.y, view.m, d);
              const has = byKey.has(key);
              const isPast = key < todayKey;
              const isSelected = key === selected;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!has}
                  onClick={() => setSelected(key)}
                  className={[
                    "relative aspect-square rounded-lg text-sm transition-colors",
                    isSelected
                      ? "bg-primary font-bold text-primary-foreground"
                      : has
                        ? "bg-primary/10 font-semibold text-primary hover:bg-primary/20"
                        : isPast
                          ? "text-muted-foreground/40"
                          : "text-foreground/70",
                  ].join(" ")}
                >
                  {d}
                  {has && !isSelected ? (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day's sessions */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">
            {selected ? fmtDateHeader(`${selected}T12:00:00`) : "Pick a date"}
          </h3>
          {selectedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions on this day — pick a highlighted date.
            </p>
          ) : (
            <ul className="space-y-3">
              {selectedSessions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {fmtTime(s.startAt)}
                    </p>
                    <p className="font-semibold leading-snug">{s.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.venue ? `${s.venue} · ` : ""}
                      {s.city}
                      {s.source === "city" ? " · city class" : ""}
                    </p>
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
                      Register →
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
