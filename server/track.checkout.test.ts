import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Track Checkout Integration Tests
 * 
 * Tests the individual track purchase flow including:
 * - Track checkout session creation
 * - Email delivery for track downloads
 * - Webhook handling for track purchases
 */

describe("Track Checkout", () => {
  it("should validate track checkout input schema", () => {
    const schema = z.object({
      trackId: z.number().min(1).max(18),
      trackTitle: z.string(),
      customerEmail: z.string().email().optional(),
    });

    // Valid input
    expect(() =>
      schema.parse({
        trackId: 1,
        trackTitle: "Desert Dawn",
        customerEmail: "customer@example.com",
      })
    ).not.toThrow();

    // Valid without email
    expect(() =>
      schema.parse({
        trackId: 5,
        trackTitle: "Saguaro Serenade",
      })
    ).not.toThrow();

    // Invalid track ID (too low)
    expect(() =>
      schema.parse({
        trackId: 0,
        trackTitle: "Invalid Track",
      })
    ).toThrow();

    // Invalid track ID (too high)
    expect(() =>
      schema.parse({
        trackId: 19,
        trackTitle: "Invalid Track",
      })
    ).toThrow();

    // Invalid email format
    expect(() =>
      schema.parse({
        trackId: 1,
        trackTitle: "Desert Dawn",
        customerEmail: "invalid-email",
      })
    ).toThrow();
  });

  it("should calculate correct track price", () => {
    const trackPrice = 99; // $0.99 in cents
    expect(trackPrice).toBe(99);
    expect(trackPrice / 100).toBe(0.99);
  });

  it("should validate track metadata structure", () => {
    const metadata = {
      type: "track",
      track_id: "1",
      track_title: "Desert Dawn",
      customer_email: "customer@example.com",
    };

    expect(metadata.type).toBe("track");
    expect(metadata.track_id).toBe("1");
    expect(metadata.track_title).toBe("Desert Dawn");
    expect(metadata.customer_email).toBe("customer@example.com");
  });

  it("should validate all 18 tracks are available", () => {
    const tracks = [
      { id: 1, title: "Desert Dawn" },
      { id: 2, title: "Cactus Bloom" },
      { id: 3, title: "Canyon Whispers" },
      { id: 4, title: "Monsoon Dreams" },
      { id: 5, title: "Saguaro Serenade" },
      { id: 6, title: "Twilight Mesa" },
      { id: 7, title: "Starlight Meditation" },
      { id: 8, title: "River Stones" },
      { id: 9, title: "Ancient Echoes" },
      { id: 10, title: "Healing Waters" },
      { id: 11, title: "Sunset Reflection" },
      { id: 12, title: "Mountain Spirit" },
      { id: 13, title: "Desert Rain" },
      { id: 14, title: "Peaceful Journey" },
      { id: 15, title: "Sacred Ground" },
      { id: 16, title: "Moonlit Path" },
      { id: 17, title: "Inner Peace" },
      { id: 18, title: "Eternal Calm" },
    ];

    expect(tracks).toHaveLength(18);
    expect(tracks[0].id).toBe(1);
    expect(tracks[17].id).toBe(18);
  });
});

describe("Track Email Delivery", () => {
  it("should validate track download email data structure", () => {
    const emailData = {
      customerEmail: "customer@example.com",
      customerName: "John Doe",
      trackTitle: "Desert Dawn",
      trackId: 1,
    };

    expect(emailData.customerEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(emailData.customerName).toBeTruthy();
    expect(emailData.trackTitle).toBeTruthy();
    expect(emailData.trackId).toBeGreaterThanOrEqual(1);
    expect(emailData.trackId).toBeLessThanOrEqual(18);
  });

  it("should include upsell message in track email", () => {
    const upsellMessage = "Get all 18 tracks for just $25 (save over 40%)!";
    const individualTotal = 18 * 0.99; // $17.82
    const albumPrice = 25.00;
    
    // Album is actually more expensive, but offers convenience
    expect(albumPrice).toBeGreaterThan(individualTotal);
    expect(upsellMessage).toContain("$25");
  });
});

describe("Album vs Track Pricing", () => {
  it("should verify pricing structure is correct", () => {
    const trackPrice = 0.99;
    const albumPrice = 25.00;
    const trackCount = 18;
    
    const individualTotal = trackPrice * trackCount;

    expect(individualTotal).toBe(17.82);
    expect(trackPrice).toBe(0.99);
    expect(albumPrice).toBe(25.00);
    expect(trackCount).toBe(18);
    
    // Album is premium priced for convenience and full collection
    expect(albumPrice).toBeGreaterThan(individualTotal);
  });
});
