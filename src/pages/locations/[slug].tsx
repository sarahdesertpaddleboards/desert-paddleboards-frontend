import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getExperienceBySlug } from "@/data/locations";
import { locationContent } from "@/data/location-content";
import FareHarborButton from "@/components/FareHarborButton";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, eventLd, graph } from "@/lib/jsonld";
import type { UpcomingSession } from "@/lib/experiencesApi";
import upcoming from "@/data/upcoming.generated.json";

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
          <span className="mt-6 inline-block cursor-pointer font-semibold text-brand hover:text-brand-dark">
            &larr; Back to all experiences
          </span>
        </Link>
      </main>
    );
  }


  const longDescription = locationContent[exp.slug];

  // Upcoming sessions for this experience (baked at build time) → Event JSON-LD
  const upcomingForItem = (upcoming.sessions as UpcomingSession[])
    .filter((s) => s.itemId === exp.itemId)
    .slice(0, 6);

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Floating Sessions", path: "/locations" },
      { name: exp.title, path: `/locations/${exp.slug}` },
    ]),
    ...upcomingForItem.map((s) => eventLd(exp, s)),
  ]);

  // SEO title: lead with the service + venue + city (the local-search terms).
  // Append the brand only when there's room, so titles don't blow past the
  // ~60-char point where Google truncates them in results.
  const baseTitle = `${exp.title}${exp.venue ? ` — ${exp.venue}` : ""}, ${exp.city}`;
  const seoTitle =
    baseTitle.length <= 40 ? `${baseTitle} | Desert Paddleboards` : baseTitle;

  return (
    <main>
      <Seo
        title={seoTitle}
        description={exp.blurb}
        image={exp.image}
      />
      <JsonLd data={structuredData} />

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
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              {exp.title}
            </h1>
            <p className="mt-2 text-lg font-medium text-white/95">
              {exp.venue ? `${exp.venue} · ` : ""}
              {exp.city}
            </p>
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-1 gap-12 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Link to="/locations">
            <span className="inline-block cursor-pointer text-sm font-medium text-brand hover:text-brand-dark">
              &larr; All experiences
            </span>
          </Link>


          {longDescription ? (
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-strong:text-foreground prose-li:marker:text-brand prose-p:text-muted-foreground prose-li:text-muted-foreground">
              <ReactMarkdown>{longDescription}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {exp.blurb}
            </p>
          )}
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
