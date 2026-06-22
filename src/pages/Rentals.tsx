import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, Truck, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

/**
 * /rentals — paddleboard rentals + the "Grapefruit Orchard" Airstream brand-activation rental.
 * Redirect target for the old GoDaddy /airstream-rental page.
 */
export default function Rentals() {
  const airstreamUses = [
    "Brand activations & product launches",
    "Corporate pop-ups & experiential campaigns",
    "Content creation & influencer events",
    "Mobile offices & VIP client experiences",
  ];

  const airstreamRates = [
    { name: "Weekend Activation", detail: "Fri–Sun", price: "from $1,500" },
    { name: "Weekly Campaign", detail: "5–7 days", price: "from $2,500" },
    { name: "Extended Campaign", detail: "2–3 weeks", price: "custom quote" },
  ];

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
        "Paddleboard rentals for groups and events, plus the Grapefruit Orchard Airstream — a camera-ready mobile space for brand activations and pop-ups across the Phoenix metro.",
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Paddleboard &amp; Airstream Rentals — Phoenix, AZ"
        description="Rent paddleboards across metro Phoenix, or book the Grapefruit Orchard Airstream — a camera-ready space for shoots, pop-ups and brand activations."
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
            Paddleboards for your group or event — plus a one-of-a-kind Airstream for brand activations.
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
                    <a href="mailto:sarah@desertpaddleboards.com?subject=Paddleboard%20Rental%20Inquiry">
                      Request a rental
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="tel:4802019520">Or call 480.201.9520</a>
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

      {/* Airstream */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">The Grapefruit Orchard Airstream</h2>
            </div>
            <p className="text-lg font-medium mb-2">Brand activation rental — Phoenix, AZ</p>
            <p className="text-muted-foreground mb-8">
              Your brand deserves a better stage. The Grapefruit Orchard Airstream is a fully outfitted,
              camera-ready mobile space for corporate brand activations, pop-up experiences and marketing
              campaigns across the Phoenix metro. Delivered to your location. Ready to turn heads.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {airstreamUses.map((u) => (
                <div key={u} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{u}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-4">Rental Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {airstreamRates.map((r) => (
                <Card key={r.name}>
                  <CardContent className="pt-8 pb-6 text-center">
                    <h4 className="font-bold text-lg mb-1">{r.name}</h4>
                    <div className="text-sm text-muted-foreground mb-2">{r.detail}</div>
                    <div className="text-2xl font-bold text-primary">{r.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Delivery, setup and pickup included within the Phoenix metro. Additional fees apply for generator
              power, location moves and branded staging. Past clients include local healthcare &amp; wellness
              brands, community festivals and corporate activations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button size="lg" asChild>
                <a href="mailto:sarah@desertpaddleboards.com?subject=Airstream%20Rental%20Inquiry">
                  Email to reserve
                </a>
              </Button>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Based in Queen Creek · Delivered Valley-wide
              </p>
            </div>
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
