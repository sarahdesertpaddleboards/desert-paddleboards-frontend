import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL, business } from "@/data/site";
import { getPostBySlug, formatPostDate } from "@/data/blog-posts";

/** Strip a leading cover image (and any caption) — it's shown in the hero. */
function stripLeadingImage(md: string): string {
  return md.replace(
    /^\s*\[?!\[[^\]]*\]\([^)]*\)(\]\([^)]*\))?\s*(\*[^*\n]*\*\s*)?/,
    "",
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const post = getPostBySlug(params.slug ?? "");

  if (!post) {
    return (
      <main className="container py-24 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link to="/blog">
          <span className="mt-6 inline-block cursor-pointer font-semibold text-brand hover:text-brand-dark">
            &larr; Back to the blog
          </span>
        </Link>
      </main>
    );
  }

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      description: post.excerpt,
      ...(post.image ? { image: [post.image] } : {}),
      author: { "@type": "Organization", name: business.name, url: SITE_URL },
      publisher: { "@type": "Organization", name: business.name, url: SITE_URL },
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    },
  ]);

  return (
    <main className="container max-w-3xl py-16">
      <Seo
        title={
          post.seoTitle ??
          (post.title.length <= 40
            ? `${post.title} | Desert Paddleboards`
            : post.title)
        }
        description={post.seoDescription ?? post.excerpt}
        image={post.image || undefined}
        type="article"
      />
      <JsonLd data={structuredData} />

      <Link to="/blog">
        <span className="inline-block cursor-pointer text-sm font-medium text-brand hover:text-brand-dark">
          &larr; All posts
        </span>
      </Link>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {formatPostDate(post.date)}
      </p>
      <h1 className="mt-2 text-balance text-4xl font-bold leading-tight">{post.title}</h1>

      {post.image ? (
        <img
          src={post.image}
          alt={post.imageAlt ?? post.title}
          className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      ) : null}

      <div className="prose prose-slate mt-8 max-w-none prose-headings:font-bold prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-li:marker:text-brand prose-a:text-brand">
        <ReactMarkdown>{stripLeadingImage(post.body)}</ReactMarkdown>
      </div>

      <div className="mt-12 rounded-2xl bg-brand/10 p-6 text-center">
        <p className="text-lg font-semibold">Ready to get on the water?</p>
        <p className="mt-1 text-muted-foreground">
          Find a floating soundbath near you, join a guided adventure, or grab a river
          guide from the shop.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link to="/locations">
            <span className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Find a soundbath
            </span>
          </Link>
          <Link to="/adventures">
            <span className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted">
              Guided adventures
            </span>
          </Link>
          <Link to="/shop">
            <span className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted">
              Shop guides & gear
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
