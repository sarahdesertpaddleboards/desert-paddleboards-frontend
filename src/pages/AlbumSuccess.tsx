import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Download, Music, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tracks = [
  { id: 1, title: "Desert Dawn", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/01-Desert-Dawn.wav" },
  { id: 2, title: "Cactus Bloom", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/02-Cactus-Bloom.wav" },
  { id: 3, title: "Canyon Whispers", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/03-Canyon-Whispers.wav" },
  { id: 4, title: "Monsoon Dreams", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/04-Monsoon-Dreams.wav" },
  { id: 5, title: "Saguaro Serenade", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/05-Saguaro-Serenade.wav" },
  { id: 6, title: "Twilight Mesa", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/06-Twilight-Mesa.wav" },
  { id: 7, title: "Starlight Meditation", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/07-Starlight-Meditation.wav" },
  { id: 8, title: "River Stones", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/08-River-Stones.wav" },
  { id: 9, title: "Ancient Echoes", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/09-Ancient-Echoes.wav" },
  { id: 10, title: "Healing Waters", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/10-Healing-Waters.wav" },
  { id: 11, title: "Sunset Reflection", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/11-Sunset-Reflection.wav" },
  { id: 12, title: "Mountain Spirit", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/12-Mountain-Spirit.wav" },
  { id: 13, title: "Desert Rain", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/13-Desert-Rain.wav" },
  { id: 14, title: "Peaceful Journey", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/14-Peaceful-Journey.wav" },
  { id: 15, title: "Sacred Ground", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/15-Sacred-Ground.wav" },
  { id: 16, title: "Moonlit Path", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/16-Moonlit-Path.wav" },
  { id: 17, title: "Inner Peace", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/17-Inner-Peace.wav" },
  { id: 18, title: "Eternal Calm", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/18-Eternal-Calm.wav" },
];

export default function AlbumSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    setSessionId(sid);
  }, []);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    tracks.forEach((track, index) => {
      setTimeout(() => {
        handleDownload(track.url, `${String(track.id).padStart(2, "0")}-${track.title}.wav`);
      }, index * 500); // Stagger downloads by 500ms
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 py-16">
      <div className="container max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your payment was successful
          </p>
          {sessionId && (
            <p className="text-sm text-gray-500">
              Order ID: {sessionId.slice(-12).toUpperCase()}
            </p>
          )}
        </div>

        {/* Download Instructions */}
        <Card className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Sonoran Echoes - Complete Album</h2>
                <p className="text-gray-700 mb-4">
                  Your album is ready for download! All 18 tracks are available in high-quality WAV format.
                </p>
                <Button 
                  onClick={handleDownloadAll}
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download All Tracks
                </Button>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                A confirmation email with download links has been sent to your email address. 
                You can download these files as many times as you need.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Individual Track Downloads */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Download Individual Tracks</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-mono w-8">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{track.title}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(track.url, `${String(track.id).padStart(2, "0")}-${track.title}.wav`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-4">What's Next?</h3>
            <p className="text-gray-700 mb-6">
              Explore our floating soundbath classes and wellness experiences to deepen your practice.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/events")}
              >
                Browse Classes
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Note */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Having trouble downloading? Contact us at{" "}
            <a href="mailto:info@desertpaddleboards.com" className="text-teal-600 hover:underline">
              info@desertpaddleboards.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
