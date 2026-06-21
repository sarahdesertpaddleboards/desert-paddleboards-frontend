import { useState } from "react";
import { videos, type Video } from "@/data/videos";

/**
 * "See it in action" — a grid of YouTube videos using a click-to-play facade:
 * we show the thumbnail + a play button and only load the (heavy, tracking-
 * laden) YouTube iframe once the visitor clicks. Uses youtube-nocookie for
 * privacy. Videos are CMS-editable (src/data/videos.json).
 */
function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <figure>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`Play video: ${video.title}`}
          >
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-primary" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 font-semibold text-foreground">
        {video.title}
      </figcaption>
    </figure>
  );
}

export default function VideoSection({
  heading = "See it in action",
  className = "",
}: {
  heading?: string;
  className?: string;
}) {
  if (videos.length === 0) return null;

  return (
    <section className={`mx-auto max-w-6xl px-4 ${className}`}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}
