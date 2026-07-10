import { Link } from "react-router-dom";
import {
  Palette,
  Building2,
  GraduationCap,
  Sparkles,
  Waves,
  Truck,
  PenTool,
  CheckCircle2,
} from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";

// On-brand hero. Swap for a photo of an actual custom / branded board (e.g. the
// green-design boards from the first custom order) when one is available.
const heroImage = "/floating-boards-sunset.jpg";

const QUOTE_LINK = "/contact?subject=Custom%20boards";

const whoFor = [
  {
    icon: Building2,
    title: "Businesses & brands",
    body: "Corporate events, activations and unforgettable branded gifts that literally float your logo out on the water.",
  },
  {
    icon: Waves,
    title: "Studios, gyms & resorts",
    body: "Your own signature branded fleet for classes, guests and amenities — a premium experience that's unmistakably yours.",
  },
  {
    icon: GraduationCap,
    title: "Aspiring instructors & entrepreneurs",
    body: "Everything you need to start your own floating soundbath or paddleboard-yoga classes — boards and the know-how to run them.",
  },
];

const included = [
  "Custom artwork and branding, printed edge-to-edge on premium wide yoga & fitness boards",
  "Pumps, accessories and branded packaging available",
  "A design mock-up to approve before anything is made — no surprises",
  "Guidance from a working operator: Sarah runs floating experiences at 30+ venues across Arizona",
];

const steps = [
  {
    icon: PenTool,
    title: "Tell us your vision",
    body: "Your brand, style, quantity, and where you'll use them. We'll talk through what's possible and send a quote.",
  },
  {
    icon: Palette,
    title: "We design & mock it up",
    body: "Our team turns your logo or artwork into a board design you approve before production begins.",
  },
  {
    icon: Sparkles,
    title: "We manufacture your boards",
    body: "Your boards are made to spec with durable, UV-stable printing built for the water.",
  },
  {
    icon: Truck,
    title: "Delivered to you",
    body: "Shipped to your door — or drop-shipped straight to your event or venue. Typical timeline about 4–8 weeks.",
  },
];

export default function CustomBoards() {
  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Custom Boards", path: "/custom-boards" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Custom & Branded Paddleboards and Floating Mats",
      serviceType: "Custom paddleboard design & manufacturing",
      provider: { "@type": "Organization", name: business.name, url: SITE_URL },
      areaServed: "United States",
      description:
        "Custom-designed, branded paddleboards and floating mats for businesses, studios, resorts and aspiring instructors — plus help launching your own floating soundbath or paddleboard-yoga experience.",
    },
  ]);

  return (
    <main>
      {/* Unlisted while in preview: noindex + no nav/footer/home links yet.
          To launch: remove `noindex`, add nav/footer/shop links, and drop the
          sitemap exclusion in scripts/generate-sitemap.mjs. */}
      <Seo
        noindex
        title="Custom &amp; Branded Paddleboards | Desert Paddleboards"
        description="We design and manufacture custom, branded paddleboards and floating mats for businesses, studios and resorts — and help you launch your own floating soundbath or paddleboard-yoga experience."
        image={heroImage}
      />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <div className="relative h-[46vh] min-h-[360px] w-full overflow-hidden bg-muted">
        <img
          src={heroImage}
          alt="Custom-designed floating boards on the water at sunset"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/55" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              For businesses · studios · aspiring instructors
            </p>
            <h1 className="mt-2 max-w-3xl text-balance text-4xl italic leading-tight md:text-5xl">
              Custom &amp; branded boards
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/90">
              Did you know we design and manufacture our own paddleboards and
              floating mats? Put your brand on the water — and we'll help you get
              started.
            </p>
            <Link
              to={QUOTE_LINK}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Get a custom quote →
            </Link>
          </div>
        </div>
      </div>

      <div className="container space-y-16 py-14">
        {/* Intro */}
        <section className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Design &amp; manufacturing
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Beyond running floating soundbaths across Arizona, we design and
            build custom boards — so you can put your brand on the water, outfit
            your studio or resort with a signature fleet, or launch your very own
            floating soundbath or paddleboard-yoga business. Boards and brains,
            done with you.
          </p>
        </section>

        {/* Who it's for */}
        <section className="space-y-8">
          <h2 className="text-3xl italic">Who it's for</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {whoFor.map((item) => (
              <div
                key={item.title}
                className="space-y-3 rounded-2xl border border-border bg-card p-6"
              >
                <item.icon className="h-7 w-7 text-brand" />
                <h3 className="text-lg font-semibold not-italic">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-brand" />
              <h2 className="text-2xl italic">What you get</h2>
            </div>
            <ul className="space-y-3">
              {included.map((line) => (
                <li key={line} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-brand" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Start your own */}
          <div className="space-y-4 rounded-2xl bg-brand/10 p-8">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-brand" />
              <h2 className="text-2xl italic">Start your own floating business</h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              The floating soundbath and paddleboard-yoga wave is just getting
              started. We'll design your boards <em>and</em> help you launch —
              training, a simple playbook, and the know-how to run experiences
              your community will line up for.
            </p>
            <Link
              to={QUOTE_LINK}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Tell us your idea →
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-8">
          <h2 className="text-3xl italic">How it works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="space-y-3 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {i + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-base font-semibold not-italic">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-dark px-8 py-10 text-center text-white">
          <h2 className="text-3xl italic">Let's design your boards</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Tell us what you have in mind — your brand, how you'll use them, and
            roughly how many — and we'll come back with ideas and a quote.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={QUOTE_LINK}
              className="inline-flex items-center justify-center rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Get a custom quote
            </Link>
            <a
              href="tel:6024560884"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Or call 602.456.0884
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
