import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PrivateEvents() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    numberOfGuests: "",
    preferredDate: "",
    location: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be connected to the backend later
    toast.success("Thank you! We'll contact you within 24 hours to discuss your event.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      eventType: "",
      numberOfGuests: "",
      preferredDate: "",
      location: "",
      message: "",
    });
  };

  const eventTypes = [
    {
      icon: Heart,
      title: "Bachelorette Parties",
      description: "Create unforgettable memories with a unique floating experience for the bride-to-be and her crew."
    },
    {
      icon: Briefcase,
      title: "Corporate Wellness",
      description: "Boost team morale and reduce stress with a relaxing group soundbath or yoga session."
    },
    {
      icon: Sparkles,
      title: "Retreats & Workshops",
      description: "Perfect addition to wellness retreats, yoga teacher trainings, and mindfulness workshops."
    },
    {
      icon: Users,
      title: "Group Celebrations",
      description: "Birthdays, anniversaries, reunions - make any celebration extra special on the water."
    }
  ];

  const includedFeatures = [
    "Customized experience tailored to your group",
    "Professional instructors and sound healers",
    "All equipment provided (paddleboards, blankets, eye masks)",
    "Flexible scheduling to fit your needs",
    "Multiple location options available",
    "Photo opportunities and social media content",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10" />
        <img
          src="/hero-yoga.jpg"
          alt="Private Group Event"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Private Events
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Unique floating experiences for bachelorettes, corporate wellness, and special celebrations
          </p>
        </div>
      </section>

      {/* Event Types */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perfect For Any Occasion
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We customize each experience to match your group's needs and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.title} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-accent/20 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              What's Included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {includedFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Request a Quote
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us about your event and we'll create a custom package for your group
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Inquiry Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Sarah Williams"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(480) 201-9520"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                      required
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelorette">Bachelorette Party</SelectItem>
                        <SelectItem value="corporate">Corporate Wellness</SelectItem>
                        <SelectItem value="retreat">Retreat/Workshop</SelectItem>
                        <SelectItem value="celebration">Group Celebration</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfGuests">Number of Guests</Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      min="1"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                      placeholder="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phoenix">Phoenix Area</SelectItem>
                        <SelectItem value="scottsdale">Scottsdale</SelectItem>
                        <SelectItem value="san-diego">San Diego</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell Us About Your Event</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share any details about your event, special requests, or questions..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1">
                    Submit Inquiry
                  </Button>
                  <Button type="button" variant="outline" size="lg" asChild>
                    <a href="tel:4802019520">Or Call 480.201.9520</a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  We typically respond within 24 hours with a custom quote for your event
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <blockquote className="text-2xl md:text-3xl italic mb-6">
            "Desert Paddleboards made our bachelorette party absolutely unforgettable! The floating soundbath was the perfect way to relax and bond before the big day."
          </blockquote>
          <p className="text-lg opacity-90">— Jessica M., Scottsdale</p>
        </div>
      </section>
    </div>
  );
}
