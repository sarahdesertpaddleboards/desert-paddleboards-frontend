import { Link } from "react-router-dom";
import { Gift as GiftIcon } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { useFareHarborEmbed } from "@/components/FareHarborButton";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { trackEvent } from "@/lib/analytics";
import { fareHarborUrl } from "@/lib/utm";
import { SITE_URL } from "@/data/site";
import {
  experiences,
  GIFT_CERTIFICATE_ITEM_ID,
  GIFT_CERTIFICATE_URL,
} from "@/data/locations";

/**
 * /gift — floating sound bath gift certificates.
 *
 * The H1 + first paragraph answer the three questions people (and AI answer
 * engines) ask, inside the first 60 words: what the certificate is, where we
 * run the sessions, and what it costs as a total. Keep that paragraph short.
 *
 * Prices come from the FareHarbor gift-certificate item's description (item
 * 573676): $40 public pool / $75 resort, one float per certificate, no tax on
 * the item. If they change in FareHarbor, change CERTIFICATES here too.
 */
const CERTIFICATES = [
  { name: "Public pool certificate", price: 40, where: "City and community pools" },
  { name: "Resort certificate", price: 75, where: "Resort and hotel pools" },
];

const PARTY_SIZES = [1, 2, 4];

export default function Gift() {
  useFareHarborEmbed();

  const buyUrl = fareHarborUrl(GIFT_CERTIFICATE_URL, { page: "/gift", placement: "buy_button" });
  const track = (placement: string) =>
    trackEvent("shop_click", { product: "Gift certificate", placement });

  // Where certificates can be used: the live FareHarbor sound bath venues,
  // grouped by city, so this list tracks the venue catalog automatically.
  const byCity = new Map<string, string[]>();
  for (const e of experiences) {
    if (e.kind !== "soundbath") continue;
    const venues = byCity.get(e.city) ?? [];
    venues.push(e.venue || e.title);
    byCity.set(e.city, venues);
  }
  const cities = [...byCity.entries()].sort(([a], [b]) => a.localeCompare(b));

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Gift Certificates", path: "/gift" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${SITE_URL}/gift#product`,
      name: "Floating Sound Bath Gift Certificate",
      description:
        "An emailed gift certificate good for one floating sound bath at a Phoenix-area resort, rooftop or city pool.",
      image: `${SITE_URL}/floating-soundbath-sunset-hero.jpg`,
      brand: { "@id": `${SITE_URL}/#organization` },
      sku: String(GIFT_CERTIFICATE_ITEM_ID),
      offers: CERTIFICATES.map((c) => ({
        "@type": "Offer",
        name: c.name,
        price: c.price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/gift`,
      })),
    },
  ]);

  return (
    <main className="py-16">
      <Seo
        title="Floating Sound Bath Gift Certificates | Desert Paddleboards"
        description="Give a floating sound bath: an emailed gift certificate for one float at a Phoenix-area resort, rooftop or city pool. $40 total public pool, $75 total resort."
        image="/floating-soundbath-sunset-hero.jpg"
      />
      <JsonLd data={structuredData} />

      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold md:text-5xl">Floating Sound Bath Gift Certificates</h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground">
          A floating sound bath gift certificate is an emailed code for one
          floating sound bath: 55 minutes on a floating water bed (okay, a
          paddleboard) while live musicians play. We run them at resort, rooftop
          and city pools around Phoenix. Each certificate is $40 total for a
          public pool or $75 total for a resort.
        </p>

        <a
          href={buyUrl}
          // pointerdown/Enter, not onClick — FareHarbor's autolightframe script
          // swallows the click (see FareHarborButton).
          onPointerDown={(e) => {
            if (e.button === 0) track("gift_page");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") track("gift_page");
          }}
          className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <GiftIcon className="h-4 w-4" aria-hidden="true" />
          Buy a gift certificate
        </a>

        <section className="mt-14">
          <h2 className="text-2xl font-bold">What it costs</h2>
          <p className="mt-2 text-muted-foreground">
            One certificate covers one person for one float. These are the totals
            you pay, with no tax added.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Gift for</th>
                  {CERTIFICATES.map((c) => (
                    <th key={c.name} scope="col" className="px-4 py-3 font-semibold">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PARTY_SIZES.map((n) => (
                  <tr key={n} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {n === 1 ? "1 person" : `${n} people`}
                    </th>
                    {CERTIFICATES.map((c) => (
                      <td key={c.name} className="px-4 py-3">
                        ${c.price * n} total
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>Pick a public pool or resort certificate and buy it online.</li>
            <li>A code arrives at the email address you give at checkout.</li>
            <li>
              Your lucky person picks a date on the{" "}
              <Link to="/calendar" className="font-semibold text-brand hover:text-brand-dark">
                calendar
              </Link>{" "}
              and enters the code when they book.
            </li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            Resort spa and pool amenities aren&apos;t included with a session.
          </p>
        </section>

        {cities.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">Where they can float</h2>
            <p className="mt-2 text-muted-foreground">
              Current floating sound bath venues. See every one on the{" "}
              <Link to="/locations" className="font-semibold text-brand hover:text-brand-dark">
                locations page
              </Link>
              .
            </p>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {cities.map(([city, venues]) => (
                <div key={city}>
                  <dt className="font-semibold">{city}</dt>
                  <dd className="text-sm text-muted-foreground">{venues.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </main>
  );
}
