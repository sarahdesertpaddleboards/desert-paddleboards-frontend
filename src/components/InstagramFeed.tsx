import { Instagram } from "lucide-react";

/**
 * Privacy-friendly Instagram feed component
 * Displays a beautiful grid linking to your Instagram profile
 * No third-party widgets or API access required
 */
export default function InstagramFeed() {
  const instagramHandle = "desertpaddleboards";
  const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;

  // Sample post images - you can replace these with actual image URLs from your Instagram posts
  const samplePosts = [
    {
      id: 1,
      alt: "Floating soundbath at sunset",
      gradient: "from-orange-200 via-pink-200 to-purple-200"
    },
    {
      id: 2,
      alt: "Peaceful floating meditation",
      gradient: "from-blue-200 via-cyan-200 to-teal-200"
    },
    {
      id: 3,
      alt: "Group floating yoga class",
      gradient: "from-green-200 via-emerald-200 to-cyan-200"
    },
    {
      id: 4,
      alt: "Desert paddleboard adventure",
      gradient: "from-yellow-200 via-orange-200 to-red-200"
    },
    {
      id: 5,
      alt: "Sound healing instruments",
      gradient: "from-purple-200 via-pink-200 to-rose-200"
    },
    {
      id: 6,
      alt: "Serene water wellness",
      gradient: "from-indigo-200 via-blue-200 to-cyan-200"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Instagram className="w-8 h-8 text-pink-600" />
            <h2 className="text-4xl font-bold text-gray-900">
              Follow Our Journey
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community on Instagram for daily inspiration,
            class updates, and serene desert moments
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-pink-600 hover:text-pink-700 font-medium text-xl"
          >
            @{instagramHandle}
          </a>
        </div>

        {/* Instagram Post Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {samplePosts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`aspect-square bg-gradient-to-br ${post.gradient} rounded-lg overflow-hidden group relative hover:scale-105 transition-transform shadow-md hover:shadow-xl`}
              aria-label={post.alt}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl text-lg font-medium"
          >
            <Instagram className="w-6 h-6" />
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
