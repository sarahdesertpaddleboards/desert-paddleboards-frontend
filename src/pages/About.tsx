import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, Music2, Newspaper, Waves } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import { breadcrumbLd, faqPageLd, graph, organizationLd } from "@/lib/jsonld";
import { SITE_URL } from "@/data/site";

/**
 * /about ("Our Story") — the business's story, from Sarah's own telling
 * (recorded with Nick, Oct 2026). Written for answer engines as well as
 * people: an answer-first summary, a dated timeline, and a short FAQ that
 * also ships as FAQPage JSON-LD. General "what is a floating soundbath"
 * questions live on /faq — keep these company-specific so they don't overlap.
 */

const summary =
  "Desert Paddleboards is an Arizona water-wellness company founded by Sarah Williams in 2011. It started with paddleboard outings on the Salt River and is now best known for the Floating Nap™: a floating soundbath with live musicians, held in resort, city and backyard pools and on lakes across Arizona.";

const facts = [
  { icon: Calendar, title: "Since 2011", description: "Paddleboarding the desert before it was cool" },
  { icon: Music2, title: "Live music, every time", description: "Real musicians, never a playlist" },
  { icon: Waves, title: "Any water", description: "Hotel, city and backyard pools, lakes and rivers" },
  { icon: Newspaper, title: "As seen in", description: "Islands Magazine, Phoenix Magazine & local news" },
];

const timeline = [
  {
    year: "2011",
    title: "Five paddleboards and a river",
    body: "Sarah, a synchronized swimming coach and swim teacher who'd swum Alcatraz, figured the next step was surfing in the desert. She bought five paddleboards and invited people out to the Salt River. Back then the Salt was for partying and tubing, and plenty of husbands and boyfriends weren't sure about their partners heading out on a board. A year of taking women out two or three times a week changed that.",
  },
  {
    year: "2011–2019",
    title: "One of the only ones out there",
    body: "For about eight years we were one of the only outfits running paddleboard outings in the desert: full moon paddles, paddleboarding with dogs, date nights.",
  },
  {
    year: "2020",
    title: "Everybody discovered paddleboarding",
    body: "COVID sent everyone outdoors, competition exploded, and our board business shrank to a quarter of its size. Time to pivot.",
  },
  {
    year: "2022",
    title: "The 20-minute sellout",
    body: "Presenting paddleboard yoga at a fitness conference, Sarah asked to try something new: a floating soundbath. It sold out in 20 minutes, faster than every boot camp on the schedule.",
  },
  {
    year: "2023",
    title: "Sold out, every time",
    body: "We called the local news, posted on TikTok and Instagram, and classes of 75 people started selling out. People are stressed and overwhelmed. Not everyone wants another workout, but everybody needs to relax.",
  },
  {
    year: "Today",
    title: "From river trips to five-star pools",
    body: "We swapped hauling people down the river for $50 for live musicians and a meditative sound journey on the water, at resorts, city pools and private homes across Arizona.",
  },
];

const different = [
  "Our own branded, high-end floating boards that don't sink when you lie on them",
  "Any water works: hotel pools, city pools, backyard pools, even lakes and rivers (we anchor you)",
  "Live musicians at every session",
  "A cozy blanket and a lavender eye mask, so all you have to do is relax",
  "Anyone can do it. No fitness level, experience or swimming skills required",
];

const faqs = [
  {
    question: "Who founded Desert Paddleboards?",
    answer:
      "Sarah Williams, a former synchronized swimming coach and swim teacher who has swum Alcatraz, founded Desert Paddleboards in 2011.",
  },
  {
    question: "When and where did Desert Paddleboards start?",
    answer:
      "In 2011 on the Salt River near Mesa, Arizona, with five paddleboards. For about eight years it was one of the only companies running paddleboard outings in the Arizona desert.",
  },
  {
    question: "What is the Floating Nap™?",
    answer:
      "The Floating Nap™ is Desert Paddleboards' floating soundbath: you lie on a floating board on the water, wrapped in a blanket with a lavender eye mask, while live musicians take you through a meditative sound journey. It launched in 2022 and sold out in 20 minutes.",
  },
  {
    question: "Where do Desert Paddleboards floating soundbaths take place?",
    answer:
      "At resort and hotel pools, city pools and private backyard pools across Arizona, and on lakes and rivers, where boards are anchored in place. See the current venues on the Floating Sessions page.",
  },
  {
    question: "What makes Desert Paddleboards different from other floating soundbaths?",
    answer:
      "We design our own branded, high-end floating boards that don't sink when you lie on them, every session has live musicians, and we can make almost any body of water work. No fitness level or swimming skills are needed.",
  },
  {
    question: "Has Desert Paddleboards been featured in the media?",
    answer:
      "Yes. Desert Paddleboards has been featured in Islands Magazine, on the cover of Phoenix Magazine, and on Phoenix-area local news as a top new trend in wellness.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <Seo
        title="Our Story | Desert Paddleboards, Arizona Since 2011"
        description="How Desert Paddleboards went from five paddleboards on the Salt River in 2011 to the Floating Nap™, Arizona's sold-out floating soundbath with live musicians."
        image="/about-sarah-class.webp"
      />
      <JsonLd
        data={graph([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Our Story", path: "/about" },
          ]),
          {
            ...organizationLd(),
            description: summary,
            foundingDate: "2011",
            foundingLocation: { "@type": "Place", name: "Mesa, Arizona" },
            founder: { "@id": `${SITE_URL}/#sarah` },
          },
          {
            "@type": "Person",
            "@id": `${SITE_URL}/#sarah`,
            name: "Sarah Williams",
            jobTitle: "Founder",
            worksFor: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "AboutPage",
            "@id": `${SITE_URL}/about`,
            url: `${SITE_URL}/about`,
            name: "Our Story",
            about: { "@id": `${SITE_URL}/#organization` },
          },
          faqPageLd(faqs),
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
            Our story
          </p>
          <h1 className="text-balance text-4xl font-bold mb-4 md:text-6xl">
            The original. Still the best.
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Paddleboarding the desert since 2011. Floating soundbaths since 2022.
          </p>
        </div>
      </section>

      {/* Answer-first summary — the sentence answer engines should quote */}
      <section className="container max-w-3xl pt-14">
        <p className="text-xl leading-relaxed text-foreground">{summary}</p>
      </section>

      {/* Facts */}
      <section className="container py-12">
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

      {/* Timeline */}
      <section className="bg-accent/20 py-16">
        <div className="container max-w-3xl space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">How Desert Paddleboards started</h2>
          <ol className="space-y-8 border-l-2 border-primary/30 pl-6">
            {timeline.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  {t.year}
                </p>
                <h3 className="mt-1 text-xl font-bold">{t.title}</h3>
                <p className="mt-2 text-muted-foreground">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What makes it different */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Why it can't be copied</h2>
          <p className="text-lg text-muted-foreground">
            Lots of people have tried to copy the floating soundbath. Here's what
            they can't copy.
          </p>
          <ul className="space-y-3">
            {different.map((line) => (
              <li key={line} className="flex gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Local talent & community */}
      <section className="bg-accent/20 py-16">
        <div className="container max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">Local talent, live</h3>
              <p className="text-muted-foreground">
                Real people, real instruments, no Spotify playlist. That includes
                award-winning Native American flutist Cody Blackbird. And there's
                always a crew in the water to help you on and off your board.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">Built around community</h3>
              <p className="text-muted-foreground">
                We started the Witches Regatta on Tempe Town Lake in 2017. Now 300+
                paddlers show up in costume. Add the Santa Paddle (yes, dogs in
                antlers) and private group trips through the Black Canyon.
              </p>
              <Link
                to="/community-events"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                See our community events →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick answers — mirrored in FAQPage JSON-LD above */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Quick answers</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.question}>
                <h3 className="text-lg font-bold">{f.question}</h3>
                <p className="mt-1 text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            More questions about booking, what to wear or what to expect?{" "}
            <Link to="/faq" className="font-medium text-primary hover:underline">
              Read the full FAQ →
            </Link>
          </p>
        </div>
      </section>

      {/* Real Google reviews, baked in at build time */}
      <GoogleReviews max={6} heading="What our guests say" />

      {/* CTA */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl italic text-primary mb-6">
            "Life is better on the water!"
          </blockquote>
          <p className="text-lg text-muted-foreground mb-8">
            First time on a board or fiftieth float, come hang out with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/locations">Book a Floating Session</Link>
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
