import { eq, desc, and, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  events,
  bookings,
  products,
  orders,
  orderItems,
  privateEventInquiries,
  newsletterSubscribers,
  giftCertificates,
  type InsertEvent,
  type InsertBooking,
  type InsertProduct,
  type InsertOrder,
  type InsertOrderItem,
  type InsertPrivateEventInquiry,
  type InsertNewsletterSubscriber,
} from "../drizzle/schema";

/**
 * EVENT HELPERS
 */

export async function getUpcomingEvents() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const { locations, eventTypes } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: events.id,
      eventTypeId: events.eventTypeId,
      locationId: events.locationId,
      title: events.title,
      startTime: events.startTime,
      endTime: events.endTime,
      price: events.price,
      maxCapacity: events.maxCapacity,
      currentBookings: events.currentBookings,
      status: events.status,
      notes: events.notes,
      externalBookingUrl: events.externalBookingUrl,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      location: locations,
      eventType: eventTypes,
    })
    .from(events)
    .leftJoin(locations, eq(events.locationId, locations.id))
    .leftJoin(eventTypes, eq(events.eventTypeId, eventTypes.id))
    .where(
      and(
        gte(events.startTime, now),
        eq(events.status, "scheduled")
      )
    )
    .orderBy(events.startTime);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { locations, eventTypes } = await import("../drizzle/schema");
  
  const result = await db
    .select({
      id: events.id,
      eventTypeId: events.eventTypeId,
      locationId: events.locationId,
      title: events.title,
      startTime: events.startTime,
      endTime: events.endTime,
      price: events.price,
      maxCapacity: events.maxCapacity,
      currentBookings: events.currentBookings,
      status: events.status,
      notes: events.notes,
      externalBookingUrl: events.externalBookingUrl,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      location: locations,
      eventType: eventTypes,
    })
    .from(events)
    .leftJoin(locations, eq(events.locationId, locations.id))
    .leftJoin(eventTypes, eq(events.eventTypeId, eventTypes.id))
    .where(eq(events.id, id))
    .limit(1);
    
  return result[0] || null;
}

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(events).values(event);
  return 0; // ID will be available after insert
}

export async function updateEvent(id: number, updates: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(events).set(updates).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(events).where(eq(events.id, id));
}

/**
 * BOOKING HELPERS
 */

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(bookings).values(booking);
  
  // Update event currentBookings count
  await db.update(events)
    .set({ 
      currentBookings: sql`${events.currentBookings} + ${booking.numberOfSpots}` 
    })
    .where(eq(events.id, booking.eventId));
  
  return 0; // ID will be available after insert
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { locations, eventTypes } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(bookings)
    .leftJoin(events, eq(bookings.eventId, events.id))
    .leftJoin(locations, eq(events.locationId, locations.id))
    .leftJoin(eventTypes, eq(events.eventTypeId, eventTypes.id))
    .where(eq(bookings.id, id))
    .limit(1);
  
  if (!result[0]) return null;
  
  const row = result[0];
  return {
    ...row.bookings,
    event: row.events ? {
      ...row.events,
      location: row.locations,
      eventType: row.eventTypes,
    } : null,
  };
}

export async function getBookingsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.eventId, eventId))
    .orderBy(desc(bookings.createdAt));
}

export async function getBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function updateBookingPaymentStatus(
  id: number,
  paymentStatus: "pending" | "paid" | "refunded",
  paymentIntentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bookings)
    .set({ 
      paymentStatus,
      ...(paymentIntentId && { paymentIntentId }),
      ...(paymentStatus === "paid" && { status: "confirmed" })
    })
    .where(eq(bookings.id, id));
}

/**
 * PRODUCT HELPERS
 */

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  
  const { productCategories } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      isDigital: products.isDigital,
      downloadUrl: products.downloadUrl,
      inventory: products.inventory,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      category: productCategories,
    })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .where(eq(products.isActive, true))
    .orderBy(products.name);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(products).values(product);
  return 0; // ID will be available after insert
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set(updates).where(eq(products.id, id));
}

/**
 * ORDER HELPERS
 */

export async function createOrder(order: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Create order
  await db.insert(orders).values(order);
  const orderId = 0; // Will be replaced with actual ID
  
  // Create order items
  const itemsWithOrderId = items.map(item => ({ ...item, orderId }));
  await db.insert(orderItems).values(itemsWithOrderId);
  
  return orderId;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderPaymentStatus(
  id: number,
  paymentStatus: "pending" | "paid" | "refunded",
  paymentIntentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders)
    .set({ 
      paymentStatus,
      ...(paymentIntentId && { paymentIntentId }),
      ...(paymentStatus === "paid" && { status: "processing" })
    })
    .where(eq(orders.id, id));
}

/**
 * PRIVATE EVENT INQUIRY HELPERS
 */

export async function createPrivateEventInquiry(inquiry: InsertPrivateEventInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(privateEventInquiries).values(inquiry);
  return 0; // ID will be available after insert
}

export async function getPrivateEventInquiries() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(privateEventInquiries)
    .orderBy(desc(privateEventInquiries.createdAt));
}

/**
 * NEWSLETTER HELPERS
 */

export async function subscribeToNewsletter(subscriber: InsertNewsletterSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(newsletterSubscribers).values(subscriber);
    return 0; // ID will be available after insert
  } catch (error: any) {
    // Handle duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      // Reactivate if previously unsubscribed
      await db.update(newsletterSubscribers)
        .set({ isActive: true, subscribedAt: new Date() })
        .where(eq(newsletterSubscribers.email, subscriber.email));
      return null;
    }
    throw error;
  }
}

export async function getNewsletterSubscribers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true))
    .orderBy(desc(newsletterSubscribers.subscribedAt));
}
