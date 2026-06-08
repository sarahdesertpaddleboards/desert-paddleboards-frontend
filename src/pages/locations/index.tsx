import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { experiences, membership } from "@/data/locations";

export default function LocationsIndex() {
  return (
    <main className="container py-16">
      <Head>
        <title>
          Floating Soundbath Locations Across Arizona | Desert Paddleboards
        </title>
        <meta
          name="description"
          content="Browse floating soundbath experiences across the Valley — Phoenix, Mesa, Scottsdale, Tempe, Gilbert, Chandler and more. See locations on the map and book online."
        />
      </Head>

      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Experiences
        </p>
        <h1 className="text-4xl font-bold leading-tight">
          Floating soundbaths across Arizona
        </h1>
        <p className="text-lg text-muted-foreground">
          Float weightlessly on the water as live sound and music wash over you.
          Choose a location below to see upcoming dates and book.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.map((exp) => (
          <Link key={exp.slug} to={`/locations/${exp.slug}`}>
            <article className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={exp.image}
                  alt={`${exp.title}${exp.venue ? ` at ${exp.venue}` : ""}, ${exp.city}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                  {exp.city}, {exp.state}
                </p>
                <h2 className="text-lg font-bold leading-snug">{exp.title}</h2>
                {exp.venue ? (
                  <p className="text-sm text-muted-foreground">{exp.venue}</p>
                ) : null}
              </div>
            </article>
          </Link>
        ))}
      </section>

      {/* Membership callout */}
      <section className="mt-16 overflow-hidden rounded-2xl bg-cyan-50 p-8 md:flex md:items-center md:gap-8">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
            Save all summer
          </p>
          <h2 className="text-2xl font-bold">{membership.title}</h2>
          <p className="text-muted-foreground">{membership.blurb}</p>
          <Link to={`/membership`}>
            <span className="inline-flex cursor-pointer items-center font-semibold text-cyan-700 hover:text-cyan-900">
              Learn more &rarr;
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
