import { useMemo } from "react";
import { Link } from "react-router-dom";
import { experiences } from "@/data/locations";
import { cityClasses } from "@/data/city-classes";
import { useMergedSessions, TZ } from "@/lib/sessions";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import { breadcrumbLd } from "@/lib/jsonld";

const CITY_FALLBACK_IMAGE = "/floating-boards-sunset.jpg";

/** Compact "Fri, Aug 7" for the next-session line. */
function fmtNext(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface VenueCard {
  key: string;
  slug: string;
  title: string;
  venue: string;
  city: string;
  image: string;
  /** Soonest upcoming session (ISO), if known. */
  next?: string;
}

export default function LocationsIndex() {
  // Feed (FareHarbor) + static city classes, merged + sorted. City-class dates
  // are known immediately; FareHarbor dates arrive when the live feed loads.
  const sessions = useMergedSessions();

  // Earliest upcoming session per FareHarbor item id and per detail-page slug.
  const { nextByItem, nextBySlug } = useMemo(() => {
    const byItem = new Map<number, string>();
    const bySlug = new Map<string, string>();
    for (const s of sessions) {
      if (typeof s.itemId === "number") {
        const cur = byItem.get(s.itemId);
        if (!cur || s.startAt < cur) byItem.set(s.itemId, s.startAt);
      }
      if (s.slug) {
        const cur = bySlug.get(s.slug);
        if (!cur || s.startAt < cur) bySlug.set(s.slug, s.startAt);
      }
    }
    return { nextByItem: byItem, nextBySlug: bySlug };
  }, [sessions]);

  const venues = useMemo<VenueCard[]>(() => {
    const fromFareHarbor: VenueCard[] = experiences.map((e) => ({
      key: e.slug,
      slug: e.slug,
      title: e.title,
      venue: e.venue,
      city: e.city,
      image: e.image,
      next: nextByItem.get(e.itemId),
    }));

    // City-run soundbaths (Avondale, Queen Creek, Sedona). Featured events that
    // book through FareHarbor (Witches Regatta, Salt River) have a
    // fareharborItemId and live under Events/Adventures — not this soundbath grid.
    const fromCity: VenueCard[] = cityClasses
      .filter((c) => typeof c.fareharborItemId !== "number")
      .map((c) => ({
        key: c.id,
        slug: c.slug,
        title: c.title,
        venue: c.venue,
        city: c.city,
        image: c.image || CITY_FALLBACK_IMAGE,
        next: nextBySlug.get(c.slug),
      }));

    // Sort by soonest upcoming date; venues with no known upcoming date go last
    // (alphabetically). As the FareHarbor feed widens, more sort into place.
    return [...fromFareHarbor, ...fromCity].sort((a, b) => {
      const an = a.next ?? "9999";
      const bn = b.next ?? "9999";
      if (an !== bn) return an.localeCompare(bn);
      return a.title.localeCompare(b.title);
    });
  }, [nextByItem, nextBySlug]);

  return (
    <main className="container py-16">
      <Seo
        title="Floating Soundbath Locations Across Arizona"
        description="Browse floating soundbath experiences across the Valley — Phoenix, Mesa, Scottsdale, Tempe, Gilbert and more. See locations on the map and book online."
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Floating Sessions", path: "/locations" },
        ])}
      />

      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Experiences
        </p>
        <h1 className="text-balance text-4xl font-bold leading-tight">
          Floating soundbaths across Arizona
        </h1>
        <p className="text-lg text-muted-foreground">
          Float weightlessly on the water as live sound and music wash over you.
          Sorted by what&apos;s coming up next — choose a location to see dates and
          book.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => (
          <Link key={v.key} to={`/locations/${v.slug}`}>
            <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={v.image}
                  alt={`${v.title}${v.venue ? ` at ${v.venue}` : ""}, ${v.city}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col space-y-1 p-5">
                <h2 className="text-lg font-bold leading-snug">{v.title}</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  {v.venue ? `${v.venue} · ` : ""}
                  {v.city}
                </p>
                {v.next ? (
                  <p className="pt-1 text-sm font-medium text-brand">
                    Next: {fmtNext(v.next)}
                  </p>
                ) : null}
              </div>
            </article>
          </Link>
        ))}
      </section>

      <GoogleReviews
        max={3}
        heading="Loved across Arizona"
        className="mt-16 rounded-2xl border-t-0"
      />
    </main>
  );
}
