/**
 * Blog posts — migrated from the old GoDaddy site (June 2026) to preserve the
 * organic-search content. Slugs match the old `/blog/f/<slug>` URLs (now
 * `/blog/<slug>`, with a 301 in public/_redirects).
 *
 * `body` is the post's original Markdown, reproduced faithfully. `image` is the
 * cover image — currently hot-linked from GoDaddy's CDN (img1.wsimg.com).
 * TODO (before canceling GoDaddy): self-host these images so they don't break.
 */

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD) for sorting + display. */
  date: string;
  excerpt: string;
  /** Cover image URL ("" if none). */
  image: string;
  /** Markdown body (may start with a cover image — stripped at render). */
  body: string;
  /**
   * Optional search-result overrides. Use when the on-page headline should stay
   * short and human but the <title> needs to carry the keywords people actually
   * search (e.g. "Halloween events in Arizona").
   */
  seoTitle?: string;
  seoDescription?: string;
}

const posts: BlogPost[] = [
  {
    slug: "simple-ways-to-lower-cortisol-this-summer",
    title: "Simple Ways to Lower Cortisol This Summer",
    date: "2026-05-27",
    excerpt:
      "What cortisol is, why Arizona summers spike it, and simple habits — hydration, mindful movement, and floating sound baths — to ease your stress response.",
    image: "/images/blog/simple-ways-to-lower-cortisol-this-summer.webp",
    body: `### Understanding Cortisol: Your Body's Natural Stress Response

Cortisol. We keep hearing about it. But... what is it, what does it do, and why does it seem to be ruining my LIFE??

Cortisol is your body's "stress hormone". It helps regulate metabolism, immune function, energy levels, and sleep cycles. In healthy amounts, it's essential.

But too much? It causes problems.

*And summers in Arizona don't help.*

Excessive heat, dehydration, over-scheduling, and nonstop stimulation can all leave your nervous system feeling overloaded. Signs of elevated cortisol include fatigue, disrupted sleep, irritability, increased heart rate, brain fog, and feeling constantly "on edge."

***So how do we support a healthier stress response? Simple habits matter.***

### Hydrate.

As temperatures rise, your body works harder to stay balanced. Dehydration can increase physical stress, fatigue, and dizziness — especially during Arizona summers. Stay ahead of it with electrolytes, consistent hydration, and by scheduling outdoor activities early in the morning or after sunset.

### Slow Down.

Balance your high-energy outings (or surviving rush-hour traffic) with restorative practices. Think time in nature. Yoga. Meditation. And our favorite, a floating soundbath. A float session on the water isn't just about listening to music - it's an opportunity to rest and recover, supporting cortisol regulation.

### Move Mindfully.

Not every workout needs to push you to exhaustion. Gentle movement like paddleboarding, swimming, stretching, floating, or walking outdoors can help regulate your nervous system while still supporting your health. Our personal favorite? Rollerblading!

Most people move directly from work stress to phone scrolling to television screens without any true rest. Simple habits like limiting screen time, listening to calming music, practicing deep breathing, and meditating can help you balance it all out. Floating soundbaths have become especially popular in Arizona because they check all those boxes.

### Float and Relax.

At the end of the day, lowering cortisol isn't about doing more — it's about creating moments where your body and mind can feel safe enough to relax. Whether that looks like time in nature, exercise, meditation, or a floating soundbath in Scottsdale or Phoenix, small moments of rest can make a big impact on your overall wellness. Arizona may move fast, but your body still needs time to recover, reset, and recharge. Take care of yourself!`,
  },
  {
    slug: "blue-zone-wellness",
    title: '"Blue Zone" Wellness',
    date: "2025-08-06",
    excerpt:
      "A lighthearted look at the world's five 'Blue Zones' where people live longest — and how floating sound baths tap into several of those longevity habits.",
    image:
      "/images/blog/blue-zone-wellness.webp",
    body: `**What are "BLUE ZONES" and why should you care?**

No it's not a spa treatment or one of Sarah's weird branding ideas. Blue Zones are actual regions in the world where people live suspiciously longer and are happier — like, they're 100 years old and still doing yardwork and yelling at grandkids in Italian.

***Where are these magical places?***

A researcher named Dan Buettner discovered 5 places on Earth where people basically refuse to die:

- ***Okinawa, Japan***
- ***Sardinia, Italy***
- ***Ikaria, Greece***
- ***Nicoya Peninsula, Costa Rica***
- ***Loma Linda, California*** (yes, somehow inland California made the list)

Residents of these 5 places aren't guzzling green juice or hitting their step goals every day - they just live *REALLY* well. Naturally. Intentionally. And without 17,000 unread emails in their inbox.

But, HOW? It's **The "Power Nine"!** Here are the 9 habits they all have in common. (Spoiler: None involve a $59 protein powder or a supplement subscription.)

1. **Move Naturally** — Walking, gardening, carrying stuff. Not burpees.
2. **Purpose** — These Blue Zone residents actually know why they get up in the morning. Not just because the dog is whining to go outside.
3. **Downshift** — Daily rituals to manage stress. (Think naps, not Starbucks.)
4. **80% Rule** — Eat until you're almost full.
5. **Plant-Slant Diet** — This is a cute rhyming way to tell you not to eat so much bacon.
6. **Wine at 5** — Now we're getting somewhere fun. Moderation + friendship = longevity.
7. **Belonging** — Faith, community, or at least brunch with friends.
8. **Loved Ones First** — They don't ignore their family members. And probably, they answer the phone when Mom calls.
9. **Right Tribe** — Blue Zone residents surround themselves with good people. Preferably ones who paddle.

***What does this have to do with Floating Soundbaths?***

Honestly? More than you'd think. Despite Sarah with her endless business ideas, floating soundbaths actually hit several of these "Blue Zone" habits that can help you live longer and be healthier.

For real.

So sign up today, and see what all the hype is about!`,
  },
  {
    slug: "floating-sound-baths-the-ultimate-corporate-wellness-event",
    title: "Floating Sound Baths: The Ultimate Corporate Wellness Event",
    date: "2024-09-16",
    excerpt:
      "Why floating sound baths make a standout corporate wellness and team-building experience in Scottsdale — what they are and why they work for groups.",
    image:
      "/images/blog/floating-sound-baths-the-ultimate-corporate-wellness-event.webp",
    body: `In the heart of Scottsdale, Arizona, where luxury resorts and vibrant desert landscapes meet, a unique corporate event trend is making waves: floating sound baths. Ideal for company retreats, wellness-focused gatherings, and team-building activities, floating sound baths offer an immersive experience that helps foster community, relaxation, and mindfulness — all while floating peacefully on water.

**What is a Floating Sound Bath?**

A floating sound bath combines the serene environment of water with the therapeutic benefits of a traditional sound bath. Participants float in a pool or shallow body of water while being enveloped by the soothing sounds of singing bowls, gongs, and other sound healing instruments. The vibrations from these sounds ripple through the water, creating a deeply immersive and calming experience.

**Why Floating Sound Baths are Perfect for Corporate Events**

- **Team Bonding & Community Building.** The shared experience of peaceful floating and soothing sounds fosters a sense of community and unity. Team members often leave feeling more connected, relaxed, and inspired to collaborate better in the workplace.
- **Promotes Relaxation & Stress Relief.** The combination of sound healing and floating in water induces a deep state of meditative relaxation, helping to reduce stress and anxiety — a perfect addition to corporate retreats focused on mental wellness.
- **Enhanced Sensory Experience on Water.** Sound waves travel through the water, resonating with the body's natural rhythms. Floating adds a physical element of weightlessness, allowing participants to feel even more connected to the sound and vibrations.
- **Scottsdale's Ideal Setting.** With stunning pools, serene desert landscapes, and top-tier wellness amenities, Scottsdale's resorts provide the perfect venue for this one-of-a-kind corporate experience.

**Why Resorts Should Offer Floating Sound Baths for Corporate Parties**

Resorts in Scottsdale are always looking for innovative and unique experiences to attract corporate clients. Offering floating sound baths as part of corporate packages can elevate a resort's wellness offerings and set it apart from competitors. Corporate groups are increasingly prioritizing wellness and mindfulness experiences, and this is a fresh way to cater to those needs.

**Conclusion**

Floating sound baths offer an innovative, relaxing, and highly effective way to enhance any corporate event in Scottsdale, Arizona. By embracing this growing wellness trend, resorts and event planners can provide corporate clients with a truly memorable experience that fosters connection, relaxation, and rejuvenation — bringing companies together, one sound wave at a time.`,
  },
  {
    slug: "discover-the-tranquil-bliss-of-a-floating-sound-bath-in-mesa-az",
    title: "Discover the Tranquil Bliss of a Floating Sound Bath in Mesa, AZ",
    date: "2024-07-18",
    excerpt:
      "An introduction to floating sound bath classes in Mesa, AZ — the benefits of sound therapy, what makes floating so relaxing, and options for groups.",
    image:
      "/images/blog/discover-the-tranquil-bliss-of-a-floating-sound-bath-in-mesa-az.webp",
    body: `Imagine floating effortlessly on the serene surface of a pool or lake, surrounded by the soothing sounds of gongs, chimes, and singing bowls. This is the essence of a floating sound bath, a unique and transformative experience offered right here in Mesa, AZ. Whether you're seeking a new form of relaxation for yourself, your team, or your friends and family, our floating sound bath classes are designed to provide unparalleled tranquility and wellness benefits. With the capacity to host up to 50 people per event, we bring the healing power of sound to your desired setting.

### The Healing Power of Sound

Sound therapy has been used for centuries to promote physical and mental well-being. The harmonious vibrations produced by instruments such as gongs, chimes, and singing bowls can have profound effects on the body and mind. Some of the key benefits of a sound bath:

1. **Stress Reduction:** The gentle, rhythmic sounds help to lower stress levels by calming the nervous system and reducing the production of stress hormones.
2. **Enhanced Relaxation:** The immersive sound environment promotes deep relaxation, allowing participants to enter a meditative state and release tension.
3. **Improved Sleep Quality:** Regular exposure to soothing sounds can improve sleep patterns, leading to better overall health and well-being.
4. **Emotional Balance:** The vibrations can help release emotional blockages and promote a sense of inner peace and emotional clarity.
5. **Pain Relief:** Sound therapy has been found to alleviate pain by reducing inflammation and increasing circulation.
6. **Increased Focus and Creativity:** The meditative state induced by a sound bath can enhance mental clarity, focus, and creativity.

### Why a Floating Sound Bath is Unique

While traditional sound baths are incredibly beneficial, experiencing one while floating on water adds a whole new dimension to the practice:

1. **Enhanced Sensory Experience:** The combination of water and sound creates a multi-sensory environment that amplifies the therapeutic effects.
2. **Weightlessness and Relaxation:** Floating in water reduces the effects of gravity on the body, relieving pressure on joints and muscles for a deeper state of relaxation.
3. **Connection with Nature:** Being on water fosters a deeper connection with nature, adding to the calming atmosphere.
4. **Group Harmony:** Our classes can accommodate up to 50 participants, making it perfect for corporate team-building or private gatherings.

### Tailored Experiences for Every Occasion

Whether you prefer the controlled environment of a pool or the open, natural setting of a lake, we can tailor the experience to meet your requirements. Our floating sound bath classes are ideal for:

- **Corporate Events:** Foster team unity and reduce workplace stress with a rejuvenating group experience.
- **Private Celebrations:** Celebrate special occasions with a unique and memorable activity that promotes well-being and togetherness.
- **Wellness Retreats:** Enhance your wellness retreats with a session that leaves participants feeling refreshed and revitalized.

Embrace the serene bliss of a floating sound bath and discover the profound benefits of sound therapy in the most tranquil of settings.`,
  },
  {
    slug: "arizona-goat-yoga-on-agt",
    title: "Arizona Goat Yoga on AGT",
    date: "2023-04-10",
    excerpt:
      "How Arizona Goat Yoga — the original goat yoga, founded by Sarah Williams and April Gould — brought its baby goats and alpacas to America's Got Talent.",
    image:
      "/images/blog/goat-yoga.webp",
    body: `Arizona Goat Yoga, the original goat yoga, has been making waves in the yoga world since 2015, and in 2022, they took the nation by storm by performing on America's Got Talent. Sarah Williams and April Gould, the co-founders of Arizona Goat Yoga, brought their baby goats and alpacas to the national stage, where they wowed the audience and the judges with their unique and entertaining performance.

Goat yoga, as the name suggests, is a yoga class that involves practicing yoga while surrounded by playful and friendly goats. The goats interact with the participants throughout the class, creating a stress-free and enjoyable environment. Arizona Goat Yoga has become a popular attraction in Arizona, with people of all ages and skill levels coming to practice yoga with the specially trained yoga goats.

In 2022, Arizona Goat Yoga was invited to perform on America's Got Talent, a popular TV show that showcases various talents from all over the country. Sarah and April jumped at the opportunity, and they brought their baby goats and alpacas to the national stage. They wowed the audience and the judges with their unique performance, which involved practicing yoga with the baby goats and alpacas.

The performance was nothing short of spectacular, with the baby goats and alpacas adding a unique and entertaining element to the traditional yoga practice. The goats and alpacas jumped, played, and even walked on the participants, creating a one-of-a-kind experience that left the audience and the judges amazed.

The performance on America's Got Talent brought Arizona Goat Yoga to the national stage, and it opened up new opportunities for the company. Sarah and April's creative and innovative idea has taken them from a local attraction in Arizona to a national sensation, and it's all thanks to their passion for yoga, animals, and entertainment.`,
  },
  {
    slug: "goat-yoga-on-agt",
    title: "Original Goat Yoga in AZ",
    date: "2023-04-10",
    excerpt:
      "The origin story of goat yoga, which began in Arizona in 2015 when American Ninja Warriors Sarah Williams and April Gould combined yoga and goats.",
    image:
      "/images/blog/goat-yoga.webp",
    body: `In the past decade, yoga has gained immense popularity all over the world, with millions of people practicing it for its numerous health benefits. But have you ever heard of goat yoga? Yes, you read that right! Goat yoga is a new trend in the yoga world, which involves practicing yoga while surrounded by playful and friendly goats.

Believe it or not, the idea of goat yoga was born in Arizona, and it all started with two American Ninja Warriors, Sarah Williams and April Gould. Sarah owned a paddleboard business that was only operational during summers, and April was famous for her goats. They both had a mutual interest in yoga, so they decided to combine their skills and interests and started Arizona Goat Yoga in 2015.

Sarah had been studying stand-up comedy and yoga for decades, making her the perfect fit to teach goat yoga. April, known as the "goat whisperer" of Gilbert, AZ, had a flock of playful and friendly goats. They put their skills and resources together and started goat yoga, which quickly became a hit in Arizona.

Arizona Goat Yoga was the first goat yoga in the world, and it became an instant success. The unique concept of practicing yoga with goats attracted people from all over the world, and it soon became a popular tourism attraction in Arizona. Participants of all ages and skill levels come to practice yoga with the specially trained yoga goats, and the goats interact with them throughout the whole class.

Goat yoga is a perfect combination of yoga, animal therapy, and comedy. The playful and friendly goats create a relaxed and stress-free atmosphere, and their presence makes the class enjoyable and entertaining. The goats jump, play, and even walk on the participants during the class, creating a one-of-a-kind experience that can't be found anywhere else.

In conclusion, Arizona Goat Yoga is a perfect example of how combining unique skills and interests can lead to the creation of something new and exciting. Today, goat yoga has spread all over the world, but it all started in Arizona, with Sarah Williams and April Gould's creative and innovative idea.`,
  },
  {
    slug: "paddleboarding-saguaro-lake-a-scenic-adventure-in-arizona",
    title: "Paddleboarding Saguaro Lake: A Scenic Adventure in Arizona",
    date: "2023-02-23",
    excerpt:
      "A practical guide to paddleboarding at Saguaro Lake in the Tonto National Forest — recreation areas, the Tonto Pass, nearby dining, and board rentals.",
    image:
      "/images/blog/paddleboarding-saguaro-lake.webp",
    body: `Saguaro Lake, located in the Tonto National Forest, is a popular destination for outdoor enthusiasts in Arizona.

Before heading to the lake, it's important to know the recreation areas and passes required. The main recreation areas are Butcher Jones and Saguaro del Norte. Butcher Jones is located on the north side of the lake and offers a boat ramp, picnic tables, restrooms, and a beach area. Saguaro del Norte, on the south side, offers a visitor center, picnic areas, and a boat launch. A Tonto Pass is required for both recreation areas and can be purchased at the entrance or online for $8 per vehicle per day. The pass is also valid for other recreation areas in the Tonto National Forest.

After your paddleboarding adventure, you might want to grab a bite to eat at one of the lake's restaurants. The most popular is the Saguaro Lake Ranch Restaurant, which offers a variety of southwestern dishes and stunning views of the lake. It's open for breakfast, lunch, and dinner, and reservations are recommended.

For those interested in exploring the area further, there are several nearby attractions. The Salt River Recreation Area is located just downstream from Saguaro Lake and offers hiking, tubing, and kayaking. The nearby town of Fountain Hills offers shops, restaurants, and attractions, including the famous Fountain Park and the River of Time Museum.

Paddleboarding at Saguaro Lake is a unique and unforgettable adventure for anyone visiting Arizona. Just be sure to purchase your Tonto Pass, rent your paddleboard, and head out to the lake for a day of fun. We offer inflatable paddleboard rentals for $35 a day.`,
  },
  {
    slug: "adult-swim-lessons--immersion-swimming",
    title: "Adult Swim Lessons — Immersion Swimming",
    date: "2023-02-21",
    excerpt:
      "An overview of the immersion swimming technique for teaching adults to swim — relaxation, balance, and efficiency — plus private one-on-one lessons.",
    image:
      "/images/blog/adult-swim-lessons.webp",
    body: `Swimming is a great exercise that is easy on the joints, helps with weight loss and improves cardiovascular health. However, many adults are afraid of the water, making it difficult for them to learn to swim. With over 20 years of swimming and coaching experience, I have found that **the immersion swimming technique is an effective way to teach adults to swim**.

The immersion swimming technique is a popular approach that uses a hands-on, immersive teaching method. Instead of focusing on a lot of technical terms and theoretical concepts, it gets students into the water as soon as possible. **This technique focuses on relaxation, balance, and efficiency in the water.**

The first step is to assess current skill level. You will get into the water and perform basic movements like kicking, floating, and gliding.

Next, **the instructor works with the student to develop a comfortable breathing pattern**. The instructor also teaches proper body positioning, which is important for developing the right balance in the water. This is done by helping the student learn to relax and to use their body's natural buoyancy to stay afloat.

Once the student has mastered these basics, **the instructor will work with them to develop their swimming strokes**, helping them find a natural rhythm to swim more efficiently.

**The immersion swimming technique is particularly useful for adults learning to swim for fitness. It's also great for scuba divers, triathletes, and open water swimmers who need to be comfortable in the water and able to swim long distances without tiring out.**

Private adult lessons are held at local health clubs or community heated pools. These lessons are one-on-one, so the instructor can focus on the individual needs of each student. The cost is $75 per session, with package deals available. Contact us to schedule a lesson!`,
  },
  {
    slug: "canyon-lake-day-trip-or-overnight",
    title: "Canyon Lake: Day Trip or Overnight",
    date: "2023-02-21",
    excerpt:
      "A guide to paddleboarding Canyon Lake in Arizona's Tonto National Forest — the best recreation areas and campgrounds for a day trip or overnight.",
    image:
      "/images/blog/canyon-lake-day-trip-or-overnight.webp",
    body: `Arizona is a haven for outdoor enthusiasts, and paddleboarding at Canyon Lake is a must-do activity for anyone looking for a unique and exciting adventure. Located in the Tonto National Forest, Canyon Lake offers a stunning natural setting, crystal-clear water, and incredible rock formations that are perfect for paddleboarding.

Paddleboarding at Canyon Lake is suitable for all skill levels, from beginners to experienced paddlers. It's a popular destination for day use and camping, with several recreational areas and campgrounds that offer access to the lake. Some of the best to consider:

- **Acacia Picnic Site:** This day-use area on the west side of the lake offers picnic tables, grills, restrooms, and a small beach area — a great spot to launch your paddleboard.
- **Boulder Creek Recreation Site:** This campground on the east side offers campsites with water, picnic tables, fire rings, and vault toilets, plus a boat launch and beach area.
- **Burnt Corral Recreation Site:** Also on the east side, with similar campsite amenities, a boat launch, and a beach area.
- **Canyon Lake Marina:** On the south end, with boat rentals, a restaurant, a gift shop, and a beach area — a great spot to rent a paddleboard or take a guided tour.

Fees and policies vary by area. The day-use fee for Acacia Picnic Site is $8 per vehicle, and the camping fee for Boulder Creek and Burnt Corral is $20 per night per campsite. Marina rental and tour fees vary.

With its stunning natural setting, clear waters, and incredible rock formations, Canyon Lake offers a unique and exciting paddleboarding experience for all skill levels. Whether you're looking for a day trip or a camping adventure, grab your paddleboard and get ready for an unforgettable outdoor experience.`,
  },
  {
    slug: "paddleboarding-watson-lake-in-prescott-arizona",
    title: "Paddleboarding Watson Lake in Prescott, Arizona",
    date: "2023-02-21",
    excerpt:
      "An overview of paddleboarding Watson Lake near Prescott — the Granite Dells rock formations, local wildlife, and practical info on fees and board rentals.",
    image:
      "/images/blog/paddleboarding-watson-lake.webp",
    body: `Arizona is known for its beautiful landscapes, and Prescott is no exception. With its mild climate and stunning scenery, Prescott is a popular destination for outdoor enthusiasts.

Watson Lake is a man-made reservoir located just a few miles from downtown Prescott. The lake is surrounded by stunning rock formations, including the Granite Dells, which make for a unique and breathtaking paddleboarding experience.

As you paddle around Watson Lake, you'll be treated to stunning views of the Granite Dells, a unique rock formation that rises out of the water and towers above the surrounding landscape. These rock formations are millions of years old and are a sight to behold. The lake is also home to a variety of wildlife, including bald eagles, great blue herons, and several species of fish, making it an excellent spot for nature lovers.

If you're looking for a more challenging experience, you can try paddling through the Granite Dells. The rock formations create narrow channels and hidden coves — though this is a more advanced route and is not recommended for beginners.

When planning your adventure, keep in mind the lake can get crowded on weekends and during peak season. Still, there's plenty of space to explore, and with its calm waters and easy accessibility, Watson Lake is excellent for paddleboarding enthusiasts of all skill levels.

As of 2021, the entry fee to Watson Lake Park is $3 per person, plus an additional $3 per vehicle.

If you need to rent a paddleboard, we offer daily rentals for $35. Boards are inflatable and pack in a duffle bag for easy transport.`,
  },
  {
    slug: "salt-river-paddleboarding-in-the-winter",
    title: "Salt River Paddleboarding in the Winter",
    date: "2023-02-19",
    excerpt:
      "The 2-hour paddleboarding journey down the Salt River from Phon D Sutton to Granite Reef — its scenery, wildlife, and appeal for all skill levels.",
    image:
      "/images/blog/salt-river-paddleboarding-winter.webp",
    body: `Paddleboarding on the Salt River is a thrilling adventure that offers a unique perspective on the beauty of Tonto National Forest. With its crystal-clear waters and breathtaking scenery, this river is an ideal destination for outdoor enthusiasts and nature lovers alike.

The 2-hour paddleboarding journey from Phon D Sutton to Granite Reef promises to be an exhilarating experience that will leave you feeling invigorated and refreshed. As you make your way down the river, you will encounter a variety of natural wonders, from towering cliffs and lush vegetation to fascinating wildlife such as blue herons, ospreys, and bald eagles.

As you glide through the water, you'll feel a sense of freedom and tranquility that comes with being out in nature, away from the hustle and bustle of city life.

Whether you're a seasoned paddleboarder or a beginner, the Salt River offers something for everyone. The calm waters are great for practicing your skills, and the stunning views are sure to inspire a sense of awe and wonder. And when you're ready to take a break, you can simply sit back, relax, and soak in the beauty of the surrounding landscape.

Overall, paddleboarding on the Salt River is an unforgettable experience that should not be missed. So grab your board, your sense of adventure, and get ready to explore one of the most stunning natural wonders in the United States.`,
  },
  {
    slug: "witches-regatta",
    title: "Witches Regatta 2026: Twelve Years of Paddling Tempe Town Lake in a Pointy Hat",
    date: "2026-08-17",
    seoTitle:
      "Witches Regatta 2026 | Free Halloween Paddleboard Event, Tempe AZ",
    seoDescription:
      "The 12th annual Witches Regatta returns Saturday, October 24, 2026 at 10 AM — a free Halloween event on Tempe Town Lake, Arizona. 300+ paddlers in costume. Bring a board or rent one.",
    excerpt:
      "One of Arizona's most unusual Halloween events: 300+ paddlers in witch costumes floating Tempe Town Lake. Free to join, Saturday October 24, 2026 at 10 AM.",
    image: "/images/blog/witches-regatta.jpg",
    body: `**Saturday, October 24, 2026 · 10:00 AM · Tempe Town Lake Marina, Phoenix metro**
**Free to join. Bring a board or rent one from us.**

Twelve years ago, a handful of us put on witch hats, got on paddleboards, and floated around an urban lake in the middle of the desert for no particular reason.

This year, more than 300 people will do it. They fly in for this. From across the country. To stand on a board, in a cloak, on a reclaimed lake in Tempe, Arizona, on a Saturday morning in October.

We have stopped trying to explain it.

## What it actually is

A few hundred witches, warlocks, and one or two extremely committed dogs, paddling Tempe Town Lake together in costume. Some people race. Most people drift, take photographs, and admire each other's hats. There is no winner. There is no prize. There is a lot of black tulle getting wet.

It's the rare Halloween event that isn't for children, isn't in a parking lot, and doesn't cost anything to attend.

## The details

**When:** Saturday, October 24, 2026. We gather at 10:00 AM.
**Where:** Tempe Town Lake Marina, 550 E. Tempe Town Lake, Tempe, AZ 85281. Launch from the marina — the City requires all watercraft to launch from designated facilities.
**Cost:** Free to join us. See the note on the City's lake permit below.
**Who:** Anyone. All ages, all abilities. You do not need to be an experienced paddler, and you will not be the least prepared person there.

## What to bring

**A board, kayak, or canoe.** Bring your own, or [reserve a rental from us](/locations/witches-regatta-tempe-town-lake#register) — we'll have it waiting at the marina, so you can arrive with nothing but a costume.

**A costume.** This is not optional in spirit, only in enforcement. Pointy hat minimum. People go extremely hard on this and you will feel underdressed in jeans.

**A Coast Guard-approved life jacket.** Required on board for every paddler. Anyone 12 or under must wear theirs the whole time. Our rentals come with one.

**A Tempe Town Lake boat permit.** This is the one thing that isn't free, and it's the City's requirement, not ours. Every watercraft on the lake needs one — $10 for a day pass, or $25 a year for Tempe residents and $50 for non-residents. Buy it before you arrive so you're not sorting it out on the ramp while 300 witches launch around you.

**Water, sunscreen, and shoes you don't mind soaking.** It is still Arizona in October.

## A few things worth knowing

Swimming in Town Lake isn't allowed, so plan to stay on your board. Paddle counter-clockwise, keep it wakeless, and give other boats a wide berth — the lake has real traffic and the rules aren't ours to bend.

If you have never stood on a paddleboard before, you can kneel or sit the entire time. Nobody will notice, and honestly, sitting is the better photograph.

## Register free

Registration is free and takes a minute. It helps us plan, and it's the only way we can tell you if the weather moves anything.

**[Register for the Witches Regatta →](/locations/witches-regatta-tempe-town-lake#register)**

Questions: sarah@desertpaddleboards.com or 602.456.0884.

## The rest of the year

The Regatta is the loud one. Most of what we do is the opposite.

Desert Paddleboards runs **Floating Soundbaths** across the Phoenix metro — you lie back on a paddleboard, dry and not paddling, while live musicians play crystal bowls, gongs, and Native American flute. Most people fall asleep. We trademarked it: the Floating Nap™.

We run them at JW Marriott Desert Ridge, Grand Hyatt Scottsdale, Westin Kierland, The Wigwam, and about thirty other places across Phoenix, Scottsdale, Tempe, and Sedona — plus paddleboard yoga, private events, and corporate wellness.

[See the full schedule →](/calendar)`,
  },
  {
    slug: "paddleboarding-the-salt-river",
    title: "Paddleboarding The Salt River",
    date: "2022-08-25",
    excerpt:
      "A stop-by-stop guide to paddleboarding Arizona's Salt River, covering each access point from Blue Point to Granite Reef, plus tips for shuttling two cars.",
    image:
      "/images/blog/paddleboarding-the-salt-river.webp",
    body: `#### Starting from the top

- **Water users:** Due to recent flooding, the very top is a dangerous area to start for beginners — there are Class Two rapids!
- **Blue Point Recreation Area:** We like to start here. The right side of the bridge has more parking; we start on the left because you don't have to walk as far (paddleboards and gear get heavy!). There's a great 3-mile hike along the river to Goldfield Ovens — look it up on AllTrails, it's great for out-of-town visitors.
- **Goldfield Ranch Recreational Area:** There will be a sign — EXIT HERE is for tubers; paddleboarders and kayakers can keep floating.
- **Coon Bluff Recreation Area:** People camp here in the winter, and you'll see lots of fishermen and photoshoots. The exit is difficult, so we just float by. If the river is high enough, stay right — it's like a jungle cruise. We saw a baby beaver!
- **Phon D Sutton Recreation Area:** It takes about 2.5 hours to paddle from the bridge to Phon D Sutton. This exit is tricky on weekends — people are everywhere. Exit here anyway, otherwise you're stuck another hour on the river. There's a hill to climb and you'll be back at your drop-off car.
- **Granite Reef (last stop before the dam):** You can paddle from Phon D Sutton to Granite Reef all year. You could also start at Granite Reef and paddle around if you only have one car. The parking lot is small; make sure you pull off the road or the sheriff will give you a ticket.

**Getting back to your car:** This is probably the most important thing to consider. If you park at the top and float down, plan how to get back.

- **Uber:** Not going to happen, sorry — cell service is spotty and it's unlikely one will come out to you.
- **Hitch a ride:** There's a good chance someone will lose or forget their keys, so you may need to rely on strangers.
- **Plan for 2 cars:** This is what you should plan for. Park one car at the end stop and one at the start. Keep your keys on your body or with the car!`,
  },
  {
    slug: "paddleboarding-with-dogs",
    title: "Paddleboarding with Dogs",
    date: "2023-02-21",
    excerpt:
      "A look at Desert Paddleboards' 'Pup on a Sup' private lesson at Tempe Town Lake, where dogs and owners learn paddleboarding basics together.",
    image:
      "/images/blog/paddleboarding-with-dogs.webp",
    body: `Get your pup out on a SUP! The ultimate adventure with your pup — a one-of-a-kind stand-up paddleboard lesson learning the basics, safety, and technique of the sport.

We meet at the boat ramp at Tempe Town Lake, where you'll be able to ease your dog into paddleboarding. A pawprint paddleboard is included in the rental price. We have some dog lifejackets but can't guarantee all sizes.

Private lessons with dog, paddleboard, and lifejackets — $75 a person.`,
  },
  {
    slug: "ladies-tahitian-adventure",
    title: "Ladies Tahitian Adventure",
    date: "2022-08-18",
    excerpt:
      "A guided luxury catamaran trip through the islands of French Polynesia led by Lois and Sarah — itinerary, inclusions, and water and land experiences.",
    image:
      "/images/blog/ladies-tahitian-adventure.webp",
    body: `Experience the Tahitian Islands with Lois and Sarah. Lois grew up in the islands of Tahiti and is fluent in several languages including French and Tahitian. Sarah and Lois take you on a once-in-a-lifetime luxury adventure through the islands of French Polynesia.

Every day is an adventure! We'll hike and explore, visit locals, and head out to sea.

**Islands — $3995 + airfare:** Tahiti (1 night), Huahine, Taha'a & Raiatea (4 days), Bora Bora (4 days).

The luxury catamaran is all-inclusive, and the islands are close together. Sleeping on a catamaran is literally an over-water bungalow! We'll sleep and eat on board, and during the day experience each island's unique qualities.

Water and juice are included; alcohol and specialty soft drinks are extra (available for purchase in advance or onboard). All meals and snacks on the ship are included — the level of food is awesome, a great combo of local, French, and Asian fusion, prepared by a Polynesian crew.

**Experiences:** sharks, rays, snorkeling coral gardens, a vanilla & pearl farm tour, an evening with locals on the boat with live music, a land tour of Huahine, whales, lagoon tours, a cooking class, a private motu, stargazing, paddleboarding, va'a, water aerobics in the sea, scuba, sunset yoga, and photography.

Need spare time to write or read? You can do that in Bora Bora, where we'll finish the trip relaxing.

**Optional add-ons (time allowing):** diving, hiking Bora Bora, over-water bungalow options, Tahitian massages, tattoos.`,
  },
  {
    slug: "tik-tok-famous",
    title: "TikTok Famous",
    date: "2022-08-18",
    excerpt:
      "The story behind the company's viral TikTok clip, filmed at its Mermaid Paddleboard Bootcamp class at Tempe Town Lake — plus a tip for going viral.",
    image: "/tiktok-famous.jpg",
    body: `Did you see our viral post on TikTok? It was at Mermaid Paddleboard Bootcamp! All ages and abilities come to this class.

We start out on paddleboard mats for 40 minutes doing surf-inspired exercises, yoga, and pilates. The second half of the class is in the Lazy River — we turn it on and do a bootcamp-style water aerobics class! It's the ideal mermaid/merman workout.

The TikTok video was a controversial clip on how you're supposed to enter the ocean when scuba diving. Tip: if you want more views on TikTok, get people arguing!`,
  },
];

/** Posts sorted newest-first. */
export const blogPosts: BlogPost[] = [...posts].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
