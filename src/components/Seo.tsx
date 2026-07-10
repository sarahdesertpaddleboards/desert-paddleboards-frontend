import { Head } from "vite-react-ssg";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "@/data/site";

/**
 * Per-page SEO head: title, meta description, canonical URL, and Open
 * Graph + Twitter card tags (title/description/image/url). One source of
 * truth per page — replaces the manual <Head><title>… blocks and the
 * site-wide-only OG defaults that used to live in index.html.
 *
 * Canonical + og:url are derived from the current route via useLocation, so
 * every page (including dynamic /blog/:slug and /locations/:slug) gets the
 * correct absolute URL at SSG build time.
 */

const DEFAULT_IMAGE = `${SITE_URL}/floating-boards-sunset.jpg`;

interface SeoProps {
  title: string;
  description: string;
  /** Site-relative ("/x.jpg") or absolute URL. Falls back to the share default. */
  image?: string;
  /** og:type — "website" (default) or "article" for blog posts. */
  type?: "website" | "article";
  /** Keep this page out of search results (unlisted / preview pages). */
  noindex?: boolean;
}

function absoluteImage(image?: string): string {
  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function Seo({
  title,
  description,
  image,
  type = "website",
  noindex = false,
}: SeoProps) {
  const { pathname } = useLocation();
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const url = `${SITE_URL}${path}`;
  const img = absoluteImage(image);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </Head>
  );
}
