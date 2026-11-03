import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Role, ShiftInput, ShiftTemplate } from "../api";
import { fromInputs, toInputs } from "../format";
import { ROLE_LABELS, ROLES, SKILL_HINTS } from "../roles";

export interface RoleRow {
  role: Role;
  needed: string;
  pay: string;
}

export interface ShiftFormValues {
  title: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  city: string;
  roles: RoleRow[];
  trailer: boolean;
  trailerPay: string;
  notes: string;
}

const dollars = (cents: number | null | undefined) => (cents != null ? String(cents / 100) : "");

export function emptyShiftValues(): ShiftFormValues {
  return {
    title: "",
    date: "",
    start: "",
    end: "",
    venue: "",
    city: "",
    roles: [{ role: "general", needed: "1", pay: "" }],
    trailer: false,
    trailerPay: "",
    notes: "",
  };
}

/** Build form values from an existing shift / calendar session. */
export function shiftValuesFrom(s: {
  title: string;
  startAt: string;
  endAt?: string | null;
  venue?: string | null;
  city?: string | null;
  roles?: { role: Role; needed: number; payCents?: number | null }[];
  trailerNeeded?: number;
  trailerPayCents?: number | null;
  notes?: string | null;
}): ShiftFormValues {
  const start = toInputs(s.startAt);
  const end = toInputs(s.endAt);
  return {
    title: s.title,
    date: start.date,
    start: start.time,
    end: end.time,
    venue: s.venue ?? "",
    city: s.city ?? "",
    roles: s.roles?.length
      ? s.roles.map((r) => ({ role: r.role, needed: String(r.needed), pay: dollars(r.payCents) }))
      : emptyShiftValues().roles,
    trailer: (s.trailerNeeded ?? 0) > 0,
    trailerPay: dollars(s.trailerPayCents),
    notes: s.notes ?? "",
  };
}

/** Swap in a template's roles, trailer and notes, keeping the title/time/place. */
export function applyTemplate(v: ShiftFormValues, t: ShiftTemplate): ShiftFormValues {
  return {
    ...v,
    roles: t.roles.map((r) => ({ role: r.role, needed: String(r.needed), pay: dollars(r.payCents) })),
    trailer: t.trailerNeeded > 0,
    trailerPay: dollars(t.trailerPayCents),
    notes: v.notes || t.notes || "",
  };
}

/** Same rule as the server: first template with a keyword in the title/venue, else the default. */
export function matchTemplate(templates: ShiftTemplate[], title: string, venue = ""): ShiftTemplate | undefined {
  const hay = `${title} ${venue}`.toLowerCase();
  return (
    templates.find((t) => !t.isDefault && t.keywords.some((k) => k && hay.includes(k.toLowerCase()))) ??
    templates.find((t) => t.isDefault)
  );
}

export function rolesInputFrom(rows: RoleRow[]) {
  return rows.map((r) => ({ role: r.role, needed: Number(r.needed) || 1, pay: r.pay.trim() || null }));
}

export function shiftInputFrom(v: ShiftFormValues): ShiftInput {
  return {
    title: v.title.trim(),
    startAt: fromInputs(v.date, v.start) ?? "",
    endAt: v.end ? fromInputs(v.date, v.end) : null,
    venue: v.venue.trim() || null,
    city: v.city.trim() || null,
    roles: rolesInputFrom(v.roles),
    trailerNeeded: v.trailer ? 1 : 0,
    trailerPay: v.trailer ? v.trailerPay.trim() || null : null,
    notes: v.notes.trim() || null,
  };
}

/**
 * Who a shift (or template) needs: one row per role with a head count and the
 * usual pay, plus the trailer add-on. Pay pre-fills the confirm box; staff
 * never see it.
 */
export function RolesEditor({
  roles,
  onRoles,
  trailer,
  onTrailer,
  trailerPay,
  onTrailerPay,
  idPrefix,
}: {
  roles: RoleRow[];
  onRoles: (rows: RoleRow[]) => void;
  trailer: boolean;
  onTrailer: (on: boolean) => void;
  trailerPay: string;
  onTrailerPay: (v: string) => void;
  idPrefix: string;
}) {
  const unused = ROLES.filter((r) => !roles.some((x) => x.role === r));
  const update = (i: number, patch: Partial<RoleRow>) => onRoles(roles.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Who's needed</Label>
        <div className="divide-y divide-border rounded-lg border border-border">
          {roles.map((r, i) => (
            <div key={r.role} className="flex flex-wrap items-center gap-2 p-2.5">
              <div className="min-w-0 flex-1 basis-40">
                <p className="text-sm font-medium">{ROLE_LABELS[r.role]}</p>
                <p className="text-xs text-muted-foreground">{SKILL_HINTS[r.role]}</p>
              </div>
              <Input
                aria-label={`How many ${ROLE_LABELS[r.role]}`}
                type="number"
                min={1}
                max={50}
                className="h-8 w-16"
                value={r.needed}
                onChange={(e) => update(i, { needed: e.target.value })}
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  aria-label={`Usual pay for ${ROLE_LABELS[r.role]}`}
                  inputMode="decimal"
                  className="h-8 w-24 pl-6"
                  placeholder="Pay"
                  value={r.pay}
                  onChange={(e) => update(i, { pay: e.target.value })}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-muted-foreground"
                disabled={roles.length === 1}
                onClick={() => onRoles(roles.filter((_, j) => j !== i))}
                aria-label={`Remove ${ROLE_LABELS[r.role]}`}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        {unused.length ? (
          <div className="flex flex-wrap gap-1.5">
            {unused.map((role) => (
              <Button
                key={role}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onRoles([...roles, { role, needed: "1", pay: "" }].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)))}
              >
                + {ROLE_LABELS[role]}
              </Button>
            ))}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">Pay pre-fills when you confirm someone. Staff don't see it.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-2.5">
        <label className="flex flex-1 basis-48 items-center gap-2 text-sm">
          <input
            id={`${idPrefix}-trailer`}
            type="checkbox"
            className="size-4 accent-[#1f3a4d]"
            checked={trailer}
            onChange={(e) => onTrailer(e.target.checked)}
          />
          <span>
            <span className="font-medium">Needs a trailer driver</span>
            <span className="block text-xs text-muted-foreground">One of the crew also tows the boards there and back, for extra pay</span>
          </span>
        </label>
        {trailer ? (
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+$</span>
            <Input
              aria-label="Extra pay for the trailer driver"
              inputMode="decimal"
              className="h-8 w-24 pl-8"
              placeholder="Extra"
              value={trailerPay}
              onChange={(e) => onTrailerPay(e.target.value)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ShiftForm({
  initial,
  submitLabel,
  busy,
  error,
  onSubmit,
  onCancel,
  templates,
}: {
  initial: ShiftFormValues;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (values: ShiftFormValues) => void;
  onCancel?: () => void;
  /** When given, offers "Staff it like…" to copy a template's roles. */
  templates?: ShiftTemplate[];
}) {
  const [v, setV] = useState<ShiftFormValues>(initial);
  const set = (k: "title" | "date" | "start" | "end" | "venue" | "city" | "notes") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="sf-title">Title</Label>
        <Input id="sf-title" required value={v.title} onChange={set("title")} placeholder="Floating Soundbath" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sf-date">Date</Label>
          <Input id="sf-date" type="date" required value={v.date} onChange={set("date")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sf-start">Start</Label>
          <Input id="sf-start" type="time" required value={v.start} onChange={set("start")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sf-end">End (optional)</Label>
          <Input id="sf-end" type="time" value={v.end} onChange={set("end")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sf-venue">Venue</Label>
          <Input id="sf-venue" value={v.venue} onChange={set("venue")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sf-city">City</Label>
          <Input id="sf-city" value={v.city} onChange={set("city")} />
        </div>
      </div>
      {templates?.length ? (
        <div className="space-y-2">
          <Label htmlFor="sf-template">Staff it like…</Label>
          <select
            id="sf-template"
            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs sm:w-72"
            value=""
            onChange={(e) => {
              const t = templates.find((x) => x.id === e.target.value);
              if (t) setV((prev) => applyTemplate(prev, t));
            }}
          >
            <option value="">Copy roles from a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <RolesEditor
        idPrefix="sf"
        roles={v.roles}
        onRoles={(roles) => setV((p) => ({ ...p, roles }))}
        trailer={v.trailer}
        onTrailer={(trailer) => setV((p) => ({ ...p, trailer }))}
        trailerPay={v.trailerPay}
        onTrailerPay={(trailerPay) => setV((p) => ({ ...p, trailerPay }))}
      />
      <div className="space-y-2">
        <Label htmlFor="sf-notes">Notes for staff (optional)</Label>
        <Textarea id="sf-notes" rows={3} value={v.notes} onChange={set("notes")} placeholder="Arrive 45 minutes early to set up boards." />
      </div>
      <p className="text-xs text-muted-foreground">Times are Arizona time.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
