import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { staffApi } from "../api";
import { summarizeEarnings, type MyShift } from "../earnings";
import { errMessage, money, monthLabel, shortDay, venueLine } from "../format";
import StatTile from "../components/StatTile";
import { applicationRoleLabel } from "../roles";
import { useStaff } from "../StaffContext";

/** A staff member's money: what they're owed, what's coming, what's been paid. */
export default function StaffEarnings() {
  const { staff } = useStaff();
  const [mine, setMine] = useState<MyShift[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    staffApi
      .shifts()
      .then((r) => setMine(r.mine))
      .catch((err) => setError(errMessage(err, "Couldn't load your earnings. Check your connection and refresh.")));
  }, []);

  if (!staff) return null;
  const e = mine ? summarizeEarnings(mine) : null;

  // Group worked shifts by the month they happened in.
  const months: { label: string; rows: MyShift[]; cents: number }[] = [];
  for (const m of e?.history ?? []) {
    const label = monthLabel(m.event.startAt);
    let group = months[months.length - 1];
    if (!group || group.label !== label) months.push((group = { label, rows: [], cents: 0 }));
    group.rows.push(m);
    group.cents += m.application.payCents ?? 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay for each shift is locked in when Sarah confirms you. It shows as paid once she's sent it.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Waiting to be paid" value={e ? money(e.owedCents) : "…"} sub={e ? `${e.owedCount} shift${e.owedCount === 1 ? "" : "s"} worked` : ""} strong className="col-span-2 sm:col-span-1" />
        <StatTile label="Coming up" value={e ? money(e.upcomingCents) : "…"} sub={e ? `${e.upcomingCount} confirmed shift${e.upcomingCount === 1 ? "" : "s"}` : ""} />
        <StatTile label={`Paid in ${e?.thisYear ?? ""}`} value={e ? money(e.paidThisYearCents) : "…"} />
      </div>

      {!mine && !error ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {mine && months.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No shifts worked yet. Once you've worked a confirmed shift it shows up here with its pay.
          </CardContent>
        </Card>
      ) : null}

      {months.map((g) => (
        <Card key={g.label}>
          <CardHeader>
            <CardTitle className="text-lg">{g.label}</CardTitle>
            <CardDescription>
              {g.rows.length} shift{g.rows.length === 1 ? "" : "s"} · {money(g.cents)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {g.rows.map(({ application, event }) => (
                <li key={application.id} className="flex items-start justify-between gap-3 px-6 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {event.title} <span className="font-normal text-muted-foreground">· {applicationRoleLabel(application, true)}</span>
                    </p>
                    <p className="text-muted-foreground">
                      {shortDay(event.startAt)}
                      {venueLine(event) ? ` · ${venueLine(event)}` : ""}
                    </p>
                    {application.paidAt ? (
                      <p className="text-xs text-muted-foreground">
                        Paid {shortDay(application.paidAt)}
                        {application.paidNote ? ` · ${application.paidNote}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    <p className="font-semibold">{money(application.payCents)}</p>
                    {application.paidAt ? (
                      <Badge className="bg-brand text-white hover:bg-brand">Paid</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Not paid yet</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {e && e.paidAllTimeCents > e.paidThisYearCents ? (
        <p className="text-sm text-muted-foreground">All-time paid: {money(e.paidAllTimeCents)}</p>
      ) : null}
    </div>
  );
}
