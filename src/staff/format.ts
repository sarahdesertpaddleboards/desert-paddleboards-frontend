/** Display + form helpers for shifts. Everything is Arizona time (no DST). */
import { fmtDateHeader, fmtTime, TZ } from "@/lib/sessions";
import { ApiError, type MarkPaidResult } from "./api";

export function money(cents: number | null | undefined): string {
  if (cents == null) return "";
  const d = cents / 100;
  return `$${Number.isInteger(d) ? d : d.toFixed(2)}`;
}

/** "Saturday, November 7" */
export const dayLabel = (iso: string) => fmtDateHeader(iso);

/** "5:30 PM – 6:30 PM" */
export function timeRange(startAt: string, endAt?: string | null): string {
  return endAt ? `${fmtTime(startAt)} – ${fmtTime(endAt)}` : fmtTime(startAt);
}

/** "Sat, Nov 7" */
export function shortDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
}

const partsFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** ISO → { date: "2026-11-07", time: "17:30" } in Arizona, for <input type=date/time>. */
export function toInputs(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Date + time inputs → "2026-11-07T17:30:00-07:00" (or null if either is blank). */
export function fromInputs(date: string, time: string): string | null {
  return date && time ? `${date}T${time}:00-07:00` : null;
}

export function venueLine(s: { venue: string | null; city: string | null }): string {
  return [s.venue, s.city].filter(Boolean).join(", ");
}

export function errMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.message && err.message !== err.code ? err.message : fallback;
}

/** Arizona calendar year of an instant, e.g. 2026. */
export function azYear(iso: string | number = Date.now()): number {
  return Number(new Date(iso).toLocaleDateString("en-US", { timeZone: TZ, year: "numeric" }));
}

/** "2026-11" in Arizona, for grouping and comparing months. */
export function azMonthKey(iso: string | number = Date.now()): string {
  return toInputs(new Date(iso).toISOString()).date.slice(0, 7);
}

/** "November 2026" */
export function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: TZ, month: "long", year: "numeric" });
}

/** Feedback line after marking shifts paid. */
export function describePaid(res: MarkPaidResult, notify: boolean): string {
  const what = `${money(res.totalCents)} marked paid (${res.paidCount} shift${res.paidCount === 1 ? "" : "s"}).`;
  if (!notify) return `${what} No email sent.`;
  if (res.localMode) return `${what} Local dev: no email sent.`;
  if (res.emailErrors.length) {
    return `${what} The email to ${res.emailErrors.map((e) => e.name).join(", ")} failed, so let them know directly.`;
  }
  const texts = res.texted ? ` ${res.texted === 1 && res.emailed === 1 ? "And texted." : `${res.texted} also got a text.`}` : "";
  return `${what} ${res.emailed === 1 ? "They've" : "Everyone's"} been emailed.${texts}`;
}
