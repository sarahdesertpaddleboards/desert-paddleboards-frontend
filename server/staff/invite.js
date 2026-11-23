/** Mint an invite token for a staff member and email it (shared by invite + resend). */
import { createLoginToken } from "./auth.js";
import { inviteEmail, isLocalMode, sendEmail } from "./email.js";
import { HttpError } from "./http.js";

export const PAYOUT_METHODS = ["venmo", "zelle", "cashapp", "paypal", "check", "other"];

export async function sendInvite(env, db, request, staff, admin) {
  const token = await createLoginToken(db, staff.id, "invite");
  if (!token) throw new HttpError(429, "too_many_links", "Too many invites sent to this person in the last hour.");
  const url = `${new URL(request.url).origin}/staff/verify?token=${token}`;

  if (isLocalMode(env)) {
    console.log(`[staff-api] LOCAL invite link for ${staff.email}: ${url}`);
    return { emailed: false, devLink: url };
  }
  const mail = inviteEmail({ name: staff.name, url, invitedBy: admin.name || "Sarah" });
  const result = await sendEmail(env, db, { ...mail, to: staff.email, kind: "invite", staffId: staff.id });
  return { emailed: result.ok, emailError: result.ok ? undefined : result.error };
}
