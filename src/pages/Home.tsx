import { Link } from "react-router-dom";
import LocationFinder from "@/components/LocationFinder";
import JsonLd from "@/components/JsonLd";
import Seo from "@/components/Seo";
import { localBusinessLd } from "@/lib/jsonld";
import GoogleReviews, { reviewSummary } from "@/components/GoogleReviews";
import SessionCalendar from "@/components/SessionCalendar";
import FeaturedEvent from "@/components/FeaturedEvent";
import VideoSection from "@/components/VideoSection";
import InstagramFeed from "@/components/InstagramFeed";
import SocialFollow from "@/components/SocialFollow";

export default function Home() {
  return (
    <>
      <Seo
        title="Floating Soundbaths in Arizona | Desert Paddleboards"
        description="Float weightlessly as live sound washes over you. Find a floating soundbath near you across Phoenix, Mesa, Scottsdale, Tempe and more — and book online."
        image="/floating-soundbath-sunset-hero.jpg"
      />
      <JsonLd data={localBusinessLd()} />
      {/* Calendar sits above the map/list finder (date-first entry point) */}
      <LocationFinder
        afterHero={
          <SessionCalendar
            heading="Find a session by date"
            showAllHref="/calendar"
            className="py-12"
          />
        }
      />

      {/* Featured event highlight (e.g. the Witches Regatta) — surfaced even
          when it's months out, so it isn't buried in the date-sorted list. */}
      <FeaturedEvent className="py-12" />

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

      {/* Greenland expedition promo banner — flagship trip, top priority */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/20">
        <Link
          to="/adventures"
          className="group mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 md:flex-row"
        >
          <img
            src="/images/adventures/greenland.jpg"
            alt="Two travelers on a Greenland small-group expedition"
            loading="lazy"
            className="h-56 w-full rounded-2xl object-cover object-top shadow-sm md:h-64 md:w-80"
          />
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Featured expedition · limited to 12
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Greenland & Arctic Iceland — August 2027
            </h2>
            <p className="mt-2 text-muted-foreground">
              A 14-day small-group journey through icebergs, fjords and hot springs.
              Kayak past glaciers, soak among floating ice, and share a Kaffemik with a
              local family. Spots are limited — reserve early.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
              Explore the Greenland expedition →
            </span>
          </div>
        </Link>
      </section>

      {/* Custom Boards promo banner — drives interest in branded/custom boards */}
      <section className="border-t border-border">
        <Link
          to="/custom-boards"
          className="group mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 sm:flex-row"
        >
          <img
            src="/custom-boards/branded-board-dogtopia.jpg"
            alt="A custom-branded paddleboard with a logo printed edge-to-edge"
            loading="lazy"
            className="h-40 w-40 flex-shrink-0 rounded-2xl object-cover shadow-sm"
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Custom Boards
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Put your own logo on the water
            </h2>
            <p className="mt-2 text-muted-foreground">
              We design and produce fully branded paddleboards for businesses,
              studios and resorts — a single board or a whole fleet, delivered to
              your door.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
              Brand your board →
            </span>
          </div>
        </Link>
      </section>

      {/* Videos — click-to-play YouTube facade */}
      <VideoSection heading="See it in action" className="py-16" />

      {/* Live Instagram feed (SnapWidget) — recent posts, then the follow CTA. */}
      <InstagramFeed className="py-16" />

      {/* Follow us — prominent social band (Instagram-led). */}
      <SocialFollow />
    </>
  );
}
