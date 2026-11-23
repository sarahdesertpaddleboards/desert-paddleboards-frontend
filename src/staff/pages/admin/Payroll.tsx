import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYOUT_METHOD_LABELS, staffApi, type LedgerRow, type Payroll } from "../../api";
import MarkPaidControl from "../../components/MarkPaidControl";
import { azMonthKey, azYear, describePaid, errMessage, money, shortDay, toInputs, venueLine } from "../../format";
import StatTile from "../../components/StatTile";
import { applicationRoleLabel } from "../../roles";
import { useStaff } from "../../StaffContext";

type Person = LedgerRow["staff"];

/**
 * Sarah's payroll: who's owed for shifts they've worked (grouped by person,
 * with their payout details), and a record of what's been paid this year.
 * Marking paid is bookkeeping only; the money goes out by Venmo/Zelle/etc.
 */
export default function AdminPayroll() {
  const { staff: me } = useStaff();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "paid" ? "paid" : "owed";
  const [year, setYear] = useState(() => azYear());
  const [data, setData] = useState<Payroll | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await staffApi.admin.payroll(year));
      setError(null);
    } catch (err) {
      setError(errMessage(err, "Couldn't load payroll."));
    }
  }, [year]);

  useEffect(() => {
    void load();
  }, [load]);

  const owedByPerson = useMemo(() => groupByPerson(data?.owed ?? []), [data]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;

  const owedTotal = (data?.owed ?? []).reduce((t, r) => t + (r.payCents ?? 0), 0);
  const paidTotal = (data?.paid ?? []).reduce((t, r) => t + (r.payCents ?? 0), 0);
  const thisMonth = azMonthKey();
  const paidThisMonth = (data?.paid ?? [])
    .filter((r) => r.paidAt && azMonthKey(r.paidAt) === thisMonth)
    .reduce((t, r) => t + (r.payCents ?? 0), 0);

  async function markPaid(ids: string[], note: string, notify: boolean) {
    setError(null);
    setNotice(null);
    try {
      const res = await staffApi.admin.markPaid({ applicationIds: ids, note: note || undefined, notify });
      setNotice(describePaid(res, notify));
      await load();
      return true;
    } catch (err) {
      setError(errMessage(err, "Couldn't mark that paid. Try again."));
      return false;
    }
  }

  async function undo(row: LedgerRow) {
    const who = row.staff.name || row.staff.email;
    if (!window.confirm(`Undo the payment of ${money(row.payCents)} to ${who}? Any email already sent stays sent, so let them know.`)) return;
    setError(null);
    setNotice(null);
    try {
      await staffApi.admin.undoPaid(row.id);
      setNotice(`Undone. ${who}'s ${money(row.payCents)} is back on the owed list.`);
      await load();
    } catch (err) {
      setError(errMessage(err, "Couldn't undo that."));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">Payroll</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send the money the usual way (Venmo, Zelle…), then mark it paid here so the team can see it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Owed now" value={data ? money(owedTotal) : "…"} sub={data ? `${data.owed.length} shift${data.owed.length === 1 ? "" : "s"}, ${owedByPerson.length} ${owedByPerson.length === 1 ? "person" : "people"}` : ""} strong />
        <StatTile label="Coming up" value={data ? money(data.upcoming.totalCents) : "…"} sub={data ? `${data.upcoming.count} confirmed shift${data.upcoming.count === 1 ? "" : "s"}` : ""} />
        <StatTile label="Paid this month" value={data && year === azYear() ? money(paidThisMonth) : "–"} />
        <StatTile label={`Paid in ${year}`} value={data ? money(paidTotal) : "…"} />
      </div>

      <div className="inline-flex rounded-lg border border-border bg-white p-1 text-sm">
        {([
          ["owed", "To pay"],
          ["paid", "Paid"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setParams(key === "paid" ? { tab: "paid" } : {}, { replace: true })}
            className={`rounded-md px-3 py-1.5 font-medium ${tab === key ? "bg-brand-dark text-white" : "text-foreground hover:bg-black/5"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {notice ? <p className="text-sm text-brand">{notice}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!data ? (
        error ? null : <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === "owed" ? (
        owedByPerson.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nobody's owed anything. Shifts show up here once they've happened.
            </CardContent>
          </Card>
        ) : (
          owedByPerson.map(({ person, rows }) => (
            <OwedCard key={person.id} person={person} rows={rows} onPay={markPaid} />
          ))
        )
      ) : (
        <PaidTab data={data} year={year} onYear={setYear} onUndo={undo} />
      )}
    </div>
  );
}

function groupByPerson(rows: LedgerRow[]) {
  const map = new Map<string, { person: Person; rows: LedgerRow[] }>();
  for (const r of rows) {
    if (!map.has(r.staffId)) map.set(r.staffId, { person: r.staff, rows: [] });
    map.get(r.staffId)!.rows.push(r);
  }
  return [...map.values()].sort((a, b) => (a.person.name || a.person.email).localeCompare(b.person.name || b.person.email));
}

function payoutLine(p: Person): string | null {
  if (!p.payoutMethod) return null;
  return `${PAYOUT_METHOD_LABELS[p.payoutMethod]}${p.payoutHandle ? ` ${p.payoutHandle}` : ""}`;
}

function OwedCard({
  person,
  rows,
  onPay,
}: {
  person: Person;
  rows: LedgerRow[];
  onPay: (ids: string[], note: string, notify: boolean) => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(rows.map((r) => r.id)));
  const [copied, setCopied] = useState(false);
  const chosen = rows.filter((r) => selected.has(r.id));
  const total = chosen.reduce((t, r) => t + (r.payCents ?? 0), 0);
  const payout = payoutLine(person);

  useEffect(() => setSelected(new Set(rows.map((r) => r.id))), [rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{person.name || person.email}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {payout ? (
            <>
              <span className="font-medium text-foreground">{payout}</span>
              {person.payoutHandle ? (
                <button
                  type="button"
                  className="text-xs text-brand hover:underline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(person.payoutHandle!).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    });
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              ) : null}
            </>
          ) : (
            <span className="text-destructive">No payout details yet</span>
          )}
          {person.phone ? (
            <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
              · {person.phone}
            </a>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-6 py-3 text-sm">
              <input
                type="checkbox"
                aria-label={`Include ${r.event.title} on ${shortDay(r.event.startAt)}`}
                className="size-4 shrink-0 accent-[#1f3a4d]"
                checked={selected.has(r.id)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(r.id);
                  else next.delete(r.id);
                  setSelected(next);
                }}
              />
              <Link to={`/staff/admin/shift?id=${r.eventId}`} className="min-w-0 flex-1 hover:underline">
                <span className="font-medium">{shortDay(r.event.startAt)}</span> · {r.event.title}
                <span className="text-muted-foreground"> · {applicationRoleLabel(r, true)}</span>
                {venueLine(r.event) ? <span className="block text-muted-foreground">{venueLine(r.event)}</span> : null}
              </Link>
              <span className="shrink-0 font-semibold">{money(r.payCents)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm">
            {chosen.length === rows.length ? "Total" : `${chosen.length} of ${rows.length} selected`}:{" "}
            <span className="font-bold">{money(total)}</span>
          </p>
          <MarkPaidControl
            label={`Mark ${money(total)} paid`}
            disabled={chosen.length === 0}
            onSubmit={(note, notify) => onPay(chosen.map((r) => r.id), note, notify)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PaidTab({
  data,
  year,
  onYear,
  onUndo,
}: {
  data: Payroll;
  year: number;
  onYear: (y: number) => void;
  onUndo: (row: LedgerRow) => void;
}) {
  const totals = groupByPerson(data.paid).map(({ person, rows }) => ({
    person,
    count: rows.length,
    cents: rows.reduce((t, r) => t + (r.payCents ?? 0), 0),
  }));
  totals.sort((a, b) => b.cents - a.cents);
  const years: number[] = [];
  for (let y = azYear(); y >= 2026; y--) years.push(y);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Year"
          className="border-input h-9 rounded-md border bg-white px-3 text-sm shadow-xs"
          value={year}
          onChange={(e) => onYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" disabled={data.paid.length === 0} onClick={() => downloadCsv(data.paid, year)}>
          Download {year} as CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Totals by person, {year}</CardTitle>
          <CardDescription>What each person was paid this year. Handy at tax time.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {totals.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Nothing marked paid in {year} yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {totals.map((t) => (
                <li key={t.person.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                  <span className="font-medium">{t.person.name || t.person.email}</span>
                  <span>
                    <span className="text-muted-foreground">{t.count} shift{t.count === 1 ? "" : "s"} · </span>
                    <span className="font-semibold">{money(t.cents)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {data.paid.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {data.paid.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p>
                      <span className="font-medium">{r.staff.name || r.staff.email}</span> · {shortDay(r.event.startAt)} {r.event.title}
                    </p>
                    <p className="text-muted-foreground">
                      Paid {r.paidAt ? shortDay(r.paidAt) : ""}
                      {r.paidByName ? ` by ${r.paidByName.split(" ")[0]}` : ""}
                      {r.paidNote ? ` · ${r.paidNote}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold">{money(r.payCents)}</span>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onUndo(r)}>
                      Undo
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function downloadCsv(rows: LedgerRow[], year: number) {
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Paid date", "Name", "Email", "Payout method", "Payout handle", "Shift date", "Shift", "Venue", "Amount", "Note", "Marked paid by"];
  const lines = rows.map((r) =>
    [
      r.paidAt ? toInputs(r.paidAt).date : "",
      r.staff.name,
      r.staff.email,
      r.staff.payoutMethod ? PAYOUT_METHOD_LABELS[r.staff.payoutMethod] : "",
      r.staff.payoutHandle,
      toInputs(r.event.startAt).date,
      r.event.title,
      venueLine(r.event),
      ((r.payCents ?? 0) / 100).toFixed(2),
      r.paidNote,
      r.paidByName,
    ]
      .map(cell)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `desert-paddleboards-staff-pay-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
