import { useEffect } from "react";
import { Head } from "vite-react-ssg";

/**
 * TEMPORARY internal page — side-by-side look at the two free-plan Instagram
 * feed options so Sarah can pick one. Not linked anywhere, no-indexed. Delete
 * once the winner is wired into the homepage.
 */

function CuratorFeed() {
  useEffect(() => {
    if (document.getElementById("curator-preview-script")) return;
    const s = document.createElement("script");
    s.id = "curator-preview-script";
    s.async = true;
    s.charset = "UTF-8";
    s.src =
      "https://cdn.curator.io/published/195d1430-608a-48ae-afb0-7b6046a50a1f.js";
    document.body.appendChild(s);
  }, []);

  return (
    <div id="curator-feed-default-feed-layout">
      <a
        href="https://curator.io"
        target="_blank"
        rel="noopener noreferrer"
        className="crt-logo crt-tag"
      >
        Powered by Curator.io
      </a>
    </div>
  );
}

export default function SocialPreview() {
  return (
    <main className="container max-w-5xl py-12">
      <Head>
        <title>Social feed preview — Desert Paddleboards</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <h1 className="text-3xl font-bold">Instagram feed — side-by-side</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Two free-plan options for the homepage social feed. Both show a small
        &ldquo;powered by&rdquo; badge on the free tier (it goes away on paid).
        Have a look and tell me which you prefer — I&apos;ll wire that one into
        the homepage under the &ldquo;Follow us&rdquo; band.
      </p>

      {/* Option A — SnapWidget */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Option A — SnapWidget</h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          A clean Instagram grid. ~$14/mo to remove the badge, with{" "}
          <strong>unlimited views</strong> (best for your traffic); you can add
          separate TikTok &amp; Facebook grids too.
        </p>
        <iframe
          src="https://snapwidget.com/embed/1126190"
          className="mx-auto block w-full max-w-[765px]"
          title="Instagram posts via SnapWidget"
          scrolling="no"
          style={{ border: "none", overflow: "hidden", height: 510 }}
        />
      </section>

      {/* Option B — Curator.io */}
      <section className="mt-16">
        <h2 className="text-xl font-bold">Option B — Curator.io</h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          A combined &ldquo;social wall&rdquo; that can mix Instagram + TikTok +
          Facebook into one feed. $23/mo removes the badge; unlimited views is
          the $54 tier.
        </p>
        <CuratorFeed />
      </section>

      <p className="mt-16 text-center text-sm text-muted-foreground">
        (Temporary comparison page — not linked from the site.)
      </p>
    </main>
  );
}
