import { Star } from "lucide-react";
import reviewsData from "@/data/reviews.generated.json";

/**
 * Google reviews, baked into the static HTML at build time by
 * scripts/generate-reviews.mjs (Places API New → reviews.generated.json).
 *
 * Shown as plain attributed text — we deliberately do NOT emit
 * Review/AggregateRating JSON-LD for a third party's Google reviews (against
 * Google policy). Attribution (name, time, "Reviews from Google" + link to the
 * profile) is included per Google's display requirements.
 */

interface Review {
  author: string;
  rating: number;
  relativeTime: string;
  publishTime: string;
  text: string;
}

interface ReviewsData {
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
  reviews: Review[];
}

const data = reviewsData as ReviewsData;

/** Row of 5 stars, filled to `value` (rounded to nearest half). */
function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-secondary/30" strokeWidth={1.5} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-4 w-4 fill-secondary text-secondary" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

interface GoogleReviewsProps {
  /** Max number of review cards to show (default 3). */
  max?: number;
  /** Section heading. */
  heading?: string;
  className?: string;
}

export default function GoogleReviews({
  max = 3,
  heading = "What our guests say",
  className = "",
}: GoogleReviewsProps) {
  const reviews = data.reviews.slice(0, max);
  if (reviews.length === 0) return null;

  return (
    <section className={`bg-card border-t border-border ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{heading}</h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-foreground">
              {data.rating.toFixed(1)}
            </span>
            <Stars value={data.rating} />
            <span className="text-sm text-muted-foreground">
              {data.userRatingCount} Google reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {r.author.charAt(0).toUpperCase()}
                </span>
                <div>
                  <figcaption className="font-semibold text-foreground leading-tight">
                    {r.author}
                  </figcaption>
                  {r.relativeTime && (
                    <span className="text-xs text-muted-foreground">{r.relativeTime}</span>
                  )}
                </div>
              </div>
              <Stars value={r.rating} className="mb-3" />
              <blockquote className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                {r.text}
              </blockquote>
            </figure>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={data.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline underline-offset-2"
          >
            Reviews from Google · read more →
          </a>
        </div>
      </div>
    </section>
  );
}

/** The aggregate rating + count, for compact inline use (e.g. hero band). */
export function reviewSummary() {
  return { rating: data.rating, count: data.userRatingCount, uri: data.googleMapsUri };
}
