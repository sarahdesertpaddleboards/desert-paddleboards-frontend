import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

/**
 * Stand-in for the private staff area at /staff (and /staff/earnings) until
 * the staff scheduling tool is merged from the `staff` branch, which replaces
 * these routes. Exists so links in staff texts resolve for Twilio's toll-free
 * reviewers. Noindex, so it stays out of search and the sitemap.
 */
export default function StaffPlaceholder() {
  return (
    <main className="container max-w-2xl py-16">
      <Seo
        title="Staff Area | Desert Paddleboards"
        description="The private staff area for Desert Paddleboards event staff: shifts, confirmations and pay."
        noindex
      />
      <h1 className="text-4xl font-bold leading-tight">Staff area</h1>
      <div className="prose prose-slate mt-6 max-w-none prose-p:text-muted-foreground">
        <p>
          This is the private area for Desert Paddleboards event staff. Team members see the shifts they're confirmed
          for, put their name down for open shifts, keep their details up to date, and see when their pay has been sent.
        </p>
        <p>
          Staff log in with a one-time link sent to the email or mobile number on their profile. There are no public
          accounts. If you work with us and need access, email <strong>sarah@desertpaddleboards.com</strong> or call{" "}
          <strong>602.456.0884</strong>.
        </p>
        <p>
          Staff can choose to get shift updates by text. See <Link to="/sms-terms">Staff text messages</Link> for what we
          send and how to stop, and our <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
