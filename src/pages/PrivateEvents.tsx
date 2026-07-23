import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, Briefcase, Sparkles, CheckCircle2, Building2, Dumbbell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { submitWeb3Form } from "@/lib/web3forms";
import { trackEvent } from "@/lib/analytics";
import { SITE_URL, business } from "@/data/site";

export default function PrivateEvents() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    numberOfGuests: "",
    preferredDate: "",
    location: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () =>
    setFormData({
      name: "",
      email: "",
      phone: "",
      eventType: "",
      numberOfGuests: "",
      preferredDate: "",
      location: "",
      message: "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const subject = `Private event inquiry${formData.eventType ? ` — ${formData.eventType}` : ""}`;

    // Preferred path: deliver straight to Sarah's inbox via Web3Forms.
    const result = await submitWeb3Form({
      subject,
      from_name: "Desert Paddleboards website",
      replyto: formData.email,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "—",
      event_type: formData.eventType || "—",
      guests: formData.numberOfGuests || "—",
      preferred_date: formData.preferredDate || "—",
      preferred_location: formData.location || "—",
      message: formData.message || "—",
    });

    setSubmitting(false);

    if (result.success) {
      trackEvent("generate_lead", { form: "private-events" });
      toast.success("Thank you! Your inquiry has been sent — we'll reply within 24 hours.");
      resetForm();
      return;
    }

    // Fallback (no key configured yet, or the request failed): hand off to the
    // visitor's mail client with everything pre-filled so the lead isn't lost.
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "—"}`,
      `Event type: ${formData.eventType || "—"}`,
      `Number of guests: ${formData.numberOfGuests || "—"}`,
      `Preferred date: ${formData.preferredDate || "—"}`,
      `Preferred location: ${formData.location || "—"}`,
      "",
      "Details:",
      formData.message || "—",
    ].join("\n");
    window.location.href = `mailto:sarah@desertpaddleboards.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.message("Opening your email app so you can send your inquiry directly…");
  };

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

      {/* Intro heading — leads into the real-event feature bands below */}
      <section className="container pt-16 pb-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Perfect For Any Occasion
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We customize each experience to match your group's needs and preferences
        </p>
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
            alt="Poolside candlelit floating soundbath member-appreciation event at Lifetime Fitness"
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
              Treat your members to an unforgettable floating soundbath — like this
              candlelit evening we hosted poolside at Lifetime Fitness. We bring
              everything and run the whole experience, or simply drop off the boards
              for your own instructors.
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
              alt="A candlelit evening floating soundbath team event at Optima"
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
              Give your team a wellness experience that's nothing like the usual
              offsite — like this candlelit evening soundbath we hosted poolside at
              Optima. It's the perfect reset for stressed-out teams, and we handle
              every detail.
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
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Request a Quote
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us about your event and we'll create a custom package for your group
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Inquiry Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Sarah Williams"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(602) 555-0123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                      required
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelorette">Bachelorette Party</SelectItem>
                        <SelectItem value="corporate">Corporate Wellness</SelectItem>
                        <SelectItem value="retreat">Retreat/Workshop</SelectItem>
                        <SelectItem value="celebration">Group Celebration</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfGuests">Number of Guests</Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      min="1"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                      placeholder="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phoenix">Phoenix Area</SelectItem>
                        <SelectItem value="scottsdale">Scottsdale</SelectItem>
                        <SelectItem value="san-diego">San Diego</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell Us About Your Event</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share any details about your event, special requests, or questions..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
                    {submitting ? "Sending…" : "Submit Inquiry"}
                  </Button>
                  <Button type="button" variant="outline" size="lg" asChild>
                    <a href="tel:6024560884">Or Call 602.456.0884</a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  We typically respond within 24 hours with a custom quote for your event
                </p>
              </form>
            </CardContent>
          </Card>
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
