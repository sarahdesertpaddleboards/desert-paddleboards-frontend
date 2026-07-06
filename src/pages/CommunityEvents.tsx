import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Briefcase,
  Music2,
  ShieldCheck,
  Clock,
  Waves,
  CheckCircle2,
} from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

const heroImage = "https://cdn.filestackcontent.com/qJlOZtLS8b3MwCH5Wjtg";

const perfectFor = [
  {
    icon: Building2,
    title: "HOAs & residential communities",
    body: "A standout amenity day at your community pool. Most events sell out the day they're posted.",
  },
  {
    icon: Users,
    title: "55+ & senior living",
    body: "Beautiful pools and clubhouses, residents who love something new to do — and it's suitable for all ages and fitness levels.",
  },
  {
    icon: Briefcase,
    title: "Corporate wellness & member appreciation",
    body: "Gyms, resorts and workplaces use a floating soundbath as an unforgettable member-appreciation or team-wellness event.",
  },
];

const included = [
  "Two live musicians — a meditative concert, not a recording",
  "Floating boards for everyone, set up and ready",
  "Lavender eye masks",
  "In-water assistants helping guests on and off the boards",
  "Full setup and teardown — we handle everything",
];

const comfort = [
  "Stay completely dry if you prefer — you don't have to get wet",
  "Non-swimmers are welcome and safe",
  "Poolside lounger options for anyone who'd rather not float",
  "Assistants are in the water at all times",
  "Suitable for all ages and fitness levels",
];

export default function CommunityEvents() {
  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Community Events", path: "/community-events" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Community & Senior-Living Floating Soundbath Events",
      serviceType: "Community wellness event",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "Turnkey floating soundbath events for HOAs, 55+ senior communities, corporate wellness and member-appreciation days across Arizona.",
    },
  ]);

  return (
    <main>
      <Seo
        title="Floating Soundbath Events for HOAs &amp; 55+ Communities"
        description="Turnkey floating soundbath events for HOAs, 55+ communities and corporate wellness across Arizona. We bring the boards, musicians and team — you pick the date."
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <div className="relative h-[44vh] min-h-[340px] w-full overflow-hidden bg-muted">
        <img
          src={heroImage}
          alt="Community floating soundbath event at a pool in Arizona"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/55" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              For HOAs · 55+ communities · workplaces
            </p>
            <h1 className="mt-2 max-w-3xl text-balance text-4xl italic leading-tight md:text-5xl">
              Bring the floating soundbath to your community
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/90">
              We bring the boards, the live musicians and the whole team. You
              just pick a date — we handle the rest.
            </p>
          </div>
        </div>
      </div>

      <div className="container space-y-16 py-14">
        {/* Intro */}
        <section className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Community events
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Community events are what we do best—bringing neighbors together for
            unforgettable evenings of floating, live music, and relaxation. It's
            an experience that sparks new friendships and creates the kind of
            community people are proud to call home.
          </p>
        </section>

        {/* Perfect for */}
        <section className="space-y-8">
          <h2 className="text-3xl italic">Perfect for</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {perfectFor.map((item) => (
              <div
                key={item.title}
                className="space-y-3 rounded-2xl border border-border bg-card p-6"
              >
                <item.icon className="h-7 w-7 text-brand" />
                <h3 className="text-lg font-semibold not-italic">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What's included + comfort */}
        <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Music2 className="h-6 w-6 text-brand" />
              <h2 className="text-2xl italic">What's included</h2>
            </div>
            <ul className="space-y-3">
              {included.map((line) => (
                <li key={line} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-brand" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-brand" />
              <h2 className="text-2xl italic">Comfortable for everyone</h2>
            </div>
            <ul className="space-y-3">
              {comfort.map((line) => (
                <li key={line} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-brand" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-8">
          <h2 className="text-3xl italic">How it works</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl bg-brand/10 p-6">
              <Clock className="h-7 w-7 text-brand" />
              <h3 className="text-lg font-semibold not-italic">
                One hour, fully run
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A one-hour experience. We need about 45 minutes to set up and 30
                to clean up — your team doesn't lift a finger.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-brand/10 p-6">
              <Waves className="h-7 w-7 text-brand" />
              <h3 className="text-lg font-semibold not-italic">
                Simple flat rate
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                One flat rate covers everything — no ticket sales or marketing to
                worry about. We'll send a custom quote for your pool and group
                size.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-brand/10 p-6">
              <Users className="h-7 w-7 text-brand" />
              <h3 className="text-lg font-semibold not-italic">
                Your call on tickets
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Offer it free to residents, add a small ticket price to raise
                funds, or let us set up a private registration link so guests
                sign up directly.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-dark px-8 py-10 text-center text-white">
          <h2 className="text-3xl italic">Request your community's date</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Tell us about your community and pool, and we'll come back with a
            custom quote — usually within 24 hours.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact?subject=Community%20event"
              className="inline-flex items-center justify-center rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Email us about your community
            </Link>
            <a
              href="tel:6024560884"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Or call 602.456.0884
            </a>
          </div>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          Looking for something more active for your group?{" "}
          <Link to="/adventures" className="font-medium text-primary hover:underline">
            Explore our guided paddleboard adventures →
          </Link>
        </p>
      </div>
    </main>
  );
}
