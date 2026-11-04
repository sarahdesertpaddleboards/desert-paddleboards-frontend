import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, PAYOUT_HANDLE_HINT, PAYOUT_METHOD_LABELS, staffApi, type PayoutMethod, type Skill } from "../api";
import { SKILLS, SKILL_HINTS, SKILL_LABELS } from "../roles";
import { useStaff } from "../StaffContext";

export default function StaffProfile() {
  const { staff, setStaff } = useStaff();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const welcome = params.get("welcome") === "1";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | "">("");
  const [payoutHandle, setPayoutHandle] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staff) return;
    setName(staff.name ?? "");
    setPhone(staff.phone ?? "");
    setPayoutMethod(staff.payoutMethod ?? "");
    setPayoutHandle(staff.payoutHandle ?? "");
    setSkills(staff.skills ?? []);
    setSmsOptIn(staff.smsOptIn ?? false);
  }, [staff]);

  if (!staff) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setNotice(null);
    setBusy(true);
    try {
      const res = await staffApi.updateMe({
        name,
        phone,
        payoutMethod: payoutMethod || null,
        payoutHandle,
        skills,
        smsOptIn,
      });
      setStaff(res.staff);
      setSaved(true);
      if (res.texted) setNotice("Texts are on. We've sent a welcome text to your phone.");
      if (welcome && res.staff.profileComplete) navigate("/staff", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.message ? err.message : "Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-brand-dark">{welcome ? "Welcome! Tell us about you" : "Your profile"}</CardTitle>
          <CardDescription>
            {welcome
              ? "Two minutes: your name, your mobile (tick the box to get shift updates by text), what you can do, and how you'd like to be paid."
              : "Keep this current so confirmations and payments reach you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={staff.email} disabled />
              <p className="text-xs text-muted-foreground">Login links go here. Ask Sarah if it needs changing.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="(480) 555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm">
                <input
                  id="smsOptIn"
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-[#1f3a4d]"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                />
                <span>
                  <span className="font-medium">Text me shift updates</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    I agree to get automated texts from Desert Paddleboards at this number about my shifts: confirmations,
                    changes, reminders and pay. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out,
                    HELP for help. Agreeing isn't a condition of working with us.{" "}
                    <Link to="/sms-terms" className="text-brand underline" target="_blank">
                      Text terms
                    </Link>{" "}
                    ·{" "}
                    <Link to="/privacy" className="text-brand underline" target="_blank">
                      Privacy
                    </Link>
                  </span>
                </span>
              </label>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">What can you do?</legend>
              <p className="text-xs text-muted-foreground">Tick everything that fits. Shifts that need you are highlighted.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SKILLS.map((k) => (
                  <label key={k} className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[#1f3a4d]"
                      checked={skills.includes(k)}
                      onChange={(e) =>
                        setSkills((prev) => (e.target.checked ? SKILLS.filter((x) => x === k || prev.includes(x)) : prev.filter((x) => x !== k)))
                      }
                    />
                    <span>
                      <span className="font-medium">{SKILL_LABELS[k]}</span>
                      <span className="block text-xs text-muted-foreground">{SKILL_HINTS[k]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="payoutMethod">How would you like to be paid?</Label>
              <select
                id="payoutMethod"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod | "")}
              >
                <option value="">Choose…</option>
                {(Object.keys(PAYOUT_METHOD_LABELS) as PayoutMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYOUT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            {payoutMethod ? (
              <div className="space-y-2">
                <Label htmlFor="payoutHandle">{PAYOUT_METHOD_LABELS[payoutMethod]} details</Label>
                <Input
                  id="payoutHandle"
                  placeholder={PAYOUT_HANDLE_HINT[payoutMethod]}
                  value={payoutHandle}
                  onChange={(e) => setPayoutHandle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Only Sarah sees this. Never enter bank account or card numbers here.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {saved ? <p className="text-sm text-brand">{notice ?? "Saved."}</p> : null}
            <Button type="submit" className="w-full sm:w-auto" disabled={busy}>
              {busy ? "Saving…" : welcome ? "Save and continue" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
