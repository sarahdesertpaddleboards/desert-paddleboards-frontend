import { useState } from "react";
import { Gift } from "lucide-react";
import { useFareHarborEmbed } from "@/components/FareHarborButton";
import GiftCertificateBanner, { GIFT_CERTIFICATE_URL } from "@/components/GiftCertificateBanner";
import { trackEvent } from "@/lib/analytics";
import { appendUtms } from "@/lib/utm";
import { DELIVERABLE_EMAIL_PATTERN, isDeliverableEmail } from "@/lib/web3forms";

/**
 * Flip to true once all three are live, or the banner promises a $5 code that
 * never arrives:
 *  1. FLODESK_API_KEY secret set on the Cloudflare Pages project
 *  2. a $5-off promo code in FareHarbor
 *  3. the Flodesk welcome workflow (trigger: added to "Website sign-ups")
 *     published with that code in it
 * While false, the plain gift-certificate banner shows instead.
 */
export const EMAIL_SIGNUP_LIVE = true;

type Status = "idle" | "sending" | "done" | "error";

/**
 * Site-wide top bar: email-only sign-up for $5 off (→ /api/subscribe →
 * Flodesk), with the gift-certificate link kept on the right.
 */
export default function EmailSignupBanner() {
  useFareHarborEmbed();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");

  if (!EMAIL_SIGNUP_LIVE) return <GiftCertificateBanner />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isDeliverableEmail(email)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company }),
      });
      if (!res.ok) throw new Error(String(res.status));
      trackEvent("sign_up", { method: "email_banner" });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const trackGift = () =>
    trackEvent("shop_click", { product: "Gift certificate", placement: "top_banner" });

  return (
    <div className="bg-brand px-4 py-2 text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {status === "done" ? (
          <p className="font-medium" role="status">
            You're in. Check your inbox for your $5 code.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-wrap items-center justify-center gap-2" noValidate>
            <label htmlFor="signup-email" className="font-medium">
              Get $5 off your next float
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              pattern={DELIVERABLE_EMAIL_PATTERN}
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              className="h-8 w-48 rounded-full border-0 bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/70 sm:w-56"
            />
            {/* Honeypot: hidden from people, irresistible to bots. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-8 rounded-full bg-white px-4 text-sm font-semibold text-brand-dark transition-colors hover:bg-white/90 disabled:opacity-70"
            >
              {status === "sending" ? "Joining…" : "Get my $5"}
            </button>
            {status === "error" ? (
              <span role="alert" className="text-xs text-white/90">
                Check that email and try again.
              </span>
            ) : null}
          </form>
        )}

        <a
          href={appendUtms(GIFT_CERTIFICATE_URL)}
          onPointerDown={(e) => {
            if (e.button === 0) trackGift();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") trackGift();
          }}
          className="hidden items-center gap-1.5 text-white/90 underline-offset-2 hover:text-white hover:underline md:inline-flex"
        >
          <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
          Gift certificates
        </a>
      </div>
    </div>
  );
}
