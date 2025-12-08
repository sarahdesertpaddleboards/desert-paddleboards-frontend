import { Calendar, MapPin, Clock, Users, Heart, Camera } from "lucide-react";

export default function SantaPaddle() {
  const photos = [
    {
      url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/santa-paddle/santagroup2.jpg",
      alt: "Group of paddleboarders in Santa costumes under Tempe Town Lake bridge",
    },
    {
      url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/santa-paddle/SANTADOGS.jpg",
      alt: "Dogs dressed as elves on paddleboards with their owners",
    },
    {
      url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/santa-paddle/santakayak.jpg",
      alt: "Woman in Santa outfit kayaking with dog in elf costume",
    },
    {
      url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/santa-paddle/santAPADDLE.jpg",
      alt: "Two women in holiday costumes with dog on paddleboard",
    },
    {
      url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/santa-paddle/SANTAPADDLEGROUP.JPG",
      alt: "Large group paddle with families and kids in holiday costumes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={photos[0].url}
          alt={photos[0].alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
              🎅 Santa Paddle
            </h1>
            <p className="text-2xl md:text-4xl text-white font-light drop-shadow-md">
              Dress up. Show up. Paddle into holiday chaos.
            </p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center border-t-4 border-red-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-red-600" />
              <h3 className="font-semibold text-lg mb-2">Date & Time</h3>
              <p className="text-gray-700">Friday, December 20th</p>
              <p className="text-gray-700">3:00 PM - 5:00 PM</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center border-t-4 border-green-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <p className="text-gray-700">Tempe Town Lake Marina</p>
              <p className="text-sm text-gray-600">550 E Tempe Town Lake, Tempe, AZ</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center border-t-4 border-blue-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-lg mb-2">Cost</h3>
              <p className="text-3xl font-bold text-gray-900">FREE!</p>
              <p className="text-sm text-gray-600">Just bring your own gear</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">About the Event</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Kick off the season on the water with our annual Santa Paddle — a festive paddleboarding and kayaking meetup where everyone shows up in their best holiday costumes. Think elves, Santas, reindeer, Mrs. Claus, holiday onesies… and yes, dogs on leashes are absolutely welcome…..dressed as reindeer.
              </p>
              <p className="text-gray-700 leading-relaxed font-semibold">
                This isn't a race. It's pure holiday fun on the lake.
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-gradient-to-br from-red-50 to-green-50 rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What to Expect</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Heart className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Group paddle around Tempe Town Lake</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Bring your pup on a leash (reindeer costumes encouraged!)</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Easy, social paddle — all ages welcome</span>
              </li>
              <li className="flex items-start">
                <Camera className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Lots of photo ops</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Snazzy Santa Paddle stickers available for purchase!</span>
              </li>
            </ul>
          </div>

          {/* What to Bring */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What to Bring</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-600">Required</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Your own paddleboard or kayak</li>
                  <li>• Paddle</li>
                  <li>• Life jacket (required by law)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600">Encouraged</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Holiday costume (the more ridiculous the better!)</li>
                  <li>• Dog in festive attire</li>
                  <li>• Camera for memories</li>
                  <li>• Holiday spirit!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Meeting Point */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Where to Meet</h2>
            <div className="flex items-start mb-4">
              <MapPin className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-lg text-gray-900">Tempe Town Lake Marina</p>
                <p className="text-gray-700">North side of the lake</p>
                <p className="text-gray-700">550 E Tempe Town Lake, Tempe, AZ 85288</p>
                <p className="text-sm text-gray-600 mt-2">(Type "Tempe Town Lake Marina" into Maps)</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Show up before 3pm.</span> There's no other activities going on at the lake so parking should be no problem!
                </p>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Past Santa Paddle Memories</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {photos.slice(1).map((photo, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-red-600 to-green-600 rounded-lg shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Join the Fun?</h2>
            <p className="text-xl mb-8">
              No registration required — just show up in your best holiday costume and bring your gear!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.google.com/maps/place/Tempe+Town+Lake+Marina"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Get Directions
              </a>
              <a
                href="/events"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View All Events
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
