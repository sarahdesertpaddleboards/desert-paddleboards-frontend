import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Waves, Users, Calendar, Gift, Star, MapPin, Clock, ArrowRight,
  Play, Pause, Music
} from "lucide-react";

import InstagramFeed from "@/components/InstagramFeed";
import axios from "axios";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const previewTracks = [
    { id: 1, title: "Desert Dawn", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/01-Desert-Dawn.wav" },
    { id: 7, title: "Starlight Meditation", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/07-Starlight-Meditation.wav" },
    { id: 10, title: "Healing Waters", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/10-Healing-Waters.wav" },
  ];

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = previewTracks[currentTrack].url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const handleTrackChange = useCallback((index: number) => {
    setCurrentTrack(index);
    if (audioRef.current) {
      audioRef.current.src = previewTracks[index].url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [isPlaying]);

  const services = [
    {
      icon: Waves,
      title: "Floating Soundbaths",
      description: "Experience deep relaxation as you float on a paddleboard...",
      price: "From $40",
      link: "/events",
    },
    {
      icon: Users,
      title: "Private Events",
      description: "Perfect for bachelorette parties, corporate groups...",
      price: "Custom Pricing",
      link: "/private-events",
    },
    {
      icon: Calendar,
      title: "Floating Yoga",
      description: "Build core strength and balance in our floating yoga classes.",
      price: "From $40",
      link: "/events",
    },
    {
      icon: Gift,
      title: "Gift Certificates",
      description: "Give a unique wellness experience.",
      price: "Any Amount",
      link: "/gift-certificates",
    },
  ];

  const locations = [
    "JW Marriott Desert Ridge, Phoenix",
    "Westin Kierland, Scottsdale",
    "The Plunge, San Diego",
    "Public Pools Across Arizona",
  ];

  const testimonials = [
    {
      name: "Linda Gregory",
      text: "Absolutely amazing experience!",
      rating: 5,
    },
    {
      name: "Amber Namitz",
      text: "Great workout and so much fun!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {/* ... EVERYTHING ABOVE REMAINS IDENTICAL ... */}

      <UpcomingClassesSection />

      {/* Services, Locations, Testimonials, IG, CTA */}
      {/* ... ALL OTHER SECTIONS REMAIN UNCHANGED ... */}
    </div>
  );
}

/* -----------------------------------------------------------
   NEW UpcomingClassesSection (REST-based, no TRPC)
------------------------------------------------------------ */

function UpcomingClassesSection() {
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);

  const API = "https://desert-paddleboards-railway.up.railway.app";

  useEffect(() => {
    async function load() {
      try {
        // Load products & sessions
        const [productsRes, sessionsRes] = await Promise.all([
          axios.get(`${API}/class-products`),
          axios.get(`${API}/class-sessions`),
        ]);

        const products = productsRes.data;
        const sessions = sessionsRes.data;

        // Join sessions with their product
        const joined = sessions
          .map(s => {
            const product = products.find(p => p.id === s.classProductId);
            if (!product) return null;

            return {
              ...s,
              title: product.name,
              price: product.price,
              location: product.location || null,
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 3);

        setUpcoming(joined);
      } catch (err) {
        console.error("UPCOMING CLASSES ERROR", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="container text-center">
          <div className="animate-pulse">Loading upcoming classes...</div>
        </div>
      </section>
    );
  }

  if (upcoming.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-muted/30 to-background py-20">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4 text-sm px-4 py-1">Coming Soon</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Classes & Events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for transformative experiences on the water.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {upcoming.map(event => (
            <Card key={event.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    {event.seatsTotal - event.seatsAvailable} / {event.seatsTotal} filled
                  </Badge>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(event.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">90 minutes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${(event.price / 100).toFixed(0)}
                  </div>
                  <Button asChild size="sm">
                    <Link href="/events">Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/events">View All Classes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
