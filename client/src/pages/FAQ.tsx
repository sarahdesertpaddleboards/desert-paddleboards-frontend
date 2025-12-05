import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: { category: string; items: FAQItem[] }[] = [
  {
    category: "About Floating Soundbaths",
    items: [
      {
        question: "What is a floating soundbath?",
        answer: "A floating soundbath is a unique wellness experience that combines the meditative practice of sound healing with the gentle support of floating on a paddleboard in water. You'll lie comfortably on a stable paddleboard while being immersed in the healing vibrations of live instruments like crystal singing bowls, gongs, chimes, and flutes. The water amplifies the sound vibrations, creating a deeply relaxing and transformative experience."
      },
      {
        question: "Do I need any experience with meditation or yoga?",
        answer: "No experience is necessary! Our floating soundbaths are designed for everyone, from complete beginners to experienced meditators. The paddleboards are extremely stable, and you'll be lying down the entire time. Our instructors provide all the guidance you need to feel comfortable and relaxed."
      },
      {
        question: "What are the benefits of a floating soundbath?",
        answer: "Floating soundbaths offer numerous benefits including deep relaxation, stress reduction, improved sleep quality, enhanced mental clarity, relief from anxiety and tension, and a profound sense of peace. The combination of sound healing and gentle floating creates a unique sensory experience that many describe as deeply restorative and transformative."
      },
      {
        question: "How is this different from a regular soundbath?",
        answer: "The water element adds a unique dimension to the experience. Sound vibrations travel through water more effectively than air, so you'll feel the healing frequencies throughout your entire body. The gentle rocking motion of the water enhances relaxation, and the outdoor or pool setting creates a special ambiance that's different from indoor studio experiences."
      }
    ]
  },
  {
    category: "What to Bring & Wear",
    items: [
      {
        question: "What should I wear?",
        answer: "Wear comfortable swimwear that you can relax in for 60-90 minutes. We recommend a one-piece swimsuit or athletic swimwear. Bring a cover-up or comfortable clothes to change into afterward. For evening classes, consider bringing a light jacket or towel for warmth."
      },
      {
        question: "What should I bring?",
        answer: "Bring a towel, water bottle, and any personal items you need. We provide the paddleboards, life vests (if desired), and all sound healing instruments. Sunscreen is recommended for daytime classes. You may want to bring a small dry bag for valuables, though we recommend leaving jewelry and electronics at home or in your car."
      },
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
        question: "Do I need to know how to swim?",
        answer: "While basic swimming ability is recommended, it's not required. The paddleboards are very stable, and you'll be in a controlled pool or calm water environment. Life vests are available upon request for anyone who wants extra security. Our instructors are trained in water safety and are always present."
      },
      {
        question: "What if I fall off the paddleboard?",
        answer: "The paddleboards we use are extremely stable and designed for lying down, so falling off is very rare. If it does happen, the water is shallow enough to stand in most locations, and our instructors are always nearby to assist. Many participants find the boards more stable than they expected!"
      },
      {
        question: "Is this suitable for pregnant women?",
        answer: "Floating soundbaths can be wonderfully relaxing during pregnancy, but we recommend consulting with your healthcare provider first. The gentle nature of the experience and the supportive water environment can be beneficial, but every pregnancy is different. Please let us know in advance so we can provide any needed accommodations."
      },
      {
        question: "Are there age restrictions?",
        answer: "Our classes are generally designed for adults and teens (14+). For younger children, we occasionally offer special family-friendly sessions. Please contact us if you'd like to bring children under 14, and we can discuss options or recommend appropriate classes."
      },
      {
        question: "What if I have physical limitations or injuries?",
        answer: "Floating soundbaths are gentle and accessible for most people. The water provides natural support, making it easier on joints and muscles than floor-based classes. However, please inform us of any physical limitations, recent surgeries, or health concerns when booking so we can ensure your safety and comfort."
      }
    ]
  },
  {
    category: "Booking & Policies",
    items: [
      {
        question: "How do I book a class?",
        answer: "You can book directly through our website by browsing our Classes & Events page and selecting your preferred date and location. Payment is processed securely through Stripe, and you'll receive an email confirmation with all the details you need."
      },
      {
        question: "What is your cancellation policy?",
        answer: "We understand plans change! You can cancel or reschedule up to 24 hours before your class for a full refund or credit toward a future class. Cancellations made less than 24 hours before the class are non-refundable, though we'll do our best to accommodate emergencies on a case-by-case basis."
      },
      {
        question: "What happens if the class is cancelled due to weather?",
        answer: "For outdoor classes, we monitor weather conditions closely. If we need to cancel due to unsafe weather (lightning, extreme heat, high winds), you'll receive a full refund or the option to transfer to another date. We'll notify you as early as possible, typically at least 2-3 hours before class time."
      },
      {
        question: "Can I purchase a gift certificate?",
        answer: "Yes! Gift certificates are available in any amount and make wonderful gifts for birthdays, holidays, or anyone seeking relaxation and unique experiences. You can purchase them through our Shop page, and they can be used toward any of our classes or private events."
      },
      {
        question: "Do you offer private events or group bookings?",
        answer: "Absolutely! We love hosting private floating soundbaths for bachelorette parties, corporate wellness events, birthday celebrations, and retreats. Private events can be customized to your group's needs and preferences. Visit our Private Events page or contact us directly for pricing and availability."
      },
      {
        question: "What's the difference between resort and public pool classes?",
        answer: "Resort classes ($75) are held at premium locations like JW Marriott Desert Ridge, Westin Kierland, and Aji Spa, offering luxury amenities, beautiful settings, and often include access to resort facilities. Public pool classes ($40) are held at community aquatic centers, providing the same high-quality soundbath experience at a more accessible price point."
      }
    ]
  },
  {
    category: "Day of Class",
    items: [
      {
        question: "When should I arrive?",
        answer: "Please arrive 10-15 minutes before class starts to check in, get settled, and receive any instructions. This buffer time helps ensure we can start promptly and you have time to relax before the experience begins."
      },
      {
        question: "Where do I meet for class?",
        answer: "Specific meeting location details are included in your confirmation email. For resort classes, we typically meet at the pool area. For public pools, we meet at the main entrance or designated area. If you have trouble finding us, call the number provided in your confirmation."
      },
      {
        question: "What happens during the class?",
        answer: "After a brief welcome and safety overview, you'll get on your paddleboard and find a comfortable lying position. The soundbath typically lasts 45-60 minutes, during which you'll float peacefully while immersed in healing sounds. Afterward, there's time for gentle reawakening, sharing (optional), and connecting with other participants."
      },
      {
        question: "Can I eat before class?",
        answer: "We recommend eating a light meal 1-2 hours before class rather than arriving on a full or empty stomach. Heavy meals right before class may make you uncomfortable while lying down, and being too hungry can be distracting. Stay well-hydrated throughout the day."
      }
    ]
  }
];

function FAQAccordion({ question, answer }: FAQItem) {
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
      {isOpen && (
        <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about floating soundbaths, booking, and what to expect
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
              href="tel:480.201.9520"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Call Us: 480.201.9520
            </a>
            <a
              href="/events"
              className="inline-flex items-center justify-center px-8 py-3 bg-background border-2 border-primary text-primary rounded-md font-medium hover:bg-primary/10 transition-colors"
            >
              Browse Classes
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
