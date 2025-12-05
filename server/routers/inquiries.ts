import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createPrivateEventInquiry,
  getPrivateEventInquiries,
  subscribeToNewsletter,
  getNewsletterSubscribers,
} from "../db-helpers";
import { notifyOwner } from "../_core/notification";

export const inquiriesRouter = router({
  // Submit private event inquiry
  submitPrivateEvent: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        eventType: z.string(),
        preferredDate: z.string().optional(),
        numberOfGuests: z.number().optional(),
        location: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const inquiryId = await createPrivateEventInquiry({
        name: input.name,
        email: input.email,
        phone: input.phone,
        eventType: input.eventType,
        preferredDate: input.preferredDate ? new Date(input.preferredDate) : undefined,
        numberOfGuests: input.numberOfGuests,
        location: input.location,
        message: input.message,
        status: "new",
      });

      // Notify owner
      await notifyOwner({
        title: "New Private Event Inquiry",
        content: `${input.name} (${input.email}) submitted a private event inquiry for ${input.eventType}. ${input.numberOfGuests ? `${input.numberOfGuests} guests.` : ""} ${input.message || ""}`,
      });

      return { success: true, inquiryId };
    }),

  // Get all inquiries (admin only)
  listInquiries: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await getPrivateEventInquiries();
  }),

  // Subscribe to newsletter
  subscribeNewsletter: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await subscribeToNewsletter({
        email: input.email,
        name: input.name,
        isActive: true,
      });

      return { success: true };
    }),

  // Get newsletter subscribers (admin only)
  listSubscribers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await getNewsletterSubscribers();
  }),
});
