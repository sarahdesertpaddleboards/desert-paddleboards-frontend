# Flodesk Integration Setup Guide

Your booking system is now integrated with Flodesk! This guide will help you complete the setup so customers automatically get added to your email list and receive booking confirmations.

## Overview

When a customer books a class:
1. ✅ Payment is processed via Stripe
2. ✅ Booking is saved to database
3. ✅ Customer is automatically added to your Flodesk email list
4. ✅ Customer data includes: name, email, last booking details
5. ✅ Customer is added to a specific segment (triggers automation)
6. ✅ You receive an in-app notification about the new booking

## Step 1: Get Your Flodesk API Key

1. Log in to your Flodesk account at https://flodesk.com
2. Click your profile icon in the top-right corner
3. Go to **Settings** → **Integrations** → **API Keys**
4. Click **Create API Key**
5. Give it a name like "Desert Paddleboards Website"
6. Copy the API key (you'll need this in Step 3)

## Step 2: Create a Segment for Booking Customers

1. In Flodesk, go to **Audience** → **Segments**
2. Click **Create Segment**
3. Name it "Booking Customers" or "Class Attendees"
4. Set criteria: "All subscribers" (we'll add them programmatically)
5. Click **Create**
6. Click on the segment you just created
7. Look at the URL in your browser - it will look like: `https://app.flodesk.com/admin/segments/abc123xyz`
8. Copy the segment ID (the part after `/segments/` - e.g., `abc123xyz`)

## Step 3: Create Booking Confirmation Automation

1. In Flodesk, go to **Workflows** → **Create Workflow**
2. Choose **Start from scratch**
3. Name it "Booking Confirmation"
4. Set the trigger: **Subscriber added to segment** → Select "Booking Customers"
5. Add an **Email** action
6. Design your booking confirmation email template with:
   - Welcome message
   - Booking details (use custom fields: `last_booking_event`, `last_booking_date`, `last_booking_amount`)
   - What to bring (towels, workout clothes, water)
   - Location and time details
   - Contact information
7. **Activate** the workflow

## Step 4: Configure Your Website

After completing Steps 1-3, you'll need to add your Flodesk credentials to your website:

1. Go to your website's **Settings** → **Secrets** in the Management UI
2. Add two new environment variables:
   - `FLODESK_API_KEY`: Your API key from Step 1
   - `FLODESK_SEGMENT_ID`: Your segment ID from Step 2

## Step 5: Test the Integration

1. Make a test booking on your website (use Stripe test mode)
2. Check your Flodesk account:
   - New subscriber should appear in "Booking Customers" segment
   - Subscriber should have custom fields populated
   - Booking confirmation email should be sent automatically
3. Check your in-app notifications for the booking alert

## Custom Fields Available

The system automatically adds these custom fields to each subscriber:
- `last_booking_event`: Name of the class they booked
- `last_booking_date`: Date of the booking (formatted: "Monday, January 1, 2024")
- `last_booking_amount`: Total amount paid (formatted: "$75.00")

You can use these fields in your email templates with merge tags.

## Creating Email Funnels

Now that customers are in your Flodesk list, you can create automated funnels:

### Welcome Funnel
1. Create a workflow triggered when someone joins "Booking Customers"
2. Send a series of emails:
   - Day 0: Booking confirmation (already set up)
   - Day 1: What to expect / preparation tips
   - Day -1: Reminder email (day before class)
   - Day +1: Thank you + feedback request
   - Day +7: Special offer for next booking

### Re-engagement Funnel
1. Create a segment for customers who haven't booked in 30+ days
2. Create a workflow to send:
   - Reminder about upcoming classes
   - Special discount code
   - New class announcements

### Upsell Funnel
1. Segment customers by class type (use custom field `last_booking_event`)
2. Send targeted offers:
   - Soundbath attendees → Yoga class promotion
   - Yoga attendees → Private event information
   - All customers → Sonoran Echoes album promotion

## Tips for Success

- **Segment your list**: Create segments based on class type, location, or booking frequency
- **Personalize emails**: Use first name and custom fields in your templates
- **Test everything**: Always send test emails before activating workflows
- **Monitor metrics**: Check open rates and click rates in Flodesk analytics
- **Keep it simple**: Start with basic confirmation emails, then add complexity

## Troubleshooting

**Customers not appearing in Flodesk?**
- Check that FLODESK_API_KEY is set correctly
- Verify the API key is active in your Flodesk account
- Check server logs for error messages

**Emails not sending?**
- Ensure the workflow is activated in Flodesk
- Check that FLODESK_SEGMENT_ID matches your segment
- Verify the trigger is set to "Subscriber added to segment"

**Custom fields not populating?**
- Custom fields are created automatically when first used
- Check the subscriber profile in Flodesk to see if fields exist
- Refresh the page if fields don't appear immediately

## Support

For Flodesk-specific questions, contact Flodesk support at support@flodesk.com

For website integration issues, check the server logs or contact your developer.
