import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, PAYOUT_METHOD_LABELS, staffApi, type Staff } from "../api";
import { SKILL_LABELS } from "../roles";
import { useStaff } from "../StaffContext";

/** Admin roster: invite people, see who has signed up, deactivate / promote. */
export default function StaffPeople() {
  const { staff: me } = useStaff();
  const [list, setList] = useState<Staff[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { staff } = await staffApi.admin.listStaff();
      setList(staff);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? "Admins only." : "Couldn't load the roster.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!me) return null;
  if (me.role !== "admin") return <p className="text-sm text-muted-foreground">Admins only.</p>;

  function describeSend(res: { emailed?: boolean; emailError?: string; devLink?: string }, who: string) {
    if (res.devLink) return `Local dev — invite link for ${who}: ${res.devLink}`;
    if (res.emailed) return `Invite emailed to ${who}.`;
    return `Added ${who}, but the email failed (${res.emailError || "unknown"}). Use "Resend invite" once email is fixed.`;
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setInviting(true);
    try {
      const res = await staffApi.admin.invite({ email, name: name || undefined });
      setNotice(describeSend(res, res.staff.email));
      setEmail("");
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError && err.message ? err.message : "Couldn't send the invite.");
    } finally {
      setInviting(false);
    }
  }

  async function act(fn: () => Promise<unknown>, okMessage?: (res: any) => string) {
    setError(null);
    setNotice(null);
    try {
      const res = await fn();
      if (okMessage) setNotice(okMessage(res));
      await load();
    } catch (err) {
      setError(err instanceof ApiError && err.message ? err.message : "That didn't work.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">People</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite someone and they get an email link to set up their profile. No passwords for anyone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite someone</CardTitle>
          <CardDescription>They'll get an email from Sarah with a link that's valid for 14 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={invite} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="inv-email">Email</Label>
              <Input id="inv-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-name">Name (optional)</Label>
              <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" disabled={inviting || !email}>
              {inviting ? "Sending…" : "Send invite"}
            </Button>
          </form>
          {notice ? <p className="mt-3 break-all text-sm text-brand">{notice}</p> : null}
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roster {list ? <span className="text-muted-foreground">({list.length})</span> : null}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!list ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Nobody yet — send the first invite above.</p>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.name || <span className="text-muted-foreground">No name yet</span>}</span>
                      <StatusBadge status={p.status} />
                      {p.role === "admin" ? <Badge variant="outline">Admin</Badge> : null}
                      {p.id === me.id ? <Badge variant="secondary">You</Badge> : null}
                    </div>
                    {p.skills.length ? (
                      <p className="mt-0.5 text-xs text-brand-dark">{p.skills.map((k) => SKILL_LABELS[k]).join(" · ")}</p>
                    ) : null}
                    <p className="truncate text-sm text-muted-foreground">
                      {p.email}
                      {p.phone ? ` · ${p.phone}${p.smsOptIn ? " (texts on)" : ""}` : ""}
                      {p.payoutMethod ? ` · ${PAYOUT_METHOD_LABELS[p.payoutMethod]}${p.payoutHandle ? ` ${p.payoutHandle}` : ""}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status === "invited" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(() => staffApi.admin.resendInvite(p.id), (r) => describeSend(r, p.email))}
                      >
                        Resend invite
                      </Button>
                    ) : null}
                    {p.id !== me.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            act(() => staffApi.admin.updateStaff(p.id, { role: p.role === "admin" ? "staff" : "admin" }))
                          }
                        >
                          {p.role === "admin" ? "Remove admin" : "Make admin"}
                        </Button>
                        {p.status === "inactive" ? (
                          <Button size="sm" variant="ghost" onClick={() => act(() => staffApi.admin.updateStaff(p.id, { status: "active" }))}>
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              if (window.confirm(`Deactivate ${p.name || p.email}? They won't be able to log in.`)) {
                                void act(() => staffApi.admin.updateStaff(p.id, { status: "inactive" }));
                              }
                            }}
                          >
                            Deactivate
                          </Button>
                        )}
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <ImportPeople onDone={load} />
    </div>
  );
}

function StatusBadge({ status }: { status: Staff["status"] }) {
  if (status === "active") return <Badge className="bg-brand text-white hover:bg-brand">Active</Badge>;
  if (status === "invited") return <Badge variant="secondary">Invited</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
}

/**
 * Paste a list (name, email, mobile: any order, one person per line) to add
 * everyone at once. Nobody is emailed unless "Send invites now" is ticked, so
 * Sarah can try it on one person first and invite the rest later.
 */
function ImportPeople({ onDone }: { onDone: (msg: string) => Promise<void> | void }) {
  const [text, setText] = useState("");
  const [sendInvites, setSendInvites] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add a list of people</CardTitle>
        <CardDescription>
          Paste from your phone list or a spreadsheet, one person per line: name, email, mobile (any order). They're added as
          invited. Nobody is emailed unless you tick the box, so you can invite them one by one later with "Resend invite".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Sonya Diaz, sonya@example.com, (480) 555-0123\nRad, rad@example.com, 480-555-0199"}
          className="font-mono text-xs"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[#1f3a4d]" checked={sendInvites} onChange={(e) => setSendInvites(e.target.checked)} />
          Send invite emails now
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {done ? <p className="text-sm text-brand">{done}</p> : null}
        <Button
          disabled={busy || !text.trim()}
          onClick={async () => {
            setBusy(true);
            setError(null);
            setDone(null);
            try {
              const r = await staffApi.admin.importStaff(text, sendInvites);
              setText("");
              const parts = [
                `${r.added.length} added`,
                r.updated.length ? `${r.updated.length} updated` : null,
                r.unchanged.length ? `${r.unchanged.length} already on the list` : null,
                sendInvites ? `${r.invited.length} invited` : "no emails sent",
              ].filter(Boolean);
              const skipped = r.skipped.length ? ` Skipped: ${r.skipped.map((x) => `line ${x.line} (${x.reason})`).join(", ")}.` : "";
              const msg = `Imported: ${parts.join(", ")}.${skipped}`;
              setDone(msg);
              await onDone(msg);
            } catch (err) {
              setError(err instanceof ApiError && err.message ? err.message : "Couldn't import that.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Adding…" : "Add these people"}
        </Button>
      </CardContent>
    </Card>
  );
}
