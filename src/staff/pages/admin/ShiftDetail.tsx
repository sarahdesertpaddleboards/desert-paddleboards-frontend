import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PAYOUT_METHOD_LABELS, staffApi, type Application, type ShiftDetail, type Staff } from "../../api";
import ShiftForm, { shiftInputFrom, shiftValuesFrom, type ShiftFormValues } from "../../components/ShiftForm";
import { dayLabel, errMessage, money, timeRange, venueLine } from "../../format";
import { useStaff } from "../../StaffContext";
import { ShiftBadges } from "./Shifts";

type Row = Application & { staff: Staff };

/**
 * One shift: who's confirmed (pay locked), who's applied (set pay → confirm,
 * which emails them from Sarah), add someone directly, edit / cancel the shift.
 */
export default function AdminShiftDetail() {
  const { staff: me } = useStaff();
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ShiftDetail | null>(null);
  const [roster, setRoster] = useState<Staff[]>([]);
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
  const defaultPay = event.defaultPayCents != null ? String(event.defaultPayCents / 100) : "";
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

  async function confirm(person: Staff, pay: string) {
    await run(async () => {
      const res = await staffApi.admin.confirm(event.id, person.id, pay);
      const who = person.name || person.email;
      setNotice(
        res.localMode
          ? `${who} confirmed (local dev: no email sent).`
          : res.emailed
            ? `${who} is confirmed. Confirmation email sent.`
            : `${who} is confirmed, but the email failed (${res.emailError || "unknown error"}). Let them know directly.`,
      );
      return res;
    });
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
            {event.defaultPayCents != null ? ` · usual pay ${money(event.defaultPayCents)}` : ""}
          </CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <ShiftBadges shift={event} />
            {event.source !== "manual" ? <Badge variant="outline">From calendar</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.notes && !editing ? <p className="rounded-lg bg-[#f4f6f7] p-3 text-sm">{event.notes}</p> : null}
          {editing ? (
            <ShiftForm
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
          <CardDescription>Pay is locked in once confirmed. To change it, remove the person and confirm them again.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {confirmed.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Nobody confirmed yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {confirmed.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Person row={a} />
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{money(a.payCents)}</span>
                    {a.paidAt ? (
                      <Badge className="bg-brand text-white hover:bg-brand">Paid</Badge>
                    ) : (
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
            {event.isFull ? "The shift is full. Raise \"staff needed\" to confirm more people." : "Set the pay and confirm. They get an email from you with the details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {applied.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {applied.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Person row={a} />
                  <div className="flex flex-wrap items-center gap-2">
                    <ConfirmControl
                      key={defaultPay}
                      defaultPay={defaultPay}
                      disabled={busy || !canConfirm || !a.staff.profileComplete}
                      onConfirm={(pay) => confirm(a.staff, pay)}
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
        <AssignCard
          people={assignable}
          defaultPay={defaultPay}
          disabled={busy || !canConfirm}
          onAssign={(person, pay) => confirm(person, pay)}
        />
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

function Person({ row }: { row: Row }) {
  const p = row.staff;
  return (
    <div className="min-w-0 text-sm">
      <p className="font-medium">
        {p.name || p.email}
        {!p.profileComplete ? <span className="ml-2 text-xs font-normal text-destructive">profile incomplete</span> : null}
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

function ConfirmControl({
  defaultPay,
  disabled,
  onConfirm,
}: {
  defaultPay: string;
  disabled: boolean;
  onConfirm: (pay: string) => void;
}) {
  const [pay, setPay] = useState(defaultPay);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (pay.trim()) onConfirm(pay.trim());
      }}
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
        <Input aria-label="Pay" inputMode="decimal" className="h-8 w-24 pl-6" placeholder="Pay" value={pay} onChange={(e) => setPay(e.target.value)} />
      </div>
      <Button size="sm" type="submit" disabled={disabled || !pay.trim()}>
        Confirm
      </Button>
    </form>
  );
}

function AssignCard({
  people,
  defaultPay,
  disabled,
  onAssign,
}: {
  people: Staff[];
  defaultPay: string;
  disabled: boolean;
  onAssign: (person: Staff, pay: string) => void;
}) {
  const [personId, setPersonId] = useState("");
  const person = people.find((p) => p.id === personId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add someone directly</CardTitle>
        <CardDescription>Already agreed with someone? Confirm them without waiting for an application.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          aria-label="Staff member"
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs sm:w-64"
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
        >
          <option value="">Choose a person…</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || p.email}
              {p.status === "invited" ? " (invited)" : ""}
            </option>
          ))}
        </select>
        <ConfirmControl
          key={defaultPay}
          defaultPay={defaultPay}
          disabled={disabled || !person}
          onConfirm={(pay) => {
            if (person) {
              onAssign(person, pay);
              setPersonId("");
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
