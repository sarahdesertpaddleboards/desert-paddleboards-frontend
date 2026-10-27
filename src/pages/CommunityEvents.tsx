import { Link } from "react-router-dom";
import { CheckCircle2, Ghost, Gift, Waves } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import FeaturedEvent from "@/components/FeaturedEvent";
import SocialFollow from "@/components/SocialFollow";
import { breadcrumbLd, graph } from "@/lib/jsonld";

/**
 * /community-events — public, show-up-and-join events for anyone who found us
 * on social: the Witches Regatta, the Santa Paddle, city pool soundbaths.
 *
 * Not to be confused with /community-partners, the unlinked pitch to HOAs and
 * 55+ communities that book a private soundbath for their residents.
 */

const heroImage = "/images/blog/witches-regatta-on-water.jpg";

const traditions = [
  {
    icon: Ghost,
    when: "Every October · Tempe Town Lake",
    title: "Witches Regatta",
    body: "Hundreds of paddlers in pointy hats floating Tempe Town Lake at sunset. Free to join since 2017. Bring a board or rent one from us.",
    href: "/witches-regatta",
    cta: "2026 photos & video",
  },
  {
    icon: Gift,
    when: "Next up · Sat Dec 12, 10am · Tempe Town Lake",
    title: "Santa Paddle",
    body: "Santas, elves, reindeer and dogs in antlers on paddleboards and kayaks. Free, not a race. Pure holiday chaos on the lake.",
    href: "/santa-paddle",
    cta: "RSVP for the Santa Paddle",
  },
  {
    icon: Waves,
    when: "Year-round · city pools",
    title: "Soundbaths at your city pool",
    body: "Floating soundbaths run with local Parks & Recreation departments, booked straight through your city.",
    href: "/calendar",
    cta: "Find a date near you",
  },
];

/** Private group trip, moved here from the retired /adventures page. */
const blackCanyonIncludes = [
  "Clear or inflatable paddleboard, leash, PFD & paddle",
  "Dinner and a fun host",
  "Campsite (sleep in your vehicle, bring a tent, or sleep under the stars on a cot)",
  "Shuttle back to camp after the float",
];

export default function CommunityEvents() {
  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Community Events", path: "/community-events" },
    ]),
  ]);

  return (
    <main>
      <Seo
        title="Community Paddle Events in Phoenix | Witches Regatta"
        description="Community paddle events across Arizona: the Witches Regatta on Tempe Town Lake, the Santa Paddle, city pool soundbaths and private Black Canyon group trips."
        image={heroImage}
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <div className="relative h-[44vh] min-h-[340px] w-full overflow-hidden bg-muted">
        <img
          src={heroImage}
          alt="Paddlers in witch costumes on paddleboards on Tempe Town Lake"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/55" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              Open to everyone · costumes encouraged
            </p>
            <h1 className="mt-2 max-w-3xl text-balance text-4xl italic leading-tight md:text-5xl">
              Community events on the water
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/90">
              The Witches Regatta, the Santa Paddle, private Black Canyon trips
              and the rest of our get-togethers. Show up, get on a board, meet
              your people.
            </p>
          </div>
        </div>
      </div>

      {/* Next dated events (Witches Regatta etc.) — renders nothing if none are upcoming */}
      <FeaturedEvent className="py-12" />

      <div className="container space-y-16 py-14">
        {/* Annual traditions */}
        <section className="space-y-8">
          <h2 className="text-3xl italic">Our traditions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {traditions.map((t) => (
              <Link
                key={t.title}
                to={t.href}
                className="group flex flex-col space-y-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <t.icon className="h-7 w-7 text-brand" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t.when}
                </p>
                <h3 className="text-lg font-semibold not-italic">{t.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t.body}
                </p>
                <span className="text-sm font-semibold text-primary group-hover:underline">
                  {t.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Black Canyon — private group trip on the Colorado River */}
        <section
          id="black-canyon"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card md:grid md:grid-cols-2"
        >
          <img
            src="/images/adventures/black-canyon.jpg"
            alt="Clear-water paddleboarding through the Colorado River's Black Canyon"
            loading="lazy"
            className="h-64 w-full object-cover md:h-full"
          />
          <div className="space-y-4 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Private group trip · up to 12
            </p>
            <h2 className="text-2xl font-bold md:text-3xl">
              Black Canyon on the Colorado River
            </h2>
            <p className="text-muted-foreground">
              Bring your crew and we'll build the trip around you. Start at the
              base of the Hoover Dam and paddle about 12 miles through Black
              Canyon, with walls up to 2,000 feet: turquoise water, hidden coves,
              hot springs, bighorn sheep and herons. Beginner-friendly, and you
              can always turn around if you're tired.
            </p>
            <ul className="space-y-2">
              {blackCanyonIncludes.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact?subject=Private%20Black%20Canyon%20trip"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Pick a date for your group
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-brand/10 p-8 text-center">
          <h2 className="text-2xl italic">Read the Witches Regatta story</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            How a handful of us in witch hats on an urban lake turned into one of
            Arizona's most unusual Halloween traditions.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/blog/witches-regatta"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Read the story
            </Link>
            <Link
              to="/witches-regatta"
              className="inline-flex items-center justify-center rounded-full border border-brand-dark px-7 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-dark/5"
            >
              2026 photos &amp; video
            </Link>
          </div>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          Want a floating soundbath just for your group?{" "}
          <Link to="/private-events" className="font-medium text-primary hover:underline">
            Plan a private event →
          </Link>
        </p>
      </div>

      {/* New dates are announced on Instagram first */}
      <SocialFollow />
    </main>
  );
}
