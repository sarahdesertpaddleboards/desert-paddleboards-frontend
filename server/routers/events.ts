import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createBooking,
  getBookingsByEvent,
  getBookingsByUser,
} from "../db-helpers";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

export const eventsRouter = router({
  // Get all upcoming events
  list: publicProcedure.query(async () => {
    return await getUpcomingEvents();
  }),

  // Get single event by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getEventById(input.id);
    }),

  // Create new event (admin only)
  create: protectedProcedure
    .input(
      z.object({
        eventTypeId: z.number(),
        locationId: z.number(),
        title: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        price: z.number(),
        maxCapacity: z.number(),
        externalBookingUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can create events
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await createEvent({
        ...input,
        currentBookings: 0,
        status: "scheduled",
      });
    }),

  // Update event (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        updates: z.object({
          title: z.string().optional(),
          startTime: z.date().optional(),
          endTime: z.date().optional(),
          price: z.number().optional(),
          maxCapacity: z.number().optional(),
          status: z.enum(["scheduled", "cancelled", "completed"]).optional(),
          externalBookingUrl: z.string().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await updateEvent(input.id, input.updates);
      return { success: true };
    }),

  // Delete event (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await deleteEvent(input.id);
      return { success: true };
    }),

  // Create booking and checkout session
  createBooking: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        numberOfSpots: z.number().min(1),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get event details
      const event = await getEventById(input.eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      // Check availability
      const spotsAvailable = event.maxCapacity - event.currentBookings;
      if (input.numberOfSpots > spotsAvailable) {
        throw new Error(`Only ${spotsAvailable} spots available`);
      }

      // Calculate total
      const totalAmount = event.price * input.numberOfSpots;

      // Create booking record
      const bookingId = await createBooking({
        eventId: input.eventId,
        userId: ctx.user?.id,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        numberOfSpots: input.numberOfSpots,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        specialRequests: input.specialRequests,
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.customerEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: event.title,
                description: `${input.numberOfSpots} spot(s) for ${new Date(event.startTime).toLocaleDateString()}`,
              },
              unit_amount: event.price,
            },
            quantity: input.numberOfSpots,
          },
        ],
        success_url: `${ctx.req.headers.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/events`,
        metadata: {
          type: "booking",
          booking_id: bookingId.toString(),
          event_id: event.id.toString(),
          customer_name: input.customerName,
          customer_email: input.customerEmail,
        },
        allow_promotion_codes: true,
      });

      return {
        bookingId,
        checkoutUrl: session.url,
      };
    }),

  // Get bookings for an event (admin only)
  getEventBookings: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await getBookingsByEvent(input.eventId);
    }),

  // Get user's own bookings
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    return await getBookingsByUser(ctx.user.id);
  }),
});
