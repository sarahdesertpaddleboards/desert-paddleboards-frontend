import { Link, useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { getExperienceBySlug } from "@/data/locations";
import FareHarborButton from "@/components/FareHarborButton";

export default function LocationDetail() {
  const params = useParams();
  const slug = params.slug ?? "";
  const exp = getExperienceBySlug(slug);

  if (!exp) {
    return (
      <main className="container py-24 text-center">
        <h1 className="text-2xl font-bold">Experience not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t find that experience.
        </p>
        <Link to="/locations">
          <span className="mt-6 inline-block cursor-pointer font-semibold text-cyan-700 hover:text-cyan-900">
            &larr; Back to all experiences
          </span>
        </Link>
      </main>
    );
  }

  const locationLabel = [exp.venue, `${exp.city}, ${exp.state}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <main>
      <Head>
        <title>
          {`${exp.title}${exp.venue ? ` — ${exp.venue}` : ""}, ${exp.city} | Desert Paddleboards`}
        </title>
        <meta name="description" content={exp.blurb} />
      </Head>

      {/* Hero */}
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-muted">
        <img
          src={exp.image}
          alt={`${exp.title}${exp.venue ? ` at ${exp.venue}` : ""}, ${exp.city}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em]">
              {exp.city}, {exp.state}
            </p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              {exp.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-1 gap-12 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Link to="/locations">
            <span className="inline-block cursor-pointer text-sm font-medium text-cyan-700 hover:text-cyan-900">
              &larr; All experiences
            </span>
          </Link>

          {exp.venue ? (
            <p className="text-lg font-medium text-foreground">{locationLabel}</p>
          ) : null}

          <p className="text-lg leading-relaxed text-muted-foreground">
            {exp.blurb}
          </p>
        </div>

        {/* Booking card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Book this experience</h2>
            <p className="text-sm text-muted-foreground">
              Live dates, availability and pricing are shown when you book.
            </p>
            <FareHarborButton
              itemId={exp.itemId}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Check dates &amp; book
            </FareHarborButton>
          </div>
        </aside>
      </div>
    </main>
  );
}
