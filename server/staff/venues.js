/**
 * Venue directory: address (shown to staff) and the venue's contact person
 * (PRIVATE: admins only, plus the event lead in the day-before reminder).
 * Shifts link to a venue by name, case-insensitively, so auto-posted calendar
 * shifts pick up the details without anyone touching them. A shift can
 * override any of the three fields (private events, or a one-off contact).
 */
import { HttpError, cleanText } from "./http.js";
import { PHONE_HELP, readPhone } from "./phone.js";

export const venueKey = (name) =>
  String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export function toPublicVenue(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    notes: row.notes,
    shiftCount: row.shift_count ?? undefined,
    updatedAt: row.updated_at,
  };
}

/** Validate venue fields from a request body (name required unless partial). */
export function readVenueInput(body, { partial = false } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined;
  if (!partial || has("name")) {
    const name = cleanText(body.name, 120);
    if (!name) throw new HttpError(400, "name_required", "Give the venue a name (as it appears on the calendar).");
    out.name = name;
    out.name_key = venueKey(name);
  }
  if (has("address")) out.address = cleanText(body.address, 200);
  if (has("contactName")) out.contact_name = cleanText(body.contactName, 80);
  if (has("contactPhone")) {
    const phone = readPhone(cleanText(body.contactPhone, 40));
    if (phone === null) throw new HttpError(400, "invalid_phone", PHONE_HELP.replace("mobile", "contact"));
    out.contact_phone = phone || null;
  }
  if (has("notes")) out.notes = cleanText(body.notes, 1000);
  return out;
}

export async function findVenue(db, name) {
  const key = venueKey(name);
  if (!key) return null;
  return db.prepare("SELECT * FROM venues WHERE name_key = ?1").bind(key).first();
}

/**
 * Where to go and who to call for one shift: the shift's own fields win,
 * else the venue directory. Returns { address, contactName, contactPhone,
 * venueId, from: { address, contact } } (from = "shift" | "venue" | null).
 */
export async function contactForEvent(db, event) {
  const venue = event.venue ? await findVenue(db, event.venue) : null;
  const pick = (own, fromVenue) => (own ? [own, "shift"] : fromVenue ? [fromVenue, "venue"] : [null, null]);
  const [address, addressFrom] = pick(event.address, venue?.address);
  const ownContact = event.contact_name || event.contact_phone;
  const contactName = ownContact ? event.contact_name : venue?.contact_name ?? null;
  const contactPhone = ownContact ? event.contact_phone : venue?.contact_phone ?? null;
  return {
    address,
    contactName,
    contactPhone,
    venueId: venue?.id ?? null,
    from: {
      address: addressFrom,
      contact: ownContact ? "shift" : venue?.contact_name || venue?.contact_phone ? "venue" : null,
    },
  };
}

/**
 * Parse pasted rows (from a spreadsheet: tab- or comma-separated) into venue
 * inputs: name, address, contact name, contact phone, notes. A header row is
 * skipped. Returns { rows, skipped: [{ line, reason }] }.
 */
export function parseVenueRows(text) {
  const rows = [];
  const skipped = [];
  String(text ?? "")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (!line.trim()) return;
      const cells = (line.includes("\t") ? line.split("\t") : splitCsv(line)).map((c) => c.trim());
      if (i === 0 && /^(venue|name|location)/i.test(cells[0] ?? "")) return;
      const [name, address, contactName, contactPhone, notes] = cells;
      if (!name) {
        skipped.push({ line: i + 1, reason: "no venue name" });
        return;
      }
      rows.push({ name, address, contactName, contactPhone, notes, line: i + 1 });
    });
  return { rows, skipped };
}

/** Minimal CSV split honouring "quoted, cells". */
export function splitCsv(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
