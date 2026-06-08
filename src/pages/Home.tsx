import { Head } from "vite-react-ssg";
import LocationFinder from "@/components/LocationFinder";
import JsonLd from "@/components/JsonLd";
import { localBusinessLd } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <Head>
        <title>Floating Soundbaths in Arizona | Desert Paddleboards</title>
        <meta
          name="description"
          content="Float weightlessly as live sound washes over you. Find a floating soundbath near you across Phoenix, Mesa, Scottsdale, Tempe and more — and book online."
        />
      </Head>
      <JsonLd data={localBusinessLd()} />
      <LocationFinder />
    </>
  );
}
