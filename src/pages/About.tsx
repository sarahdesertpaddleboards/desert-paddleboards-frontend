import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Heart, Music2, Waves } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import { breadcrumbLd, graph, organizationLd } from "@/lib/jsonld";
import { SITE_URL } from "@/data/site";

/**
 * /about — the story of the business, not the founder. Sarah's personal story
 * (goat yoga, TV, certifications) lives on her own personal-brand site.
 *
 * CONFIRM WITH SARAH before launch: the "first in Arizona" framing. Her
 * personal site currently says "one of the first to take people paddleboarding
 * on the river here" — keep the two consistent.
 */
export default function About() {
  const facts = [
    {
      icon: Calendar,
      title: "On the water since 2011",
      description: "Arizona's original paddleboard company",
    },
    {
      icon: Music2,
      title: "Live music, every time",
      description: "Local musicians, never a recording",
    },
    {
      icon: Waves,
      title: "Pools, lakes & rivers",
      description: "Resorts, city pools and open water across Arizona",
    },
    {
      icon: Heart,
      title: "Community first",
      description: "Witches Regatta since 2017, plus the Santa Paddle",
    },
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title="About Desert Paddleboards | Arizona's Original Since 2011"
        description="Desert Paddleboards has put Arizona on the water since 2011: paddleboarding, the Floating Nap™ soundbath with live local musicians, and community events like the Witches Regatta."
        image="/about-sarah-class.webp"
      />
      <JsonLd
        data={graph([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          organizationLd(),
          {
            "@type": "Person",
            "@id": `${SITE_URL}/#sarah`,
            name: "Sarah Williams",
            jobTitle: "Founder",
            worksFor: { "@id": `${SITE_URL}/#organization` },
          },
        ])}
      />
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10" />
        <img
          src="/about-sarah-class.webp"
          alt="A Desert Paddleboards class on the water"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-balance text-4xl font-bold mb-4 md:text-6xl">
            The original. Still the best.
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Putting Arizona on the water since 2011
          </p>
        </div>
      </section>

      {/* Facts */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <Card key={fact.title} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{fact.title}</h3>
                  <p className="text-sm text-muted-foreground">{fact.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Our story */}
      <section className="bg-accent/20 py-16">
        <div className="container max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Our story</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Back in 2011, hardly anyone here had seen a stand-up paddleboard.
              Which is wild, because Arizona is full of water: Saguaro Lake,
              Canyon Lake, Lake Pleasant, Tempe Town Lake, the Salt River, the
              Colorado. So we started putting people on boards. Turns out they
              loved it.
            </p>
            <p>
              Then it got weirder, in a good way. Paddleboard yoga. River trips.
              And then the Floating Nap™: you lie back on a floating board in a
              gorgeous resort pool while live musicians play gongs, singing bowls
              and Native American flute around you. Falling asleep is allowed.
              Encouraged, honestly.
            </p>
            <p>
              Is it casual? Totally. Is it also a five-star resort pool at sunset?
              Also yes. We contain multitudes.
            </p>
            <p>
              We design our own boards, too. Every board you float on is ours,
              and now businesses order them with their own logo on top.
            </p>
          </div>
        </div>
      </section>

      {/* Local talent & community */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">Local talent, live</h3>
              <p className="text-muted-foreground">
                Every soundbath has live musicians. Real people, real
                instruments, no Spotify playlist. That includes award-winning
                Native American flutist Cody Blackbird. And there's always a crew
                in the water to help you on and off your board.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">Built around community</h3>
              <p className="text-muted-foreground">
                We started the Witches Regatta on Tempe Town Lake in 2017 with a
                handful of friends in witch hats. Now 300+ paddlers show up in
                costume. There's also the Santa Paddle (yes, dogs in antlers),
                soundbaths with city Parks &amp; Rec, and private group trips
                through the Black Canyon.
              </p>
              <Link
                to="/community-events"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                See our community events →
              </Link>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">As seen in</h3>
              <p className="text-muted-foreground">
                Phoenix Magazine put us on the cover. Local news keeps coming back
                for the soundbaths, the paddleboard workouts and, of course, the
                witches.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real Google reviews, baked in at build time */}
      <GoogleReviews max={6} heading="What our guests say" />

      {/* Mission */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl italic text-primary mb-6">
            "Life is better on the water!"
          </blockquote>
          <p className="text-lg text-muted-foreground mb-8">
            Founded by Sarah Williams and run by a crew of local musicians,
            instructors and in-water helpers. First time on a board or fiftieth
            float, come hang out with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/locations">Browse Floating Sessions</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/private-events">Plan Your Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
