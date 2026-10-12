import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { SITE_URL } from "@/data/site";
import { products, formatPrice, type Product } from "@/data/shop";
import { trackEvent } from "@/lib/analytics";
import { useFareHarborEmbed } from "@/components/FareHarborButton";

const SECTIONS: { kind: Product["kind"]; title: string; blurb: string }[] = [
  {
    kind: "physical",
    title: "Boards & gear",
    blurb: "The board we float on at every soundbath, new or gently used, and the tote to carry your stuff to the water.",
  },
  {
    kind: "digital",
    title: "Digital downloads",
    blurb: "Music and guides — delivered straight to your inbox after checkout.",
  },
];

export default function Shop() {
  useFareHarborEmbed(); // for the gift-certificate FareHarbor lightframe
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
    <>
      <Seo
        title="Shop Paddleboards, Totes &amp; Custom Boards | Desert Paddleboards"
        description="Buy the floating board we use at every soundbath, new or used, plus our beach tote. Or put your own logo on a custom-printed board, with matching bandanas."
        image="/floating-meditation-board.jpg"
      />
    <main className="container py-16">
      <JsonLd data={structuredData} />

      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Shop
        </p>
        <h1 className="text-4xl font-bold leading-tight">Boards, totes &amp; custom gear</h1>
        <p className="text-lg text-muted-foreground">
          Take a little of the water home with you. Secure checkout is handled by
          Stripe — your card details never touch our site.
        </p>
      </header>

      <CustomBoardsBanner />

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

      {/* Gift certificates — booked/redeemed through FareHarbor */}
      <section className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-brand/10 to-secondary/10 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Gift certificates
        </p>
        <h2 className="mt-2 text-2xl font-bold">Give the gift of floating</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          A Desert Paddleboards gift certificate is the perfect present — redeemable
          toward any floating soundbath, water-fitness class, rental or outing.
          Purchased securely through FareHarbor.
        </p>
        <a
          href="https://fareharbor.com/embeds/book/desertpaddleboards/items/573676/?full-items=yes&flow=173629"
          // pointerdown/Enter, not onClick — FareHarbor's autolightframe script
          // swallows the click (see FareHarborButton).
          onPointerDown={(e) => {
            if (e.button === 0) trackEvent("shop_click", { product: "Gift certificate" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") trackEvent("shop_click", { product: "Gift certificate" });
          }}
          className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Buy a gift certificate
        </a>
      </section>

    </main>
    </>
  );
}

/** Custom & branded boards, condensed to one banner. The full pitch, gallery,
 *  videos and quote form live on /custom-boards. */
function CustomBoardsBanner() {
  return (
    <Link
      to="/custom-boards"
      onClick={() => trackEvent("shop_click", { product: "Custom boards" })}
      className="group mt-10 flex flex-col overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-secondary/10 transition-colors hover:border-brand sm:flex-row"
    >
      <img
        src="/images/sup-pups/hero-mission-board.jpg"
        alt="A dog sitting on a custom-printed paddleboard at the water's edge"
        loading="lazy"
        className="h-56 w-full object-cover object-[center_42%] sm:h-auto sm:w-64"
      />
      <div className="flex flex-1 flex-col justify-center gap-2 p-6 sm:p-8">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          Custom &amp; branded boards
        </span>
        <h2 className="text-2xl font-bold">Put your logo on the water</h2>
        <p className="text-muted-foreground">
          We design and print boards for businesses, studios and resorts: your
          logo, your colors, printed into the board, not stuck on it. Add
          matching branded bandanas and totes to the order.
        </p>
        <p className="text-sm text-muted-foreground">
          Orders from 10 boards · 4–8 weeks · shipped across the continental US
        </p>
        <span className="mt-1 text-sm font-semibold text-primary group-hover:underline">
          Design your boards →
        </span>
      </div>
    </Link>
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
                  onClick={() =>
                    trackEvent("shop_click", {
                      product: product.name,
                      variant: o.label || undefined,
                      value: o.priceUsd,
                    })
                  }
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
