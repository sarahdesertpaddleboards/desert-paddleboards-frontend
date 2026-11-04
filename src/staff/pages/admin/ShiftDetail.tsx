import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PAYOUT_METHOD_LABELS,
  staffApi,
  type Application,
  type ConfirmInput,
  type Role,
  type Shift,
  type ShiftDetail,
  type ShiftTemplate,
  type Staff,
} from "../../api";
import MarkPaidControl from "../../components/MarkPaidControl";
import ShiftForm, { shiftInputFrom, shiftValuesFrom, type ShiftFormValues } from "../../components/ShiftForm";
import { dayLabel, describePaid, errMessage, money, shortDay, timeRange, venueLine } from "../../format";
import { ROLE_LABELS, SKILL_LABELS, applicationRoleLabel } from "../../roles";
import { useStaff } from "../../StaffContext";
import { ShiftBadges } from "./Shifts";

type Row = Application & { staff: Staff };

/**
 * One shift: who's confirmed (role + pay locked), who's applied (pick role and
 * pay → confirm, which emails them), add someone directly (including someone
 * new, by email: they get the shift and an invite in one email), edit /
 * cancel the shift.
 */
export default function AdminShiftDetail() {
  const { staff: me } = useStaff();
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ShiftDetail | null>(null);
  const [roster, setRoster] = useState<Staff[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setDetail(await staffApi.admin.getEvent(id));
    } catch (err) {
      setError(errMessage(err, "Couldn't load this shift."));
    }
  }, [id]);

  useEffect(() => {
    void load();
    staffApi.admin
      .listStaff()
      .then((r) => setRoster(r.staff))
      .catch(() => setRoster([]));
    staffApi.admin
      .templates()
      .then((r) => setTemplates(r.templates))
      .catch(() => setTemplates([]));
  }, [load]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;
  if (!detail) return error ? <p className="text-sm text-destructive">{error}</p> : <p className="text-sm text-muted-foreground">Loading…</p>;

  const { event, applications } = detail;
  const confirmed = applications.filter((a) => a.status === "confirmed");
  const applied = applications.filter((a) => a.status === "applied");
  const others = applications.filter((a) => a.status === "declined" || a.status === "withdrawn");
  const onShift = new Set(applications.filter((a) => a.status === "confirmed").map((a) => a.staffId));
  const assignable = roster.filter((p) => p.status !== "inactive" && !onShift.has(p.id));
  const canConfirm = event.status !== "cancelled" && !event.isFull;

  async function run(fn: () => Promise<ShiftDetail | void>, ok?: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fn();
      if (res) setDetail(res);
      if (ok) setNotice(ok);
    } catch (err) {
      setError(errMessage(err, "That didn't work. Try again."));
    } finally {
      setBusy(false);
    }
  }

  async function confirm(input: ConfirmInput, who: string): Promise<boolean> {
    let ok = false;
    await run(async () => {
      const res = await staffApi.admin.confirm(event.id, input);
      const what = res.addedToTeam ? `${who} is added to the team and confirmed.` : `${who} is confirmed.`;
      setNotice(
        res.localMode
          ? `${what} Local dev: no email sent.${res.devLink ? ` Invite link: ${res.devLink}` : ""}`
          : res.emailed
            ? `${what} ${res.invited ? "They've been emailed the shift and a link to set up their profile." : res.texted ? "Confirmation emailed and texted." : "Confirmation email sent."}`
            : `${what} But the email failed (${res.emailError || "unknown error"}). Let them know directly.`,
      );
      ok = true;
      return res;
    });
    return ok;
  }

  async function saveEdit(values: ShiftFormValues) {
    await run(async () => {
      const res = await staffApi.admin.updateEvent(event.id, shiftInputFrom(values));
      setEditing(false);
      return res;
    }, "Saved.");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/staff/admin/shifts${event.isPast ? "?scope=past" : ""}`} className="text-sm text-brand hover:underline">
          ← Schedule
        </Link>
      </div>

      <Card>
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{dayLabel(event.startAt)}</p>
          <CardTitle className="text-2xl text-brand-dark">{event.title}</CardTitle>
          <CardDescription>
            {timeRange(event.startAt, event.endAt)}
            {venueLine(event) ? ` · ${venueLine(event)}` : ""}
          </CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <ShiftBadges shift={event} />
            {event.autoPosted ? (
              <Badge variant="outline">Auto-posted from calendar</Badge>
            ) : event.source !== "manual" ? (
              <Badge variant="outline">From calendar</Badge>
            ) : null}
          </div>
          <RolesSummary event={event} />
          {event.offCalendar && !event.isPast && event.status !== "cancelled" ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
              This session isn't on the public calendar any more (cancelled or moved in FareHarbor?). Cancel the shift if it's
              not happening, and let anyone confirmed know.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {event.notes && !editing ? <p className="rounded-lg bg-[#f4f6f7] p-3 text-sm">{event.notes}</p> : null}
          {editing ? (
            <ShiftForm
              templates={templates}
              initial={shiftValuesFrom(event)}
              submitLabel="Save changes"
              busy={busy}
              error={error}
              onSubmit={saveEdit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit details
              </Button>
              {event.status === "cancelled" ? (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => staffApi.admin.updateEvent(event.id, { status: "open" }), "Shift reopened.")}>
                  Reopen
                </Button>
              ) : (
                <>
                  {event.isPast && event.status !== "completed" ? (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => staffApi.admin.updateEvent(event.id, { status: "completed" }), "Marked completed.")}>
                      Mark completed
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={busy}
                    onClick={() => {
                      const msg = confirmed.length
                        ? `Cancel this shift? ${confirmed.length} confirmed ${confirmed.length === 1 ? "person isn't" : "people aren't"} emailed automatically, so let them know yourself.`
                        : "Cancel this shift? It disappears from the staff list.";
                      if (window.confirm(msg)) void run(() => staffApi.admin.updateEvent(event.id, { status: "cancelled" }), "Shift cancelled.");
                    }}
                  >
                    Cancel shift
                  </Button>
                </>
              )}
              {confirmed.length === 0 && applied.length === 0 ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={busy}
                  onClick={async () => {
                    if (!window.confirm("Delete this shift for good?")) return;
                    setBusy(true);
                    try {
                      await staffApi.admin.deleteEvent(event.id);
                      navigate("/staff/admin/shifts", { replace: true });
                    } catch (err) {
                      setError(errMessage(err, "Couldn't delete."));
                      setBusy(false);
                    }
                  }}
                >
                  Delete
                </Button>
              ) : null}
            </div>
          )}
          {!editing && notice ? <p className="text-sm text-brand">{notice}</p> : null}
          {!editing && error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Confirmed <span className="text-muted-foreground">({confirmed.length} of {event.staffNeeded})</span>
          </CardTitle>
          <CardDescription>Role and pay are locked in once confirmed. To change them, remove the person and confirm them again.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {confirmed.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Nobody confirmed yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {confirmed.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Person row={a} showRole />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold">{money(a.payCents)}</span>
                    {a.paidAt ? (
                      <>
                        <Badge className="bg-brand text-white hover:bg-brand">Paid {shortDay(a.paidAt)}</Badge>
                        {a.paidNote ? <span className="text-xs text-muted-foreground">{a.paidNote}</span> : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          disabled={busy}
                          onClick={() => {
                            if (window.confirm("Undo this payment? Any email already sent stays sent.")) {
                              void run(async () => {
                                await staffApi.admin.undoPaid(a.id);
                                return staffApi.admin.getEvent(event.id);
                              }, "Payment undone.");
                            }
                          }}
                        >
                          Undo
                        </Button>
                      </>
                    ) : (
                      <>
                      {event.isPast && event.status !== "cancelled" ? (
                        <MarkPaidControl
                          label="Mark paid"
                          disabled={busy}
                          onSubmit={async (note, notify) => {
                            let ok = false;
                            await run(async () => {
                              const res = await staffApi.admin.markPaid({ applicationIds: [a.id], note: note || undefined, notify });
                              setNotice(describePaid(res, notify));
                              ok = true;
                              return staffApi.admin.getEvent(event.id);
                            });
                            return ok;
                          }}
                        />
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Take ${a.staff.name || a.staff.email} off this shift? They aren't emailed.`)) {
                            void run(() => staffApi.admin.decline(event.id, a.staffId), "Removed from the shift.");
                          }
                        }}
                      >
                        Remove
                      </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Applied <span className="text-muted-foreground">({applied.length})</span>
          </CardTitle>
          <CardDescription>
            {event.isFull
              ? "The shift is full. Edit it to add more spots."
              : "Pick the role, type what you'll pay them, then confirm. They get an email from you with the details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {applied.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {applied.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Person row={a} showRole wants />
                  <div className="flex flex-wrap items-center gap-2">
                    <ConfirmControl
                      key={`${a.id}-${event.confirmedCount}-${event.trailerConfirmed}`}
                      event={event}
                      defaultRole={a.role}
                      defaultTrailer={a.trailer}
                      disabled={busy || !canConfirm || !a.staff.profileComplete}
                      onConfirm={(c) => confirm({ ...c, staffId: a.staffId }, a.staff.name || a.staff.email)}
                    />
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => staffApi.admin.decline(event.id, a.staffId), "Declined.")}>
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {event.status !== "cancelled" ? (
        <AssignCard event={event} people={assignable} disabled={busy || !canConfirm} onAssign={confirm} />
      ) : null}

      {others.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Declined or withdrawn</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {others.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
                  <span>{a.staff.name || a.staff.email}</span>
                  <span>{a.status === "declined" ? "Declined" : "Withdrew"}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Person({ row, showRole, wants }: { row: Row; showRole?: boolean; wants?: boolean }) {
  const p = row.staff;
  return (
    <div className="min-w-0 text-sm">
      <p className="font-medium">
        {p.name || p.email}
        {showRole ? (
          <Badge variant="outline" className="ml-2 align-middle font-normal">
            {wants ? "Wants: " : ""}
            {applicationRoleLabel(row)}
          </Badge>
        ) : null}
        {!p.profileComplete ? (
          <span className="ml-2 text-xs font-normal text-destructive">{p.status === "invited" ? "hasn't signed up yet" : "profile incomplete"}</span>
        ) : null}
      </p>
      <p className="text-muted-foreground">
        {p.phone ? (
          <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
            {p.phone}
          </a>
        ) : (
          p.email
        )}
        {p.payoutMethod ? ` · ${PAYOUT_METHOD_LABELS[p.payoutMethod]}${p.payoutHandle ? ` ${p.payoutHandle}` : ""}` : ""}
      </p>
      {row.staffNote ? <p className="mt-1 italic">"{row.staffNote}"</p> : null}
    </div>
  );
}

type ConfirmChoice = Pick<ConfirmInput, "role" | "pay" | "trailer">;

/** Who's needed vs confirmed per role. */
function RolesSummary({ event }: { event: Shift }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm">
      {event.roles.map((r) => (
        <li key={r.role}>
          <span className={r.confirmed >= r.needed ? "text-brand" : "text-foreground"}>
            {ROLE_LABELS[r.role]} {r.confirmed}/{r.needed}
          </span>
        </li>
      ))}
      {event.trailerNeeded > 0 ? (
        <li>
          <span className={event.trailerOpen ? "text-foreground" : "text-brand"}>
            Trailer {event.trailerConfirmed}/{event.trailerNeeded}
          </span>
        </li>
      ) : null}
    </ul>
  );
}

/**
 * Role + trailer + pay picker that ends in "Confirm". Pay starts blank: Sarah
 * types what she'll pay this person for this shift (trailer included).
 */
function ConfirmControl({
  event,
  defaultRole,
  defaultTrailer,
  disabled,
  onConfirm,
  label = "Confirm",
}: {
  event: Shift;
  defaultRole?: Role;
  defaultTrailer?: boolean;
  disabled: boolean;
  onConfirm: (c: ConfirmChoice) => void;
  label?: string;
}) {
  const open = event.roles.filter((r) => r.confirmed < r.needed);
  const startRole = defaultRole && open.some((r) => r.role === defaultRole) ? defaultRole : open[0]?.role ?? event.roles[0]?.role;
  const [role, setRole] = useState<Role | undefined>(startRole);
  const [pay, setPay] = useState("");
  const [trailer, setTrailer] = useState(Boolean(defaultTrailer && event.trailerOpen));
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (role && pay.trim()) onConfirm({ role, pay: pay.trim(), trailer });
      }}
    >
      <select
        aria-label="Role"
        className="border-input h-8 rounded-md border bg-white px-2 text-sm shadow-xs"
        value={role ?? ""}
        onChange={(e) => setRole(e.target.value as Role)}
      >
        {event.roles.map((r) => (
          <option key={r.role} value={r.role} disabled={r.confirmed >= r.needed}>
            {ROLE_LABELS[r.role]}
            {r.confirmed >= r.needed ? " (full)" : ""}
          </option>
        ))}
      </select>
      {event.trailerOpen ? (
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" className="size-4 accent-[#1f3a4d]" checked={trailer} onChange={(e) => setTrailer(e.target.checked)} />
          + trailer
        </label>
      ) : null}
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
        <Input
          aria-label={trailer ? "Pay, including the trailer" : "Pay"}
          inputMode="decimal"
          className="h-8 w-24 pl-6"
          placeholder={trailer ? "Total pay" : "Pay"}
          value={pay}
          onChange={(e) => setPay(e.target.value)}
        />
      </div>
      <Button size="sm" type="submit" disabled={disabled || !role || !pay.trim()}>
        {label}
      </Button>
    </form>
  );
}

const NEW = "__new__";

/**
 * Put someone on the shift without waiting for an application: anyone on the
 * roster, or someone new by email (they're added to the team and get one email
 * with the shift and a link to set up their profile).
 */
function AssignCard({
  event,
  people,
  disabled,
  onAssign,
}: {
  event: Shift;
  people: Staff[];
  disabled: boolean;
  onAssign: (input: ConfirmInput, who: string) => Promise<boolean>;
}) {
  const [personId, setPersonId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [formKey, setFormKey] = useState(0);
  const person = people.find((p) => p.id === personId);
  const isNew = personId === NEW;
  const ready = Boolean(person) || (isNew && /\S+@\S+\.\S+/.test(email));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add someone directly</CardTitle>
        <CardDescription>
          Already agreed with someone? Confirm them without waiting for an application. Not on the team yet? Add them by email and
          they'll get the shift plus a link to sign up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <select
          aria-label="Staff member"
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs sm:w-72"
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
        >
          <option value="">Choose a person…</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || p.email}
              {p.skills.length ? ` (${p.skills.map((k) => SKILL_LABELS[k].split(" ")[0].toLowerCase()).join(", ")})` : ""}
              {p.status === "invited" ? " (invited)" : ""}
            </option>
          ))}
          <option value={NEW}>+ Someone new, by email</option>
        </select>
        {isNew ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input type="email" placeholder="Their email" aria-label="Their email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Their name (optional)" aria-label="Their name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        ) : null}
        <ConfirmControl
          key={`${formKey}-${personId}-${event.confirmedCount}-${event.trailerConfirmed}`}
          event={event}
          defaultRole={person?.skills.find((k): k is Role => k !== "trailer" && event.roles.some((r) => r.role === k && r.confirmed < r.needed))}
          defaultTrailer={person?.skills.includes("trailer")}
          disabled={disabled || !ready}
          label={isNew ? "Add and confirm" : "Confirm"}
          onConfirm={async (c) => {
            const ok = person
              ? await onAssign({ ...c, staffId: person.id }, person.name || person.email)
              : isNew
                ? await onAssign({ ...c, email: email.trim(), name: name.trim() || undefined }, name.trim() || email.trim())
                : false;
            if (!ok) return;
            setPersonId("");
            setEmail("");
            setName("");
            setFormKey((k) => k + 1);
          }}
        />
      </CardContent>
    </Card>
  );
}
