import { getDb } from "./server/db.js";
import { locations, eventTypes, events } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

async function createSantaPaddleEvent() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Find or create Tempe Town Lake location
  let [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.name, "Tempe Town Lake Marina"));
  
  if (!location) {
    [location] = await db
      .insert(locations)
      .values({
        name: "Tempe Town Lake Marina",
        address: "550 E Tempe Town Lake, Tempe, AZ 85288",
        city: "Tempe",
        state: "AZ",
        zipCode: "85288",
        region: "Phoenix Area",
      })
      .returning();
    console.log("✅ Created Tempe Town Lake Marina location");
  }
  
  // Find or create Santa Paddle event type
  let [eventType] = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.name, "Santa Paddle"));
  
  if (!eventType) {
    [eventType] = await db
      .insert(eventTypes)
      .values({
        name: "Santa Paddle",
        description: "Festive holiday paddleboarding meetup with costumes and fun",
        duration: 120, // 2 hours
        difficulty: "Beginner",
        maxParticipants: 100,
      })
      .returning();
    console.log("✅ Created Santa Paddle event type");
  }
  
  // Create Santa Paddle event for Dec 20, 2024
  const eventDate = new Date("2024-12-20T15:00:00-07:00"); // 3pm MST
  
  const [event] = await db
    .insert(events)
    .values({
      eventTypeId: eventType.id,
      locationId: location.id,
      startTime: eventDate,
      endTime: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      price: 0, // Free event
      availableSpots: 100,
      status: "published",
      title: "🎅 Santa Paddle at Tempe Town Lake",
      description: `Dress up. Show up. Paddle into holiday chaos with us.

Kick off the season on the water with our annual Santa Paddle — a festive paddleboarding and kayaking meetup where everyone shows up in their best holiday costumes. Think elves, Santas, reindeer, Mrs. Claus, holiday onesies… and yes, dogs on leashes are absolutely welcome…..dressed as reindeer.

This isn't a race. It's pure holiday fun on the lake.`,
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/santa-paddle/santagroup2.jpg",
      externalBookingUrl: null, // No external booking needed
    })
    .returning();
  
  console.log("✅ Created Santa Paddle event!");
  console.log(`Event ID: ${event.id}`);
  console.log(`Date: ${event.startTime}`);
  console.log(`Location: ${location.name}`);
  
  process.exit(0);
}

createSantaPaddleEvent().catch((error) => {
  console.error("Error creating Santa Paddle event:", error);
  process.exit(1);
});
