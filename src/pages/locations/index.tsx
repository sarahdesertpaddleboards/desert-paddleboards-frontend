import { Link } from "react-router-dom";
import { experiences, membership } from "@/data/locations";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import { breadcrumbLd } from "@/lib/jsonld";

export default function LocationsIndex() {
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
                <h2 className="text-lg font-bold leading-snug">{exp.title}</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  {exp.venue ? `${exp.venue} · ` : ""}
                  {exp.city}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </section>

      {/* Membership callout */}
      <section className="mt-16 overflow-hidden rounded-2xl bg-brand/10 p-8 md:flex md:items-center md:gap-8">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Save all summer
          </p>
          <h2 className="text-2xl font-bold">{membership.title}</h2>
          <p className="text-muted-foreground">{membership.blurb}</p>
          <Link to={`/membership`}>
            <span className="inline-flex cursor-pointer items-center font-semibold text-brand hover:text-brand-dark">
              Learn more &rarr;
            </span>
          </Link>
        </div>
      </section>

      <GoogleReviews
        max={3}
        heading="Loved across Arizona"
        className="mt-16 rounded-2xl border-t-0"
      />
    </main>
  );
}
