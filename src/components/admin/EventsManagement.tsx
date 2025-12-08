import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EventsManagement() {
  const { data: events, isLoading } = trpc.events.list.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events & Classes</h2>
          <p className="text-muted-foreground">Manage your scheduled classes and events</p>
        </div>
        <Button onClick={() => toast.info("Add Event form coming soon!")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-4">
        {events && events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.currentBookings} / {event.maxCapacity} booked</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">${(event.price / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    {event.externalBookingUrl && (
                      <Badge variant="secondary" className="mb-2">
                        External Registration (City Website)
                      </Badge>
                    )}

                    {event.notes && (
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info("Edit coming soon!")}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Delete coming soon!")}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to start accepting bookings
              </p>
              <Button onClick={() => toast.info("Add Event form coming soon!")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
