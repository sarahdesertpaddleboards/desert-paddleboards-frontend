import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Award, Heart, Tv, Users } from "lucide-react";

export default function About() {
  const achievements = [
    {
      icon: Award,
      title: "25+ Years Experience",
      description: "In fitness, wellness, and aquatic instruction"
    },
    {
      icon: Users,
      title: "Thousands Served",
      description: "Classes sell out regularly across Arizona and California"
    },
    {
      icon: Tv,
      title: "Media Featured",
      description: "Amazing Race, American Ninja Warrior, Phoenix Magazine"
    },
    {
      icon: Heart,
      title: "Community Focused",
      description: "Employing local artists and supporting wellness"
    }
  ];

  const certifications = [
    "Registered Yoga Teacher (RYT)",
    "Certified Pilates Instructor",
    "CrossFit & CrossFit Kids Trainer",
    "Level 2 Parkour Coach (World Freerunning)",
    "USA Weightlifting Coach",
    "Synchronized Swimming Coach",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10" />
        <img
          src="/about-sarah-class.webp"
          alt="Desert Paddleboards"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container text-center text-white">
          <h1 className="text-4xl md:text-6xl  font-bold mb-4">
            About Desert Paddleboards
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Bringing transformative wellness experiences to the water since 2011
          </p>
        </div>
      </section>

      {/* Achievements */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Card key={achievement.title} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Sarah's Story */}
      <section className="bg-accent/20 py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {/* Placeholder for Sarah's photo */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Users className="h-24 w-24" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-3xl md:text-4xl  font-bold">
                Meet Sarah Williams
              </h2>
              <p className="text-lg text-muted-foreground">
                Owner, Instructor & Adventure Guide
              </p>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Sarah Williams is the visionary behind Desert Paddleboards, bringing over 25 years of fitness industry experience to create unique water-based wellness experiences. Based in Mesa, Arizona, Sarah has transformed the way people experience relaxation and mindfulness through her innovative floating soundbaths and paddleboard classes.
                </p>
                <p>
                  Her journey began in 2011 when she founded Desert Paddleboards as a way to connect people with nature through stand-up paddleboarding. With more than 50 rental boards and several kayaks, she can accommodate groups of any size for unforgettable outdoor adventures.
                </p>
                <p>
                  Sarah's passion for aquatic wellness stems from her extensive background in synchronized swimming, where she competed and coached at national-level competitions. She has facilitated various swimming programs throughout Arizona and even swam around Alcatraz Island and completed the Hudson River 10K in NYC.
                </p>
                <p>
                  Her latest venture, Floating Soundbaths, has become wildly popular on social media, with classes selling out regularly. These unique experiences combine the calming effects of floating on water with the healing vibrations of live gongs, singing bowls, and Native American flutes, creating a truly transformative meditation practice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl  font-bold mb-8 text-center">
            Professional Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-3 p-4 bg-accent/20 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Features */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl  font-bold mb-8 text-center">
            As Featured In
          </h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">Arizona Goat Yoga Co-Founder</h3>
                <p className="text-muted-foreground mb-3">
                  Sarah teamed up with April Gould, Arizona's Goat Whisperer, to start Arizona Goat Yoga, which has become a pop culture phenomenon and top tourist activity in Arizona, attracting hundreds of participants each week.
                </p>
                <p className="text-sm text-muted-foreground">
                  Featured on: PBS Start-up, America's Got Talent, Ozzy and Jack's World Detour, Nickelodeon's Unleashed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">Reality TV Appearances</h3>
                <p className="text-muted-foreground mb-3">
                  Sarah's adventures have been featured on several reality shows, including American Ninja Warrior, the Emmy award-winning season of Amazing Race, and the BYU TV show Survivalist, where she and her family won $10,000.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">Local Media Coverage</h3>
                <p className="text-muted-foreground">
                  Desert Paddleboards is featured regularly on various local news programs showcasing paddleboard fitness classes, the annual Witches Regatta, inline skating adventures, and was even featured on the cover of Phoenix Magazine.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            What Our Clients Say
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Hear from those who've experienced the transformative power of floating soundbaths
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "This was the most relaxing experience I've ever had. The combination of floating on water while being surrounded by healing sounds created a meditation deeper than anything I've experienced in a studio. Sarah's energy and expertise made me feel completely safe and cared for."
                </p>
                <p className="font-semibold">— Jennifer M.</p>
                <p className="text-sm text-muted-foreground">Phoenix, AZ</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "I was skeptical at first, but the floating soundbath exceeded all expectations. The vibrations from the singing bowls traveled through the water and into my body in the most incredible way. I left feeling lighter, calmer, and more centered than I have in years."
                </p>
                <p className="font-semibold">— Michael T.</p>
                <p className="text-sm text-muted-foreground">Scottsdale, AZ</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "As someone who struggles with anxiety, this experience was life-changing. The gentle rocking of the water combined with the soothing sounds helped me achieve a state of peace I didn't know was possible. I've been back three times and recommend it to everyone!"
                </p>
                <p className="font-semibold">— Rachel K.</p>
                <p className="text-sm text-muted-foreground">Mesa, AZ</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "The resort class at JW Marriott was absolutely magical. The sunset setting, the luxurious pool, and Sarah's incredible sound healing created an unforgettable evening. Worth every penny and then some. Already booked my next session!"
                </p>
                <p className="font-semibold">— David & Lisa P.</p>
                <p className="text-sm text-muted-foreground">San Diego, CA</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "I booked a private floating soundbath for my bachelorette party and it was the highlight of the weekend. All eight of us left feeling refreshed, connected, and ready to celebrate. Sarah customized everything perfectly for our group."
                </p>
                <p className="font-semibold">— Amanda S.</p>
                <p className="text-sm text-muted-foreground">Tempe, AZ</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "After years of trying different meditation practices, this is the one that finally clicked for me. The water element makes all the difference. I sleep better, feel less stressed, and have found a practice I actually look forward to. Thank you, Sarah!"
                </p>
                <p className="font-semibold">— Carlos R.</p>
                <p className="text-sm text-muted-foreground">Phoenix, AZ</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/events">Book Your Transformative Experience</Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Join hundreds of satisfied customers who've found their zen on the water
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl  font-bold mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            To provide unique, accessible wellness experiences that combine the healing power of water with mindfulness practices, helping people find peace, reduce stress, and connect with their inner calm.
          </p>
          <blockquote className="text-2xl  italic text-primary mb-8">
            "Life is better on the water!"
          </blockquote>
          <p className="text-muted-foreground mb-8">
            Sarah truly is an inspiration and encourages everyone to try new things and live life to the fullest. Whether you're seeking stress relief, a unique meditation practice, or simply a peaceful escape, Desert Paddleboards offers a journey into total relaxation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/events">Book a Class</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/private-events">Plan Your Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
