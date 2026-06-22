import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import SessionCalendar from "@/components/SessionCalendar";
import UpcomingSessions from "@/components/UpcomingSessions";
import { breadcrumbLd, graph } from "@/lib/jsonld";

/**
 * /calendar — the full upcoming-sessions schedule, merging live FareHarbor
 * sessions with the city-run classes (src/data/city-classes.ts).
 */
export default function Calendar() {
  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Calendar", path: "/calendar" },
    ]),
  ]);

  return (
    <main className="py-16">
      <Seo
        title="Floating Soundbath & Class Calendar | Desert Paddleboards"
        description="Every upcoming floating soundbath and water-wellness class across Arizona — book online, or register for city-run classes in Queen Creek, Sedona & Avondale."
      />
      <JsonLd data={structuredData} />

      <div className="mx-auto mb-10 max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Upcoming Sessions</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Every upcoming floating soundbath and class in one place. Book online
          sessions instantly; city-run classes (Queen Creek, Sedona, Avondale)
          register through the city's own page.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Sessions fill up — last-minute openings? Text{" "}
          <a href="sms:6023094093" className="font-semibold text-primary hover:underline">
            602.309.4093
          </a>{" "}
          the day of an event for the waitlist. New dates are added often —{" "}
          <a
            href="https://www.instagram.com/desertpaddleboards/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            follow us on Instagram
          </a>
          .
        </p>
      </div>

      <SessionCalendar heading="" className="mb-16" />
      <UpcomingSessions heading="All upcoming sessions" />
    </main>
  );
}
