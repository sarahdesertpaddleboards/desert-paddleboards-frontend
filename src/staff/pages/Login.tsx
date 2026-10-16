import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, staffApi } from "../api";
import { useStaff } from "../StaffContext";

export default function StaffLogin() {
  const { staff, loading } = useStaff();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Already logged in → straight through.
  useEffect(() => {
    if (!loading && staff) navigate(params.get("next") || "/staff", { replace: true });
  }, [loading, staff, navigate, params]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await staffApi.requestLink(email);
      setSent(true);
      setDevLink(res.devLink ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "email_not_configured"
          ? "Email sending isn't switched on yet. Ask Nick."
          : err instanceof ApiError && err.message
            ? err.message
            : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-brand-dark">Staff login</CardTitle>
          <CardDescription>
            No passwords. Enter your email and we'll send you a one-time link that logs you in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-3">
              <p className="rounded-lg bg-brand/10 p-4 text-sm">
                If <strong>{email}</strong> is on the staff list, a login link is on its way. It works once and
                expires in 20 minutes — check spam if it's not there in a minute.
              </p>
              {devLink ? (
                <p className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs">
                  <strong>Local dev:</strong> email is off, so here's your link:{" "}
                  <a className="break-all text-brand underline" href={devLink}>
                    {devLink}
                  </a>
                </p>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy || !email}>
                {busy ? "Sending…" : "Email me a login link"}
              </Button>
              <p className="text-xs text-muted-foreground">
                New here? You need an invite from Sarah first — ask her to add you.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
