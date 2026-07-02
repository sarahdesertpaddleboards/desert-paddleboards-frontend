/**
 * /airstream — STANDALONE hidden minisite for the BLUE WAVE MOBILE WELLNESS
 * LOUNGE: a luxury Airstream *event activation* (not an overnight stay) for
 * corporate events, conferences, retreats, resorts and private gatherings,
 * available across Arizona & Southern California.
 *
 * Deliberately self-contained: it does NOT render inside the Desert Paddleboards
 * <Layout> (no shared Header/Footer/nav), so it reads as its own brand and is
 * fully decoupled from the main DPB pages. It is a sibling top-level route in
 * App.tsx and is NOT linked from the DPB nav/footer — i.e. "hidden" but live and
 * pre-rendered at build time, so it's SEO-indexable on the trusted domain.
 *
 * Booking model = inquiry-led. This is a high-touch premium service, so the
 * inquiry form (→ sarah@ via Web3Forms) is the single primary CTA. The previous
 * Airbnb / overnight-stay framing was retired with the rebrand.
 *
 * Photos (public/airstream/): hero.jpg, interior.jpg, exterior.jpg, detail.jpg —
 * the four professionally-edited golden-hour shots.
 */
import { useState } from "react";
import {
  MapPin,
  Wind,
  Music,
  Sparkles,
  Briefcase,
  Mic,
  Waves,
  Sun,
  Star,
  Flower2,
  Heart,
  Snowflake,
  Sofa,
  Users,
  Building2,
  Tent,
  PartyPopper,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Clapperboard,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { submitWeb3Form } from "@/lib/web3forms";
import { SITE_URL } from "@/data/site";

/* ─────────────────────────────────────────────────────────────────────────
 * BRAND — single source of truth. Confirm contact details with Sarah.
 * ────────────────────────────────────────────────────────────────────────*/
const BRAND = {
  name: "Blue Wave Mobile Wellness Lounge",
  short: "Mobile Wellness Lounge",
  company: "Blue Wave Experiences",
  tagline:
    "Transform any corporate event, conference, retreat, resort, or private gathering into a premium wellness experience.",
  areas: "Arizona & Southern California",
  email: "sarah@desertpaddleboards.com",
  phoneDisplay: "(602) 456-0884",
  phoneHref: "+16024560884",
};

/* Photos — the four professionally-edited (golden-hour) shots, plus the
 * awning + crystal sound-bowls set-up (featured in the Experiences section). */
const HERO_IMG = "/airstream/hero.jpg";
const SPACE_IMG = "/airstream/interior.jpg";
const SOUNDBOWLS_IMG = "/airstream/soundbowls.jpg";

const PHOTOS: { src: string; alt: string; wide?: boolean }[] = [
  { src: "/airstream/hero.jpg", alt: "The Blue Wave lounge and fire pit set up at twilight", wide: true },
  { src: "/airstream/exterior.jpg", alt: "The polished Airstream lounge against a desert sunset" },
  { src: "/airstream/interior.jpg", alt: "Warm, climate-controlled interior of the wellness lounge at sunset" },
  { src: "/airstream/detail.jpg", alt: "Curated styling detail on the lounge deck" },
];

/* One lounge, many roles. */
const CONFIGURATIONS = [
  {
    icon: Sparkles,
    title: "VIP hospitality suite",
    body: "An elevated space to host your most important guests, sponsors and partners away from the crowd.",
  },
  {
    icon: Briefcase,
    title: "Executive retreat space",
    body: "An intimate, distraction-free setting for leadership conversations, strategy and connection.",
  },
  {
    icon: Mic,
    title: "Speaker & talent green room",
    body: "A calm, private place for speakers and talent to prepare, recharge and reset between sessions.",
  },
  {
    icon: Waves,
    title: "Wellness lounge",
    body: "A dedicated recovery space where guests can step away, breathe and genuinely relax.",
  },
  {
    icon: Star,
    title: "Branded activation",
    body: "A head-turning, fully brandable centrepiece that makes your activation impossible to miss.",
  },
];

/* Signature offerings the lounge can be paired with (Blue Wave Experiences). */
const EXPERIENCES = [
  { icon: Waves, label: "Floating sound baths" },
  { icon: Flower2, label: "Guided meditation" },
  { icon: Wind, label: "Breathwork" },
  { icon: Music, label: "Live music" },
  { icon: Heart, label: "Corporate wellness programming" },
];

/* Ideal for. */
const IDEAL_FOR = [
  { icon: Briefcase, label: "Corporate retreats & off-sites" },
  { icon: Building2, label: "Conferences & trade shows" },
  { icon: Sun, label: "Resort activations" },
  { icon: Users, label: "Executive leadership events" },
  { icon: Mic, label: "Speaker & talent green rooms" },
  { icon: PartyPopper, label: "Employee appreciation events" },
  { icon: Tent, label: "Wellness festivals & community events" },
  { icon: Clapperboard, label: "Film & TV production sets" },
];

/** Image that falls back to a soft placeholder if the file isn't there. */
function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200 text-teal-400 ${className ?? ""}`}
      >
        <Waves className="h-8 w-8" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setErrored(true)} className={className} />;
}

export default function Airstream() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    date: "",
    location: "",
    eventType: "",
    guests: "",
    programming: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const reset = () =>
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      date: "",
      location: "",
      eventType: "",
      guests: "",
      programming: "",
      message: "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const subject = `Mobile Wellness Lounge inquiry${form.company ? ` — ${form.company}` : form.eventType ? ` — ${form.eventType}` : ""}`;
    const result = await submitWeb3Form({
      subject,
      from_name: "Blue Wave Mobile Wellness Lounge website",
      replyto: form.email,
      name: form.name,
      company: form.company || "—",
      email: form.email,
      phone: form.phone || "—",
      event_date: form.date || "—",
      event_location: form.location || "—",
      event_type: form.eventType || "—",
      estimated_guests: form.guests || "—",
      wellness_programming: form.programming || "—",
      message: form.message || "—",
    });

    setSubmitting(false);

    if (result.success) {
      toast.success("Thanks — your inquiry is on its way to the Blue Wave team. We'll reply within one business day.");
      reset();
    } else {
      const body = encodeURIComponent(
        `Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nPhone: ${form.phone}\nEvent date: ${form.date}\nLocation: ${form.location}\nEvent type: ${form.eventType}\nGuests: ${form.guests}\nWellness programming: ${form.programming}\n\n${form.message}`,
      );
      window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
      toast("Opening your email app to send the inquiry…");
    }
  };

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: BRAND.name,
    serviceType: "Mobile wellness lounge & event activation",
    description: BRAND.tagline,
    url: `${SITE_URL}/airstream`,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Arizona" },
      { "@type": "AdministrativeArea", name: "Southern California" },
    ],
    provider: {
      "@type": "Organization",
      name: BRAND.company,
      url: SITE_URL,
      telephone: `+${BRAND.phoneHref.replace(/\D/g, "")}`,
      email: BRAND.email,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Seo
        title={`Airstream Corporate Wellness Lounge for Hire | ${BRAND.areas}`}
        description={`A luxury Airstream mobile wellness lounge available for corporate events, conferences, executive retreats, film & TV production sets, resort activations and private gatherings across ${BRAND.areas}. Pair with floating sound baths, meditation and breathwork.`}
        image={HERO_IMG}
      />
      <JsonLd data={serviceLd} />
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="flex flex-col leading-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Blue Wave</span>
            <span className="font-serif text-lg font-semibold">Mobile Wellness Lounge</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-slate-600 lg:flex">
            <a href="#concept" className="hover:text-slate-900">The Concept</a>
            <a href="#configurations" className="hover:text-slate-900">Configurations</a>
            <a href="#experiences" className="hover:text-slate-900">Experiences</a>
            <a href="#gallery" className="hover:text-slate-900">Gallery</a>
            <a href="#inquire" className="hover:text-slate-900">Inquire</a>
          </nav>
          <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
            <a href="#inquire">Inquire</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <Photo
          src={HERO_IMG}
          alt={`${BRAND.name} at twilight`}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-900/35" />
        {/* Right-edge shadow — keeps the eye on the lounge and quietly suppresses
            the bit of neighbouring yard visible past the right-hand chair. */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/60 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 py-28 md:py-36">
          <div className="max-w-2xl text-slate-50">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <MapPin className="h-3.5 w-3.5" /> Available across {BRAND.areas}
            </div>
            <p className="font-semibold uppercase tracking-[0.22em] text-teal-300">Blue Wave</p>
            <h1 className="mt-2 text-balance font-serif text-4xl font-bold leading-tight md:text-6xl">
              Airstream Mobile Wellness Lounge
            </h1>
            <p className="mt-5 text-lg text-slate-200 md:text-xl">{BRAND.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                <a href="#inquire">
                  Inquire about the lounge <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a href="#concept">Explore the experience</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Concept intro */}
      <section id="concept" className="mx-auto max-w-3xl px-5 py-20 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          A place to recharge, connect & reset
        </span>
        <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
          A luxury Airstream activation, reimagined for wellness
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          Our Mobile Wellness Lounge is a luxury Airstream activation designed to give guests a
          place to recharge, connect, and reset. Whether serving as a VIP hospitality suite,
          executive retreat space, speaker green room, wellness lounge, or branded activation, the
          lounge creates a memorable experience that stands out from traditional event spaces.
        </p>
      </section>

      {/* Configurations */}
      <section id="configurations" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              One lounge, many roles
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              Configure it for your event
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CONFIGURATIONS.map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-teal-700">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inside / Outside (the space) */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
        <Photo
          src={SPACE_IMG}
          alt="Warm, climate-controlled interior of the wellness lounge"
          className="aspect-[3/4] w-full rounded-2xl object-cover md:max-h-[560px]"
        />
        <div>
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Inside &amp; out</h2>
          <div className="mt-8 space-y-7">
            <div className="flex gap-4">
              <div className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Snowflake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Inside</h3>
                <p className="mt-1 text-sm text-slate-600">
                  A comfortable, climate-controlled environment designed for relaxation and
                  meaningful conversation — a calm escape from the buzz of the event floor.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Sofa className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Outside</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Curated lounge seating creates an inviting atmosphere for networking, recovery
                  and connection — an effortless gathering point that draws people in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences (pair with Blue Wave) */}
      <section id="experiences" className="bg-slate-900 text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <Photo
            src={SOUNDBOWLS_IMG}
            alt="Crystal singing sound bowls set up on the deck beneath the striped lounge awning"
            className="mx-auto w-full max-w-md rounded-2xl"
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Standalone or fully programmed
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              Pair it with Blue Wave Experiences
            </h2>
            <p className="mt-4 text-slate-300">
              Book the lounge as a standalone hospitality space, or pair it with Blue Wave
              Experiences&rsquo; signature wellness offerings — from crystal sound bowls to
              breathwork — for a fully programmed moment your guests won&rsquo;t forget.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {EXPERIENCES.map((x) => (
                <div
                  key={x.label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-4"
                >
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300">
                    <x.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{x.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ideal for */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Where it shines
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">Ideal for</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IDEAL_FOR.map((i) => (
            <div key={i.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <i.icon className="h-5 w-5 shrink-0 text-teal-700" />
              <span className="text-sm font-medium text-slate-700">{i.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Gallery</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {PHOTOS.map((p) => (
              <Photo
                key={p.src}
                src={p.src}
                alt={p.alt}
                className={`w-full rounded-xl object-cover ${p.wide ? "col-span-2 aspect-[3/2] md:col-span-3 md:aspect-[3/1]" : "aspect-[3/4]"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Availability strip */}
      <section className="border-y border-slate-200 bg-teal-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-5 py-6 text-center text-teal-900">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Available throughout Arizona &amp; Southern California</span>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquire" className="mx-auto max-w-3xl px-5 py-20">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Bring the lounge to your event</h2>
          <p className="mt-4 text-slate-600">
            Tell us about your event and we&rsquo;ll come back within one business day with
            availability, options and a quote.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company / organisation</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Event date(s)</Label>
              <Input id="date" placeholder="e.g. Mar 10–12" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Event location / venue</Label>
              <Input id="location" placeholder="City or venue" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Event type</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {IDEAL_FOR.map((i) => (
                    <SelectItem key={i.label} value={i.label}>
                      {i.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="Private gathering">Private gathering</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guests">Estimated guests</Label>
              <Input id="guests" placeholder="e.g. 150" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Wellness programming</Label>
            <Select value={form.programming} onValueChange={(v) => setForm({ ...form, programming: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Lounge only, or paired with wellness?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lounge only">Lounge only</SelectItem>
                <SelectItem value="Lounge + wellness programming">Lounge + wellness programming</SelectItem>
                <SelectItem value="Not sure yet — tell me more">Not sure yet — tell me more</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Tell us about your event</Label>
            <Textarea id="message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
            {submitting ? "Sending…" : "Send inquiry"}
          </Button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5" /> Goes straight to the Blue Wave team · no obligation
          </p>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Blue Wave</p>
            <p className="font-serif text-lg font-semibold">Mobile Wellness Lounge</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> {BRAND.areas}
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-600">
            <a href={`mailto:${BRAND.email}`} className="hover:text-slate-900">{BRAND.email}</a>
            <a href={`tel:${BRAND.phoneHref}`} className="hover:text-slate-900">{BRAND.phoneDisplay}</a>
            <a href="#inquire" className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800">
              <CalendarDays className="h-3.5 w-3.5" /> Inquire about your event
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
