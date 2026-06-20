import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { blogPosts, formatPostDate } from "@/data/blog-posts";

export default function BlogIndex() {
  return (
    <main className="container py-16">
      <Seo
        title="Blog — Desert Paddleboards"
        description="Wellness, floating soundbaths and Arizona paddleboarding adventures — tips, guides and stories from Desert Paddleboards."
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />

      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Blog
        </p>
        <h1 className="text-4xl font-bold leading-tight">
          Wellness, water & adventures
        </h1>
        <p className="text-lg text-muted-foreground">
          Tips, guides and stories from the water — floating soundbaths, Arizona
          paddleboarding, and living life better on the water.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`}>
            <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/20 to-secondary/20 p-6 text-center">
                    <span className="text-sm font-semibold uppercase tracking-wider text-brand-dark/70">
                      {post.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatPostDate(post.date)}
                </p>
                <h2 className="text-lg font-bold leading-snug group-hover:text-brand-dark">
                  {post.title}
                </h2>
                <p className="flex-1 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <span className="pt-1 text-sm font-semibold text-brand">
                  Read more &rarr;
                </span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
