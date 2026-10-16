import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, PAYOUT_METHOD_LABELS, staffApi, type Staff } from "../api";
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
                    <p className="truncate text-sm text-muted-foreground">
                      {p.email}
                      {p.phone ? ` · ${p.phone}` : ""}
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
    </div>
  );
}

function StatusBadge({ status }: { status: Staff["status"] }) {
  if (status === "active") return <Badge className="bg-brand text-white hover:bg-brand">Active</Badge>;
  if (status === "invited") return <Badge variant="secondary">Invited</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
}
