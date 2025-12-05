import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { trackPreviewPlays, musicPurchases } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, sql, desc } from "drizzle-orm";

export const analyticsRouter = router({
  /**
   * Log a preview track play
   */
  logPreviewPlay: publicProcedure
    .input(
      z.object({
        trackId: z.number().min(1).max(18),
        trackTitle: z.string(),
        source: z.enum(["homepage", "album_page"]),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(trackPreviewPlays).values({
        trackId: input.trackId,
        trackTitle: input.trackTitle,
        source: input.source,
        sessionId: input.sessionId,
        userId: ctx.user?.id,
      });

      return { success: true };
    }),

  /**
   * Get the last played track for a session (for purchase attribution)
   */
  getLastPlayedTrack: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const lastPlay = await db
        .select()
        .from(trackPreviewPlays)
        .where(eq(trackPreviewPlays.sessionId, input.sessionId))
        .orderBy(desc(trackPreviewPlays.playedAt))
        .limit(1);

      return lastPlay[0] || null;
    }),

  /**
   * Log a music purchase with attribution
   */
  logPurchase: publicProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(musicPurchases).values({
        purchaseType: input.purchaseType,
        trackId: input.trackId,
        trackTitle: input.trackTitle,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        amount: input.amount,
        stripeSessionId: input.stripeSessionId,
        lastPlayedTrackId: input.lastPlayedTrackId,
        lastPlayedTrackTitle: input.lastPlayedTrackTitle,
        sessionId: input.sessionId,
      });

      return { success: true };
    }),

  /**
   * Get analytics dashboard data
   */
  getDashboardStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        playsByTrack: [],
        totalPurchases: [],
        conversionAttribution: [],
        recentPurchases: [],
      };
    }

    // Total preview plays by track
    const playsByTrack = await db
      .select({
        trackId: trackPreviewPlays.trackId,
        trackTitle: trackPreviewPlays.trackTitle,
        totalPlays: sql<number>`count(*)`.as("totalPlays"),
      })
      .from(trackPreviewPlays)
      .groupBy(trackPreviewPlays.trackId, trackPreviewPlays.trackTitle)
      .orderBy(desc(sql`count(*)`));

    // Total purchases
    const totalPurchases = await db
      .select({
        purchaseType: musicPurchases.purchaseType,
        count: sql<number>`count(*)`.as("count"),
        revenue: sql<number>`sum(${musicPurchases.amount})`.as("revenue"),
      })
      .from(musicPurchases)
      .groupBy(musicPurchases.purchaseType);

    // Conversion attribution - which tracks led to purchases
    const conversionAttribution = await db
      .select({
        trackId: musicPurchases.lastPlayedTrackId,
        trackTitle: musicPurchases.lastPlayedTrackTitle,
        purchases: sql<number>`count(*)`.as("purchases"),
      })
      .from(musicPurchases)
      .where(sql`${musicPurchases.lastPlayedTrackId} IS NOT NULL`)
      .groupBy(musicPurchases.lastPlayedTrackId, musicPurchases.lastPlayedTrackTitle)
      .orderBy(desc(sql`count(*)`));

    // Recent purchases
    const recentPurchases = await db
      .select()
      .from(musicPurchases)
      .orderBy(desc(musicPurchases.purchasedAt))
      .limit(10);

    return {
      playsByTrack,
      totalPurchases,
      conversionAttribution,
      recentPurchases,
    };
  }),
});
