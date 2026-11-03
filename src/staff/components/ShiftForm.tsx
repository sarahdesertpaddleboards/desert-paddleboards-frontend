import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ShiftInput } from "../api";
import { fromInputs, toInputs } from "../format";

export interface ShiftFormValues {
  title: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  city: string;
  staffNeeded: string;
  defaultPay: string;
  notes: string;
}

export function emptyShiftValues(): ShiftFormValues {
  return { title: "", date: "", start: "", end: "", venue: "", city: "", staffNeeded: "1", defaultPay: "", notes: "" };
}

/** Build form values from an existing shift / calendar session. */
export function shiftValuesFrom(s: {
  title: string;
  startAt: string;
  endAt?: string | null;
  venue?: string | null;
  city?: string | null;
  staffNeeded?: number;
  defaultPayCents?: number | null;
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
    staffNeeded: String(s.staffNeeded ?? 1),
    defaultPay: s.defaultPayCents != null ? String(s.defaultPayCents / 100) : "",
    notes: s.notes ?? "",
  };
}

export function shiftInputFrom(v: ShiftFormValues): ShiftInput {
  return {
    title: v.title.trim(),
    startAt: fromInputs(v.date, v.start) ?? "",
    endAt: v.end ? fromInputs(v.date, v.end) : null,
    venue: v.venue.trim() || null,
    city: v.city.trim() || null,
    staffNeeded: Number(v.staffNeeded) || 1,
    defaultPay: v.defaultPay.trim() || null,
    notes: v.notes.trim() || null,
  };
}

export default function ShiftForm({
  initial,
  submitLabel,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ShiftFormValues;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (values: ShiftFormValues) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<ShiftFormValues>(initial);
  const set = (k: keyof ShiftFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sf-needed">Staff needed</Label>
          <Input id="sf-needed" type="number" min={1} max={50} required value={v.staffNeeded} onChange={set("staffNeeded")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sf-pay">Usual pay ($, optional)</Label>
          <Input id="sf-pay" inputMode="decimal" placeholder="45" value={v.defaultPay} onChange={set("defaultPay")} />
          <p className="text-xs text-muted-foreground">Pre-fills the pay when you confirm someone. Staff don't see it.</p>
        </div>
      </div>
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
