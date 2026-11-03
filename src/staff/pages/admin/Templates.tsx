import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { staffApi, type ShiftTemplate, type TemplateInput } from "../../api";
import { RolesEditor, rolesInputFrom, type RoleRow } from "../../components/ShiftForm";
import { errMessage } from "../../format";
import { useStaff } from "../../StaffContext";

interface Draft {
  name: string;
  keywords: string;
  roles: RoleRow[];
  trailer: boolean;
  notes: string;
  autoPost: boolean;
}

function draftFrom(t?: ShiftTemplate): Draft {
  return {
    name: t?.name ?? "",
    keywords: t?.keywords.join(", ") ?? "",
    roles: t?.roles.map((r) => ({ role: r.role, needed: String(r.needed) })) ?? [
      { role: "lead", needed: "1" },
      { role: "general", needed: "1" },
    ],
    trailer: (t?.trailerNeeded ?? 1) > 0,
    notes: t?.notes ?? "",
    autoPost: t?.autoPost ?? true,
  };
}

function inputFrom(d: Draft): TemplateInput {
  return {
    name: d.name.trim(),
    keywords: d.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    roles: rolesInputFrom(d.roles),
    trailerNeeded: d.trailer ? 1 : 0,
    notes: d.notes.trim() || null,
    autoPost: d.autoPost,
  };
}

/**
 * Staffing templates: who each kind of session needs. Calendar sessions are
 * auto-posted with the first template whose keyword appears in the session
 * title (else the default), and "Post a shift" can copy one.
 */
export default function AdminTemplates() {
  const { staff: me } = useStaff();
  const [templates, setTemplates] = useState<ShiftTemplate[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTemplates((await staffApi.admin.templates()).templates);
    } catch (err) {
      setError(errMessage(err, "Couldn't load templates."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/staff/admin/shifts" className="text-sm text-brand hover:underline">
          ← Schedule
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark sm:text-3xl">Staffing templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who each kind of session needs (no pay here: you set each person's pay when you confirm them). When a calendar session is posted automatically, it uses the first template below whose
          keyword is in the session's name (for example "soundbath"), or the default at the bottom. Changes apply to shifts posted
          from now on; existing shifts keep their roles.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!templates ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      {templates?.map((t) => (
        <TemplateCard key={t.id} template={t} onChanged={load} />
      ))}

      {adding ? (
        <TemplateCard onChanged={async () => { setAdding(false); await load(); }} onCancel={() => setAdding(false)} />
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          Add a template
        </Button>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onChanged,
  onCancel,
}: {
  template?: ShiftTemplate;
  onChanged: () => Promise<void>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState<Draft>(() => draftFrom(template));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const id = template?.id ?? "new";
  const isDefault = template?.isDefault ?? false;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (template) {
        await staffApi.admin.updateTemplate(template.id, inputFrom(d));
        setNotice("Saved.");
      } else {
        await staffApi.admin.createTemplate(inputFrom(d));
      }
      await onChanged();
    } catch (err) {
      setError(errMessage(err, "Couldn't save the template."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!template || !window.confirm(`Delete the "${template.name}" template? Existing shifts keep their roles.`)) return;
    setBusy(true);
    try {
      await staffApi.admin.deleteTemplate(template.id);
      await onChanged();
    } catch (err) {
      setError(errMessage(err, "Couldn't delete it."));
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{template ? template.name : "New template"}</CardTitle>
        <CardDescription>
          {isDefault
            ? "The default: used for any session no other template matches."
            : template?.keywords.length
              ? `Used for sessions with "${template.keywords.join('", "')}" in the name.`
              : "Add keywords so it matches sessions."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-name`}>Name</Label>
              <Input id={`${id}-name`} required value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
            </div>
            {!isDefault ? (
              <div className="space-y-2">
                <Label htmlFor={`${id}-kw`}>Keywords (comma separated)</Label>
                <Input
                  id={`${id}-kw`}
                  placeholder="soundbath, sound bath"
                  value={d.keywords}
                  onChange={(e) => setD({ ...d, keywords: e.target.value })}
                />
              </div>
            ) : null}
          </div>
          <RolesEditor
            idPrefix={id}
            roles={d.roles}
            onRoles={(roles) => setD({ ...d, roles })}
            trailer={d.trailer}
            onTrailer={(trailer) => setD({ ...d, trailer })}
          />
          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>Notes for staff (optional)</Label>
            <Textarea
              id={`${id}-notes`}
              rows={2}
              placeholder="Arrive 45 minutes early to set up boards."
              value={d.notes}
              onChange={(e) => setD({ ...d, notes: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-[#1f3a4d]" checked={d.autoPost} onChange={(e) => setD({ ...d, autoPost: e.target.checked })} />
            Post matching calendar sessions automatically
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-brand">{notice}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "Saving…" : template ? "Save" : "Add template"}
            </Button>
            {onCancel ? (
              <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
                Cancel
              </Button>
            ) : null}
            {template && !isDefault ? (
              <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={busy}>
                Delete
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
