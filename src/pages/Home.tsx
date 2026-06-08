import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { Instagram, Facebook, Music2 } from "lucide-react";
import heroImage from "/images/hero-floating-soundbath.webp";
import LocationFinder from "@/components/LocationFinder";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-8">
      <Head>
        <title>Floating Soundbaths in Arizona | Desert Paddleboards</title>
        <meta
          name="description"
          content="Float weightlessly as live sound washes over you. Find a floating soundbath near you across Phoenix, Mesa, Scottsdale, Tempe and more — and book online."
        />
      </Head>

      {/* Hero */}
      <section className="grid items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={heroImage}
            alt="Floating soundbath at sunset"
            className="h-full w-full min-h-[320px] object-cover"
          />
        </div>
        <div className="flex flex-col justify-center space-y-5 rounded-2xl bg-cyan-50 p-8">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Desert Paddleboards
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Floating soundbaths across Arizona
            </h1>
            <p className="text-muted-foreground">
              Float weightlessly on the water as live sound washes over you. Find
              the experience nearest you and book in a few taps.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#finder"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Find a session near you
            </a>
            <Link to="/locations">
              <span className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted">
                Browse all experiences
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <a
              href="https://www.instagram.com/desertpaddleboards/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/desertpaddleboards"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </a>
            <a
              href="https://www.tiktok.com/@desertpaddleboards"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Music2 className="h-4 w-4" />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </section>

      {/* Map + live sessions finder */}
      <LocationFinder />
    </div>
  );
}
