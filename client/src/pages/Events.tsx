import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, List } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import EventCalendar from "@/components/EventCalendar";

export default function Events() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const { data: events = [], isLoading } = trpc.events.list.useQuery();
  
  // Filter for upcoming events only
  let upcomingEvents = events.filter(event => 
    event.status === 'scheduled' && new Date(event.startTime) > new Date()
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Apply event type filter
  if (selectedEventType && selectedEventType !== 'All Events') {
    upcomingEvents = upcomingEvents.filter(event => 
      event.eventType?.name === selectedEventType
    );
  }

  // Apply location filter
  if (selectedLocation) {
    upcomingEvents = upcomingEvents.filter(event => {
      const locationName = event.location?.name?.toLowerCase() || '';
      if (selectedLocation === 'Phoenix Area') {
        return locationName.includes('phoenix') || locationName.includes('mesa') || locationName.includes('tempe');
      } else if (selectedLocation === 'Scottsdale') {
        return locationName.includes('scottsdale');
      } else if (selectedLocation === 'San Diego') {
        return locationName.includes('san diego');
      } else if (selectedLocation === 'Other Arizona') {
        return locationName.includes('arizona') && !locationName.includes('phoenix') && !locationName.includes('scottsdale') && !locationName.includes('mesa') && !locationName.includes('tempe');
      }
      return true;
    });
  }

  // Apply price range filter
  if (selectedPriceRange) {
    upcomingEvents = upcomingEvents.filter(event => {
      if (selectedPriceRange === '$40 (Public Pools)') {
        return event.price <= 4000; // $40 in cents
      } else if (selectedPriceRange === '$75 (Resort Classes)') {
        return event.price > 4000; // More than $40
      }
      return true;
    });
  }

  const eventTypes = [
    { name: "All Events", count: events.filter(e => e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
    { name: "Floating Soundbath", count: events.filter(e => e.eventType?.name === "Floating Soundbath" && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
    { name: "Floating Yoga", count: events.filter(e => e.eventType?.name === "Floating Yoga" && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
    { name: "Water Aerobics", count: events.filter(e => e.eventType?.name === "Water Aerobics" && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
  ];

  const locations = [
    { name: "Phoenix Area", count: events.filter(e => {
      const loc = e.location?.name?.toLowerCase() || '';
      return (loc.includes('phoenix') || loc.includes('mesa') || loc.includes('tempe')) && e.status === 'scheduled' && new Date(e.startTime) > new Date();
    }).length },
    { name: "Scottsdale", count: events.filter(e => e.location?.name?.toLowerCase().includes('scottsdale') && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
    { name: "San Diego", count: events.filter(e => e.location?.name?.toLowerCase().includes('san diego') && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
    { name: "Other Arizona", count: events.filter(e => {
      const loc = e.location?.name?.toLowerCase() || '';
      return loc.includes('arizona') && !loc.includes('phoenix') && !loc.includes('scottsdale') && !loc.includes('mesa') && !loc.includes('tempe') && e.status === 'scheduled' && new Date(e.startTime) > new Date();
    }).length },
  ];

  const priceRanges = [
    { name: "$40 (Public Pools)", count: events.filter(e => e.price <= 4000 && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
    { name: "$75 (Resort Classes)", count: events.filter(e => e.price > 4000 && e.status === 'scheduled' && new Date(e.startTime) > new Date()).length },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Classes & Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Browse our upcoming floating soundbaths, yoga classes, and wellness experiences across Arizona and California
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filter Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Event Type</h3>
                  <div className="space-y-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => setSelectedEventType(type.name === selectedEventType ? null : type.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                          selectedEventType === type.name ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                        }`}
                      >
                        <span className="text-sm">{type.name}</span>
                        <Badge variant={selectedEventType === type.name ? "outline" : "secondary"}>{type.count}</Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Location</h3>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <button
                        key={location.name}
                        onClick={() => setSelectedLocation(location.name === selectedLocation ? null : location.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                          selectedLocation === location.name ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                        }`}
                      >
                        <span className="text-sm">{location.name}</span>
                        <Badge variant={selectedLocation === location.name ? "outline" : "secondary"}>{location.count}</Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.name}
                        onClick={() => setSelectedPriceRange(range.name === selectedPriceRange ? null : range.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                          selectedPriceRange === range.name ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                        }`}
                      >
                        <span className="text-sm">{range.name}</span>
                        <Badge variant={selectedPriceRange === range.name ? "outline" : "secondary"}>{range.count}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-accent/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What to Bring</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 2-3 towels for comfort</li>
                  <li>• Quick-drying workout clothes</li>
                  <li>• Water bottle</li>
                  <li>• Arrive 15 minutes early</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Events List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground">
                  {isLoading ? "Loading..." : `Showing ${upcomingEvents.length} upcoming events`}
                </p>
                {(selectedEventType || selectedLocation || selectedPriceRange) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEventType && selectedEventType !== 'All Events' && (
                      <Badge variant="default" className="gap-1">
                        {selectedEventType}
                        <button
                          onClick={() => setSelectedEventType(null)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedLocation && (
                      <Badge variant="default" className="gap-1">
                        {selectedLocation}
                        <button
                          onClick={() => setSelectedLocation(null)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedPriceRange && (
                      <Badge variant="default" className="gap-1">
                        {selectedPriceRange}
                        <button
                          onClick={() => setSelectedPriceRange(null)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEventType(null);
                        setSelectedLocation(null);
                        setSelectedPriceRange(null);
                      }}
                      className="h-6 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  List View
                </Button>
                <Button 
                  variant={viewMode === 'calendar' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <EventCalendar events={upcomingEvents} />
            ) : isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No upcoming events scheduled. Check back soon!</p>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const spotsLeft = event.maxCapacity - event.currentBookings;
                const isSoldOut = spotsLeft === 0;
                
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 text-center bg-primary/10 rounded-lg p-4 md:w-24">
                          <div className="text-3xl font-bold text-primary">
                            {new Date(event.startTime).getDate()}
                          </div>
                          <div className="text-sm font-medium text-primary">
                            {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary">{event.eventType?.name || 'Event'}</Badge>
                                {spotsLeft < 5 && spotsLeft > 0 && (
                                  <Badge variant="destructive">Only {spotsLeft} spots left!</Badge>
                                )}
                                {isSoldOut && (
                                  <Badge variant="destructive">Sold Out</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">${(event.price / 100).toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">per person</div>
                            </div>
                          </div>

                          {event.notes && <p className="text-muted-foreground mb-4">{event.notes}</p>}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{event.location?.name || 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{spotsLeft} of {event.maxCapacity} spots available</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {event.externalBookingUrl ? (
                              <Button size="lg" className="flex-1 sm:flex-none" asChild>
                                <a href={event.externalBookingUrl} target="_blank" rel="noopener noreferrer">
                                  Book on City Website
                                </a>
                              </Button>
                            ) : (
                              <Link href={`/events/${event.id}`}>
                                <Button size="lg" className="flex-1 sm:flex-none" disabled={isSoldOut}>
                                  {isSoldOut ? 'Sold Out' : 'Book Now'}
                                </Button>
                              </Link>
                            )}
                            <Link href={`/events/${event.id}`}>
                              <Button variant="outline" size="lg">
                                More Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Load More */}
            <div className="text-center pt-6">
              <Button variant="outline" size="lg">
                Load More Events
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-secondary/10 py-16 mt-12">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't See a Date That Works?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're constantly adding new dates and locations. Sign up for our newsletter or contact us about private events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline">
              Join Newsletter
            </Button>
            <Button size="lg">
              Request Private Event
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
