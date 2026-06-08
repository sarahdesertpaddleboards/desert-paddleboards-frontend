import { Head } from "vite-react-ssg";

/**
 * Renders a JSON-LD <script> into the document head (via vite-react-ssg's Head),
 * so it lands in the pre-rendered static HTML for crawlers.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  );
}
