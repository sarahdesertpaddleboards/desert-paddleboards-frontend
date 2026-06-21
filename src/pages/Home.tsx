import LocationFinder from "@/components/LocationFinder";
import JsonLd from "@/components/JsonLd";
import Seo from "@/components/Seo";
import { localBusinessLd } from "@/lib/jsonld";
import GoogleReviews, { reviewSummary } from "@/components/GoogleReviews";
import SessionCalendar from "@/components/SessionCalendar";
import VideoSection from "@/components/VideoSection";

export default function Home() {
  return (
    <>
      <Seo
        title="Floating Soundbaths in Arizona | Desert Paddleboards"
        description="Float weightlessly as live sound washes over you. Find a floating soundbath near you across Phoenix, Mesa, Scottsdale, Tempe and more — and book online."
        image="/floating-soundbath-evening.jpg"
      />
      <JsonLd data={localBusinessLd()} />
      <LocationFinder />

      {/* Visual session calendar (FareHarbor + city classes merged) */}
      <SessionCalendar
        heading="Find a session by date"
        showAllHref="/calendar"
        className="py-12"
      />

      {/* Social proof / legitimacy band — real Google rating */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <p className="text-lg tracking-[0.2em] text-secondary">
            ★★★★★{" "}
            <span className="align-middle text-base font-semibold text-foreground">
              {reviewSummary().rating.toFixed(1)} from {reviewSummary().count} Google reviews
            </span>
          </p>
          <p className="mt-2 text-lg font-medium">
            Loved by communities, resorts and first-timers across Arizona
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Featured in Phoenix Magazine &amp; local news
          </p>
        </div>
      </section>

      {/* Google reviews — real text, baked in at build time */}
      <GoogleReviews max={3} heading="Loved across Arizona" />

      {/* Videos — click-to-play YouTube facade */}
      <VideoSection heading="See it in action" className="py-16" />
    </>
  );
}
