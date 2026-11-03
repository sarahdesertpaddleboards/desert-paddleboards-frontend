/**
 * Client for the same-origin /staff-api Pages Functions. Cookies carry the
 * session, so every call uses credentials: "same-origin". In local dev Vite
 * proxies /staff-api to `wrangler pages dev` (see vite.config.ts).
 */

export type PayoutMethod = "venmo" | "zelle" | "cashapp" | "paypal" | "check" | "other";

/** Roles on a shift. Trailer driving is an add-on to one of these, not a role. */
export type Role = "lead" | "teacher" | "artist" | "general";
export type Skill = Role | "trailer";

export interface RoleSlot {
  role: Role;
  needed: number;
  confirmed: number;
  applied: number;
  /** Usual pay for the role (admin responses only). */
  payCents?: number | null;
}

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
  /** What they can do (they tick these on their profile). */
  skills: Skill[];
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
  /** Admin responses only (legacy; pay now lives on each role). */
  defaultPayCents?: number | null;
  roles: RoleSlot[];
  trailerNeeded: number;
  trailerConfirmed: number;
  trailerOpen: boolean;
  /** Admin responses only. */
  trailerPayCents?: number | null;
  /** Posted automatically from the public calendar. */
  autoPosted: boolean;
  /** Admin responses only: the session has left the public calendar. */
  offCalendar?: boolean;
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
  role: Role;
  /** Applied to / confirmed to also drive the trailer. */
  trailer: boolean;
  /** The trailer part of payCents (payCents is the total). */
  trailerPayCents: number | null;
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
  roles?: { role: Role; needed: number; pay?: string | number | null }[];
  trailerNeeded?: number;
  trailerPay?: string | number | null;
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

type ConfirmResult = ShiftDetail & {
  emailed: boolean;
  emailError?: string;
  localMode?: boolean;
  /** They hadn't logged in yet, so the email doubled as their invite. */
  invited?: boolean;
  /** A brand-new person added to the roster by email. */
  addedToTeam?: boolean;
  devLink?: string;
};

export interface ConfirmInput {
  staffId?: string;
  /** Someone not on the team yet. */
  email?: string;
  name?: string;
  role: Role;
  pay: string;
  trailer?: boolean;
  trailerPay?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  keywords: string[];
  roles: { role: Role; needed: number; payCents: number | null }[];
  trailerNeeded: number;
  trailerPayCents: number | null;
  notes: string | null;
  autoPost: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export interface TemplateInput {
  name?: string;
  keywords?: string[];
  roles?: { role: Role; needed: number; pay?: string | number | null }[];
  trailerNeeded?: number;
  trailerPay?: string | number | null;
  notes?: string | null;
  autoPost?: boolean;
}

export interface SyncState {
  startedAt?: string;
  finishedAt?: string;
  ok?: boolean;
  error?: string;
  created?: number;
  moved?: number;
  missing?: number;
  skipped?: number;
  sessions?: number;
  fareharborOk?: boolean;
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
  updateMe: (patch: Partial<Pick<Staff, "name" | "phone" | "payoutMethod" | "payoutHandle" | "skills">>) =>
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
  apply: (id: string, input: { role: Role; trailer?: boolean; note?: string }) =>
    call<{ application: Application }>("POST", `/shifts/${id}/apply`, input),
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
    confirm: (id: string, input: ConfirmInput) => call<ConfirmResult>("POST", `/admin/events/${id}/confirm`, input),
    decline: (id: string, staffId: string) => call<ShiftDetail>("POST", `/admin/events/${id}/decline`, { staffId }),
    payroll: (year?: number) => call<Payroll>("GET", `/admin/pay${year ? `?year=${year}` : ""}`),
    markPaid: (input: { applicationIds: string[]; note?: string; notify: boolean }) =>
      call<MarkPaidResult>("POST", "/admin/pay/mark-paid", input),
    templates: () => call<{ templates: ShiftTemplate[] }>("GET", "/admin/templates"),
    createTemplate: (input: TemplateInput) => call<{ template: ShiftTemplate }>("POST", "/admin/templates", input),
    updateTemplate: (id: string, input: TemplateInput) =>
      call<{ template: ShiftTemplate }>("PATCH", `/admin/templates/${id}`, input),
    deleteTemplate: (id: string) => call<{ ok: true }>("DELETE", `/admin/templates/${id}`),
    syncState: () => call<{ state: SyncState | null; windowDays: number }>("GET", "/admin/sync"),
    syncNow: () => call<{ state: SyncState; windowDays: number }>("POST", "/admin/sync"),
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
