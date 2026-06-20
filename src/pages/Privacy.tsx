import ReactMarkdown from "react-markdown";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { privacyMarkdown } from "@/data/legal-content";

export default function Privacy() {
  return (
    <main className="container max-w-3xl py-16">
      <Seo
        title="Privacy Policy | Desert Paddleboards"
        description="How Desert Paddleboards collects, uses and protects your information."
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <h1 className="text-4xl font-bold leading-tight">Privacy Policy</h1>
      <div className="prose prose-slate mt-6 max-w-none prose-headings:font-bold prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-li:marker:text-brand">
        <ReactMarkdown>{privacyMarkdown}</ReactMarkdown>
      </div>
    </main>
  );
}
