/** Phone numbers: read what people type, US-first. Shared by profiles, venues and texts. */

/** US-first phone normalising: "(602) 456-0884" → "+16024560884"; null if unusable. */
export function toE164(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  const digits = s.replace(/\D/g, "");
  if (s.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/**
 * Read a phone number someone typed, in any everyday format: "(480) 555-0123",
 * "480.555.0123", "+1 480 555 0123", phone autofill with odd dashes or spaces.
 * Returns a tidy display form ("(480) 555-0123" for US numbers, else +E.164),
 * "" for blank, or null if it isn't a usable number.
 */
export function readPhone(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/[a-z]/i.test(s)) return null;
  const e164 = toE164(s);
  if (!e164) return null;
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return us ? `(${us[1]}) ${us[2]}-${us[3]}` : e164;
}

export const PHONE_HELP = "That mobile number doesn't look right. Type the 10 digits, like (480) 555-0123.";

