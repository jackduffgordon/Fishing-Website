import { useState } from "react";

// ============================================
// ENHANCED MOCK DATA
// ============================================

const fisheries = [
  {
    id: 1,
    name: "River Wye - Letton Beat",
    type: "game",
    waterType: "River Beat",
    location: "Herefordshire",
    region: "West Midlands",
    species: ["Atlantic Salmon", "Brown Trout", "Grayling"],
    price: 150,
    priceType: "per rod/day",
    rating: 4.9,
    reviews: 47,
    image: "linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)",
    gallery: [
      "linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)",
      "linear-gradient(135deg, #3d6a5a 0%, #2a4a40 100%)",
      "linear-gradient(135deg, #4d7a6a 0%, #3a5a50 100%)",
      "linear-gradient(135deg, #1d4a3a 0%, #0a2a20 100%)",
    ],
    bookingType: "enquiry",
    featured: true,
    // Enhanced details
    shortDescription: "One of the finest salmon beats on the Wye, offering 1.5 miles of double-bank fishing through stunning Welsh border countryside.",
    fullDescription: `The Letton Beat represents some of the most productive and picturesque salmon fishing the River Wye has to offer. Stretching for approximately 1.5 miles of double-bank fishing, this historic beat has been carefully managed for over a century to provide exceptional sport.

The water comprises a wonderful variety of pools, glides, and faster runs that fish well throughout the season. Notable lies include the Cathedral Pool - a deep, slow-moving stretch that holds fish in low water conditions - and the Ash Tree Run, where salmon rest before tackling the weir upstream.

Spring fishing (February to May) targets fresh-run springers, with fish averaging 12-15lbs and specimens to 25lbs taken each season. The autumn run (September to October) brings larger numbers of fish, with excellent sport on both fly and spinner.

The beat is managed by the Williams family, who have held the fishing rights for three generations. Their intimate knowledge of the water ensures guests are guided to the most productive spots for the prevailing conditions.`,
    season: {
      opens: "1st February",
      closes: "17th October",
      bestMonths: ["March", "April", "September", "October"],
      peakTime: "Autumn run typically peaks mid-September to early October"
    },
    expectations: {
      averageCatch: "2-3 salmon per rod over a 3-day visit during peak periods",
      recordFish: "28lb salmon (October 2019)",
      blankRate: "Approximately 30% of day rods during peak season"
    },
    terrain: {
      wading: "Essential - chest waders recommended",
      mobility: "Moderate fitness required. Some steep banks and uneven ground.",
      accessibility: "Not suitable for those with limited mobility"
    },
    methods: ["Fly fishing", "Spinning (conditions permitting)", "Worming (floodwater only)"],
    amenities: ["Fishing hut with wood burner", "Rod room", "Ghillie available (additional cost)", "Wading staff provided", "Private parking", "Lunch can be arranged"],
    rules: [
      "Barbless or de-barbed hooks only",
      "Catch & release mandatory for all salmon",
      "No fishing before 8am or after sunset",
      "Maximum 2 rods fishing at any time",
      "Dogs welcome but must be kept under control"
    ],
    equipment: {
      provided: ["Wading staff", "Landing net", "Priest (for trout)"],
      recommended: ["14-15ft double-handed rod (salmon)", "9-10ft single-handed rod (trout)", "Chest waders with wading boots", "Polarised sunglasses"]
    },
    accommodation: [
      { name: "The Riverside Inn", type: "B&B", distance: "0.5 miles", note: "Traditional pub with fishing-friendly rooms" },
      { name: "Letton Court", type: "Self-catering", distance: "On-site", note: "Exclusive cottage sleeping 6, available to fishing guests" },
      { name: "The Swan at Hay", type: "Hotel", distance: "8 miles", note: "Boutique hotel in nearby Hay-on-Wye" }
    ],
    contact: {
      name: "Edward Williams",
      role: "Beat Manager",
      phone: "01onal 123456",
      email: "fishing@lettonbeat.co.uk",
      responseTime: "Usually responds within 24 hours"
    },
    rods: 4,
    coordinates: { lat: 52.1234, lng: -3.0567 },
  },
  {
    id: 2,
    name: "Chew Valley Lake",
    type: "game",
    waterType: "Stillwater",
    location: "Somerset",
    region: "South West",
    species: ["Rainbow Trout", "Brown Trout"],
    price: 45,
    priceType: "day ticket",
    rating: 4.7,
    reviews: 124,
    image: "linear-gradient(135deg, #4a6fa5 0%, #2d4a6a 100%)",
    gallery: [
      "linear-gradient(135deg, #4a6fa5 0%, #2d4a6a 100%)",
      "linear-gradient(135deg, #5a7fb5 0%, #3d5a7a 100%)",
      "linear-gradient(135deg, #3a5f95 0%, #1d3a5a 100%)",
    ],
    bookingType: "instant",
    featured: true,
    shortDescription: "A prestigious 1,200-acre reservoir renowned for quality rainbow and brown trout with exceptional fly hatches.",
    fullDescription: `Chew Valley Lake is one of England's premier stillwater trout fisheries, set in 1,200 acres of stunning Somerset countryside. Since opening in 1956, it has earned a reputation for producing exceptional trout in beautiful surroundings.

The lake is stocked with top-quality rainbow trout averaging 2-3lbs, with a significant head of fish reaching 5lbs+. The brown trout population has grown substantially in recent years, with fish to 8lbs now a realistic prospect.

What sets Chew apart is the quality of its fly life. Prolific hatches of buzzers, sedges, and olives provide consistent dry fly and nymph fishing throughout the season. The famous "Chew buzzer" fishing in spring is legendary, while summer evenings offer spectacular sedge hatches.

Bank fishing is available around the entire perimeter, with particularly productive areas including Herriot's Bay, Stratford Bay, and the Dam Wall. Boat fishing allows access to deeper water and the opportunity to drift over the extensive weed beds that hold feeding fish.

The on-site lodge provides excellent facilities including tackle shop, restaurant, and fish cleaning area. The knowledgeable staff can advise on current tactics and productive areas.`,
    season: {
      opens: "Mid-March",
      closes: "End of October",
      bestMonths: ["April", "May", "September"],
      peakTime: "Buzzer fishing peaks April-May; sedge fishing best June-July evenings"
    },
    expectations: {
      averageCatch: "3-4 fish per rod on a typical day",
      recordFish: "Brown trout 11lb 8oz (2021)",
      blankRate: "Less than 10% of anglers blank"
    },
    terrain: {
      wading: "Not required - bank fishing from firm paths",
      mobility: "Good access throughout. Disabled platforms available.",
      accessibility: "Wheelchar accessible in main areas"
    },
    methods: ["Fly only", "Floating, intermediate, and sinking lines permitted", "Catch & release or catch & kill (within limits)"],
    amenities: ["Lodge with restaurant", "Tackle shop", "Boat hire (must book)", "Fish cleaning facilities", "Hot drinks available lakeside", "Toilets", "Ample parking"],
    rules: [
      "Fly only - no bait or lures",
      "4 fish bag limit",
      "Minimum take size 12 inches",
      "Barbless hooks required for catch & release",
      "No lead-core lines",
      "Boats must be back by 30 mins before dusk"
    ],
    equipment: {
      provided: ["Boat and oars (if hired)", "Life jackets", "Landing nets available"],
      recommended: ["9-10ft #6-7 rod", "Floating and intermediate lines", "Selection of buzzers, damsels, and sedge patterns"]
    },
    accommodation: [
      { name: "Chew Valley Hotel", type: "Hotel", distance: "2 miles", note: "Comfortable hotel with drying room" },
      { name: "Various B&Bs", type: "B&B", distance: "Local area", note: "Several fishing-friendly options in surrounding villages" }
    ],
    contact: {
      name: "Fishery Office",
      role: "Bookings",
      phone: "01275 332339",
      email: "info@chewvalleylake.co.uk",
      responseTime: "Bookings available online 24/7"
    },
    rods: 50,
    coordinates: { lat: 51.3456, lng: -2.6234 },
  },
  {
    id: 3,
    name: "Linear Fisheries - Manor Farm",
    type: "coarse",
    waterType: "Specimen Lake Complex",
    location: "Oxfordshire",
    region: "South East",
    species: ["Carp", "Tench", "Bream", "Pike", "Perch"],
    price: 25,
    priceType: "day ticket",
    rating: 4.8,
    reviews: 312,
    image: "linear-gradient(135deg, #5a7a4a 0%, #3a5a2a 100%)",
    gallery: [
      "linear-gradient(135deg, #5a7a4a 0%, #3a5a2a 100%)",
      "linear-gradient(135deg, #6a8a5a 0%, #4a6a3a 100%)",
      "linear-gradient(135deg, #4a6a3a 0%, #2a4a1a 100%)",
    ],
    bookingType: "instant",
    featured: false,
    shortDescription: "A well-established complex of specimen lakes known for big carp to 40lb+ in beautiful Oxfordshire countryside.",
    fullDescription: `Linear Fisheries at Manor Farm is one of the UK's most respected carp fishing venues, comprising multiple lakes offering varied challenges for specimen hunters of all abilities.

The complex includes St Johns (the flagship water with carp to 45lb), Hardwick Lake (prolific fishing with 30lb+ fish), Manor Farm Lake (ideal for those seeking their first 20), and several other waters catering to different skill levels.

The fishery is known for its well-maintained banks, excellent facilities, and friendly atmosphere. Fish welfare is paramount - all anglers must use unhooking mats, and nets/slings are provided if you don't have your own.

Night fishing is available on designated lakes (advance booking essential), and the on-site tackle shop stocks everything you might need. The café serves hot food throughout the day.`,
    season: {
      opens: "Year-round",
      closes: "N/A",
      bestMonths: ["May", "June", "September", "October"],
      peakTime: "Dawn and dusk sessions most productive"
    },
    expectations: {
      averageCatch: "2-5 carp per session depending on lake choice",
      recordFish: "St Johns - 45lb 8oz mirror carp",
      blankRate: "Rare on stock lakes, more challenging on specimen waters"
    },
    terrain: {
      wading: "Not required",
      mobility: "Flat, well-maintained swims",
      accessibility: "Disabled-friendly swims available"
    },
    methods: ["All legal coarse methods", "Boilies, pellets, particles permitted", "No floating baits (except surface fishing lakes)", "Night fishing by arrangement"],
    amenities: ["On-site tackle shop", "Café serving hot food", "Showers", "Toilets", "Fish care equipment provided", "Ample parking", "Bivvy-friendly swims"],
    rules: [
      "Unhooking mats mandatory",
      "No fixed/lead-clip rigs",
      "Barbless hooks only",
      "No braided mainline",
      "No keepnets",
      "Carp care kit must be used"
    ],
    equipment: {
      provided: ["Landing nets", "Unhooking mats", "Weigh slings", "Antiseptic spray"],
      recommended: ["12ft 2.75-3lb TC rods", "Baitrunner reels", "40lb braid hooklinks", "Quality bite alarms"]
    },
    accommodation: [
      { name: "Bivvy on bank", type: "Camping", distance: "On-swim", note: "Night fishing available - book in advance" },
      { name: "The Plough Inn", type: "Pub B&B", distance: "1 mile", note: "Traditional pub with rooms" }
    ],
    contact: {
      name: "Fishery Office",
      role: "Bookings",
      phone: "01onal 789012",
      email: "info@linearfisheries.co.uk",
      responseTime: "Online booking available"
    },
    rods: 30,
    coordinates: { lat: 51.8234, lng: -1.2567 },
  },
  {
    id: 4,
    name: "River Tweed - Junction Beat",
    type: "game",
    waterType: "River Beat",
    location: "Scottish Borders",
    region: "Scotland",
    species: ["Atlantic Salmon", "Sea Trout", "Brown Trout"],
    price: 350,
    priceType: "per rod/day",
    rating: 5.0,
    reviews: 28,
    image: "linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)",
    gallery: [
      "linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)",
      "linear-gradient(135deg, #4a6a7a 0%, #2a4a5a 100%)",
      "linear-gradient(135deg, #2a4a5a 0%, #0a2a3a 100%)",
    ],
    bookingType: "enquiry",
    featured: true,
    shortDescription: "The legendary Junction Pool where the Teviot meets the Tweed - arguably the most famous salmon lie in Scotland.",
    fullDescription: `The Junction Beat encompasses one of the most storied salmon lies in the world - the Junction Pool, where the River Teviot meets the mighty Tweed. This is bucket-list fishing for serious salmon anglers.

Generations of fishermen have stood in these waters, and the pool has produced countless memorable fish. The Junction Pool itself is a classic salmon lie - a deep, swirling confluence where fish rest and gather before continuing their upstream migration.

The beat offers approximately 0.75 miles of fishing, including the Junction Pool, Pot Pool, and several productive glides. While compact, every yard of water has potential. An experienced ghillie is included and their knowledge is invaluable - they know exactly where fish lie in different water heights and how to approach each pool.

Fishing is fly-only, with Spey casting the order of the day. The ghillie can assist with casting instruction if needed. Expect to fish hard - this is not easy fishing, but when a Tweed salmon takes, it's an experience like no other.`,
    season: {
      opens: "1st February",
      closes: "30th November",
      bestMonths: ["October", "November"],
      peakTime: "Back-end fishing (Oct-Nov) offers best chance of multiple fish"
    },
    expectations: {
      averageCatch: "Not a numbers water - quality over quantity",
      recordFish: "Multiple 30lb+ fish recorded",
      blankRate: "This is challenging fishing - blanks are common but the prize is worth it"
    },
    terrain: {
      wading: "Essential - experienced wading required in places",
      mobility: "Good fitness needed. Some challenging wading.",
      accessibility: "Not suitable for beginners or those with mobility issues"
    },
    methods: ["Fly only", "Double-handed rods 13-15ft recommended", "Sink tips for deeper lies"],
    amenities: ["Experienced ghillie included", "Fishing hut with heating", "Lunch provided", "Waders available if required", "Private parking"],
    rules: [
      "Fly only - no exceptions",
      "Catch & release mandatory",
      "Ghillie's guidance must be followed",
      "Maximum 2 rods on beat",
      "No fishing from boats"
    ],
    equipment: {
      provided: ["Ghillie expertise", "Lunch", "Hot drinks", "Waders (if needed)"],
      recommended: ["14-15ft #9-10 Spey rod", "Range of sink tips", "Selection of traditional patterns (Cascade, Park Shrimp, etc.)"]
    },
    accommodation: [
      { name: "Ednam House Hotel", type: "Country House Hotel", distance: "3 miles (Kelso)", note: "Historic fishing hotel with excellent dining" },
      { name: "The Roxburghe Hotel", type: "Luxury Hotel", distance: "5 miles", note: "5-star country estate" }
    ],
    contact: {
      name: "Alastair MacKenzie",
      role: "Head Ghillie",
      phone: "01onal 345678",
      email: "fishing@junctionbeat.com",
      responseTime: "Usually responds within 48 hours"
    },
    rods: 2,
    coordinates: { lat: 55.5234, lng: -2.4567 },
  },
  {
    id: 5,
    name: "River Test - Broadlands Estate",
    type: "game",
    waterType: "Chalk Stream",
    location: "Hampshire",
    region: "South",
    species: ["Wild Brown Trout", "Rainbow Trout", "Grayling"],
    price: 295,
    priceType: "per rod/day",
    rating: 4.9,
    reviews: 52,
    image: "linear-gradient(135deg, #3a6a5a 0%, #1a4a3a 100%)",
    gallery: [
      "linear-gradient(135deg, #3a6a5a 0%, #1a4a3a 100%)",
      "linear-gradient(135deg, #4a7a6a 0%, #2a5a4a 100%)",
      "linear-gradient(135deg, #2a5a4a 0%, #0a3a2a 100%)",
    ],
    bookingType: "enquiry",
    featured: true,
    shortDescription: "Premium chalk stream fishing on one of England's most celebrated rivers. Crystal-clear water and educated wild brown trout.",
    fullDescription: `The Broadlands Estate offers some of the finest chalk stream trout fishing in the world. The River Test here flows crystal-clear through ancient water meadows, providing the quintessential English fly fishing experience.

This is technical fishing at its finest. The gin-clear water reveals every detail of the riverbed - and every mistake to the fish. Wild brown trout here are notoriously selective, often requiring precise imitation of whatever is hatching. The challenge is what makes success so rewarding.

The estate maintains a thoughtful stocking policy that supplements wild fish with carefully selected browns and rainbows. The result is consistent fishing without compromising the wild character of the river.

A river keeper is included with your day, and their expertise is invaluable. They'll help identify feeding fish, suggest appropriate flies, and ensure you make the most of your time. Lunch is served in the fishing hut overlooking the water.

This is proper chalk stream fishing - dry fly and upstream nymph only. If you've dreamed of fishing the Test, this is the opportunity.`,
    season: {
      opens: "1st May",
      closes: "15th October",
      bestMonths: ["May", "June", "September"],
      peakTime: "Mayfly fortnight (late May/early June) is exceptional"
    },
    expectations: {
      averageCatch: "4-6 fish in a day is good fishing",
      recordFish: "Wild brown to 6lb taken occasionally",
      blankRate: "Rare - the keeper will find you fish"
    },
    terrain: {
      wading: "Limited - most fishing from bank",
      mobility: "Mostly flat water meadows with good paths",
      accessibility: "Accessible for most abilities"
    },
    methods: ["Dry fly and upstream nymph only", "No downstream fishing", "Single fly only"],
    amenities: ["River keeper included", "Fishing hut", "Lunch included", "Rod room", "Private parking", "Historic estate grounds"],
    rules: [
      "Dry fly and upstream nymph only",
      "No downstream fishing",
      "Catch & release for wild fish",
      "Barbless/de-barbed hooks",
      "No wading without keeper permission"
    ],
    equipment: {
      provided: ["Landing net", "Priest", "Lunch", "Tea/coffee"],
      recommended: ["8-9ft #4-5 rod", "Long fine leaders (12ft+)", "Selection of dries and emergers", "Polarised glasses essential"]
    },
    accommodation: [
      { name: "The Grosvenor Hotel", type: "Hotel", distance: "Stockbridge (2 miles)", note: "Classic fishing hotel" },
      { name: "The Greyhound", type: "Inn", distance: "1 mile", note: "Cosy pub with rooms" }
    ],
    contact: {
      name: "James Portman",
      role: "Estate Manager",
      phone: "01794 123456",
      email: "fishing@broadlands-estate.co.uk",
      responseTime: "Usually responds within 24 hours"
    },
    rods: 4,
    coordinates: { lat: 50.9876, lng: -1.5234 },
  },
];

const instructors = [
  {
    id: 1,
    name: "James MacPherson",
    title: "AAPGAI Master Instructor",
    specialties: ["Atlantic Salmon", "Spey Casting", "Double-Handed Techniques", "Scottish Rivers"],
    location: "Scottish Highlands",
    price: 275,
    priceType: "full day",
    rating: 5.0,
    reviews: 67,
    image: "linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)",
    bio: "With over 30 years guiding on Scotland's finest salmon rivers, James is one of the UK's most respected Spey casting instructors.",
    fullBio: `James MacPherson has dedicated his life to the pursuit of Atlantic salmon and the art of Spey casting. Born and raised on the banks of the River Spey, he began fishing almost before he could walk, learning from his father and grandfather - both ghillies on the Rothes waters.

After qualifying as an AAPGAI Master Instructor in 1998, James has taught thousands of anglers from complete beginners to seasoned fishers looking to refine their technique. His patient, methodical approach has earned him a reputation as one of the finest casting instructors in the UK.

James has guided on virtually every significant salmon river in Scotland, from the Tweed to the Helmsdale, and spent three seasons as head ghillie on a prestigious Spey beat. This real-world fishing experience informs his teaching - he doesn't just teach casting, he teaches fishing.

A regular contributor to Trout & Salmon magazine and speaker at game fairs, James combines technical expertise with genuine warmth and humour. His courses are challenging but never intimidating.`,
    teachingPhilosophy: "I believe everyone can learn to Spey cast well - it's not about strength or natural talent, it's about understanding the mechanics. My job is to break down the cast into simple, achievable steps and build your confidence through practice. We work at your pace, focusing on what you need rather than following a rigid curriculum.",
    typicalDay: `A typical day with James begins at 9am, meeting at the fishing hut or hotel. After a coffee and chat about your experience and goals, you'll head to the water.

Morning sessions focus on the fundamentals - stance, grip, and the basic roll cast. James uses video analysis to help you see what's happening and identify areas for improvement.

After a riverside lunch (included), afternoon sessions progress to more advanced casts - the single Spey, double Spey, and snake roll. Conditions permitting, you'll spend the last couple of hours actually fishing, putting your new skills into practice.

The day typically ends around 5pm, though James is flexible if fish are showing!`,
    whatYouLearn: [
      "Proper Spey casting mechanics and timing",
      "Roll cast, single Spey, double Spey, snake roll",
      "Line management and shooting technique",
      "Reading water and fish lies",
      "Fly selection for Scottish rivers",
      "Salmon fishing tactics and approach"
    ],
    equipmentProvided: ["14ft and 15ft Spey rods", "Quality reels and lines", "Selection of flies", "Waders and boots (if needed)"],
    equipmentBring: ["Warm, waterproof clothing", "Polarised sunglasses", "Personal medication if required"],
    certifications: ["AAPGAI Master Instructor", "SGAIC Full Member", "First Aid Certified", "Ghillie's License"],
    website: "www.speymasterclasses.co.uk",
    social: {
      instagram: "@james_macpherson_spey",
      youtube: "Spey Casting with James MacPherson",
      facebook: "James MacPherson - Spey Casting"
    },
    testimonials: [
      { name: "Robert T.", date: "October 2025", text: "James transformed my casting in a single day. His patience and clear explanations made complicated techniques suddenly click. Can't recommend highly enough." },
      { name: "Sarah M.", date: "September 2025", text: "I was nervous as a complete beginner, but James put me at ease immediately. By lunchtime I was casting further than I ever imagined. Brilliant instructor." },
      { name: "David H.", date: "August 2025", text: "After 20 years of salmon fishing I thought I knew it all. James showed me how much I was leaving on the table. My casting is now effortless." }
    ],
    availability: "March - November. Book well in advance for peak salmon months (September-November).",
    cancellation: "Full refund if cancelled 14+ days in advance. 50% refund 7-14 days. No refund within 7 days.",
  },
  {
    id: 2,
    name: "Sarah Thornton",
    title: "GAIA Advanced Instructor",
    specialties: ["Trout Fishing", "Stillwater Tactics", "Beginners Welcome", "Women's Courses"],
    location: "Derbyshire",
    price: 175,
    priceType: "full day",
    rating: 4.9,
    reviews: 89,
    image: "linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)",
    bio: "Sarah's patient, encouraging approach has introduced hundreds of newcomers to fly fishing. Specialist in stillwater tactics and women's courses.",
    fullBio: `Sarah Thornton discovered fly fishing at 25 and hasn't looked back since. What started as a chance introduction on a corporate fishing day became an all-consuming passion that led her to leave a career in marketing to pursue guiding and instruction full-time.

As a late starter herself, Sarah brings unique empathy to teaching beginners. She remembers exactly what it's like to feel intimidated by the apparent complexity of fly fishing, and has developed techniques to make learning accessible and enjoyable.

Based at several Derbyshire stillwaters, Sarah specialises in trout fishing from the bank and boat. Her stillwater tactics courses are particularly popular, covering everything from reading the water to advanced nymphing techniques.

Sarah is also passionate about encouraging more women into the sport. Her women-only courses provide a supportive environment where beginners can learn without feeling self-conscious. Many of her students have gone on to become accomplished anglers.`,
    teachingPhilosophy: "Fly fishing should be fun from day one. I structure my courses so you're catching fish quickly - there's no better confidence builder than a bent rod! We work on technique throughout, but always in the context of actually fishing. My goal is for you to leave with skills you can use independently.",
    typicalDay: `We meet at 9:30am at the fishery (I'll send detailed directions when you book). After introductions and a briefing on safety and fishery rules, we start with the basics - how to set up your rod, tie essential knots, and the fundamental casting stroke.

By mid-morning, you'll be casting to rising fish. I stay close by to offer guidance and help land your first fish. Lunch (bring your own or fishery café) provides a chance to discuss what we've learned.

Afternoon sessions introduce more advanced techniques based on conditions - perhaps dry fly fishing if there's a hatch, or indicator nymphing if fish are deeper. We finish around 4:30pm.

You'll leave with a summary sheet of what we covered and recommended next steps for your fishing journey.`,
    whatYouLearn: [
      "Casting fundamentals - overhead, roll cast",
      "Tackle setup and essential knots",
      "Reading stillwater - finding fish",
      "Fly selection basics",
      "Retrieve techniques",
      "Playing and landing fish safely"
    ],
    equipmentProvided: ["Complete rod and reel setup", "Flies for the day", "Leaders and tippet", "Landing net"],
    equipmentBring: ["Warm layers (it can be cold by the water)", "Waterproof jacket", "Comfortable walking shoes or wellies", "Sunglasses", "Lunch or money for café"],
    certifications: ["GAIA Advanced Instructor", "Angling Trust Level 2 Coach", "DBS Checked", "First Aid Certified"],
    website: "www.sarahthorntonflyfishing.co.uk",
    social: {
      instagram: "@sarah_troutfly",
      facebook: "Sarah Thornton Fly Fishing Instruction"
    },
    testimonials: [
      { name: "Jennifer K.", date: "September 2025", text: "As a complete beginner, I was worried I'd feel out of my depth. Sarah made everything so approachable and I caught 4 trout! Already booked my next session." },
      { name: "Michael P.", date: "August 2025", text: "Bought my wife a lesson as a birthday gift. Sarah was wonderful - patient and encouraging. My wife is now hooked (pun intended) and wants her own rod!" },
      { name: "Amanda R.", date: "July 2025", text: "The women's course was perfect. No pressure, great camaraderie with the other ladies, and Sarah's teaching is first class. Highly recommend." }
    ],
    availability: "Year-round. Women's courses run monthly April-October.",
    cancellation: "Full refund if cancelled 7+ days in advance. Credit note offered for shorter notice.",
  },
  {
    id: 3,
    name: "Tom Ashworth",
    title: "Specialist Carp Coach",
    specialties: ["Carp Fishing", "Rig Mechanics", "Watercraft", "Big Fish Tactics"],
    location: "Cambridgeshire",
    price: 150,
    priceType: "full day",
    rating: 4.8,
    reviews: 134,
    image: "linear-gradient(135deg, #6a6a5a 0%, #4a4a3a 100%)",
    bio: "Former match angler turned specimen hunter. Tom has landed carp to 52lb and helped hundreds of anglers catch their personal bests.",
    fullBio: `Tom Ashworth's fishing journey began in match fishing, where he competed at county level before the allure of big carp proved irresistible. For the past 15 years, he's dedicated himself to specimen carp fishing, banking fish to 52lb from some of the country's most challenging waters.

But Tom's real passion is sharing knowledge. He's found that many carp anglers plateau because they're fishing with outdated tactics or flawed rigs. His coaching sessions cut through the confusion, focusing on what actually works in modern carp fishing.

Tom's approach is practical and no-nonsense. He's not interested in selling you the latest gear - he's interested in helping you catch bigger fish with what you've got. Sessions cover everything from rig mechanics to watercraft, bait application to playing big fish.

Based in Cambridgeshire, Tom teaches at venues ranging from easy day-ticket waters (ideal for beginners) to challenging estate lakes. He tailors each session to your experience level and goals.`,
    teachingPhilosophy: "Carp fishing is 70% location, 20% presentation, 10% luck. Most anglers focus on the wrong 10%. My sessions concentrate on the skills that actually make a difference - reading the water, understanding fish behaviour, and presenting a rig that'll fool them. Get these right and the catches follow.",
    typicalDay: `We meet at the lake at first light (timing varies by season - early starts in summer!). After a walk round the lake discussing what to look for, we'll choose your swim based on current fish activity.

Morning sessions focus on setup - I'll go through your gear, suggest any improvements, and we'll tie rigs together so you understand exactly how they work. Then it's time to get baited up and fishing.

While we wait for action (this is carp fishing after all!), we discuss watercraft, bait strategies, and tackle. If we get a take, I'll guide you through the fight - big carp require calm, confident handling.

The session runs until mid-afternoon, or longer if fish are feeding. You'll leave with improved rigs, better understanding of location, and hopefully some good fish photos!`,
    whatYouLearn: [
      "Reading the water - finding carp",
      "Rig construction - what works and why",
      "Bait application strategies",
      "Casting accuracy and distance",
      "Playing and landing big fish",
      "Fish care and safe handling"
    ],
    equipmentProvided: ["Rig components for the session", "Terminal tackle", "Bait for the day", "Weigh equipment and photography gear"],
    equipmentBring: ["Your own rods and reels (I'll assess and advise)", "Unhooking mat", "Warm clothing", "Food and drinks for the day"],
    certifications: ["Angling Trust Level 2 Coach", "DBS Checked", "First Aid Certified"],
    website: "www.tomashworthcarp.co.uk",
    social: {
      instagram: "@tom_ashworth_carp",
      youtube: "Tom Ashworth Carp Fishing",
      facebook: "Tom Ashworth Carping"
    },
    testimonials: [
      { name: "Steve J.", date: "October 2025", text: "Tom completely changed how I approach a water. Within a month of our session, I'd caught three new PBs. His rig advice alone was worth the price." },
      { name: "Chris M.", date: "September 2025", text: "As an experienced angler, I was skeptical about coaching. Tom proved me wrong - he spotted flaws in my approach I'd never noticed. Brilliant day." },
      { name: "Paul D.", date: "August 2025", text: "Tom's patience with a beginner like me was incredible. Caught my first ever carp - 18lb! The photos are now framed on my wall." }
    ],
    availability: "Year-round. Night sessions available by arrangement.",
    cancellation: "Full refund if cancelled 7+ days in advance.",
  },
  {
    id: 4,
    name: "Emily Ward",
    title: "Wild Trout Specialist",
    specialties: ["Wild Brown Trout", "Small Streams", "Dry Fly", "Tenkara"],
    location: "Devon",
    price: 195,
    priceType: "full day",
    rating: 4.9,
    reviews: 56,
    image: "linear-gradient(135deg, #5a7a6a 0%, #3a5a4a 100%)",
    bio: "Passionate about wild trout and the small streams of the West Country. Emily teaches traditional and Japanese techniques.",
    fullBio: `Emily Ward fell in love with the small streams of Devon as a child, watching her grandmother fish the moorland becks with a simple rod and dry fly. That early education instilled a lifelong passion for wild trout fishing in intimate settings.

After training as a wildlife ecologist, Emily combined her scientific background with her fishing knowledge to become one of the South West's most respected wild trout guides. She holds permits on miles of rarely-fished Devon streams, offering her clients access to genuine wild trout in stunning, unspoilt settings.

Emily is also a passionate advocate for tenkara - the Japanese fixed-line technique that's perfectly suited to small stream fishing. Her tenkara courses have introduced many Western anglers to this elegant, minimalist approach.

A trustee of the Wild Trout Trust, Emily combines fishing instruction with stream conservation, helping clients understand the fragile ecosystems that support wild trout populations.`,
    teachingPhilosophy: "Small stream fishing is about so much more than catching fish. It's about slowing down, reading the water, understanding the ecosystem, and becoming part of the landscape. I teach a thoughtful, stealthy approach that produces consistent catches while respecting these precious wild places.",
    typicalDay: `We meet at 10am (wild trout fishing improves as the day warms). After a brief introduction, we walk to the stream - often a 15-20 minute hike through beautiful Devon countryside.

The morning focuses on approach and presentation. Wild trout in clear, shallow water are incredibly spooky - I'll teach you how to move stealthily, spot fish, and present a fly without alarming them.

We break for a streamside lunch (provided) in a stunning moorland setting. Afternoon sessions often see the best fishing as fly hatches improve.

For tenkara courses, I provide all equipment and focus on the unique techniques of fixed-line fishing. It's wonderfully simple once you grasp the basics.

We typically finish around 5pm, earlier if weather turns. Days are weather-dependent - wild moorland streams require decent conditions.`,
    whatYouLearn: [
      "Stealth and approach for wild fish",
      "Reading small streams - lies and feeding lanes",
      "Accurate short-range casting",
      "Dry fly selection for wild trout",
      "Tenkara techniques (if requested)",
      "Stream ecology and conservation"
    ],
    equipmentProvided: ["Short 7ft fly rod (or tenkara rod)", "Complete tackle setup", "Fly selection", "Streamside lunch", "Hot drinks"],
    equipmentBring: ["Waders or waterproof boots (stream is wadeable)", "Layered clothing for changeable moorland weather", "Waterproof jacket", "Polarised sunglasses", "Camera for the scenery!"],
    certifications: ["GAIA Level 2 Instructor", "Wild Trout Trust Accredited Guide", "British Tenkara Ambassador", "First Aid Certified", "DBS Checked"],
    website: "www.devonwildtrout.co.uk",
    social: {
      instagram: "@emily_wild_trout",
      facebook: "Devon Wild Trout with Emily Ward"
    },
    testimonials: [
      { name: "Jonathan R.", date: "September 2025", text: "A magical day on a Devon beck I never knew existed. Emily's knowledge of both fishing and ecology is remarkable. Caught half a dozen stunning wild brownies." },
      { name: "Patricia L.", date: "August 2025", text: "The tenkara course was a revelation. So simple, so effective. Emily is a patient teacher and the stream was breathtakingly beautiful." },
      { name: "Mark T.", date: "July 2025", text: "This is what fly fishing should be about - wild fish in wild places with a knowledgeable guide. Emily showed me spots I'd never find alone. Highly recommended." }
    ],
    availability: "April - October. Weather dependent - moorland streams require reasonable conditions.",
    cancellation: "Full refund or reschedule if weather forces cancellation. 7 days notice required for refund.",
  },
];

const fishingTypes = ["All Types", "Game Fishing", "Coarse Fishing", "Sea Fishing"];
const regions = ["All Regions", "Scotland", "North", "West Midlands", "South West", "South", "South East"];
const waterTypes = ["All Waters", "River Beat", "Stillwater", "Chalk Stream", "Specimen Lake Complex", "Charter Boat"];

// ============================================
// ICONS
// ============================================

const Icons = {
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Fish: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12c-2 0-4-2-8-2s-6 2-8 2c0-3 2-6 4-7 2 1 4 1 4 1s2 0 4-1c2 1 4 4 4 7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12c0 3 2 6 4 7 2-1 4-1 4-1s2 0 4 1c2-1 4-4 4-7" /><circle cx="17" cy="11" r="1" fill="currentColor" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Award: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Phone: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Globe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Quote: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>,
  Mountain: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15l5-7 4 4 5-6 4 5M3 15h18v4H3v-4z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Users: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Bed: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
};

// ============================================
// NAVIGATION
// ============================================

const Nav = ({ currentTab, setCurrentTab, setCurrentPage }) => (
  <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between h-16">
        <button onClick={() => { setCurrentPage('home'); setCurrentTab('waters'); }} className="flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition">
          <Icons.Fish />
          <span className="text-xl font-semibold tracking-tight">TightLines</span>
        </button>
        <div className="flex items-center space-x-1">
          <button onClick={() => { setCurrentPage('home'); setCurrentTab('waters'); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'waters' ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'}`}>
            Find Waters
          </button>
          <button onClick={() => { setCurrentPage('instructors'); setCurrentTab('instructors'); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'instructors' ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'}`}>
            Instructors
          </button>
          <div className="w-px h-6 bg-stone-200 mx-2"></div>
          <button className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900">List Your Water</button>
          <button className="ml-2 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition">Sign In</button>
        </div>
      </div>
    </div>
  </nav>
);

// ============================================
// CARDS
// ============================================

const FisheryCard = ({ fishery, onClick }) => {
  const typeColors = { game: 'bg-blue-50 text-blue-700 border-blue-200', coarse: 'bg-green-50 text-green-700 border-green-200', sea: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all duration-200 cursor-pointer group">
      <div className="h-44 relative" style={{ background: fishery.image }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[fishery.type]}`}>
            {fishery.type === 'game' ? 'Game Fishing' : fishery.type === 'coarse' ? 'Coarse' : 'Sea'}
          </span>
        </div>
        {fishery.bookingType === 'instant' && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500 text-white">Instant Book</span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-white/90 text-sm font-medium">{fishery.waterType}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-stone-900 group-hover:text-teal-700 transition mb-1">{fishery.name}</h3>
        <div className="flex items-center text-sm text-stone-500 mb-3">
          <Icons.MapPin />
          <span className="ml-1">{fishery.location}, {fishery.region}</span>
        </div>
        <p className="text-stone-600 text-sm mb-4 line-clamp-2">{fishery.shortDescription}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {fishery.species.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full">{s}</span>
          ))}
          {fishery.species.length > 3 && <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">+{fishery.species.length - 3}</span>}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <Icons.Star />
            <span className="font-medium text-stone-800">{fishery.rating}</span>
            <span className="text-stone-400 text-sm">({fishery.reviews} reviews)</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-stone-900">£{fishery.price}</span>
            <span className="text-stone-500 text-sm ml-1">/{fishery.priceType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstructorCard = ({ instructor, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
    <div className="flex">
      <div className="w-36 h-48 flex-shrink-0" style={{ background: instructor.image }}></div>
      <div className="flex-1 p-5">
        <h3 className="font-semibold text-lg text-stone-900 group-hover:text-teal-700 transition">{instructor.name}</h3>
        <p className="text-teal-600 text-sm mb-2">{instructor.title}</p>
        <div className="flex items-center text-sm text-stone-500 mb-3">
          <Icons.MapPin />
          <span className="ml-1">{instructor.location}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {instructor.specialties.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full">{s}</span>
          ))}
        </div>
        <p className="text-stone-600 text-sm mb-4 line-clamp-2">{instructor.bio}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Icons.Star />
            <span className="font-medium">{instructor.rating}</span>
            <span className="text-stone-400 text-sm">({instructor.reviews})</span>
          </div>
          <div>
            <span className="text-xl font-bold text-stone-900">£{instructor.price}</span>
            <span className="text-stone-500 text-sm">/{instructor.priceType}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// HOMEPAGE
// ============================================

const HomePage = ({ onSearch, onSelectFishery }) => {
  const featured = fisheries.filter(f => f.featured);
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Book Exceptional Fishing<br/>Across the UK</h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">From intimate chalk streams to legendary salmon beats. Discover, book, and fish the finest waters Britain has to offer.</p>
          </div>
          <div className="bg-white rounded-2xl p-4 max-w-3xl mx-auto shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-stone-500 mb-1 block">Location</label>
                <input type="text" placeholder="River, region, or fishery..." className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800" />
              </div>
              <div className="md:w-40">
                <label className="text-xs font-medium text-stone-500 mb-1 block">Date</label>
                <input type="date" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-600" />
              </div>
              <div className="md:w-44">
                <label className="text-xs font-medium text-stone-500 mb-1 block">Type</label>
                <select className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-600 bg-white">
                  {fishingTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={onSearch} className="w-full md:w-auto px-6 py-2.5 bg-teal-700 text-white rounded-xl font-medium hover:bg-teal-800 transition flex items-center justify-center gap-2">
                  <Icons.Search /><span>Search</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["Salmon Beats", "Chalk Streams", "Stillwater Trout", "Carp Fisheries", "Sea Charters"].map(tag => (
              <span key={tag} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm cursor-pointer transition">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Featured Waters</h2>
              <p className="text-stone-600 mt-1">Hand-picked fisheries offering exceptional sport</p>
            </div>
            <button onClick={onSearch} className="text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1">
              View all waters <Icons.ChevronRight />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(f => <FisheryCard key={f.id} fishery={f} onClick={() => onSelectFishery(f)} />)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">How TightLines Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Icons.Search />, title: "Discover", desc: "Search hundreds of waters by location, species, or fishing style. Read detailed descriptions and reviews." },
              { icon: <Icons.Calendar />, title: "Book", desc: "Book day tickets instantly or send enquiries for premium beats. Secure your spot in minutes." },
              { icon: <Icons.Fish />, title: "Fish", desc: "Receive confirmation with directions and rules. Arrive prepared and enjoy your day. Tight lines!" }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-700">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-stone-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white mb-4">
            <Icons.Fish />
            <span className="text-xl font-semibold">TightLines</span>
          </div>
          <p className="mb-6">The UK's premier fishing booking platform</p>
          <p className="text-sm">© 2026 TightLines. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// SEARCH RESULTS
// ============================================

const SearchResultsPage = ({ onSelectFishery, onBack }) => {
  const [selectedType, setSelectedType] = useState('All Types');
  const filtered = fisheries.filter(f => {
    if (selectedType === 'All Types') return true;
    const map = { 'Game Fishing': 'game', 'Coarse Fishing': 'coarse', 'Sea Fishing': 'sea' };
    return f.type === map[selectedType];
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Location..." className="flex-1 min-w-[200px] px-4 py-2.5 border border-stone-200 rounded-xl" />
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="px-4 py-2.5 border border-stone-200 rounded-xl bg-white">
            {fishingTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <button className="px-5 py-2.5 bg-teal-700 text-white rounded-xl"><Icons.Search /></button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-stone-500 hover:text-teal-700 mb-6 flex items-center gap-1"><Icons.ChevronLeft /> Back to home</button>
        <h2 className="text-xl font-bold mb-6">{filtered.length} waters found</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(f => <FisheryCard key={f.id} fishery={f} onClick={() => onSelectFishery(f)} />)}
        </div>
      </div>
    </div>
  );
};

// ============================================
// VENUE DETAIL (ENHANCED)
// ============================================

const VenueDetailPage = ({ fishery, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Fishing Details' },
    { id: 'facilities', label: 'Facilities & Rules' },
    { id: 'accommodation', label: 'Accommodation' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Gallery */}
      <div className="bg-stone-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-stone-400 hover:text-white mb-4 flex items-center gap-1"><Icons.ChevronLeft /> Back</button>
        </div>
        <div className="h-72 md:h-96 relative" style={{ background: fishery.gallery[selectedImage] }}>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-0 right-0">
            <div className="max-w-6xl mx-auto px-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{fishery.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-1"><Icons.MapPin /> {fishery.location}, {fishery.region}</span>
                <span className="flex items-center gap-1"><Icons.Star /> {fishery.rating} ({fishery.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        {/* Thumbnails */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {fishery.gallery.map((img, i) => (
            <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-14 rounded-lg flex-shrink-0 border-2 transition ${selectedImage === i ? 'border-teal-500' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ background: img }}></button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">About This Water</h2>
                  <div className="prose prose-stone max-w-none">
                    {fishery.fullDescription.split('\n\n').map((para, i) => (
                      <p key={i} className="text-stone-600 mb-4 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Species</h2>
                  <div className="flex flex-wrap gap-2">
                    {fishery.species.map(s => (
                      <span key={s} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                {fishery.contact && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-semibold mb-4">Contact</h2>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
                        <Icons.Users />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{fishery.contact.name}</p>
                        <p className="text-stone-500 text-sm mb-2">{fishery.contact.role}</p>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2 text-stone-600"><Icons.Phone /> {fishery.contact.phone}</p>
                          <p className="flex items-center gap-2 text-stone-600"><Icons.Mail /> {fishery.contact.email}</p>
                        </div>
                        <p className="text-stone-400 text-sm mt-2">{fishery.contact.responseTime}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {fishery.season && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Icons.Calendar /> Season</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-stone-500 text-sm">Season Dates</p>
                        <p className="font-medium">{fishery.season.opens} - {fishery.season.closes}</p>
                      </div>
                      <div>
                        <p className="text-stone-500 text-sm">Best Months</p>
                        <p className="font-medium">{fishery.season.bestMonths.join(', ')}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-stone-500 text-sm">Peak Time</p>
                        <p className="font-medium">{fishery.season.peakTime}</p>
                      </div>
                    </div>
                  </div>
                )}

                {fishery.expectations && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-semibold mb-4">What to Expect</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-stone-50 rounded-xl p-4">
                        <p className="text-stone-500 text-sm">Average Catch</p>
                        <p className="font-medium text-stone-900">{fishery.expectations.averageCatch}</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <p className="text-stone-500 text-sm">Record Fish</p>
                        <p className="font-medium text-stone-900">{fishery.expectations.recordFish}</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <p className="text-stone-500 text-sm">Blank Rate</p>
                        <p className="font-medium text-stone-900">{fishery.expectations.blankRate}</p>
                      </div>
                    </div>
                  </div>
                )}

                {fishery.terrain && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Icons.Mountain /> Terrain & Access</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-stone-500 w-24 flex-shrink-0">Wading:</span>
                        <span className="text-stone-900">{fishery.terrain.wading}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-stone-500 w-24 flex-shrink-0">Mobility:</span>
                        <span className="text-stone-900">{fishery.terrain.mobility}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-stone-500 w-24 flex-shrink-0">Access:</span>
                        <span className="text-stone-900">{fishery.terrain.accessibility}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Methods Permitted</h2>
                  <ul className="space-y-2">
                    {fishery.methods.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-stone-700">
                        <span className="text-teal-600"><Icons.Check /></span>{m}
                      </li>
                    ))}
                  </ul>
                </div>

                {fishery.equipment && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-semibold mb-4">Equipment</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-stone-900 mb-2">Provided</h3>
                        <ul className="space-y-1">
                          {fishery.equipment.provided.map((e, i) => (
                            <li key={i} className="flex items-center gap-2 text-stone-600 text-sm">
                              <span className="text-teal-600"><Icons.Check /></span>{e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium text-stone-900 mb-2">Recommended to Bring</h3>
                        <ul className="space-y-1">
                          {fishery.equipment.recommended.map((e, i) => (
                            <li key={i} className="text-stone-600 text-sm">• {e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fishery.amenities.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-700">
                        <span className="text-teal-600"><Icons.Check /></span>{a}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Rules & Regulations</h2>
                  <ul className="space-y-3">
                    {fishery.rules.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-stone-700">
                        <span className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 text-sm flex-shrink-0">{i + 1}</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Accommodation Tab */}
            {activeTab === 'accommodation' && fishery.accommodation && (
              <div className="space-y-4">
                {fishery.accommodation.map((acc, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-stone-900">{acc.name}</h3>
                        <p className="text-teal-600 text-sm">{acc.type}</p>
                      </div>
                      <span className="text-stone-500 text-sm">{acc.distance}</span>
                    </div>
                    <p className="text-stone-600 mt-2">{acc.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-stone-900">£{fishery.price}</span>
                <span className="text-stone-500 ml-1">/{fishery.priceType}</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Number of Rods</label>
                  <select className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-teal-500">
                    {[1, 2, 3, 4].filter(n => n <= fishery.rods).map(n => (
                      <option key={n}>{n} rod{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={() => setShowModal(true)} className="w-full py-3 bg-teal-700 text-white rounded-xl font-semibold hover:bg-teal-800 transition">
                {fishery.bookingType === 'instant' ? 'Book Now' : 'Send Enquiry'}
              </button>

              {fishery.bookingType === 'enquiry' && (
                <p className="text-center text-stone-500 text-sm mt-3">The owner will confirm availability within 24-48 hours</p>
              )}

              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <Icons.Users />
                  <span>{fishery.rods} rod{fishery.rods > 1 ? 's' : ''} available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {confirmed ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-700"><Icons.Check /></div>
                <h3 className="text-xl font-semibold mb-2">{fishery.bookingType === 'instant' ? 'Booking Confirmed!' : 'Enquiry Sent!'}</h3>
                <p className="text-stone-600">Check your email for confirmation details.</p>
                <button onClick={() => { setShowModal(false); setConfirmed(false); }} className="mt-6 px-6 py-2.5 bg-teal-700 text-white rounded-xl">Done</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">{fishery.bookingType === 'instant' ? 'Complete Booking' : 'Send Enquiry'}</h3>
                  <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600"><Icons.X /></button>
                </div>
                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Full Name" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  {fishery.bookingType === 'enquiry' && (
                    <textarea placeholder="Message (fishing experience, any questions...)" rows={3} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"></textarea>
                  )}
                </div>
                <button onClick={() => setConfirmed(true)} className="w-full py-3 bg-teal-700 text-white rounded-xl font-semibold">
                  {fishery.bookingType === 'instant' ? 'Confirm & Pay' : 'Send Enquiry'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// INSTRUCTORS PAGE
// ============================================

const InstructorsPage = ({ onSelectInstructor }) => (
  <div className="min-h-screen bg-stone-50">
    <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Find an Instructor</h1>
        <p className="text-teal-100 text-lg">Learn from certified professionals with decades of experience</p>
      </div>
    </section>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        {instructors.map(i => <InstructorCard key={i.id} instructor={i} onClick={() => onSelectInstructor(i)} />)}
      </div>
    </div>
  </div>
);

// ============================================
// INSTRUCTOR DETAIL (ENHANCED)
// ============================================

const InstructorDetailPage = ({ instructor, onBack }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'lessons', label: 'What You Learn' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <button onClick={onBack} className="text-white/80 hover:text-white flex items-center gap-1"><Icons.ChevronLeft /> Back to instructors</button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 mb-6">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-56 h-56" style={{ background: instructor.image }}></div>
                <div className="flex-1 p-6">
                  <h1 className="text-2xl font-bold text-stone-900 mb-1">{instructor.name}</h1>
                  <p className="text-teal-600 font-medium mb-3">{instructor.title}</p>

                  <div className="flex items-center gap-4 text-stone-600 mb-4">
                    <span className="flex items-center gap-1"><Icons.MapPin /> {instructor.location}</span>
                    <span className="flex items-center gap-1"><Icons.Star /> {instructor.rating} ({instructor.reviews} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {instructor.specialties.map(s => (
                      <span key={s} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">{s}</span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-4">
                    {instructor.website && (
                      <a href="#" className="flex items-center gap-1 text-stone-500 hover:text-teal-700 text-sm">
                        <Icons.Globe /> Website
                      </a>
                    )}
                    {instructor.social?.instagram && (
                      <a href="#" className="text-stone-500 hover:text-pink-600 text-sm">Instagram</a>
                    )}
                    {instructor.social?.youtube && (
                      <a href="#" className="text-stone-500 hover:text-red-600 text-sm">YouTube</a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-600'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Background</h2>
                  <div className="prose prose-stone max-w-none">
                    {instructor.fullBio.split('\n\n').map((para, i) => (
                      <p key={i} className="text-stone-600 mb-4 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Teaching Philosophy</h2>
                  <p className="text-stone-600 leading-relaxed italic">"{instructor.teachingPhilosophy}"</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                  <div className="flex flex-wrap gap-3">
                    {instructor.certifications.map(c => (
                      <div key={c} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg">
                        <Icons.Award /> {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">A Typical Day</h2>
                  <div className="prose prose-stone max-w-none">
                    {instructor.typicalDay.split('\n\n').map((para, i) => (
                      <p key={i} className="text-stone-600 mb-4 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                  <ul className="space-y-3">
                    {instructor.whatYouLearn.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-teal-600 mt-0.5"><Icons.Check /></span>
                        <span className="text-stone-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Equipment</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-stone-900 mb-3">Provided by {instructor.name.split(' ')[0]}</h3>
                      <ul className="space-y-2">
                        {instructor.equipmentProvided.map((e, i) => (
                          <li key={i} className="flex items-center gap-2 text-stone-600">
                            <span className="text-teal-600"><Icons.Check /></span>{e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-900 mb-3">You Should Bring</h3>
                      <ul className="space-y-2">
                        {instructor.equipmentBring.map((e, i) => (
                          <li key={i} className="text-stone-600">• {e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-xl font-semibold mb-4">Availability & Booking</h2>
                  <div className="space-y-3">
                    <p className="text-stone-600"><strong>Availability:</strong> {instructor.availability}</p>
                    <p className="text-stone-600"><strong>Cancellation:</strong> {instructor.cancellation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && instructor.testimonials && (
              <div className="space-y-4">
                {instructor.testimonials.map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-start gap-4">
                      <div className="text-teal-200"><Icons.Quote /></div>
                      <div>
                        <p className="text-stone-700 italic mb-4">"{t.text}"</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-stone-900">{t.name}</p>
                          <p className="text-stone-400 text-sm">{t.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-stone-900">£{instructor.price}</span>
                <span className="text-stone-500 ml-1">/{instructor.priceType}</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Date</label>
                  <input type="date" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                </div>
              </div>

              <button onClick={() => setShowModal(true)} className="w-full py-3 bg-teal-700 text-white rounded-xl font-semibold hover:bg-teal-800 transition">
                Request Booking
              </button>

              <p className="text-center text-stone-500 text-sm mt-3">{instructor.name.split(' ')[0]} will confirm availability within 24-48 hours</p>

              {instructor.website && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <a href="#" className="flex items-center justify-center gap-2 text-teal-700 hover:text-teal-800 font-medium">
                    <Icons.Globe /> Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            {confirmed ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-700"><Icons.Check /></div>
                <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
                <p className="text-stone-600">{instructor.name.split(' ')[0]} will be in touch within 24-48 hours to confirm your booking.</p>
                <button onClick={() => { setShowModal(false); setConfirmed(false); }} className="mt-6 px-6 py-2.5 bg-teal-700 text-white rounded-xl">Done</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Request Booking</h3>
                  <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600"><Icons.X /></button>
                </div>
                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Full Name" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  <select className="w-full px-4 py-2.5 border border-stone-300 rounded-xl">
                    <option>Experience Level</option>
                    <option>Complete Beginner</option>
                    <option>Some Experience</option>
                    <option>Intermediate</option>
                    <option>Advanced - Looking to Refine</option>
                  </select>
                  <textarea placeholder="What would you like to focus on? Any specific goals or questions?" rows={4} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"></textarea>
                </div>
                <button onClick={() => setConfirmed(true)} className="w-full py-3 bg-teal-700 text-white rounded-xl font-semibold">
                  Send Request
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTab, setCurrentTab] = useState('waters');
  const [selectedFishery, setSelectedFishery] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  return (
    <div className="min-h-screen bg-stone-50">
      <Nav currentTab={currentTab} setCurrentTab={setCurrentTab} setCurrentPage={setCurrentPage} />
      {currentPage === 'home' && <HomePage onSearch={() => setCurrentPage('search')} onSelectFishery={f => { setSelectedFishery(f); setCurrentPage('venue'); }} />}
      {currentPage === 'search' && <SearchResultsPage onSelectFishery={f => { setSelectedFishery(f); setCurrentPage('venue'); }} onBack={() => setCurrentPage('home')} />}
      {currentPage === 'venue' && selectedFishery && <VenueDetailPage fishery={selectedFishery} onBack={() => setCurrentPage('search')} />}
      {currentPage === 'instructors' && <InstructorsPage onSelectInstructor={i => { setSelectedInstructor(i); setCurrentPage('instructorDetail'); }} />}
      {currentPage === 'instructorDetail' && selectedInstructor && <InstructorDetailPage instructor={selectedInstructor} onBack={() => setCurrentPage('instructors')} />}
    </div>
  );
}
