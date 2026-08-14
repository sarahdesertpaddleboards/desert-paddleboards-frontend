import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, Mic, Mountain, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

/**
 * /coaching — business coaching for wellness professionals (instructors, studio
 * owners, wellness entrepreneurs) + motivational speaking with Sarah Williams.
 * Repositioned Aug 2026 from "Adventure Life Coaching"; adventure/life coaching
 * is kept as a secondary offer. Still the redirect target for the old GoDaddy
 * /adventure-life-coaching page.
 */
export default function Coaching() {
  /**
   * Packages are quote-led for now: the previous $75–$750 session bundles were
   * life-coaching rates that undercut this positioning, and Sarah hasn't set
   * the new numbers yet. Add a `price` to any tier to show it on the card.
   */
  const packages: {
    name: string;
    price?: string;
    note?: string;
    detail: string;
    featured?: boolean;
  }[] = [
    {
      name: "Strategy Session",
      detail:
        "One 60-minute deep dive into your business. Leave with a clear plan for your signature experience and the first three moves to make.",
    },
    {
      name: "Launch",
      note: "Most popular",
      detail:
        "Six sessions over three months. We design your signature experience, price and package it, and get it in front of real customers.",
      featured: true,
    },
    {
      name: "Scale",
      detail:
        "Twelve sessions over six months. Venue partnerships, corporate contracts and the systems to run it without you in every class.",
    },
  ];

  const workOn = [
    "Design your signature experience — the offering with your name on it",
    "Land venue partnerships: how to approach resorts, hotels and community pools, and what they actually want",
    "Break into corporate wellness, where the higher-value contracts live",
    "Price and package your work so you're not underselling it",
    "Fill it — the marketing that actually works for experience-based businesses",
  ];

  const whoFor = [
    "Instructors ready to go independent — yoga, Pilates, fitness, sound healing",
    "Studio and gym owners who want a signature offering competitors can't copy",
    "Wellness entrepreneurs chasing their first venue or corporate partnership",
    "Anyone who's bought boards from us and wants the playbook that goes with them",
  ];

  const credentials = [
    "Built Desert Paddleboards from one instructor to 21+ Arizona venues since 2011",
    "Resort and hotel partnerships — JW Marriott, Westin, Sheraton, Grand Hyatt",
    "Corporate clients including Lifetime Fitness and Optima",
    "Designed and manufacture our own branded board line, sold to businesses nationwide",
    "20+ years in the fitness industry",
    "Registered Yoga Teacher & certified Pilates instructor",
    "CrossFit & CrossFit Kids trainer, USA Weightlifting Coach",
    "Level 2 Parkour coach (World Freerunning & Parkour Federation)",
    "Featured on American Ninja Warrior & an Emmy-winning season of The Amazing Race",
    "Phoenix Magazine cover feature",
  ];

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Coaching", path: "/coaching" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Business Coaching for Wellness Professionals",
      serviceType: "Business coaching",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "Business coaching for instructors, studio owners and wellness entrepreneurs — design a signature experience, land venue partnerships and win corporate wellness contracts.",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        description: "Coaching packages quoted on a strategy call",
      },
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Business Coaching for Wellness Pros | Sarah Williams"
        description="Coaching for instructors, studio owners and wellness entrepreneurs — design a signature experience, land venue partnerships and win corporate wellness contracts."
        image="/about-sarah-class.webp"
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/35 z-10" />
        <img
          src="/about-sarah-class.webp"
          alt="Sarah Williams leading a floating soundbath class on the water"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="relative z-20 container text-center text-white">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
            For wellness pros, studio owners &amp; instructors
          </p>
          <h1 className="text-balance text-4xl md:text-6xl font-bold mb-4">
            Turn what you teach into a business
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            You&rsquo;re great at what you teach. Building a business around it is a different skill entirely.
          </p>
        </div>
      </section>

      {/* The gap */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-6">
            <Compass className="h-8 w-8" />
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            The gap nobody trains you for
          </h2>
          <p className="text-lg text-muted-foreground">
            Your certifications taught you to teach. They didn&rsquo;t teach you how to land a resort
            partnership, price a corporate contract, or build something people seek out by name. That&rsquo;s
            the gap — and it&rsquo;s why so many talented instructors stay stuck teaching someone else&rsquo;s
            schedule, in someone else&rsquo;s space.
          </p>
          <p className="mt-5 text-lg text-muted-foreground">
            I built Desert Paddleboards from one instructor into floating soundbaths at 21+ Arizona venues,
            resort partnerships, corporate contracts and our own board manufacturing. I&rsquo;ll show you how
            to build your own signature experience.
          </p>
        </div>
      </section>

      {/* Who it's for + what we work on */}
      <section className="container pb-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="mb-5 text-2xl font-bold">Who this is for</h2>
            <ul className="space-y-3">
              {whoFor.map((w) => (
                <li key={w} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-2xl font-bold">What we work on</h2>
            <ul className="space-y-3">
              {workOn.map((w) => (
                <li key={w} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ways to work together</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every business starts in a different place. We&rsquo;ll talk through where yours is and pick the
              right fit — pricing is quoted on our first call.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={pkg.featured ? "border-primary shadow-md relative" : ""}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <CardContent className="pt-8 pb-6 text-center flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                  {pkg.price && (
                    <div className="text-3xl font-bold text-primary mb-1">{pkg.price}</div>
                  )}
                  {pkg.note && (
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary/80 mb-3">
                      {pkg.note}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{pkg.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link to="/contact?subject=Business%20coaching%20strategy%20call">
                Book a strategy call
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Motivational Speaking + bio */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <Mic className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Motivational Speaking</h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Looking for an inspirational and entertaining speaker to energize your team, ignite their
              passion, and help them reach their full potential? Sarah Williams is the owner, instructor and
              adventure guide at Desert Paddleboards and AZ Goat Yoga, with a passion for helping others push
              their boundaries and try new things.
            </p>
            <p>
              With a background in synchronized swimming and a love for open water, Sarah has taken on
              challenges like swimming around Alcatraz Island and the Hudson River 10K in New York City. As a
              motivational speaker she shares her experiences and insights to help audiences break free from
              their comfort zones, embrace new challenges and achieve their goals.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((c) => (
              <div key={c} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link to="/contact?subject=Motivational%20speaking">
                Book Sarah to speak
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="tel:6024560884">Or call 602.456.0884</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Cross-link */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <Mountain className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Looking for adventure life coaching?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Still offered — one-on-one work on confidence and getting outside your comfort zone. And Sarah's
            guided paddleboard adventures and retreats are the perfect place to put it into practice.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact?subject=Adventure%20life%20coaching">
                Ask about life coaching
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/adventures">Explore our adventures</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
