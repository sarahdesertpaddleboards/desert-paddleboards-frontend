/**
 * /staff-api/* middleware: resolve the logged-in staff member from the session
 * cookie onto context.data.staff, and turn thrown HttpErrors into JSON.
 */
import { getSessionStaff } from "../../server/staff/auth.js";
import { errorResponse, json } from "../../server/staff/http.js";

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.STAFF_DB) return json(503, { error: "not_configured", message: "STAFF_DB binding missing" });
  try {
    context.data.staff = await getSessionStaff(env.STAFF_DB, request);
    const res = await context.next();
    // Never let a CDN or browser cache API responses.
    const headers = new Headers(res.headers);
    headers.set("cache-control", "no-store");
    return new Response(res.body, { status: res.status, headers });
  } catch (err) {
    return errorResponse(err);
  }
}
