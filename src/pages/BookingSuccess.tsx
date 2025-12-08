import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function BookingSuccess() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your booking. You'll receive a confirmation email shortly with all the details.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What's Next?</h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li>• Check your email for booking confirmation and event details</li>
              <li>• Arrive 15 minutes early to check in</li>
              <li>• Bring a towel and wear comfortable clothing</li>
              <li>• Contact us if you have any questions</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/events">
              <Button variant="outline">Browse More Events</Button>
            </Link>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
