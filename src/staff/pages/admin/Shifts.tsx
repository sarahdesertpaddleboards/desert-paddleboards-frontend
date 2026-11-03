import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { staffApi, type Shift } from "../../api";
import { errMessage, shortDay, timeRange, venueLine } from "../../format";
import { useStaff } from "../../StaffContext";

/** Sarah's schedule: every posted shift, upcoming or past, with who's on it. */
export default function AdminShifts() {
  const { staff: me } = useStaff();
  const [params, setParams] = useSearchParams();
  const scope = params.get("scope") === "past" ? "past" : "upcoming";
  const [events, setEvents] = useState<Shift[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setEvents(null);
    staffApi.admin
      .listEvents(scope)
      .then((r) => live && setEvents(r.events))
      .catch((err) => live && setError(errMessage(err, "Couldn't load the schedule.")));
    return () => {
      live = false;
    };
  }, [scope]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">Post shifts, see who's applied, confirm people with their pay.</p>
        </div>
        <Button asChild>
          <Link to="/staff/admin/shifts/new">Post a shift</Link>
        </Button>
      </div>

      <div className="inline-flex rounded-lg border border-border bg-white p-1 text-sm">
        {(["upcoming", "past"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setParams(s === "past" ? { scope: "past" } : {}, { replace: true })}
            className={`rounded-md px-3 py-1.5 font-medium capitalize ${scope === s ? "bg-brand-dark text-white" : "text-foreground hover:bg-black/5"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent className="p-0">
          {!events ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : events.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {scope === "past" ? "No past shifts yet." : "Nothing posted yet. Post a shift from the calendar to get started."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/staff/admin/shift?id=${e.id}`}
                    className="flex flex-col gap-2 p-4 transition-colors hover:bg-black/[0.03] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand">
                        {shortDay(e.startAt)} · {timeRange(e.startAt, e.endAt)}
                      </p>
                      <p className="font-medium">{e.title}</p>
                      {venueLine(e) ? <p className="text-sm text-muted-foreground">{venueLine(e)}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <ShiftBadges shift={e} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ShiftBadges({ shift: e }: { shift: Shift }) {
  if (e.status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
  return (
    <>
      {e.status === "completed" ? <Badge variant="outline">Completed</Badge> : null}
      <Badge className={e.isFull ? "bg-brand text-white hover:bg-brand" : ""} variant={e.isFull ? "default" : "outline"}>
        {e.confirmedCount}/{e.staffNeeded} confirmed
      </Badge>
      {e.appliedCount > 0 ? (
        <Badge variant="secondary" className={!e.isFull && !e.isPast ? "bg-amber-100 text-amber-900" : ""}>
          {e.appliedCount} applied
        </Badge>
      ) : null}
      {e.isPast && e.unpaidCount ? (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">{e.unpaidCount} to pay</Badge>
      ) : e.isPast && e.confirmedCount > 0 ? (
        <Badge variant="outline">All paid</Badge>
      ) : null}
    </>
  );
}
