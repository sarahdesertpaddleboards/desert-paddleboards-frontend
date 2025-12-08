import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;

  const { data: event, isLoading } = trpc.events.getById.useQuery({ id: eventId });
  const createCheckout = trpc.events.createBooking.useMutation();

  const [participants, setParticipants] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const handleBooking = async () => {
    if (!event) return;

    if (!customerName || !customerEmail) {
      toast.error("Please fill in your name and email");
      return;
    }

      const availableSpots = event.maxCapacity - event.currentBookings;
      if (participants < 1 || participants > availableSpots) {
        toast.error(`Please select between 1 and ${availableSpots} participants`);
      return;
    }

    try {
      const result = await createCheckout.mutateAsync({
        eventId: event.id,
        numberOfSpots: participants,
        customerName,
        customerEmail,
        customerPhone,
      });

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      toast.error("Failed to create checkout session. Please try again.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
            <p className="text-gray-600">The event you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const spotsLeft = event.maxCapacity - event.currentBookings;
  const isSoldOut = spotsLeft === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gradient-to-b from-white to-blue-50">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Details */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
              {event.notes && <p className="text-lg text-gray-600 mb-6">{event.notes}</p>}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>{new Date(event.startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>
                    {new Date(event.startTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {event.endTime && ` - ${new Date(event.endTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}`}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>{event.location.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>
                    {isSoldOut ? (
                      <span className="text-red-600 font-semibold">Sold Out</span>
                    ) : (
                      `${spotsLeft} spots available`
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-900">
                  ${event.price} <span className="text-base font-normal text-blue-700">per person</span>
                </p>
              </div>
            </div>

            {/* Booking Form */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Spot</h2>

              {event.externalBookingUrl ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    This event is managed by the city. Please book through their website.
                  </p>
                  <Button
                    onClick={() => window.open(event.externalBookingUrl!, "_blank")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Book on City Website
                  </Button>
                </div>
              ) : isSoldOut ? (
                <div className="text-center py-8">
                  <p className="text-red-600 font-semibold text-lg">This event is sold out</p>
                  <p className="text-gray-600 mt-2">Check our other upcoming classes!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="participants">Number of Participants</Label>
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      max={spotsLeft}
                      value={participants}
                      onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Total: ${(event.price * participants).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Sarah Williams"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="sarah@example.com"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(480) 555-1234"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={createCheckout.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  >
                    {createCheckout.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Book Now - $${(event.price * participants).toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    You'll be redirected to secure Stripe checkout
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
