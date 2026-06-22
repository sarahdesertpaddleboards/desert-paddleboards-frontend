import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, Mic, Mountain, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

/**
 * /coaching — Adventure Life Coaching + motivational speaking with Sarah Williams.
 * Redirect target for the old GoDaddy /adventure-life-coaching page.
 * Pricing/copy carried over from the old site — flagged for Sarah to confirm.
 */
export default function Coaching() {
  const packages = [
    {
      name: "Single Session",
      price: "$75",
      detail: "One 45-minute session — a low-commitment way to try coaching and talk through where you want to go.",
    },
    {
      name: "Three Sessions",
      price: "$210",
      note: "5% off",
      detail: "Three 45-minute sessions with Adventure Life Coach Sarah Williams. Perfect for getting started and exploring your options.",
    },
    {
      name: "Six Sessions",
      price: "$400",
      note: "10% off",
      detail: "Six 45-minute sessions for those committed to making real progress toward their adventure goals.",
      featured: true,
    },
    {
      name: "Twelve Sessions",
      price: "$750",
      note: "15% off — best value",
      detail: "Twelve 45-minute sessions for those who want to fully commit to their personal-growth and transformation journey.",
    },
  ];

  const credentials = [
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
      name: "Adventure Life Coaching",
      serviceType: "Life coaching",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "One-on-one adventure life coaching with Sarah Williams — build the confidence and skills to break out of your comfort zone and take on new challenges.",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "75",
        description: "45-minute coaching session",
      },
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Adventure Life Coaching &amp; Speaking | Sarah Williams"
        description="One-on-one adventure life coaching and motivational speaking with Sarah Williams — build the confidence to step outside your comfort zone, in Arizona."
        image="/about-sarah-class.webp"
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/35 z-10" />
        <img
          src="/about-sarah-class.webp"
          alt="Adventure life coach Sarah Williams leading a class on the water"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Adventure Life Coaching</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Build the confidence and skills to break out of your comfort zone — and embark on your next adventure.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-6">
            <Compass className="h-8 w-8" />
          </div>
          <p className="text-lg text-muted-foreground">
            With Adventure Life Coaching you'll gain the confidence and skills needed to break out of your
            comfort zone and embark on new adventures. Work one-on-one with Sarah to take the first step
            toward a more fulfilling life — whether that's a personal goal, a big trip, or a whole new chapter.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sessions &amp; Packages</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a single session or commit to a package — the more you book, the more you save.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="text-3xl font-bold text-primary mb-1">{pkg.price}</div>
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
              <a href="mailto:sarah@desertpaddleboards.com?subject=Adventure%20Life%20Coaching">
                Book your coaching package
              </a>
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
              <a href="mailto:sarah@desertpaddleboards.com?subject=Motivational%20Speaking%20Inquiry">
                Book Sarah to speak
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="tel:4802019520">Or call 480.201.9520</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Cross-link */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <Mountain className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to put coaching into action?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Sarah's guided paddleboard adventures and retreats are the perfect place to step outside your
            comfort zone — on the water, in good company.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/adventures">Explore our adventures</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
