import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function InquiriesManagement() {
  const { data: inquiries, isLoading } = trpc.inquiries.listInquiries.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading inquiries...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Private Event Inquiries</h2>
        <p className="text-muted-foreground">Manage requests for private events</p>
      </div>

      <div className="space-y-4">
        {inquiries && inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                    <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                    {inquiry.phone && (
                      <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      inquiry.status === "new"
                        ? "default"
                        : inquiry.status === "booked"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {inquiry.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event Type:</span>
                    <p className="font-medium">{inquiry.eventType}</p>
                  </div>
                  {inquiry.numberOfGuests && (
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium">{inquiry.numberOfGuests}</p>
                    </div>
                  )}
                  {inquiry.preferredDate && (
                    <div>
                      <span className="text-muted-foreground">Preferred Date:</span>
                      <p className="font-medium">
                        {new Date(inquiry.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {inquiry.location && (
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{inquiry.location}</p>
                    </div>
                  )}
                </div>

                {inquiry.message && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">{inquiry.message}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Submitted {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
              <p className="text-muted-foreground">
                Private event inquiries will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
