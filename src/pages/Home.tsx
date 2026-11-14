import { Link } from "react-router-dom";
import LocationFinder from "@/components/LocationFinder";
import JsonLd from "@/components/JsonLd";
import Seo from "@/components/Seo";
import { faqPageLd, graph } from "@/lib/jsonld";
import { HOME_FAQ } from "@/data/sound-bath-faq";
import GoogleReviews, { reviewSummary } from "@/components/GoogleReviews";
import SessionCalendar from "@/components/SessionCalendar";
import FeaturedEvent from "@/components/FeaturedEvent";
import VideoSection from "@/components/VideoSection";
import InstagramFeed from "@/components/InstagramFeed";
import SocialFollow from "@/components/SocialFollow";

/** Main-city links from the intro — descriptive anchors, not "learn more". */
const CITY_LINKS = [
  { to: "/locations/floating-soundbath-at-westin-kierland-resort-spa-scottsdale", label: "floating sound bath in Scottsdale" },
  { to: "/locations/floating-soundbath-jw-marriott-desert-ridge-phoenix", label: "floating sound bath in Phoenix" },
  { to: "/locations/sunset-floating-soundbath-skyline-pool-mesa", label: "floating sound bath in Mesa" },
  { to: "/locations/rooftop-floating-soundbath-skysill-westin-tempe", label: "rooftop floating sound bath in Tempe" },
  { to: "/locations/floating-soundbath-aji-spa-sheraton-grand-chandler", label: "floating sound bath in Chandler" },
  { to: "/locations/floating-soundbath-doubletree-gilbert", label: "floating sound bath in Gilbert" },
];

export default function Home() {
  return (
    <>
      <Seo
        title="Floating Sound Bath in Phoenix & Scottsdale | Desert Paddleboards"
        description="Arizona's original floating sound bath. Float on the water while live musicians play at resort and rooftop pools in Phoenix, Scottsdale, Mesa and Tempe."
        image="/marriott-night-soundbath.jpg"
      />
      <JsonLd data={graph([faqPageLd(HOME_FAQ)])} />
      {/* Booking first: hero search → calendar → map/list finder. The
          explainer copy for search engines sits further down the page. */}
      <LocationFinder
        afterHero={
          <div id="upcoming" className="scroll-mt-20">
            <SessionCalendar
              heading="Find a session by date"
              showAllHref="/calendar"
              className="py-12"
            />
          </div>
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

      {/* What is it? — short explainer + links to the main city pages */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            What is a floating sound bath?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A sound bath is a deep-rest meditation where live instruments
            (crystal singing bowls, gongs, chimes, flutes) wash over you. A
            floating sound bath does all of that on the water: you lie back on
            a floating water bed (okay, it&apos;s a paddleboard, but we&apos;re
            sticking with water bed) while the sound healing gently rocks you
            into The Floating Nap™. It&apos;s a community night of relaxing
            together, with a touch of resort luxury, created by founder Sarah
            Williams after 25+ years in fitness and wellness.
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Find yours
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {CITY_LINKS.map((c) => (
              <li key={c.to}>
                <Link
                  to={c.to}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Classes run year-round and new dates are added all the time.{" "}
            <Link to="/locations" className="font-medium text-primary hover:underline">
              See every floating sound bath location
            </Link>
          </p>
        </div>
      </section>

      {/* Quick FAQ (also emitted as FAQPage JSON-LD above); full list on /faq */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            Floating sound bath questions, answered
          </h2>
          <dl className="mt-8 space-y-6">
            {HOME_FAQ.map((f) => (
              <div key={f.question}>
                <dt className="text-lg font-semibold">{f.question}</dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">{f.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-center">
            <Link to="/faq" className="font-semibold text-primary hover:underline">
              More floating sound bath FAQs: what to wear, chilly nights and more →
            </Link>
          </p>
        </div>
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
