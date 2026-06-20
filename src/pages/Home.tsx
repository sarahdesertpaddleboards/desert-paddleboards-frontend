import { Head } from "vite-react-ssg";
import LocationFinder from "@/components/LocationFinder";
import JsonLd from "@/components/JsonLd";
import { localBusinessLd } from "@/lib/jsonld";
import GoogleReviews, { reviewSummary } from "@/components/GoogleReviews";

export default function Home() {
  return (
    <>
      <Head>
        <title>Floating Soundbaths in Arizona | Desert Paddleboards</title>
        <meta
          name="description"
          content="Float weightlessly as live sound washes over you. Find a floating soundbath near you across Phoenix, Mesa, Scottsdale, Tempe and more — and book online."
        />
      </Head>
      <JsonLd data={localBusinessLd()} />
      <LocationFinder />

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
    </>
  );
}
