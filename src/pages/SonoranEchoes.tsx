import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Download, ShoppingCart, Music } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const tracks = [
  { id: 1, title: "Desert Dawn", duration: "4:32", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/01-Desert-Dawn.wav" },
  { id: 2, title: "Cactus Bloom", duration: "5:18", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/02-Cactus-Bloom.wav" },
  { id: 3, title: "Canyon Whispers", duration: "6:45", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/03-Canyon-Whispers.wav" },
  { id: 4, title: "Monsoon Dreams", duration: "4:55", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/04-Monsoon-Dreams.wav" },
  { id: 5, title: "Saguaro Serenade", duration: "5:42", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/05-Saguaro-Serenade.wav" },
  { id: 6, title: "Twilight Mesa", duration: "6:12", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/06-Twilight-Mesa.wav" },
  { id: 7, title: "Starlight Meditation", duration: "7:20", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/07-Starlight-Meditation.wav" },
  { id: 8, title: "River Stones", duration: "5:05", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/08-River-Stones.wav" },
  { id: 9, title: "Ancient Echoes", duration: "6:30", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/09-Ancient-Echoes.wav" },
  { id: 10, title: "Healing Waters", duration: "5:48", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/10-Healing-Waters.wav" },
  { id: 11, title: "Sunset Reflection", duration: "4:25", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/11-Sunset-Reflection.wav" },
  { id: 12, title: "Mountain Spirit", duration: "6:55", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/12-Mountain-Spirit.wav" },
  { id: 13, title: "Desert Rain", duration: "5:15", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/13-Desert-Rain.wav" },
  { id: 14, title: "Peaceful Journey", duration: "7:10", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/14-Peaceful-Journey.wav" },
  { id: 15, title: "Sacred Ground", duration: "6:02", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/15-Sacred-Ground.wav" },
  { id: 16, title: "Moonlit Path", duration: "5:35", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/16-Moonlit-Path.wav" },
  { id: 17, title: "Inner Peace", duration: "6:40", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/17-Inner-Peace.wav" },
  { id: 18, title: "Eternal Calm", duration: "8:15", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/18-Eternal-Calm.wav" },
];

export default function SonoranEchoes() {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const createCheckoutMutation = trpc.shop.createAlbumCheckout.useMutation();
  const createTrackCheckoutMutation = trpc.shop.createTrackCheckout.useMutation();
  const logPreviewPlay = trpc.analytics.logPreviewPlay.useMutation();
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID from localStorage
    let sid = localStorage.getItem('analytics_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sid);
    }
    return sid;
  });

  const handlePlayPause = (trackId: number, trackUrl: string) => {
    if (currentTrack === trackId && isPlaying) {
      // Pause current track
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play new track or resume
      if (currentTrack !== trackId) {
        if (audioRef.current) {
          audioRef.current.src = trackUrl;
        } else {
          audioRef.current = new Audio(trackUrl);
        }
        setCurrentTrack(trackId);

        // Log the preview play for analytics
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          logPreviewPlay.mutate({
            trackId: track.id,
            trackTitle: track.title,
            source: 'album_page',
            sessionId,
          });

          // Store last played track in localStorage for purchase attribution
          localStorage.setItem('last_played_track', JSON.stringify({
            id: track.id,
            title: track.title,
          }));
        }
      }
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handlePurchase = async () => {
    try {
      // Get last played track from localStorage
      const lastPlayedStr = localStorage.getItem('last_played_track');
      let lastPlayed = null;
      if (lastPlayedStr) {
        try {
          lastPlayed = JSON.parse(lastPlayedStr);
        } catch (e) {
          console.error('Failed to parse last played track:', e);
        }
      }

      const result = await createCheckoutMutation.mutateAsync({
        customerEmail: "",
        lastPlayedTrackId: lastPlayed?.id,
        lastPlayedTrackTitle: lastPlayed?.title,
        sessionId,
      });
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Failed to create checkout session. Please try again.");
    }
  };

  const handleTrackPurchase = async (trackId: number, trackTitle: string) => {
    try {
      // Get last played track from localStorage
      const lastPlayedStr = localStorage.getItem('last_played_track');
      let lastPlayed = null;
      if (lastPlayedStr) {
        try {
          lastPlayed = JSON.parse(lastPlayedStr);
        } catch (e) {
          console.error('Failed to parse last played track:', e);
        }
      }

      const result = await createTrackCheckoutMutation.mutateAsync({
        trackId,
        trackTitle,
        customerEmail: "",
        lastPlayedTrackId: lastPlayed?.id,
        lastPlayedTrackTitle: lastPlayed?.title,
        sessionId,
      });
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Failed to create checkout session. Please try again.");
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle audio end
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [currentTrack]);

  const totalDuration = "1 hour 48 minutes";
  const albumPrice = 25;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 via-orange-200/30 to-red-200/30" />
        <div className="container relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Album Artwork */}
            <div className="relative">
              <div className="aspect-square rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-1">
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Music className="w-32 h-32 mx-auto mb-6 text-amber-800" />
                    <h3 className="text-4xl font-bold text-amber-900 mb-2">Sonoran Echoes</h3>
                    <p className="text-xl text-amber-700">Native Flute & Soundbath</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-400/30 rounded-full blur-2xl" />
            </div>

            {/* Album Info */}
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                Sonoran Echoes
              </h1>
              <p className="text-2xl text-gray-700 mb-6">
                Native Flute & Soundbath Album
              </p>
              <div className="space-y-4 mb-8">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Immerse yourself in the healing sounds of the Sonoran Desert. This collection features 18 original compositions blending Native American flute with crystal singing bowls, creating a meditative soundscape perfect for yoga, meditation, or deep relaxation.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>18 Tracks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>High-Quality WAV Files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{totalDuration}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Digital Album</p>
                      <p className="text-4xl font-bold text-gray-900">${albumPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Instant Download</p>
                      <p className="text-sm text-green-600 font-semibold">All 18 Tracks</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handlePurchase}
                    disabled={createCheckoutMutation.isPending}
                    size="lg" 
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {createCheckoutMutation.isPending ? "Processing..." : "Purchase Album"}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Secure checkout powered by Stripe • Instant download after payment
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Track Listing */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Album Tracks</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-4 p-4 hover:bg-amber-50 transition-colors ${
                        currentTrack === track.id ? "bg-amber-100" : ""
                      }`}
                    >
                      {/* Track Number */}
                      <div className="w-8 text-center text-gray-500 font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayPause(track.id, track.url)}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 flex items-center justify-center text-white transition-all hover:scale-105"
                      >
                        {currentTrack === track.id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>

                      {/* Track Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{track.title}</p>
                        {currentTrack === track.id && isPlaying && (
                          <p className="text-xs text-amber-600">Now playing...</p>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="text-sm text-gray-500 font-mono mr-4">
                        {track.duration}
                      </div>

                      {/* Buy Track Button */}
                      <button
                        onClick={() => handleTrackPurchase(track.id, track.title)}
                        disabled={createTrackCheckoutMutation.isPending}
                        className="text-xs bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ${createTrackCheckoutMutation.isPending ? "..." : "0.99"}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bottom CTA */}
            <div className="mt-8 text-center">
              <Button 
                onClick={handlePurchase}
                disabled={createCheckoutMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                {createCheckoutMutation.isPending ? "Processing..." : `Get Full Album - $${albumPrice}`}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">What You'll Receive</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Access</h3>
                <p className="text-gray-600 text-sm">
                  Download all 18 tracks immediately after purchase
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">High Quality</h3>
                <p className="text-gray-600 text-sm">
                  Uncompressed WAV files for the best listening experience
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Lifetime Access</h3>
                <p className="text-gray-600 text-sm">
                  Download as many times as you need, forever
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
