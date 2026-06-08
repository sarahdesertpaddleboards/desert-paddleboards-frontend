import { Head } from "vite-react-ssg";
import LocationFinder from "@/components/LocationFinder";
import JsonLd from "@/components/JsonLd";
import { localBusinessLd } from "@/lib/jsonld";

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

      {/* Social proof / legitimacy band */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <div className="text-lg tracking-[0.3em] text-secondary">★★★★★</div>
          <p className="mt-2 text-lg font-medium">
            Loved by communities, resorts and first-timers across Arizona
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Featured in Phoenix Magazine &amp; local news
          </p>
        </div>
      </section>
    </>
  );
}
