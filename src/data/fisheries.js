// ============================================
// FISHERIES DATA - Enhanced with reviews, coordinates, nearby stays
// ============================================

// Helper to generate availability for next 60 days
const generateAvailability = (basePrice, weekendPremium = 10) => {
  const availability = {};
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Random availability (80% available)
    const isAvailable = Math.random() > 0.2;
    const isClosed = Math.random() < 0.05; // 5% chance closed

    if (isClosed) {
      availability[dateStr] = { status: 'closed' };
    } else if (!isAvailable) {
      availability[dateStr] = { status: 'booked' };
    } else {
      availability[dateStr] = {
        status: 'available',
        price: isWeekend ? basePrice + weekendPremium : basePrice
      };
    }
  }
  return availability;
};

export const fisheries = [
  {
    id: 1,
    name: "River Wye - Letton Beat",
    type: "game",
    waterType: "River Beat",
    location: "Herefordshire",
    region: "Wales",
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
      "linear-gradient(135deg, #5d8a7a 0%, #4a6a60 100%)"
    ],
    bookingType: "enquiry",
    featured: true,
    topRated: true,
    shortDescription: "One of the finest salmon beats on the Wye, offering 1.5 miles of double-bank fishing.",
    fullDescription: "The Letton Beat represents some of the most productive salmon fishing the River Wye has to offer. Stretching for 1.5 miles of double-bank fishing, this historic beat has been managed for over a century.\n\nThe water comprises pools, glides, and faster runs. Notable lies include the Cathedral Pool and the Ash Tree Run.",
    season: { opens: "1st February", closes: "17th October", bestMonths: ["March", "April", "September", "October"] },
    expectations: { averageCatch: "2-3 salmon per rod over 3 days", recordFish: "28lb salmon", blankRate: "30%" },
    amenities: ["Fishing hut", "Ghillie available", "Wading access", "Parking", "Lunch available"],
    facilities: ["parking", "fishing-hut", "ghillie", "wading", "lunch"],
    rules: ["Barbless hooks only", "Catch & release for salmon", "No night fishing", "Single-handed or double-handed fly rods only", "No spinning except high water"],
    contact: { name: "Edward Williams", email: "fishing@lettonbeat.co.uk", phone: "01234 567890" },
    rods: 4,
    coordinates: { lat: 52.1234, lng: -3.0567 },
    experienceLevel: "intermediate",
    typicalSessionHours: 8,
    bestTimeOfDay: "Early morning & late evening",
    availability: generateAvailability(150, 25),
    reviewsList: [
      { id: 1, author: "Robert Thompson", rating: 5, date: "2025-10-15", title: "Exceptional salmon fishing", text: "My third visit to Letton Beat and it never disappoints. Edward is an excellent host and the ghillie's knowledge of the water is invaluable. Landed a beautiful 18lb hen salmon on day two.", verified: true },
      { id: 2, author: "Michael Davies", rating: 5, date: "2025-09-28", title: "Worth every penny", text: "Premium pricing but premium experience. The Cathedral Pool alone is worth the trip. Fish were showing throughout our stay and we landed four between the three of us.", verified: true },
      { id: 3, author: "Sarah Mitchell", rating: 4, date: "2025-09-10", title: "Beautiful setting, challenging fishing", text: "The beat is stunning and well-maintained. Water was a bit low during our visit which made fishing tricky, but we still managed two grilse. Would love to return when conditions are better.", verified: true },
      { id: 4, author: "James Wilson", rating: 5, date: "2025-08-22", title: "Dream salmon beat", text: "Finally ticked this one off my bucket list. The Wye is a truly special river and this beat showcases it at its best. Can't wait to return next season.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Angler's Rest B&B", type: "B&B", distance: "1.2 miles", priceRange: "£85-£120", rating: 4.8, reviewCount: 156, coordinates: { lat: 52.1254, lng: -3.0487 }, bookingUrl: "https://booking.com" },
      { id: 2, name: "Riverside Lodge Hotel", type: "Hotel", distance: "2.8 miles", priceRange: "£120-£180", rating: 4.6, reviewCount: 234, coordinates: { lat: 52.1334, lng: -3.0767 }, bookingUrl: "https://booking.com" },
      { id: 3, name: "Wye Valley Cottages", type: "Self-catering", distance: "3.5 miles", priceRange: "£150-£250", rating: 4.9, reviewCount: 89, coordinates: { lat: 52.1134, lng: -3.0867 }, bookingUrl: "https://booking.com" }
    ]
  },
  {
    id: 2,
    name: "Chew Valley Lake",
    type: "game",
    waterType: "Stillwater Reservoir",
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
      "linear-gradient(135deg, #3a5f95 0%, #1d3a5a 100%)"
    ],
    bookingType: "instant",
    featured: true,
    topRated: true,
    shortDescription: "A prestigious 1,200-acre reservoir renowned for quality trout and exceptional fly hatches.",
    fullDescription: "Chew Valley Lake is one of England's premier stillwater trout fisheries. The lake is stocked with rainbow trout averaging 2-3lbs, plus wild browns to 8lbs.\n\nProlific hatches of buzzers, sedges, and olives provide consistent fishing throughout the season. Bank and boat fishing available.",
    season: { opens: "Mid-March", closes: "End October", bestMonths: ["April", "May", "September"] },
    expectations: { averageCatch: "3-4 fish per day", recordFish: "11lb 8oz brown", blankRate: "Less than 10%" },
    amenities: ["Lodge restaurant", "Tackle shop", "Boat hire", "Toilets", "Parking", "Disabled access"],
    facilities: ["parking", "toilets", "cafe", "tackle-shop", "boat-hire", "disabled-access"],
    rules: ["Fly only", "4 fish limit", "Barbless for C&R", "No wading", "Boats must be returned by 7pm"],
    contact: { name: "Fishery Office", email: "info@chewvalleylake.co.uk", phone: "01234 567891" },
    rods: 50,
    coordinates: { lat: 51.3456, lng: -2.6234 },
    experienceLevel: "beginner",
    typicalSessionHours: 8,
    bestTimeOfDay: "All day - varies with conditions",
    availability: generateAvailability(45, 10),
    reviewsList: [
      { id: 1, author: "Emma Richardson", rating: 5, date: "2025-10-01", title: "Perfect for beginners", text: "My first ever fly fishing trip and I couldn't have picked a better venue. The staff were incredibly helpful and I caught three rainbows! The lodge restaurant is excellent too.", verified: true },
      { id: 2, author: "Tom Baker", rating: 5, date: "2025-09-15", title: "Buzzer bonanza", text: "September visit and the buzzers were hatching like crazy. Limited out by lunchtime fishing nymphs in the margins. The wild browns are getting bigger every year.", verified: true },
      { id: 3, author: "Linda Chen", rating: 4, date: "2025-08-20", title: "Great day out", text: "Lovely setting and good fishing. Can get busy on weekends so book early if you want a boat. The tackle shop has everything you need if you forget anything.", verified: true },
      { id: 4, author: "Paul Johnson", rating: 4, date: "2025-07-30", title: "Reliable fishery", text: "Never had a blank here in 10+ visits. The fish aren't huge but they're plentiful and fight well. Perfect venue when you want to guarantee some action.", verified: true },
      { id: 5, author: "Rachel Green", rating: 5, date: "2025-06-12", title: "Beautiful reservoir", text: "The scenery alone is worth the trip. Caught my PB rainbow at 4lb 8oz on a damsel nymph. Will definitely be back.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Chew Magna Farm B&B", type: "B&B", distance: "2.1 miles", priceRange: "£75-£95", rating: 4.7, reviewCount: 89, coordinates: { lat: 51.3556, lng: -2.6134 }, bookingUrl: "https://booking.com" },
      { id: 2, name: "The Bear & Swan Inn", type: "Inn", distance: "3.2 miles", priceRange: "£95-£130", rating: 4.5, reviewCount: 167, coordinates: { lat: 51.3356, lng: -2.6434 }, bookingUrl: "https://booking.com" },
      { id: 3, name: "Valley View Cottage", type: "Self-catering", distance: "1.8 miles", priceRange: "£120-£180", rating: 4.8, reviewCount: 45, coordinates: { lat: 51.3506, lng: -2.6284 }, bookingUrl: "https://booking.com" }
    ]
  },
  {
    id: 3,
    name: "Linear Fisheries - Manor Farm",
    type: "coarse",
    waterType: "Specimen Lake",
    location: "Oxfordshire",
    region: "South East",
    species: ["Carp", "Tench", "Bream", "Pike"],
    price: 25,
    priceType: "day ticket",
    rating: 4.8,
    reviews: 312,
    image: "linear-gradient(135deg, #5a7a4a 0%, #3a5a2a 100%)",
    gallery: [
      "linear-gradient(135deg, #5a7a4a 0%, #3a5a2a 100%)",
      "linear-gradient(135deg, #6a8a5a 0%, #4a6a3a 100%)",
      "linear-gradient(135deg, #4a6a3a 0%, #2a4a1a 100%)",
      "linear-gradient(135deg, #7a9a6a 0%, #5a7a4a 100%)"
    ],
    bookingType: "instant",
    featured: false,
    topRated: true,
    shortDescription: "Well-established specimen lakes known for big carp to 40lb+ in beautiful countryside.",
    fullDescription: "Linear Fisheries at Manor Farm is one of the UK's most respected carp venues. Multiple lakes offer varied challenges.\n\nSt Johns has carp to 45lb, Hardwick has 30lb+ fish, Manor Farm Lake is ideal for first 20s. Immaculate swims and excellent facilities.",
    season: { opens: "Year-round", closes: "N/A", bestMonths: ["May", "June", "September"] },
    expectations: { averageCatch: "2-5 carp per session", recordFish: "45lb 8oz mirror", blankRate: "Rare" },
    amenities: ["Tackle shop", "Café", "Showers", "Night fishing", "Fish care equipment", "Toilets"],
    facilities: ["parking", "toilets", "cafe", "tackle-shop", "night-fishing", "showers"],
    rules: ["Unhooking mats mandatory", "Barbless hooks", "No keepnets", "No zig rigs on some lakes", "Minimum 15lb line", "Carp care kits provided"],
    contact: { name: "Fishery Office", email: "info@linearfisheries.co.uk", phone: "01234 567892" },
    rods: 30,
    coordinates: { lat: 51.7123, lng: -1.2456 },
    experienceLevel: "any",
    typicalSessionHours: 24,
    bestTimeOfDay: "Dawn and dusk",
    availability: generateAvailability(25, 5),
    reviewsList: [
      { id: 1, author: "Steve Jackson", rating: 5, date: "2025-10-08", title: "Best carp venue in the UK", text: "My go-to venue for specimen carp. The fish are immaculate, the facilities are top-notch, and the bailiffs are helpful without being intrusive. Caught my PB 38lb mirror on my last visit.", verified: true },
      { id: 2, author: "Dan Murphy", rating: 5, date: "2025-09-20", title: "Worth the drive", text: "Travelled from Manchester and it was worth every mile. The lakes are beautifully maintained and the fish are stunning. Cafe food is great too!", verified: true },
      { id: 3, author: "Chris Taylor", rating: 4, date: "2025-08-15", title: "Challenging but rewarding", text: "St Johns is proper difficult but when you crack it, the rewards are incredible. Blanked my first session but came back and nailed a 32lb common. Persistence pays off here.", verified: true },
      { id: 4, author: "Mark Williams", rating: 5, date: "2025-07-28", title: "Perfect for all levels", text: "Manor Farm Lake is great for building confidence. My son caught his first 20 here and now he's hooked (pun intended). Staff are brilliant with younger anglers.", verified: true },
      { id: 5, author: "Pete Andrews", rating: 5, date: "2025-06-10", title: "Fish care first", text: "Love how seriously they take fish welfare here. Mandatory mats, carp care kits at every swim. The fish are in incredible condition because of it.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Carper's Lodge", type: "On-site lodges", distance: "On site", priceRange: "£60-£90", rating: 4.6, reviewCount: 234, coordinates: { lat: 51.7133, lng: -1.2446 }, bookingUrl: "https://booking.com" },
      { id: 2, name: "Witney Premier Inn", type: "Hotel", distance: "4.5 miles", priceRange: "£65-£85", rating: 4.2, reviewCount: 567, coordinates: { lat: 51.7823, lng: -1.4856 }, bookingUrl: "https://booking.com" },
      { id: 3, name: "Manor Farm Campsite", type: "Camping", distance: "Adjacent", priceRange: "£15-£25", rating: 4.4, reviewCount: 123, coordinates: { lat: 51.7113, lng: -1.2476 }, bookingUrl: "https://booking.com" }
    ]
  },
  {
    id: 4,
    name: "River Tweed - Junction Beat",
    type: "game",
    waterType: "River Beat",
    location: "Scottish Borders",
    region: "Scotland",
    species: ["Atlantic Salmon", "Sea Trout"],
    price: 350,
    priceType: "per rod/day",
    rating: 5.0,
    reviews: 28,
    image: "linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)",
    gallery: [
      "linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)",
      "linear-gradient(135deg, #4a6a7a 0%, #2a4a5a 100%)",
      "linear-gradient(135deg, #2a4a5a 0%, #0a2a3a 100%)"
    ],
    bookingType: "enquiry",
    featured: true,
    topRated: true,
    shortDescription: "The legendary Junction Pool - arguably the most famous salmon lie in Scotland.",
    fullDescription: "The Junction Beat encompasses one of the most storied salmon lies in the world. The Junction Pool, where the Teviot meets the Tweed, has produced countless memorable fish.\n\nAn experienced ghillie is included. This is bucket-list fishing for serious salmon anglers.",
    season: { opens: "1st February", closes: "30th November", bestMonths: ["October", "November"] },
    expectations: { averageCatch: "Quality over quantity", recordFish: "30lb+ fish recorded", blankRate: "Challenging" },
    amenities: ["Ghillie included", "Fishing hut", "Lunch provided", "Waders available", "4x4 access"],
    facilities: ["parking", "fishing-hut", "ghillie", "lunch", "wading"],
    rules: ["Fly only", "Catch & release", "Ghillie guidance required", "Single-handed or Spey rods", "No fishing before 9am October onwards"],
    contact: { name: "Alastair MacKenzie", email: "fishing@junctionbeat.com", phone: "01234 567893" },
    rods: 2,
    coordinates: { lat: 55.5789, lng: -2.4567 },
    experienceLevel: "advanced",
    typicalSessionHours: 8,
    bestTimeOfDay: "Mid-morning to late afternoon in autumn",
    availability: generateAvailability(350, 50),
    reviewsList: [
      { id: 1, author: "Lord Richard Ashby", rating: 5, date: "2025-11-02", title: "Simply the best", text: "My 15th season at Junction and it never fails to move me. Alastair's ghillies are the finest on the river. Landed a magnificent 24lb cock fish this autumn.", verified: true },
      { id: 2, author: "George Hamilton", rating: 5, date: "2025-10-20", title: "Bucket list complete", text: "Finally got my name on the Junction Pool. The anticipation of casting into that legendary water is indescribable. Didn't land one but touched two - I'll be back.", verified: true },
      { id: 3, author: "William Bruce", rating: 5, date: "2025-10-08", title: "Worth every penny", text: "Yes it's expensive, but where else can you fish water with this history? The ghillie made all the difference - wouldn't have landed my fish without his guidance.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Ednam House Hotel", type: "Hotel", distance: "1.5 miles", priceRange: "£150-£220", rating: 4.7, reviewCount: 312, coordinates: { lat: 55.5889, lng: -2.4367 }, bookingUrl: "https://booking.com" },
      { id: 2, name: "The Salmon Inn B&B", type: "B&B", distance: "2.2 miles", priceRange: "£95-£130", rating: 4.8, reviewCount: 78, coordinates: { lat: 55.5689, lng: -2.4767 }, bookingUrl: "https://booking.com" },
      { id: 3, name: "Tweed Valley Lodges", type: "Self-catering", distance: "3.8 miles", priceRange: "£180-£280", rating: 4.9, reviewCount: 56, coordinates: { lat: 55.5589, lng: -2.4967 }, bookingUrl: "https://booking.com" }
    ]
  },
  {
    id: 5,
    name: "River Test - Broadlands",
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
      "linear-gradient(135deg, #5a8a7a 0%, #3a6a5a 100%)"
    ],
    bookingType: "enquiry",
    featured: true,
    topRated: false,
    shortDescription: "Premium chalk stream fishing on one of England's most celebrated rivers.",
    fullDescription: "The Broadlands Estate offers some of the finest chalk stream trout fishing in the world. Crystal-clear water flows through ancient water meadows.\n\nA river keeper is included. This is technical fishing at its finest - sight fishing to educated wild browns.",
    season: { opens: "1st May", closes: "15th October", bestMonths: ["May", "June", "September"] },
    expectations: { averageCatch: "4-6 fish is good", recordFish: "Wild brown to 6lb", blankRate: "Rare for experienced anglers" },
    amenities: ["River keeper", "Lunch included", "Rod room", "Parking", "Waders available"],
    facilities: ["parking", "lunch", "ghillie", "wading", "rod-room"],
    rules: ["Dry fly & upstream nymph only", "Catch & release wild fish", "Barbless hooks", "No wading except where permitted", "Single fly only"],
    contact: { name: "James Portman", email: "fishing@broadlands.co.uk", phone: "01234 567894" },
    rods: 4,
    coordinates: { lat: 50.9876, lng: -1.5432 },
    experienceLevel: "intermediate",
    typicalSessionHours: 8,
    bestTimeOfDay: "Midday during mayfly, evening in summer",
    availability: generateAvailability(295, 45),
    reviewsList: [
      { id: 1, author: "Charles Worthington", rating: 5, date: "2025-06-15", title: "Mayfly magic", text: "Visited during the mayfly and it was everything I'd dreamed of. Sight fishing to rising browns in gin-clear water - this is what chalk stream fishing is all about.", verified: true },
      { id: 2, author: "Peter Hawkins", rating: 5, date: "2025-09-22", title: "Autumn grayling", text: "Came for the late-season grayling and wasn't disappointed. The keeper's knowledge of the water is exceptional. Beautiful setting and impeccable presentation required.", verified: true },
      { id: 3, author: "Andrew Mitchell", rating: 4, date: "2025-07-10", title: "Technical challenge", text: "This isn't easy fishing - these trout have seen it all. But that's what makes it so rewarding. Managed four fish including a cracking 3lb wild brown.", verified: true },
      { id: 4, author: "Simon Edwards", rating: 5, date: "2025-05-28", title: "Quintessential English fishing", text: "The Broadlands beat is simply stunning. Wading through water meadows casting to rising fish - it doesn't get more traditional than this. Worth every penny.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The White Horse Inn", type: "Inn", distance: "1.8 miles", priceRange: "£110-£150", rating: 4.6, reviewCount: 234, coordinates: { lat: 50.9976, lng: -1.5232 }, bookingUrl: "https://booking.com" },
      { id: 2, name: "Test Valley B&B", type: "B&B", distance: "2.5 miles", priceRange: "£85-£110", rating: 4.7, reviewCount: 89, coordinates: { lat: 50.9776, lng: -1.5632 }, bookingUrl: "https://booking.com" },
      { id: 3, name: "Romsey Riverside Hotel", type: "Hotel", distance: "4.2 miles", priceRange: "£130-£190", rating: 4.5, reviewCount: 456, coordinates: { lat: 50.9576, lng: -1.4932 }, bookingUrl: "https://booking.com" }
    ]
  },
  {
    id: 6,
    name: "Grafham Water",
    type: "game",
    waterType: "Stillwater Reservoir",
    location: "Cambridgeshire",
    region: "East Anglia",
    species: ["Rainbow Trout", "Brown Trout"],
    price: 38,
    priceType: "day ticket",
    rating: 4.6,
    reviews: 89,
    image: "linear-gradient(135deg, #4a5a7a 0%, #2a3a5a 100%)",
    gallery: [
      "linear-gradient(135deg, #4a5a7a 0%, #2a3a5a 100%)",
      "linear-gradient(135deg, #5a6a8a 0%, #3a4a6a 100%)",
      "linear-gradient(135deg, #3a4a6a 0%, #1a2a4a 100%)"
    ],
    bookingType: "instant",
    featured: false,
    topRated: false,
    shortDescription: "Large reservoir with excellent bank and boat fishing for quality trout.",
    fullDescription: "Grafham Water is one of England's premier trout reservoirs. At 1,550 acres, it offers plenty of space for both bank and boat anglers.\n\nThe fishery is known for consistent sport and good-sized fish, with rainbows averaging 2lbs and browns to 8lbs+.",
    season: { opens: "April", closes: "October", bestMonths: ["May", "June", "September"] },
    expectations: { averageCatch: "3-5 fish", recordFish: "9lb rainbow", blankRate: "15%" },
    amenities: ["Lodge", "Boat hire", "Tackle shop", "Toilets", "Parking"],
    facilities: ["parking", "toilets", "cafe", "tackle-shop", "boat-hire"],
    rules: ["Fly only", "8 fish limit", "Barbless hooks recommended", "Life jackets in boats", "No wading"],
    contact: { name: "Reception", email: "info@grafham.co.uk", phone: "01234 567895" },
    rods: 100,
    coordinates: { lat: 52.2876, lng: -0.3245 },
    experienceLevel: "beginner",
    typicalSessionHours: 8,
    bestTimeOfDay: "Early morning and evening",
    availability: generateAvailability(38, 8),
    reviewsList: [
      { id: 1, author: "Neil Patterson", rating: 5, date: "2025-09-05", title: "Great value fishing", text: "Excellent day out. The boats are well-maintained and the fish are in good condition. Caught 5 rainbows to 3lb on buzzers. Can't ask for more at this price.", verified: true },
      { id: 2, author: "Helen Wright", rating: 4, date: "2025-08-18", title: "Good for groups", text: "Brought a group of work colleagues for a corporate day. Staff were brilliant at getting everyone set up and fishing. Everyone caught at least one fish!", verified: true },
      { id: 3, author: "David Morris", rating: 4, date: "2025-07-22", title: "Reliable fishing", text: "My local water for midweek sessions. Never disappointing, always fish to be caught. The browns are getting bigger each year - had one of 5lb 4oz last month.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Grafham Lodge", type: "B&B", distance: "0.5 miles", priceRange: "£70-£90", rating: 4.5, reviewCount: 123, coordinates: { lat: 52.2906, lng: -0.3215 }, bookingUrl: "https://booking.com" },
      { id: 2, name: "Huntingdon Marriott", type: "Hotel", distance: "6.2 miles", priceRange: "£95-£140", rating: 4.3, reviewCount: 789, coordinates: { lat: 52.3376, lng: -0.1845 }, bookingUrl: "https://booking.com" }
    ]
  },
  {
    id: 7,
    name: "River Avon - Free Fishing",
    type: "coarse",
    waterType: "River",
    location: "Wiltshire",
    region: "South",
    species: ["Roach", "Chub", "Barbel", "Pike"],
    price: 0,
    priceType: "free",
    rating: 4.2,
    reviews: 45,
    image: "linear-gradient(135deg, #5a6a4a 0%, #3a4a2a 100%)",
    gallery: [
      "linear-gradient(135deg, #5a6a4a 0%, #3a4a2a 100%)",
      "linear-gradient(135deg, #6a7a5a 0%, #4a5a3a 100%)"
    ],
    bookingType: "free",
    featured: false,
    topRated: false,
    shortDescription: "Public access stretch with excellent mixed coarse fishing. Rod licence required.",
    fullDescription: "This public access stretch of the Bristol Avon offers free fishing for rod licence holders. The river holds good stocks of roach, chub, and barbel, with pike present in the deeper pools.\n\nA great option for spontaneous sessions - just turn up and fish!",
    season: { opens: "16th June", closes: "14th March", bestMonths: ["September", "October", "November"] },
    expectations: { averageCatch: "15-20 fish", recordFish: "8lb barbel", blankRate: "10%" },
    amenities: ["Parking nearby", "Public footpath access"],
    facilities: ["parking"],
    rules: ["EA rod licence required", "No night fishing", "No keepnets for barbel", "Barbless hooks recommended"],
    contact: { name: "Environment Agency", email: "enquiries@environment-agency.gov.uk" },
    rods: null,
    coordinates: { lat: 51.3654, lng: -2.1234 },
    experienceLevel: "any",
    typicalSessionHours: 4,
    bestTimeOfDay: "Dawn and dusk",
    openingHours: { weekday: "Dawn to dusk", weekend: "Dawn to dusk" },
    availability: null,
    reviewsList: [
      { id: 1, author: "Tony Green", rating: 4, date: "2025-10-12", title: "Great free fishing", text: "Brilliant that this stretch is free. Caught 15 roach and 3 decent chub on trotted bread. Just remember your rod licence!", verified: true },
      { id: 2, author: "Gary Hunt", rating: 4, date: "2025-09-28", title: "Hidden gem", text: "Don't tell everyone! Lovely stretch of river with minimal pressure. Had barbel to 6lb on the meat.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The George Inn", type: "Inn", distance: "0.8 miles", priceRange: "£75-£95", rating: 4.4, reviewCount: 156, coordinates: { lat: 51.3704, lng: -2.1184 }, bookingUrl: "https://booking.com" }
    ]
  }
];
