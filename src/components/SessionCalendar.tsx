import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FareHarborButton, { useFareHarborEmbed } from "@/components/FareHarborButton";
import {
  useMergedSessions,
  dateKey,
  fmtTime,
  fmtDateHeader,
  TZ,
  type CalSession,
} from "@/lib/sessions";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m0: number, d: number) => `${y}-${pad(m0 + 1)}-${pad(d)}`;

function fmtDayShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function BookingButton({ s }: { s: CalSession }) {
  // Sold out → invite a waitlist text (booking is closed in FareHarbor).
  if (s.isSoldOut) {
    return (
      <a
        href="sms:6024560884"
        className="inline-flex max-w-[8.5rem] flex-shrink-0 flex-col items-center justify-center rounded-xl bg-muted px-3 py-1.5 text-center text-[11px] font-semibold leading-tight text-muted-foreground hover:bg-muted/80"
      >
        Fully booked — text to join waitlist
      </a>
    );
  }
  // Real FareHarbor session that's only closed by the booking cutoff (e.g.
  // starts within the next few hours) → point them to call instead.
  if (s.source === "fareharbor" && s.isBookable === false) {
    return (
      <a
        href="tel:6024560884"
        className="inline-flex max-w-[8.5rem] flex-shrink-0 flex-col items-center justify-center rounded-xl bg-muted px-3 py-1.5 text-center text-[11px] font-semibold leading-tight text-muted-foreground hover:bg-muted/80"
      >
        Booking closed — please call to book
      </a>
    );
  }
  if (s.source === "fareharbor") {
    return (
      <FareHarborButton
        itemId={s.itemId!}
        className="inline-flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Book
      </FareHarborButton>
    );
  }
  if (s.bookingUrl) {
    return (
      <a
        href={s.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
      >
        Register →
      </a>
    );
  }
  return null;
}

function SessionRow({ s, showDate }: { s: CalSession; showDate?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {showDate ? `${fmtDayShort(s.startAt)} · ` : ""}
          {fmtTime(s.startAt)}
        </p>
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
          {s.city}
          {s.source === "city" ? " · city class" : ""}
        </p>
        {s.note ? (
          <p className="mt-1 text-xs text-muted-foreground/90">{s.note}</p>
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
      <BookingButton s={s} />
    </li>
  );
}

/**
 * Time-boxed promo for the slot under the calendar. While `until` is in the
 * future it replaces the evergreen private-events card, then auto-reverts —
 * no code change needed when it expires. Times are Phoenix (UTC-07:00).
 * Currently: boosting the Sat Aug 8 Kino Aquatic Center class.
 */
const SLOT_PROMO = {
  itemId: 171055,
  until: "2026-08-09T02:00:00-07:00", // through Saturday night
  eyebrow: "This Saturday",
  title: "Floating Soundbath at Kino Aquatic Center",
  body: "Saturday, Aug 8 at 7:30 PM in Mesa — float under the summer night sky while live sound carries you. Spots are open, and evening on the water is the coolest place in town.",
  learnMoreHref: "/locations/floating-soundbath-kino-aquatics-mesa",
};

/**
 * Visual month-grid calendar + an upcoming list. By default the right panel
 * shows the next 7 days of sessions (falling back to the next 5 if the coming
 * week is empty); clicking a day in the grid drills into that day. Merges
 * FareHarbor + city classes.
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

  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Until the user interacts, keep the grid on the month of the soonest
  // session (re-runs as the live FareHarbor feed arrives, so we don't get
  // stuck on the first static city-class date).
  const firstKey = sessions.length ? dateKey(sessions[0].startAt) : null;
  useEffect(() => {
    if (!touched && firstKey) {
      const [y, m] = firstKey.split("-").map(Number);
      setView({ y, m: m - 1 });
    }
  }, [firstKey, touched]);

  const todayKey = dateKey(now.toISOString());
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const atCurrentMonth =
    view.y === now.getFullYear() && view.m === now.getMonth();
  const nav = (dir: 1 | -1) => {
    setTouched(true);
    setView((v) => {
      const m = v.m + dir;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { ...v, m };
    });
  };

  // Default panel: next 7 days (fallback to the next 5 sessions if empty).
  const nextWeek = useMemo(() => {
    const weekMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const within = sessions.filter((s) => Date.parse(s.startAt) <= weekMs);
    return (within.length ? within : sessions.slice(0, 5)).slice(0, 7);
  }, [sessions]);

  if (sessions.length === 0) return null;

  const panel = selected ? (byKey.get(selected) ?? []) : nextWeek;
  const weekIsFallback =
    !selected && nextWeek.length > 0 &&
    Date.parse(nextWeek[0].startAt) > Date.now() + 7 * 24 * 60 * 60 * 1000;

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

      {/* Mobile stacks calendar → sessions → CTA (order classes) so the class
          list is never pushed below the fold by the CTA; on md+ the CTA sits
          under the calendar in the left column via explicit grid placement. */}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        {/* Calendar grid */}
        <div className="order-1 rounded-2xl border border-border bg-card p-4 sm:p-6 md:col-start-1 md:row-start-1">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => nav(-1)}
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
              onClick={() => nav(1)}
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
                  onClick={() => {
                    setSelected(key);
                    setTouched(true);
                  }}
                  className={[
                    // min-h keeps the tap target at the 44px accessibility
                    // minimum on phones (width still flexes with the grid).
                    "relative aspect-square min-h-[44px] rounded-lg text-sm transition-colors",
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

        {/* Fills the space beside the sessions list. Shows the time-boxed
            SLOT_PROMO while active, else the evergreen private-events card.
            Ordered last on mobile so it never sits between the calendar and
            the class list. */}
        <div className="order-3 rounded-2xl border border-border bg-card p-6 md:order-none md:col-start-1 md:row-start-2">
          {Date.now() < Date.parse(SLOT_PROMO.until) ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {SLOT_PROMO.eyebrow}
              </p>
              <h3 className="mt-1 text-lg font-bold">{SLOT_PROMO.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{SLOT_PROMO.body}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <FareHarborButton
                  itemId={SLOT_PROMO.itemId}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Book your spot
                </FareHarborButton>
                <Link
                  to={SLOT_PROMO.learnMoreHref}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Learn more →
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold">Don't see a date that works?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We host private floating soundbaths for bachelorette parties, corporate
                wellness days, birthdays and team events — at your venue or ours. Tell us
                what you have in mind and we'll build it around your group.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/private-events"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Plan a private event
                </Link>
                <Link
                  to="/locations"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Browse all venues
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Upcoming sessions (next 7 days by default; a single day when clicked) */}
        <div className="order-2 md:order-none md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
              {selected
                ? fmtDateHeader(`${selected}T12:00:00`)
                : weekIsFallback
                  ? "Next sessions"
                  : "Next 7 days"}
            </h3>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                ← This week
              </button>
            ) : null}
          </div>

          {panel.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing on this day — pick another highlighted date.
            </p>
          ) : (
            <ul className="space-y-3">
              {panel.map((s, i) => (
                <SessionRow key={i} s={s} showDate={!selected} />
              ))}
            </ul>
          )}

          {!selected && showAllHref ? (
            <Link
              to={showAllHref}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              See more dates →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
