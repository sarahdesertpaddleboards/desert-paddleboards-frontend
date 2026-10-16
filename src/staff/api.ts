/**
 * Client for the same-origin /staff-api Pages Functions. Cookies carry the
 * session, so every call uses credentials: "same-origin". In local dev Vite
 * proxies /staff-api to `wrangler pages dev` (see vite.config.ts).
 */

export type PayoutMethod = "venmo" | "zelle" | "cashapp" | "paypal" | "check" | "other";

export interface Staff {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  payoutMethod: PayoutMethod | null;
  payoutHandle: string | null;
  role: "staff" | "admin";
  status: "invited" | "active" | "inactive";
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  invitedAt: string | null;
  createdAt: string;
  profileComplete: boolean;
  /** Admin-only field, present on roster responses. */
  notes?: string | null;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message?: string) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/staff-api${path}`, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || "request_failed", data?.message);
  }
  return data as T;
}

export const staffApi = {
  me: () => call<{ staff: Staff }>("GET", "/me"),
  updateMe: (patch: Partial<Pick<Staff, "name" | "phone" | "payoutMethod" | "payoutHandle">>) =>
    call<{ staff: Staff }>("PATCH", "/me", patch),
  requestLink: (email: string) =>
    call<{ ok: true; devLink?: string }>("POST", "/auth/request-link", { email }),
  verify: (token: string) => call<{ ok: true; staff: Staff; next: string }>("POST", "/auth/verify", { token }),
  logout: () => call<{ ok: true }>("POST", "/auth/logout"),

  admin: {
    listStaff: () => call<{ staff: Staff[] }>("GET", "/admin/staff"),
    invite: (input: { email: string; name?: string; role?: "staff" | "admin" }) =>
      call<{ staff: Staff; emailed?: boolean; emailError?: string; devLink?: string }>("POST", "/admin/staff", input),
    updateStaff: (id: string, patch: Record<string, unknown>) =>
      call<{ staff: Staff }>("PATCH", `/admin/staff/${id}`, patch),
    resendInvite: (id: string) =>
      call<{ staff: Staff; emailed?: boolean; emailError?: string; devLink?: string }>(
        "POST",
        `/admin/staff/${id}/resend-invite`,
      ),
  },
};

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  venmo: "Venmo",
  zelle: "Zelle",
  cashapp: "Cash App",
  paypal: "PayPal",
  check: "Check",
  other: "Other",
};

export const PAYOUT_HANDLE_HINT: Record<PayoutMethod, string> = {
  venmo: "Your Venmo username, e.g. @sarah-williams",
  zelle: "The email or phone number linked to your Zelle",
  cashapp: "Your $Cashtag, e.g. $sarahw",
  paypal: "Your PayPal email or @username",
  check: "Name to write on the check",
  other: "How Sarah should pay you",
};
