import { Head } from "vite-react-ssg";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL } from "@/data/site";
import { products, formatPrice, type Product } from "@/data/shop";

export default function Shop() {
  const live = products.filter((p) => !p.soldOut);

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]),
    ...live
      .filter((p) => p.paymentLink)
      .map((p) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        image: [p.image],
        description: p.blurb,
        offers: {
          "@type": "Offer",
          price: p.priceUsd,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/shop`,
        },
      })),
  ]);

  return (
    <main className="container py-16">
      <Head>
        <title>Shop — Desert Paddleboards</title>
        <meta
          name="description"
          content="Floating soundbath merch from Desert Paddleboards — beach totes and more. Checkout securely via Stripe."
        />
      </Head>
      <JsonLd data={structuredData} />

      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Shop
        </p>
        <h1 className="text-4xl font-bold leading-tight">Float merch</h1>
        <p className="text-lg text-muted-foreground">
          Take a little of the water with you. Secure checkout is handled by
          Stripe — your card details never touch our site.
        </p>
      </header>

      {live.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          New merch is on the way — check back soon.
        </p>
      ) : (
        <section className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </section>
      )}
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const available = Boolean(product.paymentLink);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold leading-snug">{product.name}</h2>
          <span className="whitespace-nowrap text-lg font-bold text-brand-dark">
            {formatPrice(product.priceUsd)}
          </span>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">{product.blurb}</p>

        {available ? (
          <a
            href={product.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Buy now
          </a>
        ) : (
          <span className="mt-1 inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}
