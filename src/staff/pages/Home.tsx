import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { staffApi, type Application, type Shift } from "../api";
import { summarizeEarnings, type MyShift } from "../earnings";
import { dayLabel, errMessage, money, timeRange, venueLine } from "../format";
import { useStaff } from "../StaffContext";

type OpenShift = Shift & { my: Application | null };

/**
 * Staff home: your upcoming shifts (applied / confirmed), open shifts to put
 * your name down for, and a summary of your pay (full history on /staff/earnings).
 */
export default function StaffHome() {
  const { staff } = useStaff();
  const [open, setOpen] = useState<OpenShift[] | null>(null);
  const [mine, setMine] = useState<MyShift[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await staffApi.shifts();
      setOpen(res.shifts);
      setMine(res.mine);
      setError(null);
    } catch (err) {
      setError(errMessage(err, "Couldn't load shifts. Check your connection and refresh."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!staff) return null;
  const first = staff.name ? staff.name.split(" ")[0] : null;

  const upcomingMine = mine
    .filter((m) => !m.event.isPast && m.application.status !== "declined")
    .sort((a, b) => a.event.startAt.localeCompare(b.event.startAt));
  const openToApply = (open ?? []).filter((s) => !s.my || s.my.status === "withdrawn");
  const earnings = summarizeEarnings(mine);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">{first ? `Hi ${first}` : "Welcome"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Put your name down for the shifts you'd like. Sarah confirms the roster and emails you the pay.
        </p>
      </div>

      {!staff.profileComplete ? (
        <Card className="border-brand/40 bg-brand/5">
          <CardHeader>
            <CardTitle className="text-lg">Finish your profile</CardTitle>
            <CardDescription>
              Add your name, phone and how you'd like to be paid. You need these before you can apply for shifts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/staff/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {upcomingMine.length ? (
        <Section title="Your upcoming shifts">
          {upcomingMine.map(({ application, event }) => (
            <ShiftRow
              key={application.id}
              shift={event}
              badge={<MyStatus application={application} event={event} />}
              action={
                application.status === "applied" ? (
                  <WithdrawButton id={event.id} onDone={load} />
                ) : application.status === "confirmed" && event.status !== "cancelled" ? (
                  <span className="text-sm font-semibold text-brand-dark">{money(application.payCents)}</span>
                ) : null
              }
            />
          ))}
        </Section>
      ) : null}

      <Section
        title="Open shifts"
        description={open && !openToApply.length ? "Nothing new right now. Sarah posts shifts here as they come up." : undefined}
      >
        {!open && !error ? <p className="p-4 text-sm text-muted-foreground">Loading…</p> : null}
        {openToApply.map((s) => (
          <ShiftRow
            key={s.id}
            shift={s}
            badge={
              s.isFull ? (
                <Badge variant="outline">Full</Badge>
              ) : (
                <Badge variant="secondary">
                  {s.staffNeeded - s.confirmedCount} of {s.staffNeeded} spot{s.staffNeeded === 1 ? "" : "s"} open
                </Badge>
              )
            }
            action={
              s.isFull ? null : (
                <ApplyButton id={s.id} disabled={!staff.profileComplete} onDone={load} />
              )
            }
          />
        ))}
      </Section>

      {earnings.history.length || earnings.upcomingCount ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Not paid yet</dt>
                <dd className="text-xl font-bold text-brand-dark">{money(earnings.owedCents)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Coming up</dt>
                <dd className="text-xl font-bold text-brand-dark">{money(earnings.upcomingCents)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Paid in {earnings.thisYear}</dt>
                <dd className="text-xl font-bold text-brand-dark">{money(earnings.paidThisYearCents)}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm">
              <Link to="/staff/earnings">See all earnings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {staff.role === "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin</CardTitle>
            <CardDescription>Post shifts, confirm people with their pay, mark pay sent, and manage the team.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/staff/admin/shifts">Schedule</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/staff/admin/payroll">Payroll</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/staff/admin/people">People</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">{children}</ul>
      </CardContent>
    </Card>
  );
}

function ShiftRow({ shift, badge, action }: { shift: Shift; badge?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{dayLabel(shift.startAt)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{shift.title}</span>
          {badge}
        </div>
        <p className="text-sm text-muted-foreground">
          {timeRange(shift.startAt, shift.endAt)}
          {venueLine(shift) ? ` · ${venueLine(shift)}` : ""}
        </p>
        {shift.notes ? <p className="text-sm">{shift.notes}</p> : null}
      </div>
      {action ? <div className="shrink-0 sm:pt-5">{action}</div> : null}
    </li>
  );
}

function MyStatus({ application, event }: { application: Application; event: Shift }) {
  if (event.status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
  if (application.status === "confirmed") return <Badge className="bg-brand text-white hover:bg-brand">Confirmed</Badge>;
  return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Applied · waiting on Sarah</Badge>;
}

function ApplyButton({ id, disabled, onDone }: { id: string; disabled: boolean; onDone: () => Promise<void> }) {
  const [step, setStep] = useState<"idle" | "note" | "busy">("idle");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setStep("busy");
    setError(null);
    try {
      await staffApi.apply(id, note.trim() || undefined);
      await onDone();
    } catch (err) {
      setError(errMessage(err, "Couldn't apply. Try again."));
      setStep("note");
    }
  }

  if (step === "idle") {
    return (
      <Button size="sm" disabled={disabled} onClick={() => setStep("note")} title={disabled ? "Finish your profile first" : undefined}>
        I can work this
      </Button>
    );
  }
  return (
    <div className="w-full space-y-2 sm:w-64">
      <Input
        placeholder="Note for Sarah (optional)"
        value={note}
        maxLength={300}
        onChange={(e) => setNote(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={send} disabled={step === "busy"}>
          {step === "busy" ? "Sending…" : "Put my name down"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setStep("idle")} disabled={step === "busy"}>
          Cancel
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function WithdrawButton({ id, onDone }: { id: string; onDone: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await staffApi.withdraw(id);
            await onDone();
          } catch (err) {
            setError(errMessage(err, "Couldn't withdraw."));
            setBusy(false);
          }
        }}
      >
        Withdraw
      </Button>
      {error ? <p className="max-w-56 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
