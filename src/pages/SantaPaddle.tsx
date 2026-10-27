import { Link } from "react-router-dom";
import { Calendar, Camera, Clock, Dog, MapPin, Shirt, Sticker, Users } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import FareHarborButton, { useFareHarborEmbed } from "@/components/FareHarborButton";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL } from "@/data/site";

/**
 * /santa-paddle — our free December community paddle on Tempe Town Lake.
 * RSVP goes through FareHarbor (item 146502, free) so we can send updates.
 * The same date is a featured event in city-classes.json, so it also shows
 * on the homepage and /community-events.
 */

const SANTA_ITEM_ID = 146502;
const EVENT = {
  dateLabel: "Saturday, December 12",
  timeLabel: "10:00 AM – 12:00 PM",
  startIso: "2026-12-12T10:00:00-07:00",
  endIso: "2026-12-12T12:00:00-07:00",
};

const hero = {
  src: "/santa-paddle/santas-under-bridge.jpg",
  alt: "Paddlers dressed as Santa and elves on paddleboards under the Mill Avenue bridge on Tempe Town Lake",
};

const photos = [
  { src: "/santa-paddle/santa-and-dog.jpg", alt: "A Santa, Mrs. Claus and a golden retriever in a Santa suit by Tempe Town Lake" },
  { src: "/santa-paddle/paddlers-mill-ave-bridge.jpg", alt: "A crowd of paddleboarders in holiday costumes on Tempe Town Lake" },
  { src: "/santa-paddle/kayak-with-dog.jpg", alt: "A paddler in a Santa hat in a red kayak with a dog in an elf sweater" },
  { src: "/santa-paddle/kayak-and-paddleboard.jpg", alt: "An elf on a paddleboard next to a kayaker on Tempe Town Lake" },
];

const expect = [
  { icon: Users, text: "An easy, social group paddle around Tempe Town Lake. Not a race. All ages welcome." },
  { icon: Shirt, text: "Holiday costumes encouraged. The more ridiculous the better." },
  { icon: Dog, text: "Dogs welcome on a leash (and in antlers, ideally)." },
  { icon: Camera, text: "Lots of photo ops under the bridges." },
  { icon: Sticker, text: "Santa Paddle stickers for sale on the day." },
];

export default function SantaPaddle() {
  useFareHarborEmbed();

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Community Events", path: "/community-events" },
      { name: "Santa Paddle", path: "/santa-paddle" },
    ]),
    {
      "@type": "Event",
      name: "Santa Paddle on Tempe Town Lake",
      description:
        "A free holiday paddleboard and kayak meetup on Tempe Town Lake. Costumes encouraged, dogs on leashes welcome. Bring your own board or kayak.",
      startDate: EVENT.startIso,
      endDate: EVENT.endIso,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      image: [`${SITE_URL}${hero.src}`],
      location: {
        "@type": "Place",
        name: "Tempe Town Lake Marina",
        address: {
          "@type": "PostalAddress",
          streetAddress: "550 E Tempe Town Lake",
          addressLocality: "Tempe",
          addressRegion: "AZ",
          postalCode: "85288",
          addressCountry: "US",
        },
      },
      organizer: { "@type": "Organization", name: "Desert Paddleboards", url: SITE_URL },
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "USD",
        url: `${SITE_URL}/santa-paddle`,
        availability: "https://schema.org/InStock",
      },
    },
  ]);

  const rsvpClass =
    "inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90";

  return (
    <main>
      <Seo
        title="Santa Paddle 2026 | Free Holiday Paddle, Tempe Town Lake"
        description="Santas, elves and dogs in antlers on paddleboards and kayaks. Free holiday paddle on Tempe Town Lake, Saturday December 12, 10am. RSVP free."
        image={hero.src}
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden bg-muted">
        <img src={hero.src} alt={hero.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/40 to-transparent" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              Free · {EVENT.dateLabel} · Tempe Town Lake
            </p>
            <h1 className="mt-2 max-w-3xl text-balance text-4xl italic leading-tight md:text-6xl">
              The Santa Paddle
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/90 md:text-lg">
              Dress up. Show up. Paddle into holiday chaos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <FareHarborButton itemId={SANTA_ITEM_ID} className={rsvpClass}>
                RSVP free
              </FareHarborButton>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Tempe+Town+Lake+Marina"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/80 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                Get directions
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container space-y-16 py-14">
        {/* Key facts */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <Calendar className="h-6 w-6 text-brand" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">When</h2>
            <p className="mt-1 text-lg font-semibold">{EVENT.dateLabel}</p>
            <p className="text-muted-foreground">{EVENT.timeLabel}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <MapPin className="h-6 w-6 text-brand" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Where</h2>
            <p className="mt-1 text-lg font-semibold">Tempe Town Lake Marina</p>
            <p className="text-muted-foreground">North side · 550 E Tempe Town Lake</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Clock className="h-6 w-6 text-brand" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Cost</h2>
            <p className="mt-1 text-lg font-semibold">Free</p>
            <p className="text-muted-foreground">RSVP so we can send you updates</p>
          </div>
        </section>

        {/* About */}
        <section className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl italic">What it is</h2>
            <p className="text-muted-foreground">
              Every December we take over Tempe Town Lake with a fleet of Santas,
              elves, reindeer and Mrs. Clauses on paddleboards and kayaks. Bring
              your own board, put on the silliest costume you own, and float the
              lake with a few hundred new friends.
            </p>
            <ul className="space-y-3 pt-2">
              {expect.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 rounded-2xl bg-brand/10 p-6 md:p-8">
            <h2 className="text-2xl italic">What to bring</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Your own paddleboard or kayak, and a paddle</li>
              <li>A life jacket (required by law on the lake)</li>
              <li>A holiday costume, for you and the dog</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Arrive by 9:45 so you're on the water at 10. We meet on the hill
              by the boat marina on the north side of the lake.
            </p>
            <p className="text-sm text-muted-foreground">
              No board? Text us at{" "}
              <a href="sms:6024560884" className="font-semibold text-brand-dark underline underline-offset-2">
                602.456.0884
              </a>{" "}
              and we'll point you to a rental.
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section className="space-y-6">
          <h2 className="text-3xl italic">Santa Paddles past</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {photos.map((p) => (
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-brand-dark p-8 text-center text-white md:p-12">
          <h2 className="text-3xl italic md:text-4xl">See you on the lake, Santa</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            It's free. RSVP so we know you're coming and can send you any
            weather or meeting-spot updates.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <FareHarborButton
              itemId={SANTA_ITEM_ID}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark hover:bg-white/90"
            >
              RSVP free
            </FareHarborButton>
            <Link
              to="/community-events"
              className="inline-flex items-center justify-center rounded-full border border-white/80 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              More community events
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
