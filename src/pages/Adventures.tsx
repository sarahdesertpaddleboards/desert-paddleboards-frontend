import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Globe, Waves, CheckCircle2, Map, Download } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";
import { products, formatPrice } from "@/data/shop";
import { trackEvent } from "@/lib/analytics";

/**
 * /adventures — upcoming intentional trips + our private Colorado River tour.
 * Redirect target for the old GoDaddy /colorado-river-paddle + /upcoming-trips pages.
 */
export default function Adventures() {
  // Upcoming trips — first entry is featured at the top. Add `image` (a path
  // under /images/…) once we have a photo; otherwise a branded placeholder shows.
  const upcoming: {
    when: string;
    title: string;
    blurb: string;
    image?: string;
    href?: string;
  }[] = [
    {
      when: "August 2027 · exact dates coming soon",
      title: "Greenland — Small-Group Expedition",
      blurb:
        "Our newest intentional trip: icebergs, fjords and Arctic skies with a small, like-minded group. Spots are limited and this one takes a short conversation before booking, so we can make sure it's the right fit.",
      // Save the photo to public/images/adventures/greenland.jpg to switch this on.
      image: "/images/adventures/greenland.jpg",
      href: "https://www.wetravel.com/trips/3006797775",
    },
    {
      when: "Oct 27, 2026 & Nov 10, 2026",
      title: "Thailand — Limited Groups",
      blurb:
        "Intentional small-group travel with an optional Cambodia extension. These trips require a short conversation before booking, so we can make sure it's the right fit.",
    },
    {
      when: "March 2027",
      title: "A Winter Wellness Escape in the Alps",
      blurb:
        "Ski, snowboard, explore — or just enjoy the views, food and slower pace of Europe.",
    },
  ];

  const [featuredTrip, ...moreTrips] = upcoming;

  // Downloadable river guides (digital products checked out via Stripe).
  const guides = products.filter(
    (p) => p.slug.startsWith("guide-") && !p.soldOut,
  );

  const coloradoIncludes = [
    "Clear or inflatable paddleboard, leash, PFD & paddle",
    "Dinner and a fun host",
    "Campsite (sleep in your vehicle, bring a tent, or sleep under the stars on a cot)",
    "Shuttle back to camp after the float",
  ];

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Adventures", path: "/adventures" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Paddleboard Adventures & Intentional Travel",
      serviceType: "Adventure tour",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "Intentional small-group trips with Desert Paddleboards and our private Colorado River clear-paddleboard tour through the Black Canyon below the Hoover Dam.",
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Paddleboard Adventures & Trips | Desert Paddleboards"
        description="Upcoming intentional small-group trips — Greenland, Thailand and the Alps — plus our private Colorado River clear-paddleboard tour through the Black Canyon."
        image="/images/adventures/black-canyon-hot-springs.jpg"
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-sky-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/35 z-10" />
        <img
          src="/images/adventures/black-canyon-hot-springs.jpg"
          alt="Group soaking in the Black Canyon hot springs on a Colorado River paddleboard adventure"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Adventures</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Intentional trips and private paddleboard tours — adventure that's good for the soul.
          </p>
        </div>
      </section>

      {/* Upcoming trips — first thing people see */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
            <Globe className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Trips</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intentional, small-group travel to places worth slowing down for. Reach out and
            we'll make sure the trip is the right fit.
          </p>
        </div>

        {/* Featured trip */}
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[240px] md:min-h-full bg-muted">
                {/* Branded placeholder sits underneath; a real photo covers it when present. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 to-accent/40 p-8 text-center">
                  <Globe className="h-8 w-8 text-primary/70" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">
                    {featuredTrip.title}
                  </span>
                </div>
                {featuredTrip.image && (
                  <img
                    src={featuredTrip.image}
                    alt={featuredTrip.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                  Featured trip
                </span>
              </div>
              <CardContent className="flex flex-col justify-center p-8">
                <div className="text-sm font-semibold uppercase tracking-wide text-primary/80 mb-2">
                  {featuredTrip.when}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{featuredTrip.title}</h3>
                <p className="text-muted-foreground mb-6">{featuredTrip.blurb}</p>
                <div>
                  {featuredTrip.href ? (
                    <Button size="lg" asChild>
                      <a
                        href={featuredTrip.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent("adventure_click", { trip: featuredTrip.title })
                        }
                      >
                        View trip &amp; book
                      </a>
                    </Button>
                  ) : (
                    <Button size="lg" asChild>
                      <Link to="/contact?subject=Greenland%20trip">Ask about this trip</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Other upcoming trips */}
        {moreTrips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
            {moreTrips.map((t) => (
              <Card key={t.title} className="overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9] bg-muted">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 to-accent/40 p-6 text-center">
                    <Globe className="h-7 w-7 text-primary/70" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">
                      {t.title}
                    </span>
                  </div>
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <CardContent className="pt-6 pb-6 flex flex-col flex-1">
                  <div className="text-sm font-semibold uppercase tracking-wide text-primary/80 mb-1">
                    {t.when}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{t.blurb}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/contact?subject=Upcoming%20trip">Ask about an upcoming trip</Link>
          </Button>
        </div>
      </section>

      {/* Intro quote */}
      <section className="container pb-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground italic">
            "Adventure is not only good for the soul; it's essential for growth. Embrace the unknown,
            challenge your limits, and let nature inspire you to new heights."
          </p>
        </div>
      </section>

      {/* Private Colorado River group tour */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Private Group Adventure</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gather your crew and we'll build the trip around you — up to 12 people, on a date
              that works for your group.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/9] bg-muted">
                {/* Save a real Black Canyon photo to public/images/adventures/black-canyon.jpg to switch this on. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 to-accent/40 p-6 text-center">
                  <Waves className="h-7 w-7 text-primary/70" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">
                    Black Canyon · Colorado River
                  </span>
                </div>
                <img
                  src="/images/adventures/black-canyon.jpg"
                  alt="Clear-water paddleboarding through the Colorado River's Black Canyon"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                  Private tour · up to 12
                </span>
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                    <Waves className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl">
                    Colorado River — Black Canyon to Emerald Cove
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  A clear-paddleboard adventure that starts at the base of the Hoover Dam and
                  meanders ~12 miles through Black Canyon, with walls rising up to 2,000 feet.
                  Crystal-clear turquoise water, hidden coves, hot springs and wildlife — bighorn
                  sheep, ospreys and great blue herons. Beginner-friendly; you can always turn
                  around if you're tired.
                </p>
                <div className="space-y-2 mb-4">
                  {coloradoIncludes.map((i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{i}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Now offered as a private group tour for up to 12 people — reach out and we'll
                  help you pick a date. Boards, dinner, riverside camping and the shuttle back to
                  camp are all included.
                </p>
              </CardContent>
            </Card>
            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link to="/contact?subject=Private%20Colorado%20River%20tour">
                  Request a private tour
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Paddle-it-yourself river guides — digital downloads via Stripe */}
      {guides.length > 0 && (
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Paddle It Yourself</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Not ready for a guided trip? Grab a downloadable river guide — launch points,
              timing, what to pack and everything you need to run it on your own.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {guides.map((g) => (
              <Card key={g.slug} className="flex flex-col">
                <CardContent className="pt-8 pb-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                      <Map className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(g.priceUsd)}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-3">{g.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{g.blurb}</p>
                  {g.paymentLink ? (
                    <a
                      href={g.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent("shop_click", { product: g.name, value: g.priceUsd })
                      }
                      className="mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" />
                      Buy &amp; download — {formatPrice(g.priceUsd)}
                    </a>
                  ) : (
                    <span className="mt-auto inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/shop">See all guides &amp; merch</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Cross-link */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <Mountain className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Prefer something calmer?</h2>
          <p className="text-lg opacity-90 mb-8">
            Find a floating soundbath near you, grab a paddleboard, or pick up one of our river guides for
            your own trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/locations">Floating soundbaths</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/shop">Shop river guides</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
