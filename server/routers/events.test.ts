import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: { origin: "http://localhost:3000" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Events Router - Booking Flow", () => {
  it("should list events", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const events = await caller.events.list();
    expect(events).toBeDefined();
    expect(Array.isArray(events)).toBe(true);
  });

  it("should get event by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get list of events to find a valid ID
    const events = await caller.events.list();
    if (events.length === 0) {
      console.log("No events found, skipping test");
      return;
    }

    const testEventId = events[0].id;
    const event = await caller.events.getById({ id: testEventId });
    expect(event).toBeDefined();
    expect(event?.id).toBe(testEventId);
  });

  it("should create booking and checkout session for valid event", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get a valid event that has spots available
    const events = await caller.events.list();
    const availableEvent = events.find(
      (e) => e.status === "scheduled" && e.maxCapacity > e.currentBookings
    );

    if (!availableEvent) {
      console.log("No available events found, skipping test");
      return;
    }

    const result = await caller.events.createBooking({
      eventId: availableEvent.id,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "480-555-1234",
      numberOfSpots: 1,
      specialRequests: "Test booking",
    });

    expect(result).toBeDefined();
    expect(result.bookingId).toBeDefined();
    expect(result.checkoutUrl).toBeDefined();
    expect(result.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("should reject booking when not enough spots available", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get a valid event
    const events = await caller.events.list();
    if (events.length === 0) {
      console.log("No events found, skipping test");
      return;
    }

    const testEvent = events[0];

    await expect(
      caller.events.createBooking({
        eventId: testEvent.id,
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        numberOfSpots: testEvent.maxCapacity + 100, // More than max capacity
      })
    ).rejects.toThrow();
  });

  it("should reject booking for non-existent event", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.events.createBooking({
        eventId: 99999, // Non-existent event
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        numberOfSpots: 1,
      })
    ).rejects.toThrow("Event not found");
  });
});
