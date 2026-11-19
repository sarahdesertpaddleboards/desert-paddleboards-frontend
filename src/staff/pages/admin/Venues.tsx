import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { staffApi, type Venue, type VenueInput } from "../../api";
import { errMessage } from "../../format";
import { useStaff } from "../../StaffContext";

type Draft = Required<Pick<VenueInput, "name">> & { address: string; contactName: string; contactPhone: string; notes: string };

const draftFrom = (v?: Partial<Venue>): Draft => ({
  name: v?.name ?? "",
  address: v?.address ?? "",
  contactName: v?.contactName ?? "",
  contactPhone: v?.contactPhone ?? "",
  notes: v?.notes ?? "",
});

const inputFrom = (d: Draft): VenueInput => ({
  name: d.name.trim(),
  address: d.address.trim() || null,
  contactName: d.contactName.trim() || null,
  contactPhone: d.contactPhone.trim() || null,
  notes: d.notes.trim() || null,
});

/**
 * Venue directory: the address staff see, and the PRIVATE on-site contact
 * (admins only; the event lead gets it in the day-before reminder). Shifts
 * match a venue by name, so every calendar shift there picks it up.
 */
export default function AdminVenues() {
  const { staff: me } = useStaff();
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [missing, setMissing] = useState<{ name: string; shiftCount: number }[]>([]);
  const [editing, setEditing] = useState<string | null>(null); // venue id, "new", or "new:<name>"
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await staffApi.admin.venues();
      setVenues(res.venues);
      setMissing(res.missing);
    } catch (err) {
      setError(errMessage(err, "Couldn't load venues."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;

  const newName = editing?.startsWith("new:") ? editing.slice(4) : "";

  return (
    <div className="space-y-6">
      <div>
        <Link to="/staff/admin/shifts" className="text-sm text-brand hover:underline">
          ← Schedule
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark sm:text-3xl">Venues</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each place you work: the address staff see, and the on-site contact, which stays private. Only admins see it, and the event
          lead gets it in their reminder the day before. Every shift at a venue picks these up by name.
        </p>
      </div>

      {notice ? <p className="text-sm text-brand">{notice}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {missing.length ? (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="text-lg">Venues on the schedule with no details yet</CardTitle>
            <CardDescription>Add the address and contact so reminders have them.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {missing.map((m) => (
              <Button key={m.name} size="sm" variant="outline" onClick={() => setEditing(`new:${m.name}`)}>
                + {m.name} <span className="ml-1 text-muted-foreground">({m.shiftCount})</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {editing === "new" || newName ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a venue</CardTitle>
          </CardHeader>
          <CardContent>
            <VenueForm
              key={editing}
              initial={draftFrom({ name: newName })}
              submitLabel="Add venue"
              onCancel={() => setEditing(null)}
              onSave={async (d) => {
                await staffApi.admin.createVenue(inputFrom(d));
                setEditing(null);
                setNotice(`${d.name} added.`);
                await load();
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setEditing("new")}>Add a venue</Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All venues {venues ? <span className="text-muted-foreground">({venues.length})</span> : null}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!venues ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Loading…</p>
          ) : venues.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">None yet. Add one, or import your list below.</p>
          ) : (
            <ul className="divide-y divide-border">
              {venues.map((v) => (
                <li key={v.id} className="p-4">
                  {editing === v.id ? (
                    <VenueForm
                      initial={draftFrom(v)}
                      submitLabel="Save"
                      onCancel={() => setEditing(null)}
                      onDelete={async () => {
                        if (!window.confirm(`Delete ${v.name}? Shifts keep anything set on them directly.`)) return;
                        await staffApi.admin.deleteVenue(v.id);
                        setEditing(null);
                        await load();
                      }}
                      onSave={async (d) => {
                        await staffApi.admin.updateVenue(v.id, inputFrom(d));
                        setEditing(null);
                        setNotice(`${d.name} saved.`);
                        await load();
                      }}
                    />
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 text-sm">
                        <p className="font-medium">
                          {v.name}
                          {v.shiftCount ? <span className="ml-2 text-xs font-normal text-muted-foreground">{v.shiftCount} upcoming</span> : null}
                        </p>
                        <p className="text-muted-foreground">{v.address || "No address"}</p>
                        <p className="text-amber-800">
                          {v.contactName || v.contactPhone
                            ? `Contact: ${[v.contactName, v.contactPhone].filter(Boolean).join(" · ")}`
                            : "No on-site contact"}
                        </p>
                        {v.notes ? <p className="mt-1 text-xs text-muted-foreground">{v.notes}</p> : null}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setEditing(v.id)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ImportVenues
        onDone={async (msg) => {
          setNotice(msg);
          await load();
        }}
      />
    </div>
  );
}

function VenueForm({
  initial,
  submitLabel,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Draft;
  submitLabel: string;
  onSave: (d: Draft) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD((p) => ({ ...p, [k]: e.target.value }));
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errMessage(err, "That didn't save."));
      setBusy(false);
    }
  };
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void act(() => onSave(d));
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="vf-name">Venue name (as it appears on the schedule)</Label>
        <Input id="vf-name" required value={d.name} onChange={set("name")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="vf-address">Address (staff see this)</Label>
        <Input id="vf-address" value={d.address} onChange={set("address")} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="vf-cname">On-site contact (private)</Label>
          <Input id="vf-cname" value={d.contactName} onChange={set("contactName")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="vf-cphone">Contact phone (private)</Label>
          <Input id="vf-cphone" type="tel" inputMode="tel" value={d.contactPhone} onChange={set("contactPhone")} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="vf-notes">Private notes (admins only)</Label>
        <Textarea id="vf-notes" rows={2} value={d.notes} onChange={set("notes")} placeholder="Gate code, where to park, who to invoice…" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        {onDelete ? (
          <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={() => void act(onDelete)}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function ImportVenues({ onDone }: { onDone: (msg: string) => Promise<void> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Import a list</CardTitle>
        <CardDescription>
          Copy rows from a spreadsheet and paste them here, one venue per line, in this order: venue name, address, contact name,
          contact phone, notes. Existing venues are updated; blank cells are left alone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Heritage Asante\t123 Clubhouse Dr, Surprise, AZ\tMackenzie\t(281) 804-8074\tIndoor, clubhouse"}
          className="font-mono text-xs"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          disabled={busy || !text.trim()}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              const r = await staffApi.admin.importVenues(text);
              setText("");
              const skipped = r.skipped.length ? ` Skipped: ${r.skipped.map((s) => `line ${s.line} (${s.reason})`).join(", ")}.` : "";
              await onDone(`Imported: ${r.created} added, ${r.updated} updated.${skipped}`);
            } catch (err) {
              setError(errMessage(err, "Couldn't import that."));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Importing…" : "Import"}
        </Button>
      </CardContent>
    </Card>
  );
}
