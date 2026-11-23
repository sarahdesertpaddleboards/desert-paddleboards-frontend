/**
 * "Add to calendar" for a confirmed shift: an .ics file (Apple/Outlook/Google
 * all open it) attached to the confirmation email, plus a Google Calendar link.
 * Times are absolute (UTC), so phones in any time zone show the right Arizona time.
 * Keep the text in step with src/staff/calendar.ts (the in-app button).
 */

const DEFAULT_MINUTES = 90;

const utcStamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function times(event) {
  const start = Date.parse(event.start_at);
  const end = event.end_at ? Date.parse(event.end_at) : NaN;
  return { start, end: Number.isNaN(end) || end <= start ? start + DEFAULT_MINUTES * 60_000 : end };
}

function location(event, address) {
  return [event.venue, address || event.city].filter(Boolean).join(", ");
}

function description({ role, url }) {
  return [role ? `Your role: ${role}` : null, "Desert Paddleboards staff shift.", url ? `Details: ${url}` : null]
    .filter(Boolean)
    .join("\n");
}

const icsEscape = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** RFC 5545 lines are max 75 octets; continuation lines start with a space. */
function fold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

/** The .ics text for one shift. */
export function shiftIcs({ event, address, role, url }) {
  const { start, end } = times(event);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Desert Paddleboards//Staff//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@staff.desertpaddleboards.com`,
    `DTSTAMP:${utcStamp(Date.now())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${icsEscape(`Desert Paddleboards: ${event.title}`)}`,
    `LOCATION:${icsEscape(location(event, address))}`,
    `DESCRIPTION:${icsEscape(description({ role, url }))}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Shift in 2 hours",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Google Calendar "add event" link for one shift. */
export function googleCalendarUrl({ event, address, role, url }) {
  const { start, end } = times(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Desert Paddleboards: ${event.title}`,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    location: location(event, address),
    details: description({ role, url }),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Resend attachment for the .ics (base64). */
export function icsAttachment(args) {
  const bytes = new TextEncoder().encode(shiftIcs(args));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return { filename: "shift.ics", content: btoa(bin), content_type: "text/calendar; charset=utf-8; method=PUBLISH" };
}
