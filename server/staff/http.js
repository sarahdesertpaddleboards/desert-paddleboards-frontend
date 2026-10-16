/**
 * Tiny HTTP helpers shared by the /staff-api Pages Functions.
 */

export const json = (status, body, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });

/** Throw this from a handler to send a clean error response. */
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

export const errorResponse = (err) => {
  if (err instanceof HttpError) {
    return json(err.status, { error: err.code, message: err.message });
  }
  console.error("staff-api error", err && err.stack ? err.stack : String(err));
  return json(500, { error: "server_error" });
};

export async function readJson(request) {
  try {
    const data = await request.json();
    return data && typeof data === "object" ? data : {};
  } catch {
    throw new HttpError(400, "bad_json", "Request body must be JSON");
  }
}

export const nowIso = () => new Date().toISOString();

export const plusMinutes = (min) => new Date(Date.now() + min * 60_000).toISOString();
export const plusDays = (days) => new Date(Date.now() + days * 86_400_000).toISOString();

export function newId(prefix = "") {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return prefix ? `${prefix}_${hex}` : hex;
}

/** URL-safe random secret (tokens, session cookies). */
export function randomSecret(bytes = 32) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pragmatic "could be a real mailbox" check — not RFC-perfect, catches typos.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw) {
  const e = String(raw ?? "").trim().toLowerCase();
  if (!e || e.length > 254 || !EMAIL_RE.test(e)) return null;
  return e;
}

export function cleanText(raw, max = 200) {
  if (raw == null) return null;
  const s = String(raw).trim().replace(/\s+/g, " ");
  if (!s) return null;
  return s.slice(0, max);
}
