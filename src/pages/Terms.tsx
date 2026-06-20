import ReactMarkdown from "react-markdown";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { termsMarkdown } from "@/data/legal-content";

export default function Terms() {
  return (
    <main className="container max-w-3xl py-16">
      <Seo
        title="Terms of Service | Desert Paddleboards"
        description="The terms that apply to bookings, classes, rentals, products and use of the Desert Paddleboards website."
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />
      <h1 className="text-4xl font-bold leading-tight">Terms of Service</h1>
      <div className="prose prose-slate mt-6 max-w-none prose-headings:font-bold prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-li:marker:text-brand">
        <ReactMarkdown>{termsMarkdown}</ReactMarkdown>
      </div>
    </main>
  );
}
