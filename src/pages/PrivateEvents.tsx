import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Heart, Briefcase, Sparkles, CheckCircle2, Building2, Dumbbell } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import EventInquiryForm from "@/components/EventInquiryForm";
import VenueProof from "@/components/VenueProof";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

export default function PrivateEvents() {
  const includedFeatures = [
    "Customized experience tailored to your group",
    "Professional instructors and sound healers",
    "All equipment provided (paddleboards, blankets, eye masks)",
    "Flexible scheduling to fit your needs",
    "Multiple location options available",
    "Photo opportunities and social media content",
  ];

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Private Events", path: "/private-events" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Private Floating Soundbath Events",
      serviceType: "Private event",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
      description:
        "Private floating soundbath events for bachelorette parties, corporate wellness, retreats, gym member-appreciation days and group celebrations across Arizona.",
    },
  ]);

  return (
    <div className="min-h-screen">
      <Seo
        title="Private Events — Bachelorette &amp; Corporate Wellness"
        description="Private floating soundbath events across Arizona — bachelorette parties, corporate offsites, retreats and celebrations. We bring the boards, musicians and team."
        image="/private-events/phx-country-club-soundbath.jpg"
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10" />
        <img
          src="/private-events/phx-country-club-soundbath.jpg"
          alt="Floating soundbath at sunset by the pool at Phoenix Country Club"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Private Events
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Unique floating experiences for bachelorettes, corporate wellness, and special celebrations
          </p>
        </div>
      </section>

      {/* Lead capture above the fold — most of this page's traffic arrives from
          social on a phone and previously had to scroll past six photo bands to
          reach the form. */}
      <section id="inquiry" className="container py-14">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start">
          <div className="order-2 space-y-4 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold">
              Perfect For Any Occasion
            </h2>
            <p className="text-lg text-muted-foreground">
              We customize each experience to match your group's needs and preferences —
              bachelorette parties, corporate offsites, retreats, member-appreciation
              days and celebrations of every kind.
            </p>
            <p className="text-lg text-muted-foreground">
              We bring the boards, the live musicians and the whole team, to your venue
              or ours. Tell us what you have in mind and we'll build it around your group.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <EventInquiryForm />
          </div>
        </div>
      </section>

      <VenueProof />

      {/* Why it works for teams — links the best-converting blog post (51%
          session key-event rate) into the corporate buyer's path. */}
      <section className="container py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            For teams
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Why this works for corporate groups
          </h2>
          <p className="mt-3 text-muted-foreground">
            A floating soundbath does what a catered lunch or an escape room can&rsquo;t:
            it actually lowers stress. Teams leave calmer than they arrived, and they
            remember it. It works for every fitness level, nobody has to be good at
            anything, and it photographs beautifully for your internal comms.
          </p>
          <Link
            to="/blog/floating-sound-baths-the-ultimate-corporate-wellness-event"
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Read: floating soundbaths as a corporate wellness event &rarr;
          </Link>
        </div>
      </section>

      {/* Bachelorette Parties feature — real backyard-pool event */}
      <section className="py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="md:order-2">
            <img
              src="/private-events/bachelorette-party.jpg"
              alt="A bachelorette group floating on paddleboards at a backyard-pool soundbath"
              loading="lazy"
              className="w-full rounded-2xl object-cover shadow-sm"
            />
          </div>
          <div className="md:order-1">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Bachelorette Parties
            </h2>
            <p className="text-lg text-muted-foreground">
              Give the bride-to-be and her crew a celebration they'll never forget —
              floating together as live sound washes over you, right in a private
              backyard pool or the venue of your choice. We bring the boards,
              musicians and all the magic.
            </p>
          </div>
        </div>
      </section>

      {/* Gyms & Member Appreciation feature — real event at Lifetime Fitness */}
      <section className="py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <img
            src="/private-events/lifetime-fitness-soundbath.jpg"
            alt="A floating soundbath member-appreciation event at Lifetime Fitness"
            loading="lazy"
            className="w-full rounded-2xl object-cover shadow-sm"
          />
          <div>
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <Dumbbell className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Gyms &amp; Member Appreciation
            </h2>
            <p className="text-lg text-muted-foreground">
              Give your members something they won&apos;t find in a typical fitness
              class. A floating soundbath is a unique way to celebrate milestones, or
              create a memorable member appreciation event. We can bring everything and
              run the entire experience — or simply drop off the boards for your own
              instructors.
            </p>
          </div>
        </div>
      </section>

      {/* Small Business & Team Events feature — real event at Optima */}
      <section className="py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="md:order-2">
            <img
              src="/private-events/optima-team-event.jpg"
              alt="A floating soundbath team event at Optima"
              loading="lazy"
              className="w-full rounded-2xl object-cover shadow-sm"
            />
          </div>
          <div className="md:order-1">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Small Business &amp; Team Events
            </h2>
            <p className="text-lg text-muted-foreground">
              Treat your team to an experience that&apos;s nothing like the usual
              offsite. Floating soundbaths offer a relaxing, memorable way to bring
              your team together. We take care of the setup, equipment, and experience
              so your group can simply show up and enjoy.
            </p>
          </div>
        </div>
      </section>

      {/* Group Celebrations feature — real rooftop floating-yoga class */}
      <section className="py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <img
            src="/private-events/rooftop-group-celebration.jpg"
            alt="A group floating-yoga class on paddleboards at a rooftop pool overlooking the desert"
            loading="lazy"
            className="w-full rounded-2xl object-cover shadow-sm"
          />
          <div>
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Group Celebrations
            </h2>
            <p className="text-lg text-muted-foreground">
              Birthdays, anniversaries, reunions — make any celebration extra special
              on the water. Gather your group for a floating experience with a view,
              like this rooftop-pool class overlooking the desert. We bring everything
              and make it effortless.
            </p>
          </div>
        </div>
      </section>

      {/* Retreats & Workshops feature — real twilight backyard-pool soundbath */}
      <section className="py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="md:order-2">
            <img
              src="/private-events/backyard-retreat.jpg"
              alt="A twilight candlelit floating soundbath in a backyard pool"
              loading="lazy"
              className="max-h-[520px] w-full rounded-2xl object-cover shadow-sm"
            />
          </div>
          <div className="md:order-1">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Retreats &amp; Workshops
            </h2>
            <p className="text-lg text-muted-foreground">
              A magical addition to wellness retreats, yoga teacher trainings and
              mindfulness workshops — like this candlelit twilight soundbath under the
              stars. We create an unforgettable, restorative experience your
              participants will be talking about long after.
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Wellness feature — original JW Marriott group event */}
      <section className="py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <img
            src="/venues/jw-marriott.jpg"
            alt="A corporate group floating soundbath at the JW Marriott"
            loading="lazy"
            className="w-full rounded-2xl object-cover shadow-sm"
          />
          <div>
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-primary">
              <Briefcase className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Corporate Wellness
            </h2>
            <p className="text-lg text-muted-foreground">
              Boost team morale and melt away stress with a group soundbath or
              floating yoga session — like this event we hosted at the JW Marriott.
              It's a memorable way to invest in your team's wellbeing, and we handle
              everything from setup to sound.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              What's Included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {includedFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="container py-16">
        <div className="mx-auto max-w-3xl">
          <EventInquiryForm />
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <blockquote className="text-2xl md:text-3xl italic mb-6">
            "Desert Paddleboards made our bachelorette party absolutely unforgettable! The floating soundbath was the perfect way to relax and bond before the big day."
          </blockquote>
          <p className="text-lg opacity-90">— Jessica M., Scottsdale</p>
        </div>
      </section>

      {/* Cross-link */}
      <section className="container py-12">
        <p className="text-center text-muted-foreground">
          Want a bigger adventure for your group?{" "}
          <Link to="/adventures" className="font-medium text-primary hover:underline">
            Explore our guided paddleboard trips and retreats →
          </Link>
        </p>
      </section>
    </div>
  );
}
