import { Head } from "vite-react-ssg";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL } from "@/data/site";
import { products, formatPrice, type Product } from "@/data/shop";

const SECTIONS: { kind: Product["kind"]; title: string; blurb: string }[] = [
  {
    kind: "physical",
    title: "Boards & gear",
    blurb: "Take a little of the water home with you.",
  },
  {
    kind: "digital",
    title: "Digital downloads",
    blurb: "Music and guides — delivered straight to your inbox after checkout.",
  },
];

export default function Shop() {
  const live = products.filter((p) => !p.soldOut);

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]),
    ...live.map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      ...(p.image ? { image: [p.image] } : {}),
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
          content="Desert Paddleboards shop — floating meditation boards, the Sonoran Echoes album, river paddleboarding guides and beach totes. Secure checkout via Stripe."
        />
      </Head>
      <JsonLd data={structuredData} />

      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Shop
        </p>
        <h1 className="text-4xl font-bold leading-tight">Float merch</h1>
        <p className="text-lg text-muted-foreground">
          Boards, music and guides from the water. Secure checkout is handled by
          Stripe — your card details never touch our site.
        </p>
      </header>

      {SECTIONS.map((section) => {
        const items = live.filter((p) => p.kind === section.kind);
        if (items.length === 0) return null;
        return (
          <section key={section.kind} className="mt-14">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <p className="text-muted-foreground">{section.blurb}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const options =
    product.options ??
    (product.paymentLink !== undefined
      ? [{ label: "", priceUsd: product.priceUsd, paymentLink: product.paymentLink }]
      : []);
  const anyAvailable = options.some((o) => o.paymentLink);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/20 to-secondary/20 p-6 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-dark/70">
              {product.name}
            </span>
          </div>
        )}
        {product.kind === "digital" ? (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Digital download
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug">{product.name}</h3>
          <div className="whitespace-nowrap text-right">
            <span className="text-lg font-bold text-brand-dark">
              {product.options ? "from " : ""}
              {formatPrice(product.priceUsd)}
            </span>
            {product.priceNote ? (
              <span className="block text-xs text-muted-foreground">
                {product.priceNote}
              </span>
            ) : null}
          </div>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">{product.blurb}</p>

        {anyAvailable ? (
          <div className="mt-1 space-y-2">
            {options
              .filter((o) => o.paymentLink)
              .map((o) => (
                <a
                  key={o.label || "buy"}
                  href={o.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {o.label ? `Buy ${o.label} — ${formatPrice(o.priceUsd)}` : "Buy now"}
                </a>
              ))}
          </div>
        ) : (
          <span className="mt-1 inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}
