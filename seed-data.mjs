import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seedData() {
  console.log("🌱 Seeding database with sample data...");

  try {
    // Insert sample locations
    console.log("Adding locations...");
    await db.execute(`
      INSERT INTO locations (name, address, city, state, type, description, isActive) VALUES
      ('JW Marriott Phoenix Desert Ridge', '5350 E Marriott Dr', 'Phoenix', 'AZ', 'resort', 'Luxury resort with stunning pool facilities', 1),
      ('Kiwanis Recreation Center', '6111 S All America Way', 'Tempe', 'AZ', 'public_pool', 'Indoor heated pool perfect for year-round classes', 1),
      ('Chaparral Aquatic Center', '5401 N Hayden Rd', 'Scottsdale', 'AZ', 'public_pool', 'Beautiful Scottsdale facility with ample parking', 1),
      ('The Plunge', '3115 Ocean Front Walk', 'San Diego', 'CA', 'public_pool', 'Historic oceanfront pool in Pacific Beach', 1)
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Insert sample event types
    console.log("Adding event types...");
    await db.execute(`
      INSERT INTO eventTypes (name, slug, description, duration, publicPrice, resortPrice, maxCapacity, isActive) VALUES
      ('Floating Soundbath', 'floating-soundbath', 'Experience deep relaxation floating on water while immersed in healing sound vibrations', 90, 4000, 7500, 20, 1),
      ('Floating Yoga', 'floating-yoga', 'Paddleboard yoga combining fitness and mindfulness on the water', 60, 4000, 4000, 15, 1)
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Insert sample events
    console.log("Adding events...");
    const futureDate1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
    const futureDate2 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
    const futureDate3 = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000); // 3 weeks from now
    
    await db.execute(`
      INSERT INTO events (eventTypeId, locationId, title, startTime, endTime, price, maxCapacity, currentBookings, status) VALUES
      (1, 1, 'Floating Soundbath at JW Marriott Phoenix Desert Ridge', '${futureDate1.toISOString().slice(0, 19).replace('T', ' ')}', '${new Date(futureDate1.getTime() + 90 * 60000).toISOString().slice(0, 19).replace('T', ' ')}', 7500, 20, 5, 'scheduled'),
      (1, 2, 'Indoor Floating Soundbath with LIVE music', '${futureDate2.toISOString().slice(0, 19).replace('T', ' ')}', '${new Date(futureDate2.getTime() + 90 * 60000).toISOString().slice(0, 19).replace('T', ' ')}', 4000, 25, 12, 'scheduled'),
      (1, 3, 'Floating Soundbath at Chaparral - SCOTTSDALE', '${futureDate3.toISOString().slice(0, 19).replace('T', ' ')}', '${new Date(futureDate3.getTime() + 90 * 60000).toISOString().slice(0, 19).replace('T', ' ')}', 4000, 20, 8, 'scheduled'),
      (2, 2, 'Floating Yoga Class', '${new Date(futureDate1.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')}', '${new Date(futureDate1.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60000).toISOString().slice(0, 19).replace('T', ' ')}', 4000, 15, 3, 'scheduled')
      ON DUPLICATE KEY UPDATE title=title;
    `);

    // Insert sample product categories
    console.log("Adding product categories...");
    await db.execute(`
      INSERT INTO productCategories (name, slug, description, displayOrder, isActive) VALUES
      ('Music', 'music', 'Soundbath music and albums', 1, 1),
      ('Guides', 'guides', 'Paddleboarding adventure guides', 2, 1),
      ('Gift Certificates', 'gift-certificates', 'Give the gift of wellness', 3, 1)
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Insert sample products
    console.log("Adding products...");
    await db.execute(`
      INSERT INTO products (categoryId, name, slug, description, price, imageUrl, isDigital, downloadUrl, inventory, isActive, isFeatured) VALUES
      (1, 'Sonoran Echoes - Digital Download', 'sonoran-echoes-digital', 'Instant digital download of the complete Sonoran Echoes album featuring Native American flute and soundbath instruments by Cody Blackbird. High-quality MP3 format.', 1500, '/sonoran-echoes-album.webp', 1, NULL, 0, 1, 1),
      (1, 'Sonoran Echoes CD', 'sonoran-echoes-cd', 'Physical CD featuring Native American flute and soundbath instruments by Cody Blackbird. Includes shipping.', 2500, '/sonoran-echoes-album.webp', 0, NULL, 50, 1, 1),
      (1, 'Sonoran Echoes USB + Bonus Tracks', 'sonoran-echoes-usb', 'USB drive with full album plus exclusive bonus tracks not available anywhere else. Includes shipping.', 3500, '/sonoran-echoes-album.webp', 0, NULL, 25, 1, 0),
      (2, 'Black Canyon Paddleboarding Guide', 'black-canyon-guide', 'Comprehensive digital guide for paddleboarding Black Canyon with maps, tips, safety information, and insider secrets.', 500, NULL, 1, NULL, 0, 1, 0),
      (2, 'Lees Ferry Adventure Guide', 'lees-ferry-guide', 'Complete guide for paddleboarding and kayaking at Lees Ferry with route details, local insights, and photography tips.', 500, NULL, 1, NULL, 0, 1, 0),
      (3, 'Gift Certificate - $40', 'gift-cert-40', 'Gift certificate valid for one public pool floating soundbath class. Perfect for birthdays, holidays, or just because!', 4000, NULL, 1, NULL, 0, 1, 0),
      (3, 'Gift Certificate - $75', 'gift-cert-75', 'Gift certificate valid for one resort floating soundbath class at JW Marriott. The ultimate gift of relaxation!', 7500, NULL, 1, NULL, 0, 1, 0)
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Insert sample private event inquiries
    console.log("Adding sample inquiries...");
    await db.execute(`
      INSERT INTO privateEventInquiries (name, email, phone, eventType, numberOfGuests, message, status) VALUES
      ('Jessica Martinez', 'jessica.m@example.com', '602-555-0123', 'Bachelorette Party', 12, 'Looking for a unique bachelorette experience for my best friend. We want floating soundbath followed by champagne!', 'new'),
      ('Tech Corp HR', 'hr@techcorp.example.com', '480-555-0199', 'Corporate Wellness Event', 50, 'Interested in booking a team building floating soundbath for our company retreat in March.', 'contacted'),
      ('Sarah Johnson', 'sarah.j@example.com', NULL, 'Birthday Celebration', 8, 'Want to book a private floating soundbath for my 40th birthday. Preferably at a resort location.', 'new')
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Insert sample newsletter subscribers
    console.log("Adding newsletter subscribers...");
    await db.execute(`
      INSERT INTO newsletterSubscribers (email, name, isActive) VALUES
      ('wellness.lover@example.com', 'Emma Wilson', 1),
      ('zen.seeker@example.com', 'Michael Chen', 1),
      ('yoga.enthusiast@example.com', 'Amanda Rodriguez', 1)
      ON DUPLICATE KEY UPDATE email=email;
    `);

    console.log("✅ Sample data seeded successfully!");
    console.log("\nSample data includes:");
    console.log("- 4 locations (JW Marriott, Kiwanis, Chaparral, The Plunge)");
    console.log("- 2 event types (Floating Soundbath, Floating Yoga)");
    console.log("- 4 upcoming events with bookings");
    console.log("- 7 products (Sonoran Echoes, guides, gift certificates)");
    console.log("- 3 private event inquiries");
    console.log("- 3 newsletter subscribers");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log("\n🎉 Database seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });
