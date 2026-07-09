import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, Truck, Sparkles, MapPin } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

/**
 * /rentals — paddleboard fleet rentals + a feature for the Blue Wave Mobile
 * Wellness Lounge (the Airstream minisite at /airstream).
 * Redirect target for the old GoDaddy /airstream-rental page.
 */
export default function Rentals() {
  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Rentals", path: "/rentals" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Paddleboard & Airstream Rentals",
      serviceType: "Equipment & venue rental",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "Paddleboard fleet rentals for groups and events, plus the Blue Wave Mobile Wellness Lounge — a luxury Airstream wellness activation available across Arizona and Southern California.",
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Paddleboard &amp; Airstream Rentals — Arizona"
        description="Rent a fleet of paddleboards across metro Phoenix, or bring the Blue Wave Mobile Wellness Lounge — our luxury Airstream wellness activation — to your event across AZ &amp; SoCal."
        image="/floating-boards-sunset.jpg"
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/35 z-10" />
        <img
          src="/floating-boards-sunset.jpg"
          alt="Paddleboards floating on Arizona water at sunset"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Rentals</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Paddleboards for your group or event — plus the Blue Wave Mobile Wellness Lounge Airstream.
          </p>
        </div>
      </section>

      {/* Paddleboard rentals */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <Waves className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Paddleboard Rentals</h2>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Planning a group paddle, a private event or a team day on the water? We rent out our fleet of
            stable, beginner-friendly paddleboards — delivered, set up and picked up for you. Boards, paddles,
            leashes and life vests included.
          </p>
          <Card>
            <CardContent className="pt-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-primary/80 mb-1">
                    Group rental
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">$500</div>
                  <p className="text-sm text-muted-foreground">
                    Up to 20 paddleboards, including delivery and pickup across the Valley. Perfect for group
                    outings, parties and team events. Setup and instruction available — just ask.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button size="lg" asChild>
                    <Link to="/contact?subject=Paddleboard%20rental">
                      Request a rental
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="tel:6024560884">Or call 602.456.0884</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground mt-4">
            Looking for a board of your own?{" "}
            <Link to="/shop" className="text-primary underline underline-offset-2">
              Shop our paddleboards
            </Link>
            . Want us to run the whole experience?{" "}
            <Link to="/private-events" className="text-primary underline underline-offset-2">
              Book a private event
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Blue Wave Mobile Wellness Lounge — featured; full details on /airstream */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Blue Wave Mobile Wellness Lounge
              </h2>
            </div>
            <p className="text-lg font-medium mb-2">
              Our luxury Airstream wellness activation — Arizona &amp; Southern California
            </p>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              A beautifully restored Airstream, reimagined as a mobile wellness lounge — brought
              to your event, retreat, festival or private gathering. A serene, show-stopping space
              for sound healing, recovery and relaxation, delivered and styled for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button size="lg" asChild>
                <Link to="/airstream">Explore the Blue Wave Lounge →</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact?subject=Blue%20Wave%20Airstream">Inquire about a date</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> Available across Arizona &amp; Southern California
            </p>
          </div>
        </div>
      </section>

      {/* Cross-link */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Truck className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">More ways to get on the water</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join one of our guided paddleboard adventures, or find a floating soundbath near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/adventures">Guided adventures</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/locations">Floating soundbaths</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
