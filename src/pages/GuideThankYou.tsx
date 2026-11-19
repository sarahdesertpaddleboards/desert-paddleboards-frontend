import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Post-purchase page for the Black Canyon Guide (digital download).
 * Stripe Payment Link → "After payment" → redirect to /guides/black-canyon/thank-you
 * The PDF lives at an unlisted path under /public/downloads/.
 */
const GUIDE_PDF = "/downloads/black-canyon-guide-r7k3m9x2.pdf";

export default function GuideThankYou() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70">
        Thank you!
      </p>
      <h1 className="mt-3 text-4xl font-bold">Your Black Canyon Guide is ready</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Twenty pages of insider tips, the river map, permits and shuttle details,
        and both overnight options — everything you need to paddle from Hoover
        Dam to Emerald Cove.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button asChild size="lg">
          <a href={GUIDE_PDF} download="Black-Canyon-Guide.pdf">
            <Download className="mr-2 h-5 w-5" />
            Download the guide (PDF)
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">
          Save it to your phone — there's no cell service in the canyon.
          Bookmark this page so you can come back for it any time.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-left">
        <p className="font-semibold">Questions, or want to do this trip with Sarah?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Desert Paddleboards runs small-group Black Canyon outings a few times a
          year. Text or call 480.201.9520, or message{" "}
          <a
            className="underline"
            href="https://www.instagram.com/desertpaddleboards"
            target="_blank"
            rel="noopener noreferrer"
          >
            @DesertPaddleboards
          </a>{" "}
          on Instagram.
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" /> Your Stripe receipt was emailed to you.
        </p>
      </div>
    </main>
  );
}
