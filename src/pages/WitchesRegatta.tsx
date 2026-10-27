import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Download, Facebook, Gift, Instagram, Pause, Play } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import FareHarborButton, { useFareHarborEmbed } from "@/components/FareHarborButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { trackEvent } from "@/lib/analytics";

/**
 * /witches-regatta — the 2026 recap: drone + camera montage, a photo
 * carousel, Sarah's reels/posts, and a push to the next free event (the
 * Santa Paddle). Built so the recap email can link here instead of a
 * Dropbox folder.
 *
 * Photos are 1600px WebP (~90KB) with 640px "-sm" variants in
 * public/witches-regatta-2026/; the montage is a silent 720p loop. Sarah
 * wants people to keep their photos, so the full-size JPGs live in
 * download/ (one per slide) plus a zip of all of them.
 */

const SANTA_ITEM_ID = 146502;
const DIR = "/witches-regatta-2026";

const ZIP = { href: `${DIR}/witches-regatta-2026-photos.zip`, label: "Download all 30 photos (19MB)" };

const video = { src: `${DIR}/montage.mp4`, poster: `${DIR}/montage-poster.jpg` };

// [file number, landscape?, alt]
const photos: [string, boolean, string][] = [
  ["01", false, "Three pugs in orange life jackets sitting on a paddleboard"],
  ["02", false, "Two paddlers in witch costumes walking a dog along the Tempe Town Lake path"],
  ["03", false, "Sarah from Desert Paddleboards smiling with her pug at the Witches Regatta"],
  ["04", false, "A witch carrying her paddleboard down to the lake"],
  ["05", false, "A mother and daughter in pink witch hats and tutus by the lake"],
  ["06", false, "A witch in a green tutu walking her husky down the dock"],
  ["07", false, "A witch and a young paddler in a life jacket carrying boards to the water"],
  ["08", false, "A grinning witch with purple braids in a bright life jacket"],
  ["09", true, "Witches carrying paddleboards along the dock"],
  ["10", false, "A coven of witches with paddles laughing before launch"],
  ["11", false, "Three witches holding paddles on the grass by the lake"],
  ["12", false, "A witch carrying two paddleboards on the dock at golden hour"],
  ["13", true, "Witches on paddleboards and kayaks on Tempe Town Lake"],
  ["14", true, "Two witches kayaking side by side"],
  ["15", true, "A paddler in a skull mask and cloak on a paddleboard"],
  ["16", true, "A witch with a mermaid tail sitting on her paddleboard"],
  ["17", true, "A witch in a purple skirt paddling past the Tempe skyline"],
  ["18", true, "A witch standing on a paddleboard with a dog in a witch cape"],
  ["19", false, "A witch standing on her paddleboard on the open lake"],
  ["20", false, "A witch and a small witch on one paddleboard with yellow paddles"],
  ["21", false, "A witch paddling a stand-up board in the shallows"],
  ["22", false, "Two witches posing with flowing capes by the lake"],
  ["23", false, "Two witches in striped stockings and tutus clowning for the camera"],
  ["24", true, "A witch and two young witches sitting on the lake wall"],
  ["25", true, "Witches on a dock at sunset with paddleboards on the lake"],
  ["26", true, "A paddleboarder silhouetted against the sunset on Tempe Town Lake"],
  ["27", false, "Three witches on the dock at dusk"],
  ["28", true, "A witch kneeling on her paddleboard in the sunset glow"],
  ["29", true, "Paddlers silhouetted on the lake as the sun sets behind Tempe"],
  ["30", false, "A witch in a lace hat silhouetted against the sunset"],
];

const social = [
  {
    icon: Instagram,
    label: "Watch Sarah's reel on Instagram",
    href: "https://www.instagram.com/p/De-nrpmRi-v/",
  },
  {
    icon: Instagram,
    label: "And another reel on Instagram",
    href: "https://www.instagram.com/p/De-Sb4DS3br/",
  },
  {
    icon: Facebook,
    label: "Photos on Facebook (tag yourself!)",
    href: "https://www.facebook.com/photo.php?fbid=1719551743503328&set=pb.100063455574148.-2207520000&type=3",
  },
];

function MontageVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Start muted autoplay from the client (React doesn't SSR the `muted`
  // attribute, and we skip autoplay entirely for reduced-motion users).
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        loop
        playsInline
        preload="metadata"
        aria-label="Highlights from the 2026 Witches Regatta: drone and on-the-water footage"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </>
  );
}

function PhotoCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="mx-auto md:px-12">
      <CarouselContent>
        {photos.map(([n, landscape, alt], i) => (
          <CarouselItem key={n} className="relative basis-auto">
            <img
              src={`${DIR}/${n}-sm.webp`}
              srcSet={`${DIR}/${n}-sm.webp 640w, ${DIR}/${n}.webp 1600w`}
              sizes={landscape ? "(min-width: 768px) 690px, 80vw" : "(min-width: 768px) 307px, 53vw"}
              width={landscape ? 1600 : 1066}
              height={landscape ? 1066 : 1600}
              alt={alt}
              loading={i < 3 ? "eager" : "lazy"}
              decoding="async"
              className={`h-[60vw] max-h-[460px] w-auto rounded-xl bg-muted object-cover ${
                landscape ? "aspect-[3/2]" : "aspect-[2/3]"
              }`}
            />
            <a
              href={`${DIR}/download/witches-regatta-2026-${n}.jpg`}
              download
              onClick={() => trackEvent("photo_download", { event: "witches_regatta_2026", photo: n })}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-brand-dark shadow hover:bg-white"
              aria-label={`Download photo ${Number(n)}: ${alt}`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-1 bg-white/90 md:left-0" />
      <CarouselNext className="right-1 bg-white/90 md:right-0" />
      <p className="mt-3 text-center text-sm text-muted-foreground" aria-live="polite">
        {current} / {photos.length} · swipe or use the arrows
      </p>
    </Carousel>
  );
}

export default function WitchesRegatta() {
  useFareHarborEmbed();

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Community Events", path: "/community-events" },
      { name: "Witches Regatta 2026", path: "/witches-regatta" },
    ]),
  ]);

  const santaPrimary =
    "inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90";

  return (
    <main>
      <Seo
        title="Witches Regatta 2026 Photos & Video | Tempe Town Lake"
        description="Photos and a drone video from the 10th Witches Regatta on Tempe Town Lake. Find yourself, tag your coven, and RSVP free for the Santa Paddle on Dec 12."
        image={`${DIR}/25.webp`}
      />
      <JsonLd data={structuredData} />

      {/* Hero: montage */}
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-brand-dark">
        <MontageVideo />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/30 to-transparent" />
        <div className="pointer-events-none relative z-10 flex h-full items-end">
          <div className="container pb-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              Saturday, October 24, 2026 · Tempe Town Lake
            </p>
            <h1 className="mt-2 max-w-3xl text-balance text-4xl italic leading-tight md:text-6xl">
              Witches Regatta 2026
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/90 md:text-lg">
              Ten years, hundreds of witches, one very spooky lake. Thank you for flying with us.
            </p>
            <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
              <a
                href="#photos"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark hover:bg-white/90"
              >
                See the photos
              </a>
              <a
                href="#santa-paddle"
                className="inline-flex items-center justify-center rounded-full border border-white/80 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Gift className="mr-2 h-4 w-4" aria-hidden="true" />
                Next up: Santa Paddle
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container space-y-16 py-14">
        {/* Photos */}
        <section id="photos" className="scroll-mt-24 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl italic">Find yourself on the lake</h2>
            <p className="mt-2 text-muted-foreground">
              A few favourites from the dock, the water and that sunset. They're
              yours to keep: hit Download on any photo, or grab the lot. Share
              them and tag us{" "}
              <a
                href="https://www.instagram.com/desertpaddleboards/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-dark underline underline-offset-2"
              >
                @desertpaddleboards
              </a>
              .
            </p>
          </div>
            <a
              href={ZIP.href}
              download
              onClick={() => trackEvent("photo_download", { event: "witches_regatta_2026", photo: "all" })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {ZIP.label}
            </a>
          </div>
          <PhotoCarousel />
        </section>

        {/* Santa Paddle CTA */}
        <section
          id="santa-paddle"
          className="scroll-mt-24 overflow-hidden rounded-3xl bg-brand-dark text-white md:grid md:grid-cols-2"
        >
          <img
            src="/santa-paddle/sarah-and-dog-santa.webp"
            alt="Sarah in a Santa dress on her paddleboard with her golden retriever in a Santa suit on Tempe Town Lake"
            loading="lazy"
            className="h-80 w-full object-cover object-[center_35%] md:h-full"
          />
          <div className="p-8 md:p-12">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Next up · Sat Dec 12 · 10am · Free
            </p>
            <h2 className="mt-3 text-3xl italic md:text-4xl">Swap the broomstick for a sleigh</h2>
            <p className="mt-3 text-white/85">
              Our next free community paddle is the Santa Paddle on Tempe Town
              Lake: Santas, elves, reindeer and dogs in antlers on paddleboards
              and kayaks, flying across the lake in formation. Same lake, same
              crew, more tinsel. RSVP so we can send you meeting-spot and
              weather updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <FareHarborButton
                itemId={SANTA_ITEM_ID}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark hover:bg-white/90"
              >
                RSVP free for the Santa Paddle
              </FareHarborButton>
              <Link
                to="/santa-paddle"
                className="inline-flex items-center justify-center rounded-full border border-white/80 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Event details
              </Link>
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="space-y-3">
            <h2 className="text-3xl italic">More from the day</h2>
            <p className="text-muted-foreground">
              Watch Sarah's reels with the sound on, and tag yourself and your
              coven in the Facebook photos.
            </p>
          </div>
          <ul className="space-y-3">
            {social.map(({ icon: Icon, label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 font-semibold hover:border-brand"
                >
                  <Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Story + next year */}
        <section className="rounded-3xl bg-brand/10 p-8 text-center md:p-12">
          <h2 className="text-2xl italic md:text-3xl">See you next October</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            The Witches Regatta is free and open to anyone, every October since
            2017. Read how a handful of us in pointy hats turned into hundreds.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/blog/witches-regatta" className={santaPrimary}>
              The Witches Regatta story
            </Link>
            <Link
              to="/community-events"
              className="inline-flex items-center justify-center rounded-full border border-brand-dark px-7 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-dark/5"
            >
              More community events
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
