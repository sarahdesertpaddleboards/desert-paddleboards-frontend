import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

/**
 * Public page describing the staff shift-text program. Phone carriers (and
 * Twilio's toll-free verification) require a public description of how people
 * opt in, what they'll get, and how to stop. The opt-in itself happens on the
 * staff profile (behind login), so this page shows the exact checkbox wording.
 */
export default function SmsTerms() {
  return (
    <main className="container max-w-3xl py-16">
      <Seo
        title="Staff Text Messages | Desert Paddleboards"
        description="How Desert Paddleboards staff opt in to shift texts, what messages they receive, and how to stop them at any time."
      />
      <h1 className="text-4xl font-bold leading-tight">Staff text messages</h1>
      <div className="prose prose-slate mt-6 max-w-none prose-headings:font-bold prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-li:marker:text-brand">
        <p>
          Desert Paddleboards (a trade name of Blue Wave Experiences Inc, Arizona) sends text messages to members of our
          event staff who ask for them. These are work messages about the shifts they work with us. We do not send
          marketing texts, and we never text members of the public through this program.
        </p>

        <h2>How staff sign up</h2>
        <p>
          Staff manage their details in our private staff area. On their profile they enter a mobile number and can tick a
          box that is <strong>unticked by default</strong>. Texts start only after they tick it and save. The wording next
          to the box is:
        </p>
        <div className="not-prose my-6 rounded-xl border border-border bg-muted/40 p-5">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" disabled className="mt-0.5 size-4 shrink-0" aria-label="Example opt-in checkbox" />
            <span>
              <span className="font-semibold">Text me shift updates</span>
              <span className="mt-1 block leading-relaxed text-muted-foreground">
                I agree to get automated texts from Desert Paddleboards at this number about my shifts: confirmations,
                changes, reminders and pay. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP
                for help. Agreeing isn't a condition of working with us. Text terms · Privacy
              </span>
            </span>
          </label>
        </div>
        <p>
          Right after opting in they receive: <em>"Desert Paddleboards: You're signed up for staff shift texts
          (confirmations, changes, pay). Msg frequency varies. Msg &amp; data rates may apply. Reply HELP for help, STOP to
          opt out."</em>
        </p>
        <p>
          Staff can also ask for a one-time login link by text from the staff login page, by entering the mobile number on
          their profile. That sends a single text in reply to their request.
        </p>

        <h2>What we send</h2>
        <ul>
          <li>Shift confirmations, with the date, place, role and agreed pay.</li>
          <li>Changes or cancellations to a shift they're working, and reminders before it.</li>
          <li>A note when their pay has been sent.</li>
          <li>One-time login links they request.</li>
        </ul>
        <p>Example: <em>"Desert Paddleboards: You're confirmed for Floating Soundbath at Kierland, Sat, Nov 8, 6:30pm as crew. Pay $85. Details: https://desertpaddleboards.com/staff"</em></p>
        <p>Message frequency varies with how many shifts someone works, typically a few texts a month. Message and data rates may apply.</p>

        <h2>How to stop</h2>
        <p>
          Reply <strong>STOP</strong> to any text to stop all texts, or untick the box on the staff profile. Reply{" "}
          <strong>START</strong> to sign up again, or <strong>HELP</strong> for help. Staff still get the same updates by
          email. For help, email <strong>sarah@desertpaddleboards.com</strong> or call <strong>602.456.0884</strong>.
        </p>
        <p>Carriers are not liable for delayed or undelivered messages.</p>

        <h2>Privacy</h2>
        <p>
          Mobile numbers and text consent are used only to send these staff messages. We do not sell or share mobile
          information with third parties or affiliates for marketing or promotional purposes. Text-messaging opt-in data
          and consent are never shared with any third party. Messages are delivered through our texting provider, Twilio.
          See our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
        </p>
      </div>
    </main>
  );
}
