import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function BookingsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-muted-foreground">View and manage customer bookings</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground">
            Bookings will appear here once customers start registering for classes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
