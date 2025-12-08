import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, TrendingUp, Music, DollarSign, Play } from "lucide-react";

export default function Analytics() {
  const { data: stats, isLoading } = trpc.analytics.getDashboardStats.useQuery();

  if (isLoading) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  const totalRevenue = stats.totalPurchases.reduce((sum, p) => sum + (p.revenue || 0), 0) / 100;
  const totalPurchaseCount = stats.totalPurchases.reduce((sum, p) => sum + (p.count || 0), 0);
  const totalPlays = stats.playsByTrack.reduce((sum, t) => sum + (t.totalPlays || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Music Analytics Dashboard</h1>
          <p className="text-xl text-amber-50">Track preview plays and purchase conversions for Sonoran Echoes</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From all music sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchaseCount}</div>
              <p className="text-xs text-muted-foreground">Albums and tracks sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preview Plays</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlays}</div>
              <p className="text-xs text-muted-foreground">Total track previews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPlays > 0 ? ((totalPurchaseCount / totalPlays) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Plays to purchases</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Purchase Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.totalPurchases.map((purchase) => (
                  <div key={purchase.purchaseType} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold capitalize">{purchase.purchaseType}s</p>
                      <p className="text-sm text-muted-foreground">{purchase.count} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${((purchase.revenue || 0) / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
                {stats.totalPurchases.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No purchases yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Converting Tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.conversionAttribution.slice(0, 5).map((track) => (
                  <div key={track.trackId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{track.trackTitle}</p>
                      <p className="text-sm text-muted-foreground">Track #{track.trackId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{track.purchases}</p>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                    </div>
                  </div>
                ))}
                {stats.conversionAttribution.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No conversion data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Most Played Tracks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Most Played Preview Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.playsByTrack.slice(0, 10).map((track, index) => {
                const maxPlays = stats.playsByTrack[0]?.totalPlays || 1;
                const percentage = ((track.totalPlays || 0) / maxPlays) * 100;
                
                return (
                  <div key={track.trackId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <div>
                          <p className="font-semibold">{track.trackTitle}</p>
                          <p className="text-sm text-muted-foreground">Track #{track.trackId}</p>
                        </div>
                      </div>
                      <p className="font-bold">{track.totalPlays} plays</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-600 to-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {stats.playsByTrack.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No preview plays yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-semibold">{purchase.customerName || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">{purchase.customerEmail}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(purchase.purchasedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(purchase.amount / 100).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{purchase.purchaseType}</p>
                    {purchase.lastPlayedTrackTitle && (
                      <p className="text-xs text-amber-600 mt-1">
                        Last played: {purchase.lastPlayedTrackTitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {stats.recentPurchases.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No purchases yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
