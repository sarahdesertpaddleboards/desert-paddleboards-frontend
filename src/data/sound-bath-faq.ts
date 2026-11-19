/**
 * The core "floating sound bath" questions — shown first on /faq and (a few of
 * them) on the homepage, and emitted as FAQPage JSON-LD on both.
 *
 * Only state facts that already appear on the site. Prices, policies and dates
 * live elsewhere — don't add them here.
 */

export interface FaqItem {
  question: string;
  answer: string;
  /** Optional follow-on link shown under the answer (not part of the JSON-LD). */
  link?: { href: string; label: string };
}

export const SOUND_BATH_FAQ: FaqItem[] = [
  {
    question: "What is a floating sound bath?",
    answer:
      "A floating sound bath is a sound bath on the water. You lie back on a floating water bed (okay, it's a paddleboard, but we're sticking with water bed) in a pool while live sound bath musicians play crystal singing bowls, gongs, chimes, flutes and more. We call it The Floating Nap™: part guided meditation, part live concert, all sound healing, and zero effort required from you.",
  },
  {
    question: "What's the difference between a sound bath and a floating sound bath?",
    answer:
      "A regular sound bath happens on a mat on the floor. A floating sound bath moves the whole thing onto the water, so you're gently rocking on the pool while the music plays. Sound vibrations travel through water more effectively than air, so you feel the sound healing through your whole body, and a pool under the open sky feels nothing like a studio. Also: no hard floor.",
  },
  {
    question: "Do I need to know how to swim, or have any experience?",
    answer:
      "No experience needed, whether that's meditation, yoga or paddleboarding. You lie down the whole time on an extra-wide, very stable board in a pool or calm water. Basic swimming ability is recommended but not required, life vests are available on request, and our instructors are trained in water safety and always nearby.",
  },
  {
    question: "What should I wear and bring?",
    answer:
      "Wear whatever you're comfortable lying down in. A swimsuit is optional: quick-drying workout or yoga clothes work just as well, and plenty of guests stay almost completely dry. Bring a towel, a water bottle and a layer for evening sessions. We bring the floating water beds, a blanket and lavender eye mask, and all the instruments. Jewelry and phones are happiest left at home or in the car.",
  },
  {
    question: "What happens if it's chilly?",
    answer:
      "Arizona does get the occasional cold snap. In cool weather you lie on top of the water in warm clothes (think sweats and a hoodie), and we bring a blanket for every guest. You stay cozy and dry, and honestly the stars look even better on a crisp night.",
  },
  {
    question: "How long is a floating sound bath?",
    answer:
      "About an hour. The session runs 55 minutes: a guided meditation to help you settle in, then live sound, then a few gentle floating yoga stretches to wake you back up. Plan to arrive 10–15 minutes early to check in and get comfy.",
  },
  {
    question: "Where are floating sound baths held?",
    answer:
      "At resort, rooftop and city pools across Phoenix, Scottsdale, Mesa, Tempe, Chandler, Gilbert and more, from Queen Creek and Apache Junction to the West Valley and even Sedona. Classes run year-round and new dates are added all the time, so check the calendar and check back for new dates.",
    link: { href: "/locations", label: "See every floating sound bath location" },
  },
  {
    question: "Can I book a private floating sound bath?",
    answer:
      "Yes! We bring the whole experience to private pools: homes, vacation rentals, and HOA or community pools. It's a hit for bachelorettes, birthdays, retreats and team events. Hotel and resort pools are public classes only, so for those, grab a spot on the calendar.",
    link: { href: "/private-events", label: "Plan a private floating sound bath" },
  },
  {
    question: "Do I need to be a hotel guest to join a resort class?",
    answer:
      "Nope. Anyone can book a resort or rooftop floating sound bath through our website, no room key required. Resort spa and pool amenities aren't included with your ticket, though some resorts offer sound bath guests special pricing.",
  },
  {
    question: "Is it a sound bath or a soundbath?",
    answer:
      "Both, and people search for both. We write it as two words, sound bath, but if you came here looking for a floating soundbath, you're in exactly the right place.",
  },
];

/** The handful shown on the homepage (the full list lives on /faq). */
export const HOME_FAQ: FaqItem[] = [
  SOUND_BATH_FAQ[0],
  SOUND_BATH_FAQ[1],
  SOUND_BATH_FAQ[2],
  SOUND_BATH_FAQ[5],
  SOUND_BATH_FAQ[8],
];
