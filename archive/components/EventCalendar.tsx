import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MapPin, Clock, Users } from "lucide-react";
import { Link } from "wouter";

type Event = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  price: number;
  maxCapacity: number;
  currentBookings: number;
  status: string;
  notes: string | null;
  externalBookingUrl: string | null;
  location: { name: string } | null;
  eventType: { name: string } | null;
};

type EventCalendarProps = {
  events: Event[];
};

export default function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the month and the number of days in the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Group events by date
  const eventsByDate = new Map<string, Event[]>();
  events.forEach((event) => {
    const eventDate = new Date(event.startTime);
    if (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    ) {
      const dateKey = eventDate.getDate().toString();
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    }
  });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dayEvents = day ? eventsByDate.get(day.toString()) || [] : [];
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={index}
                  className={`
                    min-h-24 p-2 border rounded-lg
                    ${!day ? "bg-muted/20" : "bg-background hover:bg-accent/50 transition-colors"}
                    ${isToday(day) ? "ring-2 ring-primary" : ""}
                    ${hasEvents ? "cursor-pointer" : ""}
                  `}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary font-bold" : ""}`}>
                        {day}
                      </div>
                      {hasEvents && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const spotsLeft = event.maxCapacity - event.currentBookings;
                            const isSoldOut = spotsLeft === 0;
                            
                            return (
                              <Link key={event.id} href={`/events/${event.id}`}>
                                <div
                                  className={`
                                    text-xs p-1 rounded truncate
                                    ${isSoldOut ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}
                                    hover:opacity-80 transition-opacity
                                  `}
                                  title={event.title}
                                >
                                  {new Date(event.startTime).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  })} - {event.title.substring(0, 20)}
                                </div>
                              </Link>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events list for selected month */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Events in {monthNames[currentDate.getMonth()]}
        </h3>
        {events.filter(event => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getMonth() === currentDate.getMonth() &&
            eventDate.getFullYear() === currentDate.getFullYear()
          );
        }).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No events scheduled for this month
            </CardContent>
          </Card>
        ) : (
          events
            .filter(event => {
              const eventDate = new Date(event.startTime);
              return (
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
              );
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((event) => {
              const spotsLeft = event.maxCapacity - event.currentBookings;
              const isSoldOut = spotsLeft === 0;

              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 text-center bg-primary/10 rounded-lg p-3 md:w-20">
                        <div className="text-2xl font-bold text-primary">
                          {new Date(event.startTime).getDate()}
                        </div>
                        <div className="text-xs font-medium text-primary">
                          {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold mb-1">{event.title}</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{event.eventType?.name || 'Event'}</Badge>
                              {spotsLeft < 5 && spotsLeft > 0 && (
                                <Badge variant="destructive">Only {spotsLeft} spots left!</Badge>
                              )}
                              {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              ${(event.price / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">per person</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(event.startTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{event.location?.name || 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{spotsLeft} of {event.maxCapacity} spots</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {event.externalBookingUrl ? (
                            <Button size="sm" asChild>
                              <a href={event.externalBookingUrl} target="_blank" rel="noopener noreferrer">
                                Book on City Website
                              </a>
                            </Button>
                          ) : (
                            <Link href={`/classes`}>
                              <Button size="sm" disabled={isSoldOut}>
                                {isSoldOut ? 'Sold Out' : 'Book Now'}
                              </Button>
                            </Link>
                          )}
                          <Link href={`/classes`}>
                            <Button variant="outline" size="sm">
                              Details
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
      </div>
    </div>
  );
}
