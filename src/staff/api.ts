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

export interface Shift {
  id: string;
  title: string;
  venue: string | null;
  city: string | null;
  /** Arizona-local ISO with offset, e.g. 2026-11-07T17:30:00-07:00 */
  startAt: string;
  endAt: string | null;
  source: "manual" | "fareharbor" | "city";
  fareharborItemId: number | null;
  fareharborAvailabilityPk: number | null;
  staffNeeded: number;
  /** Admin responses only. */
  defaultPayCents?: number | null;
  notes: string | null;
  status: "open" | "filled" | "completed" | "cancelled";
  confirmedCount: number;
  appliedCount: number;
  /** Confirmed people not yet marked paid (admin responses only). */
  unpaidCount?: number;
  isFull: boolean;
  isPast: boolean;
  createdAt: string;
}

export type ApplicationStatus = "applied" | "confirmed" | "declined" | "withdrawn";

export interface Application {
  id: string;
  eventId: string;
  staffId: string;
  status: ApplicationStatus;
  payCents: number | null;
  staffNote: string | null;
  confirmedAt: string | null;
  paidAt: string | null;
  paidNote: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface ShiftDetail {
  event: Shift;
  applications: (Application & { staff: Staff })[];
}

export interface ShiftInput {
  title?: string;
  startAt?: string;
  endAt?: string | null;
  venue?: string | null;
  city?: string | null;
  staffNeeded?: number;
  defaultPay?: string | number | null;
  notes?: string | null;
  status?: "open" | "completed" | "cancelled";
  source?: "manual" | "fareharbor" | "city";
  fareharborItemId?: number | null;
  fareharborAvailabilityPk?: number | null;
}

/** A confirmed shift on Sarah's payroll: the application plus its shift and person. */
export interface LedgerRow extends Application {
  paidByName: string | null;
  event: Pick<Shift, "id" | "title" | "venue" | "city" | "startAt" | "endAt" | "status" | "isPast">;
  staff: Pick<Staff, "id" | "email" | "name" | "phone" | "payoutMethod" | "payoutHandle">;
}

export interface Payroll {
  year: number;
  owed: LedgerRow[];
  upcoming: { count: number; totalCents: number };
  paid: LedgerRow[];
}

export interface MarkPaidResult {
  paidCount: number;
  totalCents: number;
  emailed: number;
  emailErrors: { name: string; error: string }[];
  localMode: boolean;
}

type ConfirmResult = ShiftDetail & { emailed: boolean; emailError?: string; localMode?: boolean };

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

  shifts: () =>
    call<{ shifts: (Shift & { my: Application | null })[]; mine: { application: Application; event: Shift }[] }>(
      "GET",
      "/shifts",
    ),
  apply: (id: string, note?: string) => call<{ application: Application }>("POST", `/shifts/${id}/apply`, { note }),
  withdraw: (id: string) => call<{ application: Application }>("POST", `/shifts/${id}/withdraw`),

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
    listEvents: (scope: "upcoming" | "past") =>
      call<{ scope: string; events: Shift[] }>("GET", `/admin/events?scope=${scope}`),
    createEvent: (input: ShiftInput) => call<{ event: Shift }>("POST", "/admin/events", input),
    getEvent: (id: string) => call<ShiftDetail>("GET", `/admin/events/${id}`),
    updateEvent: (id: string, patch: ShiftInput) => call<ShiftDetail>("PATCH", `/admin/events/${id}`, patch),
    deleteEvent: (id: string) => call<{ ok: true }>("DELETE", `/admin/events/${id}`),
    confirm: (id: string, staffId: string, pay: string) =>
      call<ConfirmResult>("POST", `/admin/events/${id}/confirm`, { staffId, pay }),
    decline: (id: string, staffId: string) => call<ShiftDetail>("POST", `/admin/events/${id}/decline`, { staffId }),
    payroll: (year?: number) => call<Payroll>("GET", `/admin/pay${year ? `?year=${year}` : ""}`),
    markPaid: (input: { applicationIds: string[]; note?: string; notify: boolean }) =>
      call<MarkPaidResult>("POST", "/admin/pay/mark-paid", input),
    undoPaid: (applicationId: string) => call<{ ok: true }>("POST", "/admin/pay/undo", { applicationId }),
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
