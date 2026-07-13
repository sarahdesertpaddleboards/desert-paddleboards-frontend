import { useState } from "react";
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
import { toast } from "sonner";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";
import { submitWeb3Form } from "@/lib/web3forms";
import { trackEvent } from "@/lib/analytics";

// On-brand hero. Swap for a photo of an actual custom / branded board when a
// hero-worthy one is available.
const heroImage = "/floating-boards-sunset.jpg";

// Real custom work — a fully branded fleet we designed & built.
const gallery = [
  {
    src: "/custom-boards/branded-board-dogtopia.jpg",
    alt: "A custom-branded inflatable board with a full-color logo and lettering printed edge-to-edge",
    caption: "Your brand, printed edge-to-edge",
  },
  {
    src: "/custom-boards/branded-fleet-in-use.jpg",
    alt: "A branded paddleboard fleet in use at the beach, one with a dog aboard",
    caption: "A branded fleet, out in the world",
  },
];

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
  "Your logo, wording and colors — designed and mocked up for your approval before anything is made",
  "Pumps, accessories and branded packaging available",
  "Guidance from a working operator: Sarah runs floating experiences at 30+ venues across Arizona",
];

const steps = [
  {
    icon: PenTool,
    title: "Tell us your vision",
    body: "Your logo, wording, colors and how many boards you need. Send the quick form below and we'll follow up.",
  },
  {
    icon: Palette,
    title: "We design & mock it up",
    body: "Our team turns your logo and artwork into a board design you approve before production begins.",
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

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  quantity: "",
  colors: "",
  boardText: "",
  message: "",
};

export default function CustomBoards() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const subject = `Custom boards quote request${form.company ? ` — ${form.company}` : ""}`;
    const payload = {
      subject,
      from_name: "Desert Paddleboards website",
      replyto: form.email,
      name: form.name,
      email: form.email,
      phone: form.phone || "—",
      company: form.company || "—",
      number_of_boards: form.quantity || "—",
      preferred_colors: form.colors || "—",
      board_text: form.boardText || "—",
      message: form.message || "—",
    };

    const result = await submitWeb3Form(payload);
    setSubmitting(false);

    if (result.success) {
      trackEvent("generate_lead", { form: "custom-boards" });
      toast.success(
        "Thanks! Your quote request has been sent — we'll reply within 24 hours. Have a logo? Reply to our email with it, or send it to sarah@desertpaddleboards.com.",
      );
      setForm(EMPTY);
      return;
    }

    // Fallback: open the visitor's mail client with everything pre-filled.
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "—"}`,
      `Company / organization: ${form.company || "—"}`,
      `Number of boards: ${form.quantity || "—"}`,
      `Preferred colors: ${form.colors || "—"}`,
      `Text / wording for the board: ${form.boardText || "—"}`,
      "",
      "Vision / notes:",
      form.message || "—",
      "",
      "(I'll attach my logo in this email.)",
    ].join("\n");
    window.location.href = `mailto:sarah@desertpaddleboards.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.message("Opening your email app so you can send your request directly…");
  }

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

  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <main>
      {/* Unlisted while in preview: noindex + no nav/homepage/footer links (only
          linked from the Shop). To fully launch: add nav/footer links, remove
          `noindex`, and drop the sitemap exclusion in generate-sitemap.mjs. */}
      <Seo
        noindex
        title="Custom &amp; Branded Paddleboards | Desert Paddleboards"
        description="We design and manufacture custom, branded paddleboards and floating mats for businesses, studios and resorts — order in bulk, put your logo on the water, and we'll help you get started."
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
              floating mats? Order in bulk, put your brand on the water — and
              we'll help you get started.
            </p>
            <a
              href="#quote"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Request a quote →
            </a>
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

        {/* Our work gallery */}
        <section className="space-y-6">
          <h2 className="text-3xl italic">Our work</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {gallery.map((g) => (
              <figure key={g.src} className="overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="h-72 w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
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
            <a
              href="#quote"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Tell us your idea →
            </a>
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

        {/* Quote request form */}
        <section id="quote" className="scroll-mt-24 rounded-2xl bg-brand-dark px-6 py-10 text-white sm:px-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl italic">Request a quote</h2>
            <p className="mt-2 text-white/85">
              Tell us what you have in mind and we'll come back with ideas and
              pricing — usually within 24 hours. Custom branding is available on
              orders of about 10 boards or more.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <input required value={form.name} onChange={set("name")} className={field} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email *</label>
                <input required type="email" value={form.email} onChange={set("email")} className={field} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input value={form.phone} onChange={set("phone")} className={field} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Company / organization</label>
                <input value={form.company} onChange={set("company")} className={field} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Number of boards *</label>
                <input
                  required
                  value={form.quantity}
                  onChange={set("quantity")}
                  placeholder="e.g. 10"
                  className={field}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Preferred colors</label>
                <input
                  value={form.colors}
                  onChange={set("colors")}
                  placeholder="e.g. teal, navy, orange"
                  className={field}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Text / wording for the board
                </label>
                <input
                  value={form.boardText}
                  onChange={set("boardText")}
                  placeholder="e.g. your tagline or event name"
                  className={field}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Your vision / anything else
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={set("message")}
                  className={field}
                />
              </div>

              <p className="text-xs text-white/70 sm:col-span-2">
                Have a logo? After you submit, just reply to our email with your
                logo file — or send it to{" "}
                <span className="font-medium text-white">sarah@desertpaddleboards.com</span>.
              </p>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? "Sending…" : "Send my request"}
                </button>
                <a
                  href="tel:6024560884"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 sm:ml-3 sm:mt-0 sm:w-auto"
                >
                  Or call 602.456.0884
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
