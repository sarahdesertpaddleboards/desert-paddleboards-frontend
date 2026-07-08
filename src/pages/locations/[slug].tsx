import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, Navigation } from "lucide-react";
import { getExperienceBySlug, fareHarborBookUrl } from "@/data/locations";
import { getCityClassBySlug } from "@/data/city-classes";
import {
  directionsUrl,
  hasRoutableLocation,
  venueDestination,
  cityClassDestination,
} from "@/lib/directions";
import { locationContent } from "@/data/location-content";
import FareHarborButton from "@/components/FareHarborButton";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, eventLd, graph } from "@/lib/jsonld";
import type { UpcomingSession } from "@/lib/experiencesApi";
import upcoming from "@/data/upcoming.generated.json";
import { fmtDateHeader, fmtTime } from "@/lib/sessions";
import { trackEvent } from "@/lib/analytics";
import { appendUtms } from "@/lib/utm";
import { SITE_URL, business } from "@/data/site";

const CITY_FALLBACK_IMAGE = "/floating-boards-sunset.jpg";

function absoluteImage(src: string): string {
  return src.startsWith("http") ? src : `${SITE_URL}${src}`;
}

export default function LocationDetail() {
  const params = useParams();
  const slug = params.slug ?? "";
  const exp = getExperienceBySlug(slug);
  const city = exp ? undefined : getCityClassBySlug(slug);

  if (!exp && !city) {
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

  // Normalised view model so one template renders both FareHarbor venues and
  // city-run classes.
  const view = exp
    ? {
        slug: exp.slug,
        title: exp.title,
        venue: exp.venue,
        city: exp.city,
        state: exp.state,
        image: exp.image,
        blurb: exp.blurb,
        isCity: false,
        bookingUrl: undefined as string | undefined,
        bookingLabel: undefined as string | undefined,
        note: undefined as string | undefined,
        sessions: [] as { startAt: string }[],
      }
    : {
        slug: city!.slug,
        title: city!.title,
        venue: city!.venue,
        city: city!.city,
        state: city!.state,
        image: city!.image || CITY_FALLBACK_IMAGE,
        blurb:
          city!.note ?? `A floating soundbath at ${city!.venue} in ${city!.city}.`,
        isCity: true,
        bookingUrl: city!.bookingUrl,
        bookingLabel: city!.bookingLabel,
        note: city!.note,
        sessions: city!.sessions
          .filter((s) => Date.parse(s.startAt) > Date.now())
          .slice(0, 8),
      };

  // Booking flips to FareHarbor whenever an item id exists — a real FareHarbor
  // venue, OR a city class migrated into FareHarbor via `fareharborItemId`.
  const fhItemId = exp ? exp.itemId : city!.fareharborItemId;

  // "Getting there" — directions destination for this venue, if we can route.
  const dest = exp
    ? venueDestination(exp)
    : city
      ? cityClassDestination(city)
      : null;
  const showDirections = dest ? hasRoutableLocation(dest) : false;

  const longDescription = locationContent[view.slug];

  // Structured data (Event markup) — from the build-time FareHarbor feed for
  // venues, or the static city-class dates for city classes.
  const fhEvents = exp
    ? (upcoming.sessions as UpcomingSession[])
        .filter((s) => s.itemId === exp.itemId)
        .slice(0, 6)
        .map((s) => eventLd(exp, s))
    : [];
  const cityEventOfferUrl = view.isCity
    ? (view.bookingUrl ?? (fhItemId ? fareHarborBookUrl(fhItemId) : SITE_URL))
    : SITE_URL;
  const cityEvents =
    view.isCity && view.sessions.length > 0
      ? view.sessions.map((s) => ({
          "@context": "https://schema.org",
          "@type": "Event",
          name: `${view.title} at ${view.venue} — ${view.city}`,
          description: view.blurb,
          startDate: s.startAt,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: view.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: view.city,
              addressRegion: view.state,
              addressCountry: "US",
            },
          },
          image: [absoluteImage(view.image)],
          organizer: { "@type": "Organization", name: business.name, url: SITE_URL },
          offers: {
            "@type": "Offer",
            url: cityEventOfferUrl,
            availability: "https://schema.org/InStock",
          },
        }))
      : [];

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Floating Sessions", path: "/locations" },
      { name: view.title, path: `/locations/${view.slug}` },
    ]),
    ...fhEvents,
    ...cityEvents,
  ]);

  // SEO title: lead with service + venue + city; append brand only if it fits.
  const baseTitle = `${view.title}${view.venue ? ` — ${view.venue}` : ""}, ${view.city}`;
  const seoTitle =
    baseTitle.length <= 40 ? `${baseTitle} | Desert Paddleboards` : baseTitle;

  return (
    <main>
      <Seo title={seoTitle} description={view.blurb} image={view.image} />
      <JsonLd data={structuredData} />

      {/* Hero */}
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-muted">
        <img
          src={view.image}
          alt={`${view.title}${view.venue ? ` at ${view.venue}` : ""}, ${view.city}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container pb-8 text-white">
            {view.isCity ? (
              <p className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                {fhItemId ? "Featured event" : "City class · book with the city"}
              </p>
            ) : null}
            <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight md:text-5xl">
              {view.title}
            </h1>
            <p className="mt-2 text-lg font-medium text-white/95">
              {view.venue ? `${view.venue} · ` : ""}
              {view.city}
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
              {view.blurb}
            </p>
          )}

          {/* Upcoming dates — shown on-page for city classes (no lightframe). */}
          {view.isCity && view.sessions.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-xl font-bold">Upcoming dates</h2>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {view.sessions.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 bg-card px-4 py-3"
                  >
                    <span className="text-sm font-medium">
                      {fmtDateHeader(s.startAt)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {fmtTime(s.startAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Booking card + "Getting there" */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {fhItemId ? (
              <>
                <h2 className="text-xl font-bold">Book this experience</h2>
                <p className="text-sm text-muted-foreground">
                  Live dates, availability and pricing are shown when you book.
                </p>
                <FareHarborButton
                  itemId={fhItemId}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Check dates &amp; book
                </FareHarborButton>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">Register for this class</h2>
                <p className="text-sm text-muted-foreground">
                  This class is run with the city and booked through their
                  registration system. Tap below to reserve your spot.
                </p>
                <a
                  href={appendUtms(view.bookingUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("city_register_click", { city: view.city })
                  }
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {view.bookingLabel ?? "Register"} →
                </a>
                {view.note ? (
                  <p className="text-xs text-muted-foreground">{view.note}</p>
                ) : null}
              </>
            )}
          </div>

          {/* Getting there — one-tap directions + a QR to send to your phone. */}
          {showDirections && dest ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold">Getting there</h2>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">
                {view.venue}
              </p>
              <p className="text-sm text-muted-foreground">
                {dest.address ?? `${view.city}, ${view.state}`}
              </p>
              <a
                href={directionsUrl(dest)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("directions_click", { venue: dest.label })
                }
                className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
              {/* On a phone the button above already opens Maps, so the QR is
                  only useful on a larger screen — scan to open it on your phone. */}
              <div className="mt-5 hidden flex-col items-center border-t border-border pt-5 sm:flex">
                <QRCodeSVG value={directionsUrl(dest)} size={128} />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Scan to open directions on your phone
                </p>
              </div>
            </div>
          ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
