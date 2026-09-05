import { useState } from "react";
import { toast } from "sonner";
import { Heart, Shirt, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitWeb3Form } from "@/lib/web3forms";
import { trackEvent } from "@/lib/analytics";
import { business } from "@/data/site";

/**
 * "Volunteer & Cheer Us On" block for the Witches Regatta event page.
 *
 * Two paths, per Sarah's plan:
 *  1. Free spectator/volunteer RSVP (+ optional $30 shirt add-on) — handled on
 *     FareHarbor as a $0 item. Set VOLUNTEER_RSVP_URL to that item's booking
 *     link once it exists; until then the RSVP card shows an "opening soon" note.
 *  2. Volunteer roles/shifts — this on-page form, delivered to Sarah's inbox
 *     via Web3Forms (same path as the contact form).
 */
const VOLUNTEER_RSVP_URL = ""; // ← paste the $0 FareHarbor RSVP link here to activate

export default function VolunteerSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    message: "",
  });
  const [roles, setRoles] = useState({ checkin: false, wherever: false });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const rolePick = [
      roles.checkin ? "Check-in & registration table" : "",
      roles.wherever ? "Wherever you need me" : "",
    ]
      .filter(Boolean)
      .join(", ");

    const result = await submitWeb3Form({
      subject: "Witches Regatta — Volunteer signup",
      from_name: "Desert Paddleboards website",
      replyto: form.email,
      name: form.name,
      email: form.email,
      phone: form.phone || "—",
      inquiry_about: "Witches Regatta volunteer",
      roles: rolePick || "Not specified",
      availability: form.availability || "—",
      message: form.message || "—",
    });

    setSubmitting(false);

    if (result.success) {
      trackEvent("generate_lead", { form: "witches_volunteer" });
      toast.success(
        "Thank you for volunteering! We'll be in touch with details before the event.",
      );
      setForm({ name: "", email: "", phone: "", availability: "", message: "" });
      setRoles({ checkin: false, wherever: false });
      return;
    }

    // Fallback: open the visitor's mail client with everything pre-filled.
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "—"}`,
      `Role: ${rolePick || "—"}`,
      `Availability: ${form.availability || "—"}`,
      "",
      form.message || "—",
    ].join("\n");
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(
      "Witches Regatta — Volunteer signup",
    )}&body=${encodeURIComponent(body)}`;
    toast.message("Opening your email app so you can send your details directly…");
  };

  return (
    <section
      id="volunteer"
      className="space-y-5 rounded-2xl border border-border bg-accent/10 p-6"
    >
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-bold">Volunteer &amp; Cheer Us On</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        You don&apos;t have to paddle to be part of the Regatta. Come cheer from the
        shore, lend a hand at the event, and grab a shirt — the more of the
        community, the merrier.
      </p>

      {/* Path 1 — free RSVP + shirt (FareHarbor $0 item) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Shirt className="h-5 w-5 text-brand" />
          <h3 className="font-bold">Just here to watch?</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          RSVP free so we know you&apos;re coming — and add a $30 event shirt to pick
          up on the day.
        </p>
        {VOLUNTEER_RSVP_URL ? (
          <a
            href={VOLUNTEER_RSVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("shop_click", { product: "Witches Regatta RSVP" })}
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            RSVP free (and grab a shirt)
          </a>
        ) : (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Free RSVP + shirt sign-up opening soon — check back shortly.
          </p>
        )}
      </div>

      {/* Path 2 — volunteer roles/shifts (Web3Forms) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-bold">Want to lend a hand?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us how you&apos;d like to help and we&apos;ll follow up with the details.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="vol-name">Name</Label>
              <Input id="vol-name" required value={form.name} onChange={set("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vol-email">Email</Label>
              <Input
                id="vol-email"
                type="email"
                required
                value={form.email}
                onChange={set("email")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vol-phone">Phone (optional)</Label>
            <Input id="vol-phone" type="tel" value={form.phone} onChange={set("phone")} />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">How would you like to help?</legend>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-primary"
                checked={roles.checkin}
                onChange={(e) => setRoles((r) => ({ ...r, checkin: e.target.checked }))}
              />
              <span>Check-in &amp; registration table</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-primary"
                checked={roles.wherever}
                onChange={(e) => setRoles((r) => ({ ...r, wherever: e.target.checked }))}
              />
              <span>Wherever you need me</span>
            </label>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="vol-availability">
              When can you help? (setup, during the event, teardown)
            </Label>
            <Input
              id="vol-availability"
              value={form.availability}
              onChange={set("availability")}
              placeholder="e.g. can arrive early to set up and stay to pack down"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vol-message">Anything else?</Label>
            <Textarea id="vol-message" rows={3} value={form.message} onChange={set("message")} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Sending…" : "Sign up to volunteer"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
            Goes straight to Sarah — no account needed.
          </p>
        </form>
      </div>
    </section>
  );
}
