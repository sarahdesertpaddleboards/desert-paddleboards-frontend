import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  createOrder,
  getOrdersByUser,
} from "../db-helpers";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

export const shopRouter = router({
  // Get all active products
  listProducts: publicProcedure.query(async () => {
    return await getActiveProducts();
  }),

  // Get single product
  getProduct: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getProductById(input.id);
    }),

  // Create product (admin only)
  createProduct: protectedProcedure
    .input(
      z.object({
        categoryId: z.number(),
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        isDigital: z.boolean().default(false),
        downloadUrl: z.string().optional(),
        inventory: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await createProduct({
        ...input,
        isActive: true,
      });
    }),

  // Update product (admin only)
  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        updates: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          imageUrl: z.string().optional(),
          inventory: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await updateProduct(input.id, input.updates);
      return { success: true };
    }),

  // Create order and checkout
  createOrder: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          })
        ),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        shippingAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get product details and calculate total
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let subtotal = 0;

      for (const item of input.items) {
        const product = await getProductById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (!product.isActive) {
          throw new Error(`Product ${product.name} is not available`);
        }

        // Check inventory for physical products
        if (!product.isDigital && product.inventory !== null) {
          if (product.inventory < item.quantity) {
            throw new Error(`Not enough inventory for ${product.name}`);
          }
        }

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
        });

        subtotal += product.price * item.quantity;
      }

      // Generate unique order number
      const orderNumber = `DP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create order record
      const orderId = await createOrder(
        {
          userId: ctx.user?.id,
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          subtotal,
          tax: 0,
          shipping: 0,
          total: subtotal,
          status: "pending",
          paymentStatus: "pending",
        },
        input.items.map((item) => ({
          orderId: 0, // Will be set by createOrder
          productId: item.productId,
          productName: "", // Will be filled from product
          quantity: item.quantity,
          price: 0, // Will be filled from product
          total: 0, // Will be calculated
        }))
      );

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.customerEmail,
        line_items: lineItems,
        success_url: `${ctx.req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/shop`,
        metadata: {
          type: "order",
          order_id: orderId.toString(),
          order_number: orderNumber,
          customer_name: input.customerName,
          customer_email: input.customerEmail,
        },
        allow_promotion_codes: true,
      });

      return {
        orderId,
        orderNumber,
        checkoutUrl: session.url,
      };
    }),

  // Get user's orders
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    return await getOrdersByUser(ctx.user.id);
  }),

  // Create album checkout session
  createAlbumCheckout: publicProcedure
    .input(
      z.object({
        customerEmail: z.string().email().optional(),
        lastPlayedTrackId: z.number().optional(),
        lastPlayedTrackTitle: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const albumPrice = 2500; // $25.00 in cents
      const albumName = "Sonoran Echoes - Complete Album";
      const albumDescription = "18 tracks of Native American flute and crystal singing bowls. High-quality WAV files for instant download.";

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.customerEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: albumName,
                description: albumDescription,
              },
              unit_amount: albumPrice,
            },
            quantity: 1,
          },
        ],
        success_url: `${ctx.req.headers.origin}/album-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/sonoran-echoes`,
        metadata: {
          type: "album",
          product: "sonoran-echoes",
          customer_email: input.customerEmail || "",
          last_played_track_id: input.lastPlayedTrackId?.toString() || "",
          last_played_track_title: input.lastPlayedTrackTitle || "",
          session_id: input.sessionId || "",
        },
        allow_promotion_codes: true,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),

  // Create individual track checkout session
  createTrackCheckout: publicProcedure
    .input(
      z.object({
        trackId: z.number().min(1).max(18),
        trackTitle: z.string(),
        customerEmail: z.string().email().optional(),
        lastPlayedTrackId: z.number().optional(),
        lastPlayedTrackTitle: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const trackPrice = 99; // $0.99 in cents

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.customerEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${input.trackTitle} - Sonoran Echoes`,
                description: `Track ${String(input.trackId).padStart(2, "0")} from Sonoran Echoes album. High-quality WAV file.`,
              },
              unit_amount: trackPrice,
            },
            quantity: 1,
          },
        ],
        success_url: `${ctx.req.headers.origin}/track-success?session_id={CHECKOUT_SESSION_ID}&track_id=${input.trackId}`,
        cancel_url: `${ctx.req.headers.origin}/sonoran-echoes`,
        metadata: {
          type: "track",
          track_id: input.trackId.toString(),
          track_title: input.trackTitle,
          customer_email: input.customerEmail || "",
          last_played_track_id: input.lastPlayedTrackId?.toString() || "",
          last_played_track_title: input.lastPlayedTrackTitle || "",
          session_id: input.sessionId || "",
        },
        allow_promotion_codes: true,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),
});
