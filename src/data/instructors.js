// ============================================
// INSTRUCTORS DATA - Enhanced with reviews, gallery, typical day
// ============================================

// Helper to generate availability for next 60 days
const generateInstructorAvailability = () => {
  const availability = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    // Instructors typically available weekdays and some weekends
    if (dayOfWeek !== 0 && Math.random() > 0.3) {
      availability.push(date.toISOString().split('T')[0]);
    }
  }
  return availability;
};

export const instructors = [
  {
    id: 1,
    name: "James MacPherson",
    title: "AAPGAI Master Instructor",
    specialties: ["Atlantic Salmon", "Spey Casting", "Scottish Rivers"],
    location: "Scottish Highlands",
    price: 275,
    priceType: "full day",
    rating: 5.0,
    reviews: 67,
    image: "linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)",
    gallery: [
      "linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)",
      "linear-gradient(135deg, #5a6a7a 0%, #3a4a5a 100%)",
      "linear-gradient(135deg, #3a4a5a 0%, #1a2a3a 100%)",
      "linear-gradient(135deg, #6a7a8a 0%, #4a5a6a 100%)"
    ],
    bio: "30 years guiding on Scotland's finest salmon rivers. One of the UK's most respected Spey casting instructors.",
    fullBio: "James MacPherson has dedicated his life to Atlantic salmon and Spey casting. Born on the banks of the River Spey, he qualified as an AAPGAI Master Instructor in 1998.\n\nHe has taught thousands of anglers from complete beginners to international competitors, and has coached several Scottish International casting team members. His patient, analytical approach breaks down the complexities of Spey casting into manageable steps.",
    teachingPhilosophy: "Everyone can learn to Spey cast well - it's about understanding the mechanics, not strength. I've taught 70-year-olds who outcast 30-year-olds because they listened and trusted the process.",
    whatYouLearn: ["Spey casting mechanics and timing", "Single Spey, double Spey, snake roll, snap-T", "Reading salmon water", "Fly selection for Scottish rivers", "Fish playing and landing techniques", "Conservation-focused approach"],
    equipmentProvided: ["Spey rods (12-15ft)", "Reels and lines (Scandi & Skagit)", "Full fly selection", "Waders and boots"],
    certifications: ["AAPGAI Master", "SGAIC", "First Aid", "River Rescue"],
    website: "www.speymasterclasses.co.uk",
    hasCalendar: true,
    availability: generateInstructorAvailability(),
    typicalDay: [
      { time: "09:00", activity: "Meet at the river, introductions and safety briefing" },
      { time: "09:30", activity: "Casting assessment and identification of areas to improve" },
      { time: "10:00", activity: "Bank-side casting tuition - building the foundation" },
      { time: "11:30", activity: "Move onto the river - practical fishing begins" },
      { time: "13:00", activity: "Lunch break (packed lunch provided)" },
      { time: "14:00", activity: "Afternoon fishing session with ongoing instruction" },
      { time: "16:00", activity: "Water craft session - reading the river, finding lies" },
      { time: "17:00", activity: "Final hour of fishing, wrap-up and action plan" }
    ],
    reviewsList: [
      { id: 1, author: "Robert Thompson", rating: 5, date: "2025-10-20", title: "Transformed my casting", text: "James completely rebuilt my Spey cast in a single day. What had been a constant struggle suddenly clicked. His understanding of the mechanics is incredible, and he explains complex concepts in simple terms.", verified: true },
      { id: 2, author: "Michael Davies", rating: 5, date: "2025-09-15", title: "Worth every penny", text: "Saved me years of bad habits. James spotted issues with my timing that I'd had for a decade. Left feeling like a different angler. Already booked for a follow-up session.", verified: true },
      { id: 3, author: "Andrew Wilson", rating: 5, date: "2025-08-28", title: "Patient and knowledgeable", text: "As a complete beginner to Spey casting, I was nervous about booking such a renowned instructor. James put me at ease immediately and had me making decent casts by lunchtime. Incredible teacher.", verified: true },
      { id: 4, author: "William Bruce", rating: 5, date: "2025-07-10", title: "The real deal", text: "James knows these rivers inside out. Beyond the casting instruction, his knowledge of where the fish lie and when they move is invaluable. Landed my first Scottish salmon thanks to his guidance.", verified: true }
    ]
  },
  {
    id: 2,
    name: "Sarah Thornton",
    title: "GAIA Advanced Instructor",
    specialties: ["Trout", "Stillwater", "Beginners", "Women's Courses"],
    location: "Derbyshire",
    price: 175,
    priceType: "full day",
    rating: 4.9,
    reviews: 89,
    image: "linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)",
    gallery: [
      "linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)",
      "linear-gradient(135deg, #6a7a6a 0%, #4a5a4a 100%)",
      "linear-gradient(135deg, #4a5a4a 0%, #2a3a2a 100%)"
    ],
    bio: "Patient, encouraging instruction for newcomers. Specialist in stillwater tactics and women-only courses.",
    fullBio: "Sarah discovered fly fishing at 25 and immediately fell in love with the sport. Her empathy for beginners comes from being a late starter herself - she understands the frustrations and common pitfalls.\n\nNow a GAIA Advanced Instructor with over 15 years' experience, she specialises in making fly fishing accessible and enjoyable from day one. Her women's courses have introduced hundreds of female anglers to the sport.",
    teachingPhilosophy: "Fly fishing should be fun from day one. I structure courses so you catch fish quickly and build confidence. There's no point spending hours on grass casting if you leave having never felt a fish on the line.",
    whatYouLearn: ["Casting fundamentals that actually work", "Knots and setup made simple", "Reading stillwater - where the fish are", "Fly selection without the confusion", "Playing and landing fish", "Building confidence to fish independently"],
    equipmentProvided: ["Complete rod and reel setup", "Flies and leaders", "Landing nets", "Fishing permits"],
    certifications: ["GAIA Advanced", "Angling Trust Level 2", "DBS Checked", "First Aid"],
    website: "www.sarahthorntonfly.co.uk",
    hasCalendar: true,
    availability: generateInstructorAvailability(),
    typicalDay: [
      { time: "09:30", activity: "Coffee and introductions, discuss goals for the day" },
      { time: "10:00", activity: "Tackle setup - rods, reels, leaders, knots" },
      { time: "10:30", activity: "Casting practice on grass - the basics" },
      { time: "11:30", activity: "Move to the water - start fishing!" },
      { time: "13:00", activity: "Lunch break (café on site)" },
      { time: "14:00", activity: "Afternoon session - building on morning skills" },
      { time: "15:30", activity: "Fly selection masterclass" },
      { time: "16:30", activity: "Final fishing hour and wrap-up" }
    ],
    reviewsList: [
      { id: 1, author: "Jennifer Kline", rating: 5, date: "2025-09-28", title: "Perfect for beginners", text: "Sarah made everything so approachable. I was terrified of looking silly but she immediately put me at ease. I caught 4 trout on my first ever fly fishing trip! Can't recommend her enough.", verified: true },
      { id: 2, author: "Emma Richardson", rating: 5, date: "2025-08-15", title: "Women's course was brilliant", text: "Signed up for Sarah's women-only course and it was exactly what I needed. No pressure, no egos, just a supportive environment to learn. The other ladies were lovely and we've stayed in touch.", verified: true },
      { id: 3, author: "Lisa Morgan", rating: 5, date: "2025-07-20", title: "Finally got it!", text: "After struggling with casting on YouTube videos, one day with Sarah sorted everything out. She has such a patient way of explaining things. My husband couldn't believe the improvement.", verified: true },
      { id: 4, author: "Amanda Cross", rating: 4, date: "2025-06-10", title: "Great introduction", text: "Lovely day out and caught my first trout on a fly. Sarah is wonderful - encouraging but also pushes you to improve. Would have loved a bit more time on the water but understand the need for theory.", verified: true }
    ]
  },
  {
    id: 3,
    name: "Tom Ashworth",
    title: "Specimen Carp Specialist",
    specialties: ["Carp", "Pike", "Rig Mechanics", "Watercraft"],
    location: "Cambridgeshire",
    price: 150,
    priceType: "full day",
    rating: 4.8,
    reviews: 134,
    image: "linear-gradient(135deg, #6a6a5a 0%, #4a4a3a 100%)",
    gallery: [
      "linear-gradient(135deg, #6a6a5a 0%, #4a4a3a 100%)",
      "linear-gradient(135deg, #7a7a6a 0%, #5a5a4a 100%)",
      "linear-gradient(135deg, #5a5a4a 0%, #3a3a2a 100%)",
      "linear-gradient(135deg, #8a8a7a 0%, #6a6a5a 100%)"
    ],
    bio: "Former match angler turned specimen hunter. Carp to 52lb, helping anglers catch PBs.",
    fullBio: "Tom's practical, no-nonsense approach focuses on what actually works in modern carp fishing. A former match angler who transitioned to specimen hunting, he brings analytical precision to targeting big fish.\n\nWith carp to 52lb and multiple 40s to his name, Tom specialises in helping anglers break through plateaus and catch their target fish. He's particularly known for his watercraft - finding fish is his superpower.",
    teachingPhilosophy: "Carp fishing is 70% location, 20% presentation, 10% luck. Most anglers focus on the wrong 10%. I'll teach you to find fish first, then worry about fancy rigs.",
    whatYouLearn: ["Finding carp - visual spotting, feature finding", "Rig construction that actually works", "Bait strategies for different situations", "Playing and landing big fish safely", "Night fishing tactics", "Session planning and preparation"],
    equipmentProvided: ["Rig components and end tackle", "Bait samples", "Landing and retention equipment", "Unhooking mats and treatment"],
    certifications: ["Angling Trust Level 2", "DBS Checked", "First Aid"],
    website: "www.tomashworthcarp.co.uk",
    hasCalendar: true,
    availability: generateInstructorAvailability(),
    typicalDay: [
      { time: "06:00", activity: "Dawn start - best time to spot feeding fish" },
      { time: "07:00", activity: "Watercraft session - feature finding, reading the water" },
      { time: "08:30", activity: "Set up swims, discuss tactics for the session" },
      { time: "09:30", activity: "Rig tying masterclass - the rigs that catch big fish" },
      { time: "11:00", activity: "Cast out and fish - ongoing instruction" },
      { time: "13:00", activity: "Lunch (bring your own or we'll nip to the café)" },
      { time: "14:00", activity: "Bait application strategies" },
      { time: "16:00", activity: "Recap and action plan for your fishing" }
    ],
    reviewsList: [
      { id: 1, author: "Steve Jackson", rating: 5, date: "2025-10-05", title: "Changed how I approach fishing", text: "Tom transformed my carp fishing. His watercraft knowledge is incredible - he showed me fish I would have walked past. Three new PBs within a month of our session. Worth every penny.", verified: true },
      { id: 2, author: "Dan Murphy", rating: 5, date: "2025-09-18", title: "Finally broke the 30lb barrier", text: "Been stuck at 27lb for years. One session with Tom and I had a 31lb mirror three weeks later. He simplified everything - I was over-complicating it massively.", verified: true },
      { id: 3, author: "Mark Williams", rating: 4, date: "2025-08-22", title: "Great for intermediate anglers", text: "Tom's approach is practical and no-nonsense. He won't tell you what you want to hear, he'll tell you what you need to hear. My rig game has improved massively.", verified: true },
      { id: 4, author: "Chris Taylor", rating: 5, date: "2025-07-15", title: "The watercraft guru", text: "Spent most of the morning just walking and watching before we even cast out. Learned more about finding fish in those hours than in years of fishing alone. Essential knowledge.", verified: true },
      { id: 5, author: "Pete Andrews", rating: 5, date: "2025-06-28", title: "Brilliant for pike too", text: "Booked Tom for a pike session and he delivered big time. His location skills translate perfectly to predator fishing. Had two 20s in one session!", verified: true }
    ]
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
    gallery: [
      "linear-gradient(135deg, #5a7a6a 0%, #3a5a4a 100%)",
      "linear-gradient(135deg, #6a8a7a 0%, #4a6a5a 100%)",
      "linear-gradient(135deg, #4a6a5a 0%, #2a4a3a 100%)"
    ],
    bio: "Passionate about wild trout on Devon's small streams. Teaches traditional and tenkara techniques.",
    fullBio: "Emily holds permits on miles of rarely-fished Devon streams. A wildlife ecologist by training, she brings a naturalist's eye to wild trout fishing.\n\nHer courses focus on the complete experience - understanding the river ecosystem, the insects the trout feed on, and the art of approaching wild fish in intimate settings. She's one of the UK's leading tenkara instructors.",
    teachingPhilosophy: "Small stream fishing is about slowing down and becoming part of the landscape. The fish are wild, the setting is beautiful, and every trout is earned. It's the purest form of fly fishing.",
    whatYouLearn: ["Stealth and approach - the key to small stream success", "Reading small water", "Dry fly selection for wild trout", "Short-line nymphing techniques", "Tenkara basics and beyond", "Stream entomology - matching the hatch"],
    equipmentProvided: ["Fly rod or tenkara rod (your choice)", "Flies tied for local waters", "Leaders and tippet", "Light lunch and refreshments"],
    certifications: ["GAIA Level 2", "Wild Trout Trust Ambassador", "Tenkara UK Ambassador"],
    website: "www.devonwildtrout.co.uk",
    hasCalendar: false, // Contact-only
    availability: [],
    typicalDay: [
      { time: "09:00", activity: "Meet at a picturesque Devon village" },
      { time: "09:30", activity: "Short walk to the stream, discussing the environment" },
      { time: "10:00", activity: "Stealth and approach techniques - stalking fish" },
      { time: "11:00", activity: "First pool - putting skills into practice" },
      { time: "12:30", activity: "Streamside lunch in a beautiful spot" },
      { time: "13:30", activity: "Move upstream - tenkara introduction" },
      { time: "15:00", activity: "Dry fly session - matching the hatch" },
      { time: "16:30", activity: "Final pool and wrap-up" }
    ],
    reviewsList: [
      { id: 1, author: "Mark Thompson", rating: 5, date: "2025-09-12", title: "What fly fishing should be", text: "This is what fly fishing should be about - wild fish in wild places. Emily's passion is infectious and her knowledge of these streams is encyclopedic. Caught a dozen wild browns in stunning surroundings.", verified: true },
      { id: 2, author: "Helen Wright", rating: 5, date: "2025-08-25", title: "Tenkara convert", text: "Came to try tenkara and left completely hooked. Emily's teaching is gentle but effective. The simplicity of the method on these tiny streams makes so much sense. Bought my own setup the next day!", verified: true },
      { id: 3, author: "David Morris", rating: 5, date: "2025-07-18", title: "Hidden gems of Devon", text: "Emily took me to streams I'd drive past without a second glance. The fish might be small but they're wild and beautiful, and the setting is magical. A totally different experience to reservoir fishing.", verified: true },
      { id: 4, author: "Neil Patterson", rating: 4, date: "2025-06-30", title: "Peaceful and productive", text: "Perfect antidote to busy stillwater fishing. Emily creates such a calm atmosphere and her approach to the river is almost meditative. Caught fish all day on dry flies.", verified: true }
    ]
  }
];
