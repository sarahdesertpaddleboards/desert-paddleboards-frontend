import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitWeb3Form } from "@/lib/web3forms";
import { trackEvent } from "@/lib/analytics";
import { business } from "@/data/site";

/**
 * Free registration for the Witches Regatta.
 *
 * Deliberately NOT a FareHarbor link: press coverage and the blog post point
 * here, so the event has one canonical, on-site place to sign up. That keeps
 * the audience (and the email list) with us rather than handing it to a booking
 * widget, and gives a defensible attendance number to quote to press and
 * tourism boards.
 *
 * Board rentals still go through FareHarbor — that's a paid product and belongs
 * in the booking flow.
 */
export default function RegattaRegistration({ className = "" }: { className?: string }) {
  const uid = useId();
  const startedRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    paddlers: "",
    board: "own",
  });

  const set = (k: keyof typeof form) => (v: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("form_start", { form: "witches_registration", page_path: "/locations/witches-regatta-tempe-town-lake" });
    }
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!form.email.trim()) next.email = "We need an email to send updates.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "That email doesn't look right.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    const result = await submitWeb3Form({
      subject: `Witches Regatta 2026 registration — ${form.name}`,
      from_name: "Desert Paddleboards website",
      replyto: form.email,
      name: form.name,
      email: form.email,
      phone: form.phone || "—",
      paddlers: form.paddlers || "1",
      board: form.board === "rental" ? "Needs a rental" : "Bringing their own",
      event: "Witches Regatta — Sat Oct 24, 2026",
    });
    setSubmitting(false);

    if (result.success) {
      trackEvent("generate_lead", {
        form: "witches_registration",
        event_type: "Witches Regatta",
        headcount_bucket: form.paddlers || "1",
        page_path: "/locations/witches-regatta-tempe-town-lake",
      });
      setDone(true);
      return;
    }

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "—"}`,
      `Paddlers: ${form.paddlers || "1"}`,
      `Board: ${form.board === "rental" ? "Needs a rental" : "Bringing their own"}`,
    ].join("\n");
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(
      "Witches Regatta 2026 registration",
    )}&body=${encodeURIComponent(body)}`;
    toast.message("Opening your email app so you can send your registration…");
  }

  if (done) {
    return (
      <section id="register" className={`scroll-mt-24 ${className}`}>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">You&rsquo;re on the list</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            See you Saturday, October 24 at 10:00 AM at the Tempe Town Lake Marina.
            We&rsquo;ll email you if the weather moves anything. Don&rsquo;t forget your
            $10 City boat permit and a life jacket — and go hard on the costume.
          </p>
        </div>
      </section>
    );
  }

  const errCls = "border-destructive focus-visible:ring-destructive";

  return (
    <section id="register" className={`scroll-mt-24 ${className}`}>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Register free</h2>
            <p className="text-sm text-muted-foreground">
              Saturday, October 24, 2026 · 10:00 AM · Tempe Town Lake Marina
            </p>
          </div>
        </div>

        <p className="mt-4 text-muted-foreground">
          Registration is free and takes a minute. It helps us plan, and it&rsquo;s the
          only way we can tell you if the weather moves anything.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${uid}-name`}>Your name *</Label>
              <Input
                id={`${uid}-name`}
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                className={errors.name ? errCls : ""}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-sm font-medium text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uid}-email`}>Email *</Label>
              <Input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                className={errors.email ? errCls : ""}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uid}-phone`}>Phone (optional)</Label>
              <Input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uid}-paddlers`}>How many paddlers?</Label>
              <Input
                id={`${uid}-paddlers`}
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="1"
                value={form.paddlers}
                onChange={(e) => set("paddlers")(e.target.value)}
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Board</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              {[
                ["own", "I'm bringing my own"],
                ["rental", "I'd like to rent one"],
              ].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`${uid}-board`}
                    value={value}
                    checked={form.board === value}
                    onChange={() => set("board")(value)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  {label}
                </label>
              ))}
            </div>
            {form.board === "rental" && (
              <p className="text-sm text-muted-foreground">
                Great — we&rsquo;ll follow up with rental details so your board is waiting
                at the marina.
              </p>
            )}
          </fieldset>

          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Registering…" : "Register for the Regatta"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Free to join. Every watercraft on Tempe Town Lake needs a City boat permit
            ($10 day pass) and a Coast Guard-approved life jacket — both are the
            City&rsquo;s rules, not ours.
          </p>
        </form>
      </div>
    </section>
  );
}
