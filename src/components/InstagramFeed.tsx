import { useEffect } from "react";

/**
 * Live Instagram feed via SnapWidget (widget 1126190, Sarah's paid account).
 * Loads SnapWidget's resize script so the grid is responsive (auto-height) on
 * every device. WHICH posts appear is curated in Sarah's SnapWidget account
 * (Widget → Filter), not here — so the site never needs a code change to swap
 * content or hide reels.
 */
export default function InstagramFeed({ className = "" }: { className?: string }) {
  useEffect(() => {
    if (document.getElementById("snapwidget-script")) return;
    const s = document.createElement("script");
    s.id = "snapwidget-script";
    s.async = true;
    s.src = "https://snapwidget.com/js/snapwidget.js";
    document.body.appendChild(s);
  }, []);

  return (
    <section className={`bg-card ${className}`}>
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Lately on Instagram</h2>
        <p className="mt-2 text-muted-foreground">
          Fresh from{" "}
          <a
            href="https://www.instagram.com/desertpaddleboards/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            @desertpaddleboards
          </a>
        </p>
        {/* SnapWidget gives a fixed-size grid (765x510). Cap the width so the
            full grid shows without clipping. If Sarah toggles "Responsive" on
            the widget in her SnapWidget account, the resize script above makes
            it fully fluid and this fixed height becomes a graceful fallback. */}
        <div className="mx-auto mt-8 w-full max-w-[765px]">
          <iframe
            src="https://snapwidget.com/embed/1126190"
            className="snapwidget-widget block w-full"
            title="Latest Instagram posts from Desert Paddleboards"
            scrolling="no"
            style={{ border: "none", overflow: "hidden", height: 510 }}
          />
        </div>
      </div>
    </section>
  );
}
