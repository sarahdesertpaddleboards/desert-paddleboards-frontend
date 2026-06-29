import { Instagram, Facebook } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/** TikTok has no lucide icon — reuse the same inline mark as the footer. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const SECONDARY =
  "inline-flex items-center gap-2.5 rounded-full bg-white/10 px-6 py-3 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/20";

/**
 * Prominent "follow us" band for the homepage. Leads with Instagram (the main
 * traffic driver) and surfaces TikTok + Facebook too. A live Instagram feed can
 * later slot in right below this once a feed tool is chosen.
 */
export default function SocialFollow({ className = "" }: { className?: string }) {
  return (
    <section
      className={`bg-gradient-to-br from-brand to-brand-dark text-white ${className}`}
    >
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Join the community
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold md:text-4xl">
          Follow the floating soundbath journey
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-balance text-white/90">
          Sunsets, live music on the water, behind-the-scenes and the latest
          events — follow along and tag us{" "}
          <span className="font-semibold">@desertpaddleboards</span>.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="https://www.instagram.com/desertpaddleboards/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "instagram" })}
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-base font-bold text-brand-dark shadow-sm transition-transform hover:scale-[1.03]"
          >
            <Instagram className="h-5 w-5" />
            Follow on Instagram
          </a>
          <a
            href="https://www.tiktok.com/@desertpaddleboards"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "tiktok" })}
            className={SECONDARY}
          >
            <TikTokIcon className="h-5 w-5" />
            TikTok
          </a>
          <a
            href="https://www.facebook.com/desertpaddleboards"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "facebook" })}
            className={SECONDARY}
          >
            <Facebook className="h-5 w-5" />
            Facebook
          </a>
        </div>
      </div>
    </section>
  );
}
