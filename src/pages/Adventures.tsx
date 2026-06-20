import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Bike, Globe, Waves, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

/**
 * /adventures — guided paddleboard adventures, retreats and upcoming trips.
 * Redirect target for the old GoDaddy /colorado-river-paddle + /upcoming-trips pages.
 */
export default function Adventures() {
  const featured = [
    {
      icon: Waves,
      title: "Colorado River — Black Canyon to Emerald Cove",
      price: "$250",
      blurb:
        "A clear-paddleboard adventure that starts at the base of the Hoover Dam and meanders ~12 miles through Black Canyon, with walls rising up to 2,000 feet. Crystal-clear turquoise water, hidden coves, hot springs and wildlife — bighorn sheep, ospreys and great blue herons. Beginner-friendly; you can always turn around if you're tired.",
      includes: [
        "Clear or inflatable paddleboard, leash, PFD & paddle",
        "Dinner and a fun host",
        "Campsite (sleep in your vehicle, bring a tent, or sleep under the stars on a cot)",
        "Shuttle back to camp after the float",
      ],
      note: "$50 deposit reserves your spot. Trip dates are announced seasonally — get in touch to join the next one.",
    },
    {
      icon: Bike,
      title: "Paddle & Ride Adventure Retreat",
      price: "$250",
      blurb:
        "A two-day Flagstaff escape: a beginner-friendly fat-tire mountain bike ride through the pines, a night of hammocking and guided meditation under dark skies, then clear paddleboarding at a hidden reservoir with towering cliffs — plus a stop at a secret ghost town with tunnels and caves.",
      includes: [
        "Fat-bike rental",
        "Healthy dinner & breakfast, cooked on a Blackstone grill",
        "Paddleboards included",
        "Comedy & life coaching with Sarah Williams",
      ],
      note: "Couples sign up → couples trip. Women sign up → women's trip (limit 12). Carpool available from Phoenix.",
    },
  ];

  const upcoming = [
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

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Adventures", path: "/adventures" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Guided Paddleboard Adventures & Retreats",
      serviceType: "Adventure tour",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "Guided paddleboard adventures and retreats with Desert Paddleboards — clear-paddleboard trips through the Colorado River's Black Canyon, Flagstaff paddle-and-ride retreats and intentional small-group travel.",
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Guided Paddleboard Adventures &amp; Retreats in Arizona | Desert Paddleboards"
        description="Guided paddleboard adventures with Desert Paddleboards — clear-paddleboard trips through the Colorado River's Black Canyon, Flagstaff paddle-and-ride retreats, and intentional small-group travel to Thailand and the Alps."
        image="/floating-boards-sunset.jpg"
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/35 z-10" />
        <img
          src="/floating-boards-sunset.jpg"
          alt="Paddleboarding adventure on Arizona water"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Adventures</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Guided paddleboard trips, retreats and intentional travel — adventure that's good for the soul.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground italic">
            "Adventure is not only good for the soul; it's essential for growth. Embrace the unknown,
            challenge your limits, and let nature inspire you to new heights."
          </p>
        </div>
      </section>

      {/* Featured adventures */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Signature Adventures</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Small groups, big scenery, and just enough challenge to leave you proud of yourself.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featured.map((adv) => {
              const Icon = adv.icon;
              return (
                <Card key={adv.title} className="flex flex-col">
                  <CardContent className="pt-8 pb-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold text-primary">{adv.price}</div>
                    </div>
                    <h3 className="font-bold text-xl mb-3">{adv.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{adv.blurb}</p>
                    <div className="space-y-2 mb-4">
                      {adv.includes.map((i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{i}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-auto">{adv.note}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <a href="mailto:sarah@desertpaddleboards.com?subject=Adventure%20Trip%20Inquiry">
                Reserve your spot
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming trips */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Upcoming Trips</h2>
          </div>
          <div className="space-y-6">
            {upcoming.map((t) => (
              <Card key={t.title}>
                <CardContent className="pt-6 pb-6">
                  <div className="text-sm font-semibold uppercase tracking-wide text-primary/80 mb-1">
                    {t.when}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.blurb}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8">
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:sarah@desertpaddleboards.com?subject=Upcoming%20Trip%20Interest">
                Ask about an upcoming trip
              </a>
            </Button>
          </div>
        </div>
      </section>

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
