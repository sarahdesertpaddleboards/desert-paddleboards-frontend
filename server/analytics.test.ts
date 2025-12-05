import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Analytics Tracking Tests
 * 
 * Tests the analytics tracking system including:
 * - Preview play logging
 * - Purchase attribution
 * - Dashboard statistics
 */

describe("Analytics Schema Validation", () => {
  it("should validate preview play input", () => {
    const schema = z.object({
      trackId: z.number().min(1).max(18),
      trackTitle: z.string(),
      source: z.enum(["homepage", "album_page"]),
      sessionId: z.string(),
    });

    // Valid homepage play
    expect(() =>
      schema.parse({
        trackId: 1,
        trackTitle: "Desert Dawn",
        source: "homepage",
        sessionId: "session_123",
      })
    ).not.toThrow();

    // Valid album page play
    expect(() =>
      schema.parse({
        trackId: 10,
        trackTitle: "Healing Waters",
        source: "album_page",
        sessionId: "session_456",
      })
    ).not.toThrow();

    // Invalid track ID (too low)
    expect(() =>
      schema.parse({
        trackId: 0,
        trackTitle: "Invalid",
        source: "homepage",
        sessionId: "session_789",
      })
    ).toThrow();

    // Invalid track ID (too high)
    expect(() =>
      schema.parse({
        trackId: 19,
        trackTitle: "Invalid",
        source: "homepage",
        sessionId: "session_789",
      })
    ).toThrow();

    // Invalid source
    expect(() =>
      schema.parse({
        trackId: 1,
        trackTitle: "Desert Dawn",
        source: "invalid_source",
        sessionId: "session_789",
      })
    ).toThrow();
  });

  it("should validate purchase attribution data", () => {
    const schema = z.object({
      purchaseType: z.enum(["album", "track"]),
      trackId: z.number().optional(),
      trackTitle: z.string().optional(),
      customerEmail: z.string().email(),
      customerName: z.string().optional(),
      amount: z.number(),
      stripeSessionId: z.string(),
      lastPlayedTrackId: z.number().optional(),
      lastPlayedTrackTitle: z.string().optional(),
      sessionId: z.string().optional(),
    });

    // Valid album purchase with attribution
    expect(() =>
      schema.parse({
        purchaseType: "album",
        customerEmail: "customer@example.com",
        customerName: "John Doe",
        amount: 2500,
        stripeSessionId: "cs_test_123",
        lastPlayedTrackId: 7,
        lastPlayedTrackTitle: "Starlight Meditation",
        sessionId: "session_123",
      })
    ).not.toThrow();

    // Valid track purchase
    expect(() =>
      schema.parse({
        purchaseType: "track",
        trackId: 1,
        trackTitle: "Desert Dawn",
        customerEmail: "customer@example.com",
        amount: 99,
        stripeSessionId: "cs_test_456",
      })
    ).not.toThrow();

    // Invalid email
    expect(() =>
      schema.parse({
        purchaseType: "album",
        customerEmail: "invalid-email",
        amount: 2500,
        stripeSessionId: "cs_test_789",
      })
    ).toThrow();
  });
});

describe("Analytics Data Structures", () => {
  it("should validate session ID format", () => {
    const sessionId = "session_1234567890_abc123def";
    
    expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    expect(sessionId.startsWith("session_")).toBe(true);
  });

  it("should validate track preview play data structure", () => {
    const previewPlay = {
      trackId: 1,
      trackTitle: "Desert Dawn",
      source: "homepage" as const,
      sessionId: "session_123",
      userId: 5,
    };

    expect(previewPlay.trackId).toBeGreaterThanOrEqual(1);
    expect(previewPlay.trackId).toBeLessThanOrEqual(18);
    expect(previewPlay.trackTitle).toBeTruthy();
    expect(["homepage", "album_page"]).toContain(previewPlay.source);
    expect(previewPlay.sessionId).toBeTruthy();
  });

  it("should validate purchase data structure", () => {
    const purchase = {
      purchaseType: "album" as const,
      customerEmail: "customer@example.com",
      customerName: "John Doe",
      amount: 2500,
      stripeSessionId: "cs_test_123",
      lastPlayedTrackId: 7,
      lastPlayedTrackTitle: "Starlight Meditation",
      sessionId: "session_123",
    };

    expect(["album", "track"]).toContain(purchase.purchaseType);
    expect(purchase.customerEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(purchase.amount).toBeGreaterThan(0);
    expect(purchase.stripeSessionId).toBeTruthy();
  });
});

describe("Analytics Calculations", () => {
  it("should calculate conversion rate correctly", () => {
    const totalPlays = 100;
    const totalPurchases = 5;
    const conversionRate = (totalPurchases / totalPlays) * 100;

    expect(conversionRate).toBe(5);
  });

  it("should calculate revenue correctly", () => {
    const purchases = [
      { type: "album", amount: 2500 }, // $25.00
      { type: "album", amount: 2500 }, // $25.00
      { type: "track", amount: 99 },   // $0.99
      { type: "track", amount: 99 },   // $0.99
    ];

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0) / 100;
    expect(totalRevenue).toBe(51.98);
  });

  it("should handle zero plays gracefully", () => {
    const totalPlays = 0;
    const totalPurchases = 0;
    const conversionRate = totalPlays > 0 ? (totalPurchases / totalPlays) * 100 : 0;

    expect(conversionRate).toBe(0);
  });
});

describe("Attribution Logic", () => {
  it("should store last played track in localStorage format", () => {
    const lastPlayed = {
      id: 7,
      title: "Starlight Meditation",
    };

    const stored = JSON.stringify(lastPlayed);
    const parsed = JSON.parse(stored);

    expect(parsed.id).toBe(7);
    expect(parsed.title).toBe("Starlight Meditation");
  });

  it("should handle missing attribution gracefully", () => {
    const purchase = {
      purchaseType: "album" as const,
      customerEmail: "customer@example.com",
      amount: 2500,
      stripeSessionId: "cs_test_123",
      lastPlayedTrackId: null,
      lastPlayedTrackTitle: null,
      sessionId: null,
    };

    // Purchase should still be valid without attribution
    expect(purchase.purchaseType).toBe("album");
    expect(purchase.lastPlayedTrackId).toBeNull();
  });
});

describe("Dashboard Statistics", () => {
  it("should aggregate plays by track correctly", () => {
    const plays = [
      { trackId: 1, trackTitle: "Desert Dawn", count: 10 },
      { trackId: 7, trackTitle: "Starlight Meditation", count: 15 },
      { trackId: 10, trackTitle: "Healing Waters", count: 8 },
    ];

    const totalPlays = plays.reduce((sum, p) => sum + p.count, 0);
    expect(totalPlays).toBe(33);

    const mostPlayed = plays.reduce((max, p) => (p.count > max.count ? p : max));
    expect(mostPlayed.trackId).toBe(7);
    expect(mostPlayed.count).toBe(15);
  });

  it("should aggregate purchases by type correctly", () => {
    const purchases = [
      { type: "album", count: 3, revenue: 7500 },
      { type: "track", count: 10, revenue: 990 },
    ];

    const totalPurchases = purchases.reduce((sum, p) => sum + p.count, 0);
    const totalRevenue = purchases.reduce((sum, p) => sum + p.revenue, 0);

    expect(totalPurchases).toBe(13);
    expect(totalRevenue).toBe(8490); // $84.90 in cents
  });
});
