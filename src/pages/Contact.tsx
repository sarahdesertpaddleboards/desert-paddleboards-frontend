import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, graph } from "@/lib/jsonld";
import { submitWeb3Form } from "@/lib/web3forms";
import { trackEvent } from "@/lib/analytics";
import { business } from "@/data/site";

export default function Contact() {
  const [params] = useSearchParams();
  // Optional context passed by "Email us" buttons, e.g. /contact?subject=Paddleboard%20rental
  const presetSubject = params.get("subject") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () =>
    setFormData({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const subject = presetSubject
      ? `Website inquiry — ${presetSubject}`
      : "Website inquiry";

    // Preferred path: deliver straight to Sarah's inbox via Web3Forms.
    const result = await submitWeb3Form({
      subject,
      from_name: "Desert Paddleboards website",
      replyto: formData.email,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "—",
      inquiry_about: presetSubject || "General",
      message: formData.message || "—",
    });

    setSubmitting(false);

    if (result.success) {
      trackEvent("generate_lead", { form: "contact" });
      toast.success(
        "Thank you! Your message has been sent — we'll reply within 24 hours.",
      );
      resetForm();
      return;
    }

    // Fallback (request failed): hand off to the visitor's mail client with
    // everything pre-filled so the message isn't lost.
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "—"}`,
      "",
      "Message:",
      formData.message || "—",
    ].join("\n");
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.message("Opening your email app so you can send your message directly…");
  };

  const structuredData = graph([
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  ]);

  return (
    <main>
      <Seo
        title="Contact Us | Desert Paddleboards"
        description="Get in touch with Desert Paddleboards — questions about floating soundbaths, water-fitness classes, rentals, adventures, coaching or private events in Arizona."
      />
      <JsonLd data={structuredData} />

      <section className="bg-muted/40 py-16">
        <div className="container max-w-3xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Get in touch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Questions about a class, a rental, a private event, or anything else?
            Send us a note and we&apos;ll reply within 24 hours.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-12">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Contact details */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Call or text</p>
                <a
                  href="tel:6024560884"
                  className="text-muted-foreground hover:text-primary"
                >
                  602.456.0884
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Email</p>
                <a
                  href={`mailto:${business.email}`}
                  className="break-all text-muted-foreground hover:text-primary"
                >
                  {business.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Based in</p>
                <p className="text-muted-foreground">Mesa, AZ — serving Arizona</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={
                      presetSubject
                        ? `I'm interested in ${presetSubject}…`
                        : "How can we help?"
                    }
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Sending…" : "Send message"}
                </Button>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" /> We reply within 24
                  hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
