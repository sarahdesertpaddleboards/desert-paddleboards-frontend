import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Seo from "@/components/Seo";
import JsonLd from "@/components/JsonLd";
import { Link } from "react-router-dom";
import { faqPageLd } from "@/lib/jsonld";
import { SOUND_BATH_FAQ, type FaqItem } from "@/data/sound-bath-faq";

type FAQItem = FaqItem;

const faqData: { category: string; items: FAQItem[] }[] = [
  {
    category: "About Floating Sound Baths",
    items: [
      ...SOUND_BATH_FAQ,
      {
        question: "What are the benefits of a floating sound bath?",
        answer: "Floating sound baths offer numerous benefits including deep relaxation, stress reduction, improved sleep quality, enhanced mental clarity, relief from anxiety and tension, and a profound sense of peace. The combination of sound healing and gentle floating creates a unique sensory experience that many describe as deeply restorative and transformative."
      },
    ]
  },
  {
    category: "What to Bring & Wear",
    items: [
      {
        question: "Can I bring my phone or camera?",
        answer: "We ask that you leave phones and cameras off the paddleboard during the experience to maintain the meditative atmosphere and prevent water damage. However, we often take group photos before or after class that we share on social media. You're welcome to take photos during the social time before class begins."
      },
      {
        question: "Do I need to bring my own paddleboard?",
        answer: "No! All equipment is provided, including stable paddleboards specifically chosen for their comfort and stability during soundbaths. We use extra-wide boards that are perfect for lying down and relaxing."
      }
    ]
  },
  {
    category: "Experience & Safety",
    items: [
      {
        question: "What if I fall off the paddleboard?",
        answer: "The paddleboards we use are extremely stable and designed for lying down, so falling off is very rare. If it does happen, the water is shallow enough to stand in most locations, and our instructors are always nearby to assist. Many participants find the boards more stable than they expected!"
      },
      {
        question: "Is this suitable for pregnant women?",
        answer: "Floating sound baths can be wonderfully relaxing during pregnancy, but we recommend consulting with your healthcare provider first. The gentle nature of the experience and the supportive water environment can be beneficial, but every pregnancy is different. Please let us know in advance so we can provide any needed accommodations."
      },
      {
        question: "Are there age restrictions?",
        answer: "Our classes are generally designed for adults and teens (14+). For younger children, we occasionally offer special family-friendly sessions. Please contact us if you'd like to bring children under 14, and we can discuss options or recommend appropriate classes."
      },
      {
        question: "What if I have physical limitations or injuries?",
        answer: "Floating sound baths are gentle and accessible for most people. The water provides natural support, making it easier on joints and muscles than floor-based classes. However, please inform us of any physical limitations, recent surgeries, or health concerns when booking so we can ensure your safety and comfort."
      },
      {
        question: "It's an evening session in the Arizona heat — will I get overheated?",
        answer: "Great question, especially if you or a guest aren't used to the Arizona heat. Evening sessions are timed for when the day is cooling down, and being on the water keeps things noticeably more comfortable than being on land — you're floating on cool water the whole time, and many guests find it refreshing rather than hot. We still recommend arriving hydrated, bringing a water bottle, and wearing light, breathable clothing or a swimsuit. You're also welcome to get in the water before class or dip your towel in the water and drape it over your neck to cool off. If at any point you feel too warm, you can cool off in the water or take a break on the deck — just let your instructor know. We keep an eye on everyone throughout the session, and on days of genuine extreme heat we adjust or reschedule for safety."
      }
    ]
  },
  {
    category: "Booking & Policies",
    items: [
      {
        question: "How do I book a session?",
        answer: "You can book directly through our website by browsing our Experiences page and selecting your preferred date and location. Payment is processed securely through Stripe, and you'll receive an email confirmation with all the details you need."
      },
      {
        question: "What is your cancellation policy?",
        answer: "We understand plans change! You can cancel or reschedule up to 24 hours before your session for a full refund or credit toward a future session. Cancellations made less than 24 hours before the session are non-refundable, though we'll do our best to accommodate emergencies on a case-by-case basis."
      },
      {
        question: "What if there's bad weather?",
        answer: "We keep a close eye on the weather, and the clouds usually part! If we do need to cancel because of unsafe conditions (lightning, high winds or extreme heat), we'll let you know at least an hour before the event. And if we have to cancel, you'll always get a rain check or a full refund of your money."
      },
      {
        question: "Can I purchase a gift certificate?",
        answer: "Yes! Gift certificates are available in any amount and make wonderful gifts for birthdays, holidays, or anyone seeking relaxation and unique experiences. You can purchase them through our Shop page, and they can be used toward any of our sessions or private events."
      },
      {
        question: "What's the difference between resort and public pool sessions?",
        answer: "Resort sessions ($75) are held at premium locations like JW Marriott Desert Ridge, Westin Kierland, and Aji Spa, offering beautiful settings and a premium experience. Resort spa and pool amenities are not included with your ticket, though some resorts offer sound bath guests special pricing (for example, at JW Marriott Desert Ridge you can get a $50 Revive Spa day pass or 20% off spa services when you mention the sound bath while booking). Public pool sessions ($40) are held at community aquatic centers, providing the same high-quality sound bath experience at a more accessible price point."
      }
    ]
  },
  {
    category: "Day of Class",
    items: [
      {
        question: "When should I arrive?",
        answer: "Please arrive 10-15 minutes before your session starts to check in, get settled, and receive any instructions. This buffer time helps ensure we can start promptly and you have time to relax before the experience begins."
      },
      {
        question: "Where do I meet for my session?",
        answer: "Specific meeting location details are included in your confirmation email. For resort sessions, we typically meet at the pool area. For public pools, we meet at the main entrance or designated area. If you have trouble finding us, call the number provided in your confirmation."
      },
      {
        question: "What happens during the session?",
        answer: "After a brief welcome and safety overview, you'll get on your paddleboard and find a comfortable lying position. The session runs about 55 minutes (guided meditation, then live sound, then gentle floating yoga stretches), and you'll float peacefully the whole time. Afterward, there's time for gentle reawakening, sharing (optional), and connecting with other participants."
      },
      {
        question: "Can I eat before class?",
        answer: "We recommend eating a light meal 1-2 hours before your session rather than arriving on a full or empty stomach. Heavy meals right before a session may make you uncomfortable while lying down, and being too hungry can be distracting. Stay well-hydrated throughout the day."
      }
    ]
  }
];

function FAQAccordion({ question, answer, link }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-lg pr-8">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {/* Always rendered (just hidden when closed) so answers are in the
          prerendered HTML for search engines and AI answers. */}
      <div hidden={!isOpen} className="px-6 pb-4 text-muted-foreground leading-relaxed">
        {answer}
        {link ? (
          <Link to={link.href} className="mt-2 block font-medium text-primary hover:underline">
            {link.label} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Floating Sound Bath FAQ | What to Expect | Desert Paddleboards"
        description="What is a floating sound bath? What to wear, what if it's chilly, how long it lasts, and whether you need to swim. Answers before your first float."
        image="/venues/doubletree.jpg"
      />
      <JsonLd data={faqPageLd(faqData.flatMap((section) => section.items))} />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container">
          <h1 className="text-balance text-4xl md:text-5xl font-bold text-center mb-6">
            Floating Sound Bath FAQ
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know before your first floating sound bath:
            what to wear, what to bring, and what actually happens on the water
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          {faqData.map((section, idx) => (
            <div key={idx} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-primary">
                {section.category}
              </h2>
              <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                {section.items.map((item, itemIdx) => (
                  <FAQAccordion key={itemIdx} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're here to help! Feel free to reach out with any questions not covered here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:602.456.0884"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Call Us: 602.456.0884
            </a>
            <a
              href="/locations"
              className="inline-flex items-center justify-center px-8 py-3 bg-background border-2 border-primary text-primary rounded-md font-medium hover:bg-primary/10 transition-colors"
            >
              Browse Floating Sessions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
