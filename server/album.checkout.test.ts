import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Album Checkout", () => {
  it("should create Stripe checkout session for Sonoran Echoes album", async () => {
    // Mock context
    const mockContext: TrpcContext = {
      user: null,
      req: {
        headers: {
          origin: "http://localhost:3000",
        },
      } as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(mockContext);

    const result = await caller.shop.createAlbumCheckout({
      customerEmail: "test@example.com",
    });

    // Verify response structure
    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.sessionId).toBeDefined();
    expect(typeof result.url).toBe("string");
    expect(typeof result.sessionId).toBe("string");
    
    // Verify Stripe checkout URL format
    expect(result.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  it("should create checkout session without providing email", async () => {
    const mockContext: TrpcContext = {
      user: null,
      req: {
        headers: {
          origin: "http://localhost:3000",
        },
      } as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(mockContext);

    // Email is optional, so we can omit it
    const result = await caller.shop.createAlbumCheckout({});

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.sessionId).toBeDefined();
  });
});
