import { Link } from "react-router-dom";
import { experiences } from "@/data/locations";

/**
 * Social proof band: the hotels and resorts that already host us. Names are
 * derived from the live FareHarbor venue list, so this can't drift out of date
 * as venues come and go.
 *
 * /locations pages convert at 43–69%, far better than the event pages — the
 * venue names are doing that work, so we surface them here too.
 */
export default function VenueProof({ className = "" }: { className?: string }) {
  // Hotel/resort/spa partners read as the strongest proof for event buyers.
  const partners = [...new Set(
    experiences
      .map((e) => e.venue)
      .filter((v) =>
        /hotel|resort|marriott|westin|hyatt|sheraton|canopy|doubletree|wigwam|omni|spa/i.test(v),
      ),
  )].sort((a, b) => a.localeCompare(b));

  if (partners.length === 0) return null;

  return (
    <section className={`bg-accent/20 py-14 ${className}`}>
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Trusted by
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            We already host events at Arizona&rsquo;s best venues
          </h2>
          <p className="mt-3 text-muted-foreground">
            Resorts, hotels and spas across the Valley bring us in for their guests
            and members. We can host your event at any of them — or come to you.
          </p>
        </div>

        <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          {partners.map((p) => (
            <li
              key={p}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            to="/locations"
            className="text-sm font-semibold text-primary hover:underline"
          >
            See all {experiences.length} venues &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
