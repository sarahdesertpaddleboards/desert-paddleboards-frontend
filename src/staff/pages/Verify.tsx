import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, staffApi } from "../api";
import { useStaff } from "../StaffContext";

/**
 * Landing page for one-time links. Redeems the token with a POST on mount
 * (so mail scanners that prefetch the GET don't use it up) and moves on.
 */
export default function StaffVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setStaff } = useStaff();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // React StrictMode double-mount guard
    started.current = true;
    const token = params.get("token");
    if (!token) {
      setError("This link is missing its code. Please request a new one.");
      return;
    }
    staffApi
      .verify(token)
      .then((res) => {
        setStaff(res.staff);
        navigate(res.next || "/staff", { replace: true });
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.code === "used_token") setError("That link has already been used. Request a fresh one below.");
          else if (err.code === "expired_token") setError("That link has expired. Request a fresh one below.");
          else if (err.code === "inactive") setError("This account is no longer active. Contact Sarah if that's a mistake.");
          else setError("That link isn't valid. Request a fresh one below.");
        } else {
          setError("Couldn't reach the server. Check your connection and try again.");
        }
      });
  }, [params, navigate, setStaff]);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-brand-dark">{error ? "Hmm, that didn't work" : "Logging you in…"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <>
              <p className="text-sm">{error}</p>
              <Button asChild className="w-full">
                <Link to="/staff/login">Request a new link</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">One moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
