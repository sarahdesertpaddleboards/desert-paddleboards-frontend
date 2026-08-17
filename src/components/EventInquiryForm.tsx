import { useId, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { experiences } from "@/data/locations";
import { cityClassVenues } from "@/data/city-classes";
import { submitWeb3Form } from "@/lib/web3forms";
import { trackEvent } from "@/lib/analytics";
import { business } from "@/data/site";

/**
 * Shared lead-capture form for /private-events and /community-events.
 *
 * Analytics contract (GA4):
 *  - `form_start`        — first interaction with any field (abandonment rate)
 *  - `generate_lead`     — successful submit, with event_type, headcount_bucket,
 *                          preferred_venue and page_path
 *  - `lead_contact_click`— the secondary "call us" CTA
 *
 * Delivery is Web3Forms → sarah@, with a mailto: fallback so a lead is never
 * lost if the API call fails.
 */

const EVENT_TYPES = [
  "Corporate",
  "Team Offsite",
  "Community",
  "Nonprofit",
  "Private Party",
] as const;

/** Coarse buckets keep GA4 cardinality low enough to segment on. */
function headcountBucket(raw: string): string {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return "unspecified";
  if (n <= 10) return "1-10";
  if (n <= 25) return "11-25";
  if (n <= 50) return "26-50";
  if (n <= 100) return "51-100";
  return "100+";
}

type Errors = Partial<Record<"name" | "email" | "eventType", string>>;

export default function EventInquiryForm({
  variant = "private",
  className = "",
}: {
  /** "community" retitles the form and defaults the event type. */
  variant?: "private" | "community";
  className?: string;
}) {
  const uid = useId();
  const { pathname } = useLocation();
  const startedRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isCommunity = variant === "community";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    eventType: isCommunity ? "Community" : "Corporate",
    headcount: "",
    date: "",
    venue: "",
    message: "",
  });

  /** Venue options: FareHarbor venues + city-run pools, de-duped and sorted. */
  const venues = useMemo(() => {
    const names = new Set<string>();
    for (const e of experiences) {
      if (e.venue) names.add(`${e.venue} — ${e.city}`);
    }
    for (const c of cityClassVenues) {
      if (c.venue) names.add(`${c.venue} — ${c.city}`);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, []);

  const set = (key: keyof typeof form) => (value: string) => {
    // Fire once, on the visitor's first interaction with any field.
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("form_start", { form: `${variant}-events`, page_path: pathname });
    }
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(): boolean {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!form.email.trim()) next.email = "We need an email to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "That email doesn't look right.";
    if (!form.eventType) next.eventType = "Pick the closest event type.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      // Move focus to the first error for keyboard and screen-reader users.
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setSubmitting(true);

    const subject = `${isCommunity ? "Community" : "Private"} event inquiry — ${
      form.eventType
    }${form.organization ? ` — ${form.organization}` : ""}`;

    const result = await submitWeb3Form({
      subject,
      from_name: "Desert Paddleboards website",
      replyto: form.email,
      name: form.name,
      email: form.email,
      phone: form.phone || "—",
      organization: form.organization || "—",
      event_type: form.eventType,
      estimated_headcount: form.headcount || "—",
      preferred_date: form.date || "—",
      preferred_venue: form.venue || "—",
      message: form.message || "—",
      page: pathname,
    });

    setSubmitting(false);

    if (result.success) {
      trackEvent("generate_lead", {
        form: `${variant}-events`,
        event_type: form.eventType,
        headcount_bucket: headcountBucket(form.headcount),
        preferred_venue: form.venue || "unspecified",
        page_path: pathname,
      });
      toast.success("Thank you! Your inquiry is on its way — we'll reply within 24 hours.");
      setForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
        eventType: isCommunity ? "Community" : "Corporate",
        headcount: "",
        date: "",
        venue: "",
        message: "",
      });
      return;
    }

    // Fallback: hand off to the visitor's mail client so the lead isn't lost.
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "—"}`,
      `Organization: ${form.organization || "—"}`,
      `Event type: ${form.eventType}`,
      `Estimated headcount: ${form.headcount || "—"}`,
      `Preferred date: ${form.date || "—"}`,
      `Preferred venue: ${form.venue || "—"}`,
      "",
      form.message || "—",
    ].join("\n");
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.message("Opening your email app so you can send your inquiry directly…");
  }

  const errCls = "border-destructive focus-visible:ring-destructive";

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7 ${className}`}
    >
      <h2 className="text-2xl font-bold md:text-3xl">
        {isCommunity ? "Request a community event" : "Plan your private event"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us what you have in mind and we&rsquo;ll come back within 24 hours with
        availability and a quote. No obligation.
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
              aria-describedby={errors.name ? `${uid}-name-err` : undefined}
              className={errors.name ? errCls : ""}
              autoComplete="name"
            />
            {errors.name && (
              <p id={`${uid}-name-err`} className="text-sm font-medium text-destructive">
                {errors.name}
              </p>
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
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              className={errors.email ? errCls : ""}
              autoComplete="email"
            />
            {errors.email && (
              <p id={`${uid}-email-err`} className="text-sm font-medium text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${uid}-phone`}>Phone</Label>
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
            <Label htmlFor={`${uid}-org`}>
              {isCommunity ? "Community or HOA" : "Company or organization"}
            </Label>
            <Input
              id={`${uid}-org`}
              value={form.organization}
              onChange={(e) => set("organization")(e.target.value)}
              autoComplete="organization"
            />
          </div>

          {/* Native selects on purpose — they're the best mobile experience,
              and most of this traffic arrives from social on a phone. */}
          <div className="space-y-2">
            <Label htmlFor={`${uid}-type`}>Event type *</Label>
            <select
              id={`${uid}-type`}
              value={form.eventType}
              onChange={(e) => set("eventType")(e.target.value)}
              aria-invalid={Boolean(errors.eventType)}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm ${
                errors.eventType ? errCls : ""
              }`}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.eventType && (
              <p className="text-sm font-medium text-destructive">{errors.eventType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${uid}-headcount`}>Estimated headcount</Label>
            <Input
              id={`${uid}-headcount`}
              type="number"
              inputMode="numeric"
              min={1}
              value={form.headcount}
              onChange={(e) => set("headcount")(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${uid}-date`}>Preferred date</Label>
            <Input
              id={`${uid}-date`}
              type="date"
              value={form.date}
              onChange={(e) => set("date")(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${uid}-venue`}>Preferred venue</Label>
            <select
              id={`${uid}-venue`}
              value={form.venue}
              onChange={(e) => set("venue")(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
            >
              <option value="">No preference / your venue</option>
              {venues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${uid}-message`}>Anything else?</Label>
          <Textarea
            id={`${uid}-message`}
            rows={4}
            value={form.message}
            onChange={(e) => set("message")(e.target.value)}
            placeholder={
              isCommunity
                ? "Tell us about your community — residents, pool setup, dates you have in mind."
                : "Tell us about your group, the occasion and what you're hoping for."
            }
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" disabled={submitting} className="sm:flex-1">
            {submitting ? "Sending…" : "Send my inquiry"}
          </Button>
          <a
            href={`tel:${business.telephone}`}
            onClick={() =>
              trackEvent("lead_contact_click", {
                method: "phone",
                form: `${variant}-events`,
                page_path: pathname,
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Phone className="h-4 w-4" />
            Or call 602.456.0884
          </a>
        </div>
      </form>
    </div>
  );
}
