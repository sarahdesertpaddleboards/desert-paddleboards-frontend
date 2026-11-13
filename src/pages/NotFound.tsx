import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

/**
 * 404 page. Pre-rendered to dist/404.html (see ssgOptions in vite.config.ts),
 * which Cloudflare Pages serves with a 404 status for any URL that has no page
 * of its own. Also rendered by the dynamic routes (/locations/:slug,
 * /blog/:slug) for unknown slugs, so the client render matches that HTML.
 */
export default function NotFound() {
  return (
    <main className="container py-24 text-center">
      <Seo
        title="Page not found | Desert Paddleboards"
        description="That page doesn't exist. Find an upcoming floating sound bath near you, or head back to the Desert Paddleboards homepage."
        noindex
        canonical={false}
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
      <h1 className="mt-2 text-4xl font-bold md:text-5xl">This page floated away</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
        We couldn&apos;t find what you were looking for. It may have moved, or
        the link may be mistyped.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/calendar"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          See upcoming sessions
        </Link>
        <Link
          to="/locations"
          className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Browse locations
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
