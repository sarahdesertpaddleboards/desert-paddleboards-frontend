import type { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { updateBookingPaymentStatus, updateOrderPaymentStatus, getBookingById } from "./db-helpers";
import { addFlodeskSubscriber } from "./_core/flodesk";
import { notifyOwner } from "./_core/notification";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook] Error processing event:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Processing checkout session: ${session.id}`);

  const metadata = session.metadata || {};
  const type = metadata.type; // 'booking' or 'order'

  if (type === "booking") {
    const bookingId = parseInt(metadata.booking_id || "0");
    if (bookingId) {
      await updateBookingPaymentStatus(
        bookingId,
        "paid",
        session.payment_intent as string
      );
      console.log(`[Webhook] Updated booking ${bookingId} to paid`);

      // Add customer to Flodesk and send notifications
      try {
        const booking = await getBookingById(bookingId);
        if (booking && booking.event && 
            typeof booking.customerEmail === 'string' && 
            typeof booking.customerName === 'string') {
          
          const eventDate = new Date((booking.event as any).startTime);
          const eventDateFormatted = eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const totalPrice = `$${((booking.totalAmount as number) / 100).toFixed(2)}`;
          
          // Split customer name into first and last name
          const nameParts = booking.customerName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Add customer to Flodesk email list
          const flodeskData: any = {
            email: booking.customerEmail,
            first_name: firstName,
            last_name: lastName,
            custom_fields: {
              last_booking_event: (booking.event as any).title || 'Event',
              last_booking_date: eventDateFormatted,
              last_booking_amount: totalPrice,
            },
          };

          // Add to segment if configured (this will trigger Flodesk automation/email)
          if (ENV.flodeskSegmentId) {
            flodeskData.segment_ids = [ENV.flodeskSegmentId];
          }

          const flodeskResult = await addFlodeskSubscriber(flodeskData);
          if (flodeskResult.success) {
            console.log(`[Webhook] Added customer to Flodesk: ${booking.customerEmail}`);
          } else {
            console.error(`[Webhook] Failed to add customer to Flodesk: ${flodeskResult.error}`);
          }

          // Send in-app notification to owner
          await notifyOwner({
            title: `New Booking: ${(booking.event as any)?.title || 'Event'}`,
            content: `${booking.customerName} (${booking.customerEmail}) booked ${(booking.numberOfSpots as number) || 1} spot(s) for ${eventDateFormatted}. Total: ${totalPrice}`,
          });
        }
      } catch (error) {
        console.error('[Webhook] Error processing Flodesk integration:', error);
      }
    }
  } else if (type === "order") {
    const orderId = parseInt(metadata.order_id || "0");
    if (orderId) {
      await updateOrderPaymentStatus(
        orderId,
        "paid",
        session.payment_intent as string
      );
      console.log(`[Webhook] Updated order ${orderId} to paid`);
    }
  } else if (type === "album") {
    // Handle album purchase
    const product = metadata.product || "sonoran-echoes";
    const customerEmail = session.customer_email || metadata.customer_email;
    const customerName = session.customer_details?.name || "Customer";
    
    if (customerEmail) {
      try {
        const { sendAlbumDownloadEmail } = await import("./_core/email");
        const emailResult = await sendAlbumDownloadEmail({
          customerEmail,
          customerName,
          albumName: "Sonoran Echoes - Complete Album",
          trackCount: 18,
        });
        
        if (emailResult.success) {
          console.log(`[Webhook] Sent album download email to ${customerEmail}`);
        } else {
          console.error(`[Webhook] Failed to send album email: ${emailResult.error}`);
        }
      } catch (error) {
        console.error('[Webhook] Error sending album email:', error);
      }

      // Log purchase analytics
      try {
        const { getDb } = await import("./db");
        const { musicPurchases } = await import("../drizzle/schema");
        const db = await getDb();
        if (db) {
          await db.insert(musicPurchases).values({
            purchaseType: "album",
            customerEmail,
            customerName,
            amount: 2500, // $25.00 in cents
            stripeSessionId: session.id,
            lastPlayedTrackId: metadata.last_played_track_id ? parseInt(metadata.last_played_track_id) : null,
            lastPlayedTrackTitle: metadata.last_played_track_title || null,
            sessionId: metadata.session_id || null,
          });
          console.log(`[Webhook] Logged album purchase analytics`);
        }
      } catch (error) {
        console.error('[Webhook] Error logging purchase analytics:', error);
      }

      // Notify owner of album sale
      try {
        await notifyOwner({
          title: `Album Purchase: ${product}`,
          content: `${customerName} (${customerEmail}) purchased the Sonoran Echoes album for $25.00`,
        });
      } catch (error) {
        console.error('[Webhook] Error notifying owner:', error);
      }
    }
  } else if (type === "track") {
    // Handle individual track purchase
    const trackId = metadata.track_id;
    const trackTitle = metadata.track_title;
    const customerEmail = session.customer_email || metadata.customer_email;
    const customerName = session.customer_details?.name || "Customer";
    
    if (customerEmail && trackId && trackTitle) {
      // Log purchase analytics
      try {
        const { getDb } = await import("./db");
        const { musicPurchases } = await import("../drizzle/schema");
        const db = await getDb();
        if (db) {
          await db.insert(musicPurchases).values({
            purchaseType: "track",
            trackId: parseInt(trackId),
            trackTitle,
            customerEmail,
            customerName,
            amount: 99, // $0.99 in cents
            stripeSessionId: session.id,
            lastPlayedTrackId: metadata.last_played_track_id ? parseInt(metadata.last_played_track_id) : null,
            lastPlayedTrackTitle: metadata.last_played_track_title || null,
            sessionId: metadata.session_id || null,
          });
          console.log(`[Webhook] Logged track purchase analytics for track ${trackId}`);
        }
      } catch (error) {
        console.error('[Webhook] Error logging purchase analytics:', error);
      }

      try {
        const { sendTrackDownloadEmail } = await import("./_core/email");
        const emailResult = await sendTrackDownloadEmail({
          customerEmail,
          customerName,
          trackTitle,
          trackId: parseInt(trackId),
        });
        
        if (emailResult.success) {
          console.log(`[Webhook] Sent track download email to ${customerEmail}`);
        } else {
          console.error(`[Webhook] Failed to send track email: ${emailResult.error}`);
        }
      } catch (error) {
        console.error('[Webhook] Error sending track email:', error);
      }

      // Notify owner of track sale
      try {
        await notifyOwner({
          title: `Track Purchase: ${trackTitle}`,
          content: `${customerName} (${customerEmail}) purchased "${trackTitle}" for $0.99`,
        });
      } catch (error) {
        console.error('[Webhook] Error notifying owner:', error);
      }
    }
  }


}
