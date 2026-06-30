import { Link } from "react-router-dom";
import FareHarborButton from "@/components/FareHarborButton";
import { cityClasses, nextCitySessionIso } from "@/data/city-classes";
import { fmtDateHeader, fmtTime } from "@/lib/sessions";

const FALLBACK_IMAGE = "/floating-boards-sunset.jpg";

/**
 * Highlights upcoming FEATURED EVENTS (static entries that book through
 * FareHarbor, e.g. the Witches Regatta, Salt River outing). Surfaced
 * regardless of how far out the date is — so a big annual event isn't buried
 * at the bottom of a date-sorted list. Renders nothing if there's no upcoming
 * featured event.
 */
export default function FeaturedEvent({ className = "" }: { className?: string }) {
  const upcoming = cityClasses
    .filter((c) => typeof c.fareharborItemId === "number")
    .map((c) => ({ c, iso: nextCitySessionIso(c) }))
    .filter((x): x is { c: (typeof cityClasses)[number]; iso: string } =>
      Boolean(x.iso),
    )
    .sort((a, b) => a.iso.localeCompare(b.iso));

  if (upcoming.length === 0) return null;

  return (
    <section className={`mx-auto max-w-5xl space-y-6 px-4 ${className}`}>
      {upcoming.map(({ c, iso }) => (
        <div
          key={c.id}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid md:grid-cols-2"
        >
          <Link to={`/locations/${c.slug}`} className="block">
            <img
              src={c.image || FALLBACK_IMAGE}
              alt={c.title}
              loading="lazy"
              className="h-56 w-full cursor-pointer object-cover md:h-full"
            />
          </Link>
          <div className="flex flex-col justify-center space-y-3 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Featured event
            </p>
            <Link to={`/locations/${c.slug}`}>
              <h2 className="cursor-pointer text-2xl font-bold leading-snug hover:text-brand-dark md:text-3xl">
                {c.title}
              </h2>
            </Link>
            <p className="text-sm font-medium text-foreground">
              {fmtDateHeader(iso)} · {fmtTime(iso)}
              {c.venue ? ` · ${c.venue}` : ""}
            </p>
            {c.note ? (
              <p className="line-clamp-3 text-sm text-muted-foreground">{c.note}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {c.fareharborItemId ? (
                <FareHarborButton
                  itemId={c.fareharborItemId}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Book your spot
                </FareHarborButton>
              ) : null}
              <Link
                to={`/locations/${c.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
