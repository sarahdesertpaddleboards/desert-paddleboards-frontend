import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, Users, Calendar, Gift, Star, MapPin, Clock, ArrowRight, Play, Pause, Music } from "lucide-react";
import { trpc } from "@/lib/trpc";
import InstagramFeed from "@/components/InstagramFeed";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID from localStorage
    let sid = localStorage.getItem('analytics_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sid);
    }
    return sid;
  });

  const logPreviewPlay = trpc.analytics.logPreviewPlay.useMutation();

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

      // Log the preview play for analytics
      logPreviewPlay.mutate({
        trackId: previewTracks[currentTrack].id,
        trackTitle: previewTracks[currentTrack].title,
        source: 'homepage',
        sessionId,
      });

      // Store last played track in localStorage for purchase attribution
      localStorage.setItem('last_played_track', JSON.stringify({
        id: previewTracks[currentTrack].id,
        title: previewTracks[currentTrack].title,
      }));
    }
  }, [isPlaying, currentTrack, logPreviewPlay, sessionId]);

  const handleTrackChange = useCallback((index: number) => {
    setCurrentTrack(index);
    if (audioRef.current) {
      audioRef.current.src = previewTracks[index].url;
      if (isPlaying) {
        audioRef.current.play();

        // Log the preview play for analytics
        logPreviewPlay.mutate({
          trackId: previewTracks[index].id,
          trackTitle: previewTracks[index].title,
          source: 'homepage',
          sessionId,
        });

        // Store last played track in localStorage for purchase attribution
        localStorage.setItem('last_played_track', JSON.stringify({
          id: previewTracks[index].id,
          title: previewTracks[index].title,
        }));
      }
    }
  }, [isPlaying, logPreviewPlay, sessionId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  const services = [
    {
      icon: Waves,
      title: "Floating Soundbaths",
      description: "Experience deep relaxation as you float on a paddleboard while immersed in the healing vibrations of live gongs, singing bowls, and flutes.",
      price: "From $40",
      link: "/events"
    },
    {
      icon: Users,
      title: "Private Events",
      description: "Perfect for bachelorette parties, corporate wellness, and retreats. We customize the experience for your group.",
      price: "Custom Pricing",
      link: "/private-events"
    },
    {
      icon: Calendar,
      title: "Floating Yoga",
      description: "Challenge your balance and core strength with paddleboard yoga classes in stunning pool and outdoor settings.",
      price: "From $40",
      link: "/events"
    },
    {
      icon: Gift,
      title: "Gift Certificates",
      description: "Give the gift of relaxation and unique experiences. Perfect for anyone seeking stress relief and mindfulness.",
      price: "Any Amount",
      link: "/gift-certificates"
    }
  ];

  const locations = [
    "JW Marriott Desert Ridge, Phoenix",
    "Westin Kierland Resort & Spa, Scottsdale",
    "The Plunge, San Diego",
    "Multiple Public Pools Across Arizona"
  ];

  const testimonials = [
    {
      name: "Linda Gregory",
      text: "The Floating Sound Bath at Superstition Shadows Aquatic Center was absolutely amazing! Such a unique and peaceful experience.",
      rating: 5
    },
    {
      name: "Amber Namitz",
      text: "Rent a board and join on a Thursday meet up! It's a great workout and so much fun. Sarah is an incredible instructor!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 z-10" />
        <img
          src="/hero-pool-soundbath.webp"
          alt="Floating Soundbath Experience"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-6xl md:text-8xl mb-6 text-balance script-text" style={{ fontWeight: 400, lineHeight: 1.3, textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            Find Your Zen on the Water
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-balance">
            Experience transformative floating soundbaths, yoga, and wellness adventures across Arizona and California
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/events">Book a Class</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-foreground">
              <Link href="/private-events">Private Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sonoran Echoes Album Banner */}
      <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-16 border-y border-amber-200">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Album Artwork */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 p-8 rounded-2xl border-4 border-amber-600 shadow-2xl">
                  <div className="w-64 h-64 flex flex-col items-center justify-center">
                    <Music className="w-24 h-24 text-amber-700 mb-4" />
                    <h3 className="text-3xl font-bold text-amber-900 text-center">Sonoran Echoes</h3>
                    <p className="text-amber-700 text-center mt-2">Native Flute & Soundbath</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Album Info & Player */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3 bg-amber-600 hover:bg-amber-700">New Release</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                  Healing Sounds of the Desert
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  Immerse yourself in 18 original compositions blending Native American flute with crystal singing bowls. Perfect for meditation, yoga, or deep relaxation.
                </p>
              </div>

              {/* Audio Player */}
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={handlePlayPause}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {previewTracks[currentTrack].title}
                      </p>
                      <p className="text-sm text-gray-600">Preview Track</p>
                    </div>
                  </div>

                  {/* Track Selector */}
                  <div className="flex gap-2 mb-4">
                    {previewTracks.map((track, index) => (
                      <button
                        key={track.id}
                        onClick={() => handleTrackChange(index)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentTrack === index
                            ? "bg-amber-600 text-white"
                            : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        }`}
                      >
                        {track.title}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-amber-200">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">$25</p>
                      <p className="text-sm text-gray-600">18 Tracks • High-Quality WAV</p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      <Link href="/sonoran-echoes">
                        View Album <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-gray-600 text-center">
                Also available: Individual tracks at $0.99 each
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Classes Section */}
      <UpcomingClassesSection />

      {/* Services Grid */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl  font-bold mb-4">
            Our Experiences
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our signature water-based wellness offerings designed to help you relax, reset, and reconnect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl  font-bold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary">{service.price}</span>
                        <Button asChild variant="ghost">
                          <Link href={service.link}>Learn More →</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Locations Section */}
      <section className="bg-accent/20 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl  font-bold mb-4">
              Multiple Locations
            </h2>
            <p className="text-lg text-muted-foreground">
              We bring our experiences to premier resorts and public pools throughout the Southwest
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {locations.map((location) => (
              <div key={location} className="bg-background p-6 rounded-lg text-center shadow-sm">
                <p className="font-medium">{location}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/events">View Full Schedule</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl  font-bold mb-4">
            What People Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied participants who have found peace on the water
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold">— {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl  font-bold mb-6">
            Ready to Experience Floating Bliss?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Book your spot in an upcoming class or inquire about private events for your group
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/events">Browse Classes</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href="tel:4802019520">Call 480.201.9520</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function UpcomingClassesSection() {
  const { data: events, isLoading } = trpc.events.list.useQuery();

  // Get next 3 upcoming events
  const upcomingEvents = events?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="text-center">
            <div className="animate-pulse">Loading upcoming classes...</div>
          </div>
        </div>
      </section>
    );
  }

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-muted/30 to-background py-20">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4 text-sm px-4 py-1">Coming Soon</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Classes & Events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for transformative experiences on the water. Limited spots available!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    {event.currentBookings} / {event.maxCapacity} spots filled
                  </Badge>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        {new Date(event.startTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(event.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{event.location.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {event.eventType?.duration || 90} minutes
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${(event.price / 100).toFixed(0)}
                  </div>
                  <Button asChild size="sm" className="group-hover:gap-2 transition-all">
                    <Link href="/events">
                      Book Now
                      <ArrowRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/events">
              View All Classes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
