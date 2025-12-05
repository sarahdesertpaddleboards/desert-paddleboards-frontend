/**
 * Stripe Products Configuration
 * Define all products and prices here for centralized management
 */

export const PRODUCTS = {
  // Floating Soundbath Classes
  SOUNDBATH_RESORT: {
    name: "Floating Soundbath - Resort Class",
    description: "Premium floating soundbath experience at luxury resort pools. Includes towel service and blankets.",
    price: 7500, // $75.00 in cents
    currency: "usd",
    type: "class" as const,
  },
  SOUNDBATH_PUBLIC: {
    name: "Floating Soundbath - Public Pool Class",
    description: "Floating soundbath experience at public aquatic centers across Arizona and California.",
    price: 4000, // $40.00 in cents
    currency: "usd",
    type: "class" as const,
  },

  // Floating Yoga
  YOGA_CLASS: {
    name: "Floating Yoga Class",
    description: "Paddleboard yoga on the water - a unique blend of fitness and mindfulness.",
    price: 4000, // $40.00 in cents
    currency: "usd",
    type: "class" as const,
  },

  // Digital Products
  SONORAN_ECHOES_CD: {
    name: "Sonoran Echoes CD",
    description: "Physical CD featuring Native American flute and soundbath instruments by Cody Blackbird. Includes shipping.",
    price: 2500, // $25.00 in cents
    currency: "usd",
    type: "physical" as const,
  },
  SONORAN_ECHOES_USB: {
    name: "Sonoran Echoes USB + Bonus Tracks",
    description: "USB drive with full album plus exclusive bonus tracks. Includes shipping.",
    price: 3500, // $35.00 in cents
    currency: "usd",
    type: "physical" as const,
  },
  SONORAN_ECHOES_DIGITAL: {
    name: "Sonoran Echoes - Digital Download",
    description: "Instant digital download of the complete Sonoran Echoes album in high-quality MP3 format.",
    price: 1500, // $15.00 in cents
    currency: "usd",
    type: "digital" as const,
  },

  // Travel Guides
  BLACK_CANYON_GUIDE: {
    name: "Black Canyon Paddleboarding Guide",
    description: "Comprehensive digital guide for paddleboarding Black Canyon with maps, tips, and safety information.",
    price: 500, // $5.00 in cents
    currency: "usd",
    type: "digital" as const,
  },
  LEES_FERRY_GUIDE: {
    name: "Lees Ferry Adventure Guide",
    description: "Complete guide for paddleboarding and kayaking at Lees Ferry with route details and local insights.",
    price: 500, // $5.00 in cents
    currency: "usd",
    type: "digital" as const,
  },

  // Gift Certificates
  GIFT_CERT_40: {
    name: "Gift Certificate - $40",
    description: "Gift certificate valid for one public pool floating soundbath class.",
    price: 4000, // $40.00 in cents
    currency: "usd",
    type: "gift" as const,
  },
  GIFT_CERT_75: {
    name: "Gift Certificate - $75",
    description: "Gift certificate valid for one resort floating soundbath class.",
    price: 7500, // $75.00 in cents
    currency: "usd",
    type: "gift" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
export type ProductType = typeof PRODUCTS[ProductKey]["type"];
