import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMergedSessions, type CalSession } from "@/lib/sessions";
import { staffApi, type Shift, type ShiftInput } from "../../api";
import ShiftForm, { emptyShiftValues, shiftInputFrom, shiftValuesFrom, type ShiftFormValues } from "../../components/ShiftForm";
import { errMessage, shortDay, timeRange, toInputs } from "../../format";
import { useStaff } from "../../StaffContext";

const DAYS_AHEAD = 60;
const PAGE = 25;

const keyOf = (title: string, startAt: string) => {
  const t = toInputs(startAt);
  return `${title.trim().toLowerCase()}|${t.date}T${t.time}`;
};

/**
 * Post a shift. The public calendar (FareHarbor + city classes) is listed first
 * so Sarah can turn a session into a shift in one tap; anything else goes in by
 * hand. Sessions that already have a shift are hidden.
 */
export default function AdminShiftNew() {
  const { staff: me } = useStaff();
  const navigate = useNavigate();
  const sessions = useMergedSessions();
  const [posted, setPosted] = useState<Shift[] | null>(null);
  const [picked, setPicked] = useState<CalSession | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [initial, setInitial] = useState<ShiftFormValues>(emptyShiftValues);
  const [shown, setShown] = useState(PAGE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    staffApi.admin
      .listEvents("upcoming")
      .then((r) => setPosted(r.events))
      .catch(() => setPosted([]));
  }, []);

  const candidates = useMemo(() => {
    const pks = new Set((posted ?? []).map((e) => e.fareharborAvailabilityPk).filter((pk) => pk != null));
    const keys = new Set((posted ?? []).filter((e) => e.status !== "cancelled").map((e) => keyOf(e.title, e.startAt)));
    const horizon = Date.now() + DAYS_AHEAD * 86_400_000;
    return sessions.filter(
      (s) =>
        Date.parse(s.startAt) < horizon &&
        !(s.availabilityPk != null && pks.has(s.availabilityPk)) &&
        !keys.has(keyOf(s.title, s.startAt)),
    );
  }, [sessions, posted]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;

  function pick(s: CalSession) {
    setPicked(s);
    setInitial(shiftValuesFrom({ title: s.title, startAt: s.startAt, endAt: s.endAt, venue: s.venue, city: s.city }));
    setFormKey((k) => k + 1);
    setError(null);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function clearPick() {
    setPicked(null);
    setInitial(emptyShiftValues());
    setFormKey((k) => k + 1);
  }

  async function submit(values: ShiftFormValues) {
    setBusy(true);
    setError(null);
    const input: ShiftInput = { ...shiftInputFrom(values), source: "manual" };
    if (picked) {
      input.source = picked.source;
      input.fareharborItemId = picked.itemId ?? null;
      input.fareharborAvailabilityPk = picked.availabilityPk ?? null;
    }
    try {
      const { event } = await staffApi.admin.createEvent(input);
      navigate(`/staff/admin/shift?id=${event.id}`);
    } catch (err) {
      setError(errMessage(err, "Couldn't post the shift."));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/staff/admin/shifts" className="text-sm text-brand hover:underline">
          ← Schedule
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark sm:text-3xl">Post a shift</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">From the public calendar</CardTitle>
          <CardDescription>The next {DAYS_AHEAD} days of sessions that don't have a shift yet. Tap one to fill in the details.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {posted === null ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : candidates.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Every upcoming calendar session already has a shift.</p>
          ) : (
            <ul className="divide-y divide-border">
              {candidates.slice(0, shown).map((s) => (
                <li key={`${s.title}|${s.startAt}|${s.availabilityPk ?? ""}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{s.title}</p>
                    <p className="text-muted-foreground">
                      {shortDay(s.startAt)} · {timeRange(s.startAt, s.endAt)} · {s.venue}
                      {s.city ? `, ${s.city}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant={picked === s ? "default" : "outline"} onClick={() => pick(s)}>
                    {picked === s ? "Selected" : "Use"}
                  </Button>
                </li>
              ))}
              {candidates.length > shown ? (
                <li className="p-3 text-center">
                  <Button size="sm" variant="ghost" onClick={() => setShown((n) => n + PAGE)}>
                    Show more ({candidates.length - shown} left)
                  </Button>
                </li>
              ) : null}
            </ul>
          )}
        </CardContent>
      </Card>

      <div ref={formRef} className="scroll-mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shift details</CardTitle>
            <CardDescription>
              {picked ? (
                <>
                  Linked to the calendar session on {shortDay(picked.startAt)}.{" "}
                  <button type="button" className="text-brand underline" onClick={clearPick}>
                    Start blank instead
                  </button>
                </>
              ) : (
                "Not on the public calendar? Fill it in by hand."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShiftForm key={formKey} initial={initial} submitLabel="Post shift" busy={busy} error={error} onSubmit={submit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
