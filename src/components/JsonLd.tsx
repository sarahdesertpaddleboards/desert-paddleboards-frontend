import { Head } from "vite-react-ssg";
import { graph } from "@/lib/jsonld";

/**
 * Renders a JSON-LD <script> into the document head (via vite-react-ssg's Head),
 * so it lands in the pre-rendered static HTML for crawlers. Each page renders
 * exactly one of these; a bare node is wrapped in the page @graph (which adds
 * the site-wide business + WebSite nodes).
 */
export default function JsonLd({ data }: { data: object }) {
  const ld = "@graph" in data ? data : graph([data]);
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
    </Head>
  );
}
