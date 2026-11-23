/**
 * "Add to calendar" for a confirmed shift, in the browser: a Google Calendar
 * link and a downloadable .ics (Apple / Outlook). Mirrors server/staff/calendar.js,
 * which attaches the same .ics to the confirmation email.
 */
import type { Shift } from "./api";

const DEFAULT_MINUTES = 90;

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function span(shift: Pick<Shift, "startAt" | "endAt">) {
  const start = Date.parse(shift.startAt);
  const end = shift.endAt ? Date.parse(shift.endAt) : NaN;
  return { start, end: Number.isNaN(end) || end <= start ? start + DEFAULT_MINUTES * 60_000 : end };
}

const where = (s: Pick<Shift, "venue" | "city" | "address">) => [s.venue, s.address || s.city].filter(Boolean).join(", ");

export function googleCalendarUrl(shift: Shift, role?: string): string {
  const { start, end } = span(shift);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Desert Paddleboards: ${shift.title}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: where(shift),
    details: [role ? `Your role: ${role}` : null, "Desert Paddleboards staff shift."].filter(Boolean).join("\n"),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

export function downloadIcs(shift: Shift, role?: string) {
  const { start, end } = span(shift);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Desert Paddleboards//Staff//EN",
    "BEGIN:VEVENT",
    `UID:${shift.id}@staff.desertpaddleboards.com`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`Desert Paddleboards: ${shift.title}`)}`,
    `LOCATION:${esc(where(shift))}`,
    `DESCRIPTION:${esc([role ? `Your role: ${role}` : "", "Desert Paddleboards staff shift."].filter(Boolean).join("\n"))}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Shift in 2 hours",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "desert-paddleboards-shift.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
