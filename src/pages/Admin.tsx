import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, Users, MessageSquare, Mail, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import EventsManagement from "@/components/admin/EventsManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";
import BookingsManagement from "@/components/admin/BookingsManagement";
import InquiriesManagement from "@/components/admin/InquiriesManagement";

export default function Admin() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [, setLocation] = useLocation();

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your business</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              View Site
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Bookings"
            value="0"
            icon={Calendar}
            description="This month"
          />
          <StatsCard
            title="Revenue"
            value="$0"
            icon={DollarSign}
            description="This month"
          />
          <StatsCard
            title="Active Products"
            value="0"
            icon={Package}
            description="In catalog"
          />
          <StatsCard
            title="Inquiries"
            value="0"
            icon={MessageSquare}
            description="Pending"
          />
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Users className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="inquiries">
              <MessageSquare className="h-4 w-4 mr-2" />
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="newsletter">
              <Mail className="h-4 w-4 mr-2" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesManagement />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: any;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function NewsletterManagement() {
  const { data: subscribers, isLoading } = trpc.inquiries.listSubscribers.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading subscribers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Subscribers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscribers && subscribers.length > 0 ? (
            <div className="space-y-2">
              {subscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{sub.email}</p>
                    {sub.name && <p className="text-sm text-muted-foreground">{sub.name}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No subscribers yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
