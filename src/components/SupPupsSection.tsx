import { Link } from "react-router-dom";

/**
 * SupPupsSection
 *
 * Goal: this is the FIRST thing a visitor sees on /shop — above "Float merch",
 * above the boards & gear grid, above everything.
 *
 * Uses the existing shadcn/tailwind design tokens already in the app
 * (bg-background, text-foreground, text-primary, border-border, container).
 * No new colour values are hard-coded except the dark panel, which is
 * intentionally distinct so the section reads as its own product line.
 *
 * Images live in /public/images/sup-pups/
 */

/**
 * Gallery. NOTE: the original brief also referenced board-underside.jpg,
 * board-rail.jpg and east-village-rail.jpg (the printed-surface detail shots).
 * Those photos weren't supplied, so those entries are omitted rather than
 * rendered as broken images — drop the files into /public/images/sup-pups/
 * and add them back here when they're available.
 */
/** Videos — titles taken from the YouTube uploads themselves. */
const CLIPS = [
  { id: "WOVI0_3TRYg", title: "SUP Pups Christmas Paddle" },
  { id: "KoGT7HWGMb0", title: "Paddleboarding with Dogs" },
];

const GALLERY = [
  { src: "/images/sup-pups/board-deck.jpg", alt: "Paddleboard deck printed with a dog daycare logo, tagline and mission line", caption: "Printed deck" },
  { src: "/images/sup-pups/delivery-day.jpg", alt: "Branded board bags delivered outside a dog daycare before opening day", caption: "Delivery day" },
  { src: "/images/sup-pups/branded-bandanas.jpg", alt: "Two golden retrievers in matching branded bandanas on a paddleboard", caption: "Matching bandanas" },
  { src: "/images/sup-pups/on-the-water.jpg", alt: "A large dog standing on a branded paddleboard on open water", caption: "Where the photos come from" },
];

export default function SupPupsSection() {
  return (
    <section
      aria-labelledby="sup-pups-heading"
      className="bg-[#0A1D26] text-white"
    >
      <div className="container py-16 md:py-24">
        {/* ---------- HERO ---------- */}
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DCC7A6]">
              For dog daycares &amp; multi-location pet brands
            </p>

            <h2
              id="sup-pups-heading"
              className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl"
            >
              SUP&nbsp;Pups
              <span className="mt-1 block text-[#FF5B33]">Branded Boards</span>
            </h2>

            <p className="mt-5 max-w-md text-lg text-[#C6D6DC]">
              We design and manufacture custom-printed paddleboards for dog
              daycares and franchise groups. Your logo, your colors, and each
              location&rsquo;s own phone number — printed into the board, not
              stuck on it.
            </p>

            <dl className="mt-8 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded border border-white/15 bg-white/15">
              {[
                ["Standard size", "10'6\" × 32\""],
                ["Custom sizes", "Made to spec"],
                ["Orders from", "10 boards"],
                ["Lead time", "4–8 weeks"],
              ].map(([term, value]) => (
                <div key={term} className="bg-[#0A1D26] p-4">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#3FA9C9]">
                    {term}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/custom-boards"
                className="inline-block bg-[#FF5B33] px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-[#FF7053]"
              >
                Request a quote
              </Link>
              <a
                href="tel:+16024560884"
                className="inline-block border border-white/25 px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:border-[#DCC7A6]"
              >
                602.456.0884
              </a>
            </div>
          </div>

          <div className="relative">
            <img
              src="/images/sup-pups/hero-mission-board.jpg"
              alt="A dog sitting on a custom-printed paddleboard at the water's edge"
              width={1310}
              height={1604}
              loading="eager"
              className="h-[420px] w-full object-cover object-[center_42%] md:h-[560px]"
            />
          </div>
        </div>

        {/* ---------- GALLERY ---------- */}
        <div className="mt-20 border-t border-white/15 pt-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF5B33]">
            Straight off the production line
          </p>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-4xl">
            Already on the water
          </h3>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {GALLERY.map((g) => (
              <figure key={g.src} className="group">
                <div className="overflow-hidden bg-[#0F2833]">
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8FA7B0]">
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* ---------- WATCH ----------
            Titles verified from the YouTube videos themselves. The brief's
            "As seen on / outlet — date" framing is held back until Sarah
            confirms which outlet aired each segment and when. */}
        <div className="mt-20 border-t border-white/15 pt-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF5B33]">
            Watch
          </p>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-4xl">
            SUP Pups in action
          </h3>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {CLIPS.map((clip) => (
              <figure key={clip.id}>
                <div className="aspect-video w-full overflow-hidden border border-white/15 bg-[#0F2833]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${clip.id}`}
                    title={clip.title}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <figcaption className="mt-4 text-sm text-[#A9BEC6]">{clip.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
