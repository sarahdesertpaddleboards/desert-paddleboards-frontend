import { drizzle } from "drizzle-orm/mysql2";
import { products, productCategories } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function addStickers() {
  console.log("Adding sticker products to database...");

  // First, check if "Stickers" category exists, if not create it
  const existingCategory = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.name, "Stickers"))
    .limit(1);

  let categoryId;
  if (existingCategory.length === 0) {
    const [newCategory] = await db.insert(productCategories).values({
      name: "Stickers",
      slug: "stickers",
      description: "Fun and inspiring stickers featuring Desert Paddleboards designs",
    });
    categoryId = newCategory.insertId;
    console.log(`Created Stickers category with ID: ${categoryId}`);
  } else {
    categoryId = existingCategory[0].id;
    console.log(`Using existing Stickers category with ID: ${categoryId}`);
  }

  // Add the three sticker products
  const stickers = [
    {
      categoryId: categoryId,
      name: "Take It Easy Go With The Flow Sticker",
      slug: "take-it-easy-sticker",
      description: "Relax on your paddleboard with this fun desert sunset sticker. Features a laid-back character enjoying the flow on the water with saguaro cacti and mountains in the background. Perfect for water bottles, laptops, or paddleboards!",
      price: 500, // $5.00 in cents
      imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663233691307/TrZzEhFHgYTejlkz.jpeg",
      isDigital: false,
      inventory: 100,
      isActive: true,
    },
    {
      categoryId: categoryId,
      name: "Hydrate and Meditate Playa Sticker",
      slug: "hydrate-meditate-sticker",
      description: "Stay hydrated and zen with this playful sticker featuring a peaceful character with a water bottle. Perfect reminder to take care of yourself while enjoying your paddleboard adventures. Waterproof and durable for any surface!",
      price: 500, // $5.00 in cents
      imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663233691307/RRVUEecYyiUSWzeu.jpeg",
      isDigital: false,
      inventory: 100,
      isActive: true,
    },
    {
      categoryId: categoryId,
      name: "Zen AF Sticker",
      slug: "zen-af-sticker",
      description: "Embrace your inner peace with this meditation-inspired sticker. Features a serene character in lotus position with a peace symbol, perfect for anyone who loves yoga, meditation, and paddleboard soundbaths. Weatherproof vinyl construction!",
      price: 500, // $5.00 in cents
      imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663233691307/UBrADGBzoeZDfXXx.jpeg",
      isDigital: false,
      inventory: 100,
      isActive: true,
    },
  ];

  for (const sticker of stickers) {
    // Check if product already exists
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, sticker.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(products).values(sticker);
      console.log(`✓ Added: ${sticker.name}`);
    } else {
      console.log(`- Skipped (already exists): ${sticker.name}`);
    }
  }

  console.log("\nSticker products added successfully!");
  process.exit(0);
}

addStickers().catch((error) => {
  console.error("Error adding stickers:", error);
  process.exit(1);
});
