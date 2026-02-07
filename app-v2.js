// TightLines v2.0 - Enhanced UK Fishing Booking Platform
// Single-file React application for CDN-based deployment

const { useState, useEffect, useRef, useMemo } = React;

// ============================================================================
// ICONS - SVG Icon Components
// ============================================================================
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Fish: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12c-2-4-6-6-11-6-2 0-4 .5-5 1l2 2-3 3 3 3-2 2c1 .5 3 1 5 1 5 0 9-2 11-6z" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Award: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-2-4H7L5 9m14 0v8a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H6a1 1 0 01-1-1V9m14 0H5m14 0a2 2 0 012 2v3M5 9a2 2 0 00-2 2v3m4 0a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  ),
  Coffee: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h12a2 2 0 012 2v1a2 2 0 012 2v1a2 2 0 01-2 2h-1v4a4 4 0 01-4 4H8a4 4 0 01-4-4V4zm0 12h12" />
    </svg>
  ),
  Wifi: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Bed: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7M3 7l9-4 9 4M3 7v4h18V7M7 14h.01M12 14h.01M17 14h.01" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Accessibility: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth={2}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v4m0 0l-3 8m3-8l3 8m-6-6h6" />
    </svg>
  )
};

// ============================================================================
// DATA - Regions
// ============================================================================
const regions = [
  { id: 'scotland', name: 'Scotland', count: 245 },
  { id: 'north-england', name: 'North England', count: 189 },
  { id: 'wales', name: 'Wales', count: 156 },
  { id: 'midlands', name: 'Midlands', count: 203 },
  { id: 'south-england', name: 'South England', count: 312 },
  { id: 'east-anglia', name: 'East Anglia', count: 98 },
  { id: 'south-west', name: 'South West', count: 178 },
  { id: 'northern-ireland', name: 'Northern Ireland', count: 67 }
];

const fishTypes = [
  { id: 'game', name: 'Game Fishing', description: 'Salmon, trout, and other game fish' },
  { id: 'coarse', name: 'Coarse Fishing', description: 'Carp, pike, perch, and more' },
  { id: 'sea', name: 'Sea Fishing', description: 'Coastal and deep sea adventures' }
];

const speciesList = [
  'Atlantic Salmon', 'Brown Trout', 'Rainbow Trout', 'Sea Trout', 'Grayling',
  'Carp', 'Pike', 'Perch', 'Tench', 'Bream', 'Roach', 'Barbel', 'Chub',
  'Bass', 'Cod', 'Mackerel', 'Pollock'
];

const facilitiesList = [
  { id: 'parking', name: 'Parking', icon: 'Car' },
  { id: 'cafe', name: 'Café/Restaurant', icon: 'Coffee' },
  { id: 'toilets', name: 'Toilets', icon: 'Home' },
  { id: 'disabled', name: 'Disabled Access', icon: 'Accessibility' },
  { id: 'night', name: 'Night Fishing', icon: 'Moon' },
  { id: 'wifi', name: 'WiFi', icon: 'Wifi' }
];

// ============================================================================
// DATA - Fisheries (Enhanced with reviews, coordinates, availability)
// ============================================================================
const fisheries = [
  {
    id: 1,
    name: "River Wye - Letton Beat",
    region: "wales",
    type: "game",
    price: 85,
    rating: 4.8,
    reviewCount: 124,
    species: ["Atlantic Salmon", "Brown Trout", "Grayling"],
    description: "One of the finest salmon beats on the River Wye, offering 1.5 miles of double-bank fishing through stunning Welsh countryside. The Letton Beat is renowned for its consistent spring salmon runs and excellent autumn fishing.",
    highlights: ["Double-bank access", "1.5 miles of water", "Historic salmon beat", "Wading friendly"],
    rules: ["Catch and release for salmon", "Barbless hooks only", "No night fishing", "Rod licence required"],
    facilities: ["parking", "toilets"],
    bookingType: "enquiry",
    experienceLevel: "intermediate",
    typicalSessionHours: 8,
    bestTimeOfDay: "Early morning & evening",
    averageCatchRate: "2-3 fish per day",
    blankRate: "15%",
    recordFish: "32lb Atlantic Salmon (2019)",
    seasonInfo: "Mar-Oct for salmon, year-round for trout",
    coordinates: { lat: 52.1234, lng: -3.0567 },
    gallery: [
      { id: 1, gradient: "from-emerald-600 to-teal-700", label: "River View" },
      { id: 2, gradient: "from-blue-600 to-cyan-700", label: "Salmon Pool" },
      { id: 3, gradient: "from-green-600 to-emerald-700", label: "Autumn Colors" },
      { id: 4, gradient: "from-teal-600 to-green-700", label: "Wading Spot" }
    ],
    reviewsList: [
      { id: 1, author: "James M.", rating: 5, date: "2025-10-15", title: "Exceptional salmon fishing", text: "Had an incredible day on the Letton Beat. Landed a beautiful 18lb salmon on my first visit. The ghillie was incredibly knowledgeable and helpful. Will definitely be returning.", verified: true },
      { id: 2, author: "Robert K.", rating: 5, date: "2025-09-22", title: "World-class water", text: "This beat consistently produces fish. The scenery is breathtaking and the water is well-maintained. Booking was straightforward and the facilities are adequate.", verified: true },
      { id: 3, author: "Sarah L.", rating: 4, date: "2025-08-10", title: "Great experience overall", text: "Wonderful day out despite not landing a salmon. Saw several fish and had a few takes. The trout fishing as a backup was excellent - landed 6 brownies to 2lb.", verified: true },
      { id: 4, author: "Michael P.", rating: 5, date: "2025-07-05", title: "Best beat on the Wye", text: "Been fishing the Wye for 20 years and this is my favourite beat. Good holding pools and plenty of variety. Well worth the price.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Angler's Rest B&B", type: "B&B", distance: "2.3 miles", priceRange: "£85-£120", rating: 4.6, reviewCount: 89, amenities: ["Breakfast", "Rod storage", "Drying room"] },
      { id: 2, name: "Letton Court Hotel", type: "Hotel", distance: "1.8 miles", priceRange: "£120-£180", rating: 4.8, reviewCount: 156, amenities: ["Restaurant", "Bar", "Spa"] },
      { id: 3, name: "Riverside Cottage", type: "Self-catering", distance: "0.5 miles", priceRange: "£150-£200/night", rating: 4.9, reviewCount: 42, amenities: ["Kitchen", "Garden", "River views"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 85 },
      '2026-02-11': { status: 'available', price: 85 },
      '2026-02-12': { status: 'booked' },
      '2026-02-13': { status: 'available', price: 85 },
      '2026-02-14': { status: 'available', price: 95 },
      '2026-02-15': { status: 'available', price: 95 },
      '2026-02-16': { status: 'booked' }
    }
  },
  {
    id: 2,
    name: "Loch Awe - Kilchurn Bay",
    region: "scotland",
    type: "game",
    price: 45,
    rating: 4.6,
    reviewCount: 89,
    species: ["Brown Trout", "Rainbow Trout", "Pike", "Perch"],
    description: "Fish in the shadow of the iconic Kilchurn Castle on Scotland's longest freshwater loch. Excellent wild brown trout fishing with specimen pike in the deeper waters.",
    highlights: ["Historic castle backdrop", "Wild brown trout", "Boat hire available", "Stunning scenery"],
    rules: ["Boat fishing only in designated areas", "Pike must be returned", "No live bait"],
    facilities: ["parking", "cafe", "toilets"],
    bookingType: "instant",
    experienceLevel: "beginner",
    typicalSessionHours: 6,
    bestTimeOfDay: "Mid-morning to afternoon",
    averageCatchRate: "4-6 fish per day",
    blankRate: "10%",
    recordFish: "28lb Pike (2021)",
    seasonInfo: "Mar-Oct (best May-Sep)",
    coordinates: { lat: 56.4023, lng: -5.0287 },
    gallery: [
      { id: 1, gradient: "from-blue-700 to-indigo-800", label: "Loch View" },
      { id: 2, gradient: "from-slate-600 to-blue-700", label: "Kilchurn Castle" },
      { id: 3, gradient: "from-cyan-600 to-blue-700", label: "Boat Fishing" }
    ],
    reviewsList: [
      { id: 1, author: "Duncan S.", rating: 5, date: "2025-09-18", title: "Magical location", text: "The setting is absolutely stunning. Caught a dozen beautiful wild brownies while drifting past the castle. An unforgettable experience.", verified: true },
      { id: 2, author: "Emma W.", rating: 4, date: "2025-08-25", title: "Great family day", text: "Took the kids for their first fishing trip. The staff were very helpful and we all caught fish. Café food was good too!", verified: true },
      { id: 3, author: "Ian M.", rating: 5, date: "2025-07-12", title: "Pike fishing paradise", text: "Targeted pike and wasn't disappointed. Three fish over 15lb including a 24lb specimen. The guides know exactly where to find them.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Kilchurn Lodge", type: "Guest House", distance: "3.1 miles", priceRange: "£75-£110", rating: 4.5, reviewCount: 67, amenities: ["Breakfast", "Packed lunches", "Parking"] },
      { id: 2, name: "Lochside Cabins", type: "Self-catering", distance: "1.2 miles", priceRange: "£100-£160/night", rating: 4.7, reviewCount: 34, amenities: ["Kitchen", "Hot tub", "Loch access"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 45 },
      '2026-02-11': { status: 'available', price: 45 },
      '2026-02-12': { status: 'available', price: 45 },
      '2026-02-13': { status: 'booked' },
      '2026-02-14': { status: 'available', price: 55 },
      '2026-02-15': { status: 'available', price: 55 }
    }
  },
  {
    id: 3,
    name: "Packington Somers Fishery",
    region: "midlands",
    type: "coarse",
    price: 25,
    rating: 4.9,
    reviewCount: 312,
    species: ["Carp", "Tench", "Bream", "Roach", "Perch"],
    description: "Award-winning coarse fishery set in the historic Packington Estate. Four pristine lakes stocked with specimen carp to 35lb+ and excellent mixed fishing.",
    highlights: ["Specimen carp to 35lb+", "4 lakes to choose from", "Well-maintained swims", "Match & pleasure fishing"],
    rules: ["Barbless hooks only", "No braided mainline", "Landing nets must be used", "Keep nets by arrangement"],
    facilities: ["parking", "cafe", "toilets", "disabled", "wifi"],
    bookingType: "instant",
    experienceLevel: "beginner",
    typicalSessionHours: 8,
    bestTimeOfDay: "Dawn and dusk",
    averageCatchRate: "10-20 fish per day",
    blankRate: "5%",
    recordFish: "38lb 4oz Mirror Carp (2023)",
    seasonInfo: "Year-round",
    coordinates: { lat: 52.5123, lng: -1.5678 },
    gallery: [
      { id: 1, gradient: "from-green-600 to-emerald-700", label: "Main Lake" },
      { id: 2, gradient: "from-emerald-600 to-teal-700", label: "Specimen Lake" },
      { id: 3, gradient: "from-teal-600 to-cyan-700", label: "Match Lake" },
      { id: 4, gradient: "from-lime-600 to-green-700", label: "Café & Facilities" }
    ],
    reviewsList: [
      { id: 1, author: "Steve B.", rating: 5, date: "2025-11-02", title: "Best fishery in the Midlands", text: "Consistently brilliant fishing. The lakes are immaculate and the carp are in perfect condition. Staff go above and beyond.", verified: true },
      { id: 2, author: "Dave T.", rating: 5, date: "2025-10-18", title: "Specimen heaven", text: "Landed my PB carp here - 31lb 8oz mirror. The fish are well looked after and fight like trains. Highly recommended.", verified: true },
      { id: 3, author: "Lisa R.", rating: 5, date: "2025-09-30", title: "Perfect for beginners", text: "Brought my nephew for his first proper fishing trip. The match lake was perfect - he caught 15 fish and is now hooked for life!", verified: true },
      { id: 4, author: "Paul H.", rating: 4, date: "2025-09-15", title: "Great but busy", text: "Excellent fishing but can get very busy at weekends. Book in advance and arrive early for the best swims.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Packington Hall Hotel", type: "Hotel", distance: "0.8 miles", priceRange: "£95-£150", rating: 4.4, reviewCount: 203, amenities: ["Restaurant", "Bar", "Pool"] },
      { id: 2, name: "The Fisherman's Rest", type: "B&B", distance: "2.1 miles", priceRange: "£65-£85", rating: 4.6, reviewCount: 78, amenities: ["Breakfast", "Rod storage", "Early breakfast available"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 25 },
      '2026-02-11': { status: 'available', price: 25 },
      '2026-02-12': { status: 'available', price: 25 },
      '2026-02-13': { status: 'available', price: 25 },
      '2026-02-14': { status: 'available', price: 30 },
      '2026-02-15': { status: 'booked' }
    }
  },
  {
    id: 4,
    name: "Chesil Beach - West Bexington",
    region: "south-west",
    type: "sea",
    price: 0,
    rating: 4.5,
    reviewCount: 178,
    species: ["Bass", "Cod", "Mackerel", "Pollock", "Plaice"],
    description: "Iconic 18-mile shingle beach offering world-class bass fishing and excellent winter cod. Free access with stunning Jurassic Coast scenery.",
    highlights: ["Free fishing", "World-famous bass venue", "18 miles of beach", "Jurassic Coast UNESCO site"],
    rules: ["Bass size limits apply", "No fishing in marked swimming areas", "Respect other beach users"],
    facilities: ["parking"],
    bookingType: "free",
    experienceLevel: "intermediate",
    typicalSessionHours: 4,
    bestTimeOfDay: "High tide, dawn/dusk",
    averageCatchRate: "2-5 fish per session",
    blankRate: "25%",
    recordFish: "14lb 8oz Bass (2020)",
    seasonInfo: "Bass Apr-Nov, Cod Nov-Feb",
    coordinates: { lat: 50.6789, lng: -2.6543 },
    gallery: [
      { id: 1, gradient: "from-blue-500 to-cyan-600", label: "Beach View" },
      { id: 2, gradient: "from-orange-500 to-amber-600", label: "Sunset Fishing" },
      { id: 3, gradient: "from-slate-500 to-blue-600", label: "Winter Cod" }
    ],
    reviewsList: [
      { id: 1, author: "Tom H.", rating: 5, date: "2025-10-28", title: "Bass fishing at its best", text: "Nothing beats Chesil for bass. Landed 4 schoolies and a cracking 7lb fish on peeler crab. The beach is stunning.", verified: true },
      { id: 2, author: "Chris D.", rating: 4, date: "2025-09-14", title: "Classic venue", text: "Challenging fishing but rewarding when you get it right. The shingle can be tough on the feet - bring proper boots!", verified: true },
      { id: 3, author: "Andy P.", rating: 4, date: "2025-02-20", title: "Winter codding", text: "Great winter session with 3 codling to 6lb. Wrap up warm and bring plenty of bait - you'll need it!", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Seaside B&B", type: "B&B", distance: "0.3 miles", priceRange: "£70-£95", rating: 4.3, reviewCount: 112, amenities: ["Sea views", "Breakfast", "Bait freezer"] },
      { id: 2, name: "Chesil Beach Lodge", type: "Self-catering", distance: "0.5 miles", priceRange: "£120-£180/night", rating: 4.7, reviewCount: 56, amenities: ["Kitchen", "Garden", "Beach access"] }
    ],
    availability: {}
  },
  {
    id: 5,
    name: "River Test - Broadlands Estate",
    region: "south-england",
    type: "game",
    price: 250,
    rating: 4.9,
    reviewCount: 67,
    species: ["Brown Trout", "Rainbow Trout", "Grayling"],
    description: "The legendary River Test at Broadlands - arguably the finest chalk stream fishing in the world. Crystal-clear waters, prolific fly hatches, and wild brown trout in immaculate condition.",
    highlights: ["World-famous chalk stream", "Wild brown trout", "Pristine water quality", "Historic estate"],
    rules: ["Dry fly and upstream nymph only", "Catch and release", "Wading by arrangement", "No dogs"],
    facilities: ["parking", "toilets"],
    bookingType: "enquiry",
    experienceLevel: "expert",
    typicalSessionHours: 8,
    bestTimeOfDay: "Late morning to early evening",
    averageCatchRate: "3-6 fish per day",
    blankRate: "10%",
    recordFish: "8lb 12oz Brown Trout (2018)",
    seasonInfo: "May-Sep (best Jun-Jul)",
    coordinates: { lat: 50.9876, lng: -1.5234 },
    gallery: [
      { id: 1, gradient: "from-emerald-500 to-green-600", label: "Chalk Stream" },
      { id: 2, gradient: "from-teal-500 to-emerald-600", label: "Mayfly Hatch" },
      { id: 3, gradient: "from-green-500 to-teal-600", label: "Estate Grounds" },
      { id: 4, gradient: "from-cyan-500 to-teal-600", label: "Wild Brownie" }
    ],
    reviewsList: [
      { id: 1, author: "Richard E.", rating: 5, date: "2025-07-22", title: "Bucket list experience", text: "Finally fished the Test and it exceeded all expectations. The clarity of the water is incredible - you can see every fish. Landed 5 beautiful wild browns on dry fly.", verified: true },
      { id: 2, author: "Patrick S.", rating: 5, date: "2025-06-15", title: "Mayfly magic", text: "Timed my visit for the mayfly hatch and it was extraordinary. Fish rising everywhere and took 8 browns to 4lb. Worth every penny.", verified: true },
      { id: 3, author: "William D.", rating: 5, date: "2025-05-28", title: "The pinnacle of trout fishing", text: "If you're a serious fly fisher, you must fish the Test at least once. The fish are spooky and selective but that's what makes it so rewarding.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Mill at Broadlands", type: "Hotel", distance: "0.2 miles", priceRange: "£180-£280", rating: 4.9, reviewCount: 89, amenities: ["Restaurant", "Bar", "River views"] },
      { id: 2, name: "Romsey Arms", type: "Inn", distance: "1.5 miles", priceRange: "£95-£140", rating: 4.5, reviewCount: 156, amenities: ["Restaurant", "Bar", "Parking"] }
    ],
    availability: {
      '2026-02-10': { status: 'closed' },
      '2026-02-11': { status: 'closed' },
      '2026-05-15': { status: 'available', price: 250 },
      '2026-05-16': { status: 'available', price: 280 },
      '2026-05-17': { status: 'booked' }
    }
  },
  {
    id: 6,
    name: "Linear Fisheries - St Johns",
    region: "south-england",
    type: "coarse",
    price: 35,
    rating: 4.7,
    reviewCount: 445,
    species: ["Carp", "Catfish", "Tench", "Bream"],
    description: "One of the UK's premier carp venues with multiple lakes holding fish to over 50lb. St Johns Lake is the flagship water with immaculate fish in a stunning setting.",
    highlights: ["Carp to 50lb+", "Multiple lakes", "24hr fishing available", "On-site tackle shop"],
    rules: ["Minimum 42\" landing net", "Unhooking mat required", "No fixed leads", "Booking essential"],
    facilities: ["parking", "cafe", "toilets", "night", "wifi"],
    bookingType: "instant",
    experienceLevel: "intermediate",
    typicalSessionHours: 24,
    bestTimeOfDay: "Night and early morning",
    averageCatchRate: "2-4 carp per 24hrs",
    blankRate: "15%",
    recordFish: "52lb 8oz Mirror Carp (2024)",
    seasonInfo: "Year-round (best Apr-Oct)",
    coordinates: { lat: 51.8234, lng: -1.2345 },
    gallery: [
      { id: 1, gradient: "from-green-700 to-emerald-800", label: "St Johns Lake" },
      { id: 2, gradient: "from-amber-600 to-orange-700", label: "Specimen Carp" },
      { id: 3, gradient: "from-slate-600 to-gray-700", label: "Night Session" }
    ],
    reviewsList: [
      { id: 1, author: "Mark C.", rating: 5, date: "2025-10-05", title: "Incredible carp fishing", text: "Did a 48hr session and landed 7 carp including a 38lb mirror. The fish are in incredible condition and the facilities are top-notch.", verified: true },
      { id: 2, author: "Jason R.", rating: 5, date: "2025-09-20", title: "Best carp venue in the UK", text: "Linear never disappoints. The lakes are well-managed and the stock is outstanding. Worth the drive from anywhere.", verified: true },
      { id: 3, author: "Kevin T.", rating: 4, date: "2025-08-15", title: "Great but pricey", text: "Excellent fishing but the costs add up with bivvy hire and day tickets. That said, you get what you pay for.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "On-site Bivvy Hire", type: "Bivvy", distance: "On-site", priceRange: "£30/night", rating: 4.2, reviewCount: 234, amenities: ["Bedchair", "Sleeping bag", "Cooking gear"] },
      { id: 2, name: "The Carp Lodge", type: "B&B", distance: "2.5 miles", priceRange: "£75-£95", rating: 4.6, reviewCount: 67, amenities: ["Breakfast", "Rod storage", "Early breakfast"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 35 },
      '2026-02-11': { status: 'available', price: 35 },
      '2026-02-12': { status: 'booked' },
      '2026-02-13': { status: 'available', price: 35 },
      '2026-02-14': { status: 'available', price: 40 },
      '2026-02-15': { status: 'available', price: 40 }
    }
  },
  {
    id: 7,
    name: "River Tweed - Junction Pool",
    region: "scotland",
    type: "game",
    price: 150,
    rating: 4.8,
    reviewCount: 98,
    species: ["Atlantic Salmon", "Sea Trout", "Brown Trout"],
    description: "The famous Junction Pool where the Teviot meets the Tweed. One of Scotland's most productive salmon beats with excellent autumn runs and historic fishing huts.",
    highlights: ["Famous junction pool", "Prolific autumn runs", "Historic fishing huts", "Experienced ghillies"],
    rules: ["Catch and release encouraged", "Fly fishing only Sep-Nov", "Spinning permitted early season"],
    facilities: ["parking", "toilets"],
    bookingType: "enquiry",
    experienceLevel: "intermediate",
    typicalSessionHours: 8,
    bestTimeOfDay: "All day during runs",
    averageCatchRate: "1-2 salmon per day (in season)",
    blankRate: "30%",
    recordFish: "42lb Atlantic Salmon (1998)",
    seasonInfo: "Feb-Nov (best Sep-Oct)",
    coordinates: { lat: 55.5987, lng: -2.4567 },
    gallery: [
      { id: 1, gradient: "from-blue-600 to-indigo-700", label: "Junction Pool" },
      { id: 2, gradient: "from-amber-600 to-yellow-700", label: "Autumn Run" },
      { id: 3, gradient: "from-slate-600 to-blue-700", label: "Fishing Hut" }
    ],
    reviewsList: [
      { id: 1, author: "Alistair M.", rating: 5, date: "2025-10-25", title: "Legendary water", text: "The Junction Pool lived up to its reputation. Hooked 4 salmon, landed 2 including a fresh 18-pounder. The ghillie was fantastic.", verified: true },
      { id: 2, author: "David W.", rating: 5, date: "2025-09-30", title: "Autumn perfection", text: "Timed my visit perfectly for the autumn run. Fish everywhere and landed my first Tweed salmon - a 14lb hen fish on a Cascade.", verified: true },
      { id: 3, author: "George F.", rating: 4, date: "2025-09-15", title: "Beautiful but challenging", text: "Stunning location but the fish weren't running during my visit. Still a wonderful day on the water with excellent company.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Kelso Bridge Hotel", type: "Hotel", distance: "2.0 miles", priceRange: "£110-£160", rating: 4.6, reviewCount: 189, amenities: ["Restaurant", "Bar", "Drying room"] },
      { id: 2, name: "The Salmon Inn", type: "Inn", distance: "1.5 miles", priceRange: "£85-£120", rating: 4.4, reviewCount: 112, amenities: ["Restaurant", "Bar", "Rod storage"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 120 },
      '2026-02-11': { status: 'available', price: 120 },
      '2026-09-15': { status: 'available', price: 180 },
      '2026-09-16': { status: 'booked' },
      '2026-10-01': { status: 'available', price: 200 }
    }
  }
];


// ============================================================================
// DATA - Instructors (Enhanced with galleries, typical day, reviews)
// ============================================================================
const instructors = [
  {
    id: 1,
    name: "Callum MacLeod",
    location: "River Spey, Scotland",
    region: "scotland",
    specialties: ["Salmon", "Spey Casting", "Traditional Flies"],
    rating: 4.9,
    reviewCount: 89,
    price: 250,
    experience: "25 years",
    bio: "Third-generation Spey ghillie with unparalleled knowledge of the river. Callum specialises in teaching traditional Spey casting techniques and has guided anglers from complete beginners to world champions.",
    certifications: ["SGAIC Master", "AAPGAI", "First Aid", "DBS Checked"],
    languages: ["English", "Gaelic"],
    maxGroupSize: 2,
    hasCalendar: true,
    gallery: [
      { id: 1, gradient: "from-blue-700 to-indigo-800", label: "On the Spey" },
      { id: 2, gradient: "from-teal-600 to-cyan-700", label: "Spey Casting" },
      { id: 3, gradient: "from-emerald-600 to-green-700", label: "Salmon Catch" }
    ],
    typicalDay: [
      { time: "08:30", activity: "Meet at the fishing hut for coffee and introductions" },
      { time: "09:00", activity: "Assess experience level and set goals for the day" },
      { time: "09:30", activity: "Casting instruction on the grass (if needed)" },
      { time: "10:30", activity: "Move to the river - begin fishing instruction" },
      { time: "12:30", activity: "Lunch break (packed lunch provided)" },
      { time: "13:30", activity: "Afternoon session - focus on reading water and fly selection" },
      { time: "16:30", activity: "Final fishing and wrap-up discussion" },
      { time: "17:00", activity: "Session ends" }
    ],
    reviewsList: [
      { id: 1, author: "Peter M.", rating: 5, date: "2025-10-12", title: "Master of his craft", text: "Callum transformed my Spey casting in one day. His patience and expertise are remarkable. I finally understand the snap-T!", verified: true },
      { id: 2, author: "Hans G.", rating: 5, date: "2025-09-28", title: "Flew from Germany - worth every mile", text: "Made the trip specifically to fish with Callum. His knowledge of the Spey is encyclopedic. Caught my first Scottish salmon thanks to him.", verified: true },
      { id: 3, author: "Andrew K.", rating: 5, date: "2025-08-15", title: "Life-changing instruction", text: "After 20 years of self-taught Spey casting, Callum fixed all my bad habits in a single session. Should have done this years ago!", verified: true },
      { id: 4, author: "Margaret T.", rating: 5, date: "2025-07-22", title: "Perfect for beginners", text: "Never held a Spey rod before. By the end of the day I was making 60ft casts and had a salmon follow my fly. Incredible teacher.", verified: true }
    ],
    availability: ['2026-02-10', '2026-02-12', '2026-02-15', '2026-02-18', '2026-02-20', '2026-03-05', '2026-03-08']
  },
  {
    id: 2,
    name: "Emma Richardson",
    location: "Hampshire Chalk Streams",
    region: "south-england",
    specialties: ["Dry Fly", "Nymphing", "River Craft"],
    rating: 4.8,
    reviewCount: 67,
    price: 195,
    experience: "15 years",
    bio: "Former competitive fly fisher turned full-time guide, Emma brings technical precision and infectious enthusiasm to her teaching. Her approach combines traditional chalk stream methods with modern competition techniques.",
    certifications: ["GAIA Level 2", "Angling Trust Coach", "First Aid", "DBS Checked"],
    languages: ["English", "French"],
    maxGroupSize: 3,
    hasCalendar: true,
    gallery: [
      { id: 1, gradient: "from-emerald-500 to-teal-600", label: "Chalk Stream" },
      { id: 2, gradient: "from-green-500 to-emerald-600", label: "Dry Fly Session" },
      { id: 3, gradient: "from-teal-500 to-cyan-600", label: "Nymphing Demo" }
    ],
    typicalDay: [
      { time: "09:00", activity: "Meet at the river - tackle check and briefing" },
      { time: "09:30", activity: "Entomology walk - identify what's hatching" },
      { time: "10:00", activity: "Casting practice and line control exercises" },
      { time: "11:00", activity: "Guided fishing with real-time coaching" },
      { time: "13:00", activity: "Lunch at riverside (included)" },
      { time: "14:00", activity: "Afternoon session - focus on presentation" },
      { time: "16:30", activity: "Review and homework for continued improvement" },
      { time: "17:00", activity: "Session ends" }
    ],
    reviewsList: [
      { id: 1, author: "Sophie L.", rating: 5, date: "2025-09-15", title: "Finally got my first chalk stream trout!", text: "Emma's patience is incredible. She spotted fish I would never have seen and coached me into presenting perfectly. Landed 4 beautiful browns.", verified: true },
      { id: 2, author: "James B.", rating: 5, date: "2025-08-22", title: "Competition-level instruction", text: "Emma's comp background shows. She introduced me to Euro nymphing techniques that have completely changed my fishing. Highly technical but explained simply.", verified: true },
      { id: 3, author: "Robert T.", rating: 4, date: "2025-07-10", title: "Great day, tough conditions", text: "Fish were being very selective due to bright sun, but Emma worked hard to find opportunities. Her knowledge of the river is impressive.", verified: true }
    ],
    availability: ['2026-02-11', '2026-02-14', '2026-02-17', '2026-02-21', '2026-03-02', '2026-03-06']
  },
  {
    id: 3,
    name: "Mike Thompson",
    location: "Norfolk Broads & East Anglia",
    region: "east-anglia",
    specialties: ["Pike", "Predator Fishing", "Lure Fishing"],
    rating: 4.7,
    reviewCount: 112,
    price: 175,
    experience: "20 years",
    bio: "The East's leading pike specialist, Mike has guided anglers to over 500 twenty-pound pike. His boat is fully equipped for lure and deadbait fishing, and he holds multiple venue records across the Broads.",
    certifications: ["Angling Trust Level 2", "Boat Master", "First Aid", "DBS Checked"],
    languages: ["English"],
    maxGroupSize: 2,
    hasCalendar: false,
    gallery: [
      { id: 1, gradient: "from-slate-600 to-gray-700", label: "Norfolk Broads" },
      { id: 2, gradient: "from-green-600 to-teal-700", label: "Monster Pike" },
      { id: 3, gradient: "from-blue-600 to-slate-700", label: "Boat Setup" }
    ],
    typicalDay: [
      { time: "07:00", activity: "Meet at boat launch - early start essential for pike" },
      { time: "07:30", activity: "Tackle setup and safety briefing" },
      { time: "08:00", activity: "First drift - focus on prime early morning spots" },
      { time: "10:00", activity: "Move to deeper water - try different techniques" },
      { time: "12:00", activity: "Lunch on the boat (bring your own or order in advance)" },
      { time: "13:00", activity: "Afternoon session - lure fishing focus" },
      { time: "15:30", activity: "Final hour in prime evening spots" },
      { time: "16:30", activity: "Return to mooring, session ends" }
    ],
    reviewsList: [
      { id: 1, author: "Terry O.", rating: 5, date: "2025-11-05", title: "PB smashed!", text: "Mike put me on a 28lb pike on my first drift! His knowledge of the Broads is second to none. Can't wait to go back for another session.", verified: true },
      { id: 2, author: "Dean S.", rating: 5, date: "2025-10-18", title: "Lure fishing masterclass", text: "Learned more about pike lure fishing in one day than in 10 years of self-teaching. Mike's boat is perfectly set up and he works incredibly hard.", verified: true },
      { id: 3, author: "Phil W.", rating: 4, date: "2025-09-22", title: "Great guide, tricky day", text: "Fish were being difficult but Mike kept trying different spots and methods. Eventually found them in the afternoon - 3 doubles to show for our efforts.", verified: true }
    ],
    availability: []
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    location: "Welsh Dee & Border Rivers",
    region: "wales",
    specialties: ["Grayling", "Tenkara", "Small Stream"],
    rating: 4.9,
    reviewCount: 45,
    price: 165,
    experience: "12 years",
    bio: "Pioneer of tenkara fishing in the UK, Sarah combines Japanese minimalism with Welsh river traditions. Her approach emphasises stealth, presentation, and a deep connection with the river environment.",
    certifications: ["GAIA Level 2", "Tenkara Ambassador", "First Aid", "DBS Checked"],
    languages: ["English", "Welsh"],
    maxGroupSize: 2,
    hasCalendar: true,
    gallery: [
      { id: 1, gradient: "from-emerald-600 to-green-700", label: "Welsh Dee" },
      { id: 2, gradient: "from-teal-600 to-emerald-700", label: "Tenkara Style" },
      { id: 3, gradient: "from-cyan-600 to-teal-700", label: "Grayling Catch" }
    ],
    typicalDay: [
      { time: "10:00", activity: "Meet at riverside - tenkara introduction and tackle demo" },
      { time: "10:30", activity: "Learn the basic tenkara cast and line control" },
      { time: "11:30", activity: "Move upstream - practical fishing begins" },
      { time: "13:00", activity: "Picnic lunch by the river (included)" },
      { time: "14:00", activity: "Explore small tributaries and pocket water" },
      { time: "16:00", activity: "Late afternoon rise - target feeding fish" },
      { time: "17:30", activity: "Session ends" }
    ],
    reviewsList: [
      { id: 1, author: "Jennifer K.", rating: 5, date: "2025-10-30", title: "Tenkara converted me", text: "Sceptical about tenkara but Sarah showed me how effective and enjoyable it can be. Caught more fish than usual with half the gear. Now I'm obsessed!", verified: true },
      { id: 2, author: "Owen P.", rating: 5, date: "2025-09-18", title: "Perfect grayling day", text: "Sarah knows exactly where the grayling hold. Landed 15 beautiful fish to 2lb on tiny dries. Her casting instruction is excellent.", verified: true },
      { id: 3, author: "Linda M.", rating: 5, date: "2025-08-25", title: "Peaceful and productive", text: "The tenkara approach is so peaceful. Sarah's teaching style is calm and encouraging. Left feeling refreshed and with new skills.", verified: true }
    ],
    availability: ['2026-02-12', '2026-02-15', '2026-02-19', '2026-02-22', '2026-03-01', '2026-03-04', '2026-03-09']
  }
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Star Rating Display
const StarRating = ({ rating, showNumber = true, size = "normal" }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const starClass = size === "small" ? "w-4 h-4" : "w-5 h-5";
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className={`${starClass} text-amber-400 fill-current`} viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className={`${starClass} text-amber-400`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-${i})`} stroke="currentColor" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className={`${starClass} text-gray-300`} viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showNumber && <span className="text-sm font-medium text-stone-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

// Photo Carousel Component
const PhotoCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };
  
  const goToNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };
  
  return (
    <div className="relative">
      {/* Main Image */}
      <div className={`h-64 md:h-96 rounded-xl bg-gradient-to-br ${images[currentIndex]?.gradient || 'from-teal-600 to-emerald-700'} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.83zM32 0l-3.486 3.485 1.415 1.414L searching32.343 2.485 34.757 0H32zm-6.657 0L16.857 8.485l1.414 1.415 9.9-9.9h-2.828z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}} />
        </div>
        <span className="text-white/70 text-lg">{images[currentIndex]?.label || title}</span>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Icons.ChevronLeft />
            </button>
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Icons.ChevronRight />
            </button>
          </>
        )}
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg bg-gradient-to-br ${img.gradient} ${currentIndex === idx ? 'ring-2 ring-brand-600 ring-offset-2' : 'opacity-70 hover:opacity-100'} transition-all`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Calendar Date Picker (works without react-datepicker)
const SimpleDatePicker = ({ selectedDate, onDateSelect, availability = {}, minDate = new Date() }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }
  
  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateStr];
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isSelected = selectedDate && dateStr === selectedDate;
    
    let bgColor = 'bg-gray-100 text-gray-400';
    let hoverColor = '';
    
    if (!isPast) {
      if (dayAvailability?.status === 'available') {
        bgColor = 'bg-green-100 text-green-800';
        hoverColor = 'hover:bg-green-200 cursor-pointer';
      } else if (dayAvailability?.status === 'booked') {
        bgColor = 'bg-red-100 text-red-800';
      } else if (dayAvailability?.status === 'closed') {
        bgColor = 'bg-gray-200 text-gray-500';
      } else {
        bgColor = 'bg-white text-stone-700';
        hoverColor = 'hover:bg-stone-100 cursor-pointer';
      }
    }
    
    if (isSelected) {
      bgColor = 'bg-brand-600 text-white';
    }
    
    days.push(
      <button
        key={day}
        onClick={() => !isPast && dayAvailability?.status !== 'booked' && dayAvailability?.status !== 'closed' && onDateSelect(dateStr)}
        disabled={isPast || dayAvailability?.status === 'booked' || dayAvailability?.status === 'closed'}
        className={`h-10 rounded-lg text-sm font-medium ${bgColor} ${hoverColor} transition-colors flex items-center justify-center`}
      >
        {day}
      </button>
    );
  }
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Icons.ChevronLeft />
        </button>
        <span className="font-semibold text-stone-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Icons.ChevronRight />
        </button>
      </div>
      
      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-stone-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-stone-200 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span className="text-stone-600">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span className="text-stone-600">Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />
          <span className="text-stone-600">Closed</span>
        </div>
      </div>
    </div>
  );
};

// Certification Badge Component
const CertificationBadge = ({ cert }) => {
  const badgeStyles = {
    'SGAIC Master': { bg: 'bg-amber-100', text: 'text-amber-800', icon: '🏆' },
    'AAPGAI': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🎣' },
    'GAIA Level 2': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
    'Angling Trust Level 2': { bg: 'bg-teal-100', text: 'text-teal-800', icon: '✓' },
    'Angling Trust Coach': { bg: 'bg-teal-100', text: 'text-teal-800', icon: '👨‍🏫' },
    'First Aid': { bg: 'bg-red-100', text: 'text-red-800', icon: '➕' },
    'DBS Checked': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '✔' },
    'Boat Master': { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '⚓' },
    'Tenkara Ambassador': { bg: 'bg-pink-100', text: 'text-pink-800', icon: '🎌' }
  };
  
  const style = badgeStyles[cert] || { bg: 'bg-stone-100', text: 'text-stone-800', icon: '•' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      <span>{style.icon}</span>
      {cert}
    </span>
  );
};


// ============================================================================
// ADVANCED FILTERS COMPONENT
// ============================================================================

const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), localMax - 10);
    setLocalMin(newMin);
    onChange([newMin, localMax]);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), localMin + 10);
    setLocalMax(newMax);
    onChange([localMin, newMax]);
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-stone-700">£{localMin}</span>
        <span className="font-medium text-stone-700">£{localMax}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 bg-stone-200 rounded-full" />
        <div
          className="absolute h-full bg-teal-500 rounded-full"
          style={{ left: minPercent + '%', right: (100 - maxPercent) + '%' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer"
          style={{ zIndex: 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};

const CheckboxFilter = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-stone-300 group-hover:border-teal-400'}`}>
      {checked && <Icons.Check />}
    </div>
    <span className="text-stone-700">{label}</span>
  </label>
);

const AdvancedFilters = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Price Range (per day)</h4>
        <PriceRangeSlider
          min={0}
          max={500}
          value={filters.priceRange}
          onChange={(value) => onFilterChange({ ...filters, priceRange: value })}
        />
      </div>

      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Species</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {speciesList.slice(0, 10).map(species => (
            <CheckboxFilter
              key={species}
              label={species}
              checked={filters.species.includes(species)}
              onChange={() => {
                const newSpecies = filters.species.includes(species)
                  ? filters.species.filter(s => s !== species)
                  : [...filters.species, species];
                onFilterChange({ ...filters, species: newSpecies });
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Experience Level</h4>
        <div className="space-y-2">
          {['beginner', 'intermediate', 'expert'].map(level => (
            <label key={level} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="experience"
                checked={filters.experience === level}
                onChange={() => onFilterChange({ ...filters, experience: level })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-stone-700 capitalize">{level}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="experience"
              checked={!filters.experience}
              onChange={() => onFilterChange({ ...filters, experience: '' })}
              className="w-4 h-4 text-teal-600"
            />
            <span className="text-stone-700">Any level</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Facilities</h4>
        <div className="space-y-2">
          {facilitiesList.map(facility => (
            <CheckboxFilter
              key={facility.id}
              label={facility.name}
              checked={filters.facilities.includes(facility.id)}
              onChange={() => {
                const newFacilities = filters.facilities.includes(facility.id)
                  ? filters.facilities.filter(f => f !== facility.id)
                  : [...filters.facilities, facility.id];
                onFilterChange({ ...filters, facilities: newFacilities });
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-stone-800">Available this weekend</span>
        <button
          onClick={() => onFilterChange({ ...filters, weekendOnly: !filters.weekendOnly })}
          className={`w-12 h-6 rounded-full transition-colors ${filters.weekendOnly ? 'bg-teal-600' : 'bg-stone-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${filters.weekendOnly ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <button
        onClick={() => onFilterChange({
          priceRange: [0, 500],
          species: [],
          experience: '',
          facilities: [],
          weekendOnly: false
        })}
        className="w-full py-2 text-teal-600 hover:text-teal-700 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <React.Fragment>
      <div className="hidden lg:block">
        <div className={`bg-white rounded-xl border border-stone-200 overflow-hidden transition-all ${isOpen ? 'p-6' : 'p-0 h-0'}`}>
          {isOpen && <FilterContent />}
        </div>
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        <Icons.Filter />
        <span>Filters</span>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <Icons.X />
              </button>
            </div>
            <div className="p-6">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

// ============================================================================
// REVIEWS LIST COMPONENT
// ============================================================================

const ReviewsList = ({ reviews, showAll = false }) => {
  const [expanded, setExpanded] = useState(showAll);
  const displayReviews = expanded ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayReviews.map(review => (
        <div key={review.id} className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-800">{review.author}</span>
                {review.verified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
              <div className="text-sm text-stone-500">{new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <StarRating rating={review.rating} showNumber={false} size="small" />
          </div>
          <h4 className="font-medium text-stone-800 mb-2">{review.title}</h4>
          <p className="text-stone-600 text-sm leading-relaxed">{review.text}</p>
        </div>
      ))}

      {reviews.length > 3 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-3 text-teal-600 hover:text-teal-700 font-medium"
        >
          Show all {reviews.length} reviews
        </button>
      )}
    </div>
  );
};

// ============================================================================
// TYPICAL DAY TIMELINE
// ============================================================================

const TypicalDayTimeline = ({ schedule }) => (
  <div className="space-y-0">
    {schedule.map((item, idx) => (
      <div key={idx} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
            {item.time.split(':')[0]}
          </div>
          {idx < schedule.length - 1 && (
            <div className="w-0.5 h-full min-h-[40px] bg-teal-200 my-1" />
          )}
        </div>
        <div className="pb-6">
          <div className="text-sm font-medium text-teal-600">{item.time}</div>
          <div className="text-stone-700">{item.activity}</div>
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// WHAT TO EXPECT SECTION
// ============================================================================

const WhatToExpect = ({ venue }) => {
  const items = [
    { icon: Icons.Clock, label: 'Typical session', value: venue.typicalSessionHours + ' hours' },
    { icon: Icons.Sun, label: 'Best time', value: venue.bestTimeOfDay },
    { icon: Icons.Target, label: 'Avg catch rate', value: venue.averageCatchRate },
    { icon: Icons.TrendingUp, label: 'Blank rate', value: venue.blankRate },
    { icon: Icons.Award, label: 'Record fish', value: venue.recordFish },
    { icon: Icons.Calendar, label: 'Season', value: venue.seasonInfo }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            <item.icon />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <div className="text-stone-800 font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// NEARBY STAYS MAP (Leaflet)
// ============================================================================

const NearbyStaysMap = ({ venue, stays }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (typeof L === 'undefined') return;

    const map = L.map(mapRef.current).setView([venue.coordinates.lat, venue.coordinates.lng], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Venue marker
    L.marker([venue.coordinates.lat, venue.coordinates.lng])
      .addTo(map)
      .bindPopup('<strong>' + venue.name + '</strong><br/>Fishing venue');

    // Stay markers
    stays.forEach((stay, idx) => {
      const offset = (idx + 1) * 0.008;
      L.marker([venue.coordinates.lat + offset, venue.coordinates.lng + offset * 1.5])
        .addTo(map)
        .bindPopup('<strong>' + stay.name + '</strong><br/>' + stay.type + ' • ' + stay.distance);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venue, stays]);

  return (
    <div ref={mapRef} className="h-64 md:h-80 rounded-xl overflow-hidden border border-stone-200" />
  );
};

// ============================================================================
// ACCOMMODATION CARD
// ============================================================================

const AccommodationCard = ({ stay }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-stone-800">{stay.name}</h4>
        <div className="text-sm text-stone-500">{stay.type} • {stay.distance}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-teal-600">{stay.priceRange}</div>
        <div className="flex items-center gap-1 text-sm">
          <StarRating rating={stay.rating} size="small" showNumber={false} />
          <span className="text-stone-500">({stay.reviewCount})</span>
        </div>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mt-3">
      {stay.amenities.map((amenity, idx) => (
        <span key={idx} className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">
          {amenity}
        </span>
      ))}
    </div>
  </div>
);


// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

const Nav = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Icons.Fish />
            </div>
            <span className="text-xl font-bold text-stone-800">TightLines</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('search', { type: 'game' })}
              className="text-stone-600 hover:text-teal-600 font-medium"
            >
              Game Fishing
            </button>
            <button
              onClick={() => onNavigate('search', { type: 'coarse' })}
              className="text-stone-600 hover:text-teal-600 font-medium"
            >
              Coarse Fishing
            </button>
            <button
              onClick={() => onNavigate('search', { type: 'sea' })}
              className="text-stone-600 hover:text-teal-600 font-medium"
            >
              Sea Fishing
            </button>
            <button
              onClick={() => onNavigate('instructors')}
              className="text-stone-600 hover:text-teal-600 font-medium"
            >
              Guides & Instructors
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-stone-600 hover:text-teal-600 font-medium">Sign In</button>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
              List Your Water
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <Icons.Menu />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <div className="flex flex-col gap-4">
              <button onClick={() => { onNavigate('search', { type: 'game' }); setMobileMenuOpen(false); }} className="text-left text-stone-600 hover:text-teal-600 font-medium">Game Fishing</button>
              <button onClick={() => { onNavigate('search', { type: 'coarse' }); setMobileMenuOpen(false); }} className="text-left text-stone-600 hover:text-teal-600 font-medium">Coarse Fishing</button>
              <button onClick={() => { onNavigate('search', { type: 'sea' }); setMobileMenuOpen(false); }} className="text-left text-stone-600 hover:text-teal-600 font-medium">Sea Fishing</button>
              <button onClick={() => { onNavigate('instructors'); setMobileMenuOpen(false); }} className="text-left text-stone-600 hover:text-teal-600 font-medium">Guides & Instructors</button>
              <hr className="border-stone-200" />
              <button className="text-left text-stone-600 hover:text-teal-600 font-medium">Sign In</button>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium text-center">List Your Water</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================================================
// FISHERY CARD COMPONENT
// ============================================================================

const FisheryCard = ({ fishery, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
  >
    <div className={`h-48 bg-gradient-to-br ${fishery.gallery?.[0]?.gradient || 'from-teal-600 to-emerald-700'} flex items-center justify-center`}>
      <span className="text-white/50 text-sm">Photo</span>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg text-stone-800">{fishery.name}</h3>
        <div className="flex items-center gap-1">
          <StarRating rating={fishery.rating} size="small" />
          <span className="text-sm text-stone-500">({fishery.reviewCount})</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-stone-500 text-sm mb-3">
        <Icons.MapPin />
        <span>{regions.find(r => r.id === fishery.region)?.name}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {fishery.species.slice(0, 3).map(species => (
          <span key={species} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">
            {species}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          {fishery.price === 0 ? (
            <span className="text-green-600 font-semibold">Free Fishing</span>
          ) : (
            <span className="text-stone-800 font-semibold">From £{fishery.price}/day</span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          fishery.bookingType === 'instant' ? 'bg-green-100 text-green-700' :
          fishery.bookingType === 'enquiry' ? 'bg-amber-100 text-amber-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {fishery.bookingType === 'instant' ? 'Instant Book' :
           fishery.bookingType === 'enquiry' ? 'Enquiry' : 'Free Access'}
        </span>
      </div>
    </div>
  </div>
);

// ============================================================================
// INSTRUCTOR CARD COMPONENT
// ============================================================================

const InstructorCard = ({ instructor, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
  >
    <div className={`h-40 bg-gradient-to-br ${instructor.gallery?.[0]?.gradient || 'from-blue-600 to-indigo-700'} flex items-center justify-center`}>
      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
        <Icons.Users />
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-semibold text-lg text-stone-800 mb-1">{instructor.name}</h3>
      <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
        <Icons.MapPin />
        <span>{instructor.location}</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <StarRating rating={instructor.rating} size="small" />
        <span className="text-sm text-stone-500">({instructor.reviewCount} reviews)</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {instructor.specialties.map(spec => (
          <span key={spec} className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">
            {spec}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-stone-800 font-semibold">From £{instructor.price}/day</span>
        <span className="text-teal-600 text-sm font-medium">{instructor.experience} exp.</span>
      </div>
    </div>
  </div>
);

// ============================================================================
// HOME PAGE
// ============================================================================

const HomePage = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const matches = [
        ...fisheries.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).map(f => ({ type: 'fishery', item: f })),
        ...regions.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).map(r => ({ type: 'region', item: r })),
        ...speciesList.filter(s => s.toLowerCase().includes(query.toLowerCase())).map(s => ({ type: 'species', item: s }))
      ].slice(0, 6);
      setSearchSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const featuredGuides = instructors.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover the Best Fishing in the UK
          </h1>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Book day tickets, find expert guides, and explore thousands of waters across England, Scotland, Wales, and Northern Ireland.
          </p>

          {/* Search Bar with Autocomplete */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search waters, regions, or species..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full px-6 py-4 text-stone-800 focus:outline-none"
                />
              </div>
              <button
                onClick={() => onNavigate('search', { query: searchQuery })}
                className="bg-teal-600 hover:bg-teal-700 px-8 flex items-center gap-2"
              >
                <Icons.Search />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl mt-2 overflow-hidden z-10">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (suggestion.type === 'fishery') {
                        onNavigate('venue', { id: suggestion.item.id });
                      } else if (suggestion.type === 'region') {
                        onNavigate('search', { region: suggestion.item.id });
                      } else {
                        onNavigate('search', { species: suggestion.item });
                      }
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-stone-50 flex items-center gap-3 text-stone-800"
                  >
                    {suggestion.type === 'fishery' && <Icons.Fish />}
                    {suggestion.type === 'region' && <Icons.MapPin />}
                    {suggestion.type === 'species' && <Icons.Target />}
                    <span>
                      {suggestion.type === 'fishery' ? suggestion.item.name :
                       suggestion.type === 'region' ? suggestion.item.name :
                       suggestion.item}
                    </span>
                    <span className="text-xs text-stone-400 ml-auto capitalize">{suggestion.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Fish Types */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-10">
            What type of fishing are you looking for?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {fishTypes.map(type => (
              <button
                key={type.id}
                onClick={() => onNavigate('search', { type: type.id })}
                className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow border border-stone-200"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.Fish />
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-2">{type.name}</h3>
                <p className="text-stone-500">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Guides Carousel */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-stone-800">Featured Fishing Guides</h2>
            <button
              onClick={() => onNavigate('instructors')}
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View all
              <Icons.ChevronRight />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGuides.map(instructor => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                onClick={() => onNavigate('instructor', { id: instructor.id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-10">
            Explore by Region
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => onNavigate('search', { region: region.id })}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-stone-200"
              >
                <h3 className="font-semibold text-stone-800 mb-1">{region.name}</h3>
                <p className="text-sm text-stone-500">{region.count} waters</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Waters */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-stone-800 mb-8">Popular Waters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fisheries.slice(0, 6).map(fishery => (
              <FisheryCard
                key={fishery.id}
                fishery={fishery}
                onClick={() => onNavigate('venue', { id: fishery.id })}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


// ============================================================================
// SEARCH RESULTS PAGE
// ============================================================================

const SearchResultsPage = ({ onNavigate, params }) => {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    species: [],
    experience: '',
    facilities: [],
    weekendOnly: false
  });

  const filteredFisheries = useMemo(() => {
    return fisheries.filter(f => {
      if (params?.type && f.type !== params.type) return false;
      if (params?.region && f.region !== params.region) return false;
      if (f.price < filters.priceRange[0] || f.price > filters.priceRange[1]) return false;
      if (filters.species.length > 0 && !filters.species.some(s => f.species.includes(s))) return false;
      if (filters.experience && f.experienceLevel !== filters.experience) return false;
      if (filters.facilities.length > 0 && !filters.facilities.every(fac => f.facilities.includes(fac))) return false;
      return true;
    });
  }, [params, filters]);

  const getTitle = () => {
    if (params?.type) {
      const type = fishTypes.find(t => t.id === params.type);
      return type?.name || 'Fishing';
    }
    if (params?.region) {
      const region = regions.find(r => r.id === params.region);
      return region?.name || 'All Waters';
    }
    return 'All Waters';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{getTitle()}</h1>
          <p className="text-stone-500">{filteredFisheries.length} waters found</p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"
        >
          <Icons.Filter />
          <span>{filtersOpen ? 'Hide' : 'Show'} Filters</span>
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`hidden lg:block w-72 flex-shrink-0 transition-all ${filtersOpen ? '' : 'w-0 overflow-hidden'}`}>
          <AdvancedFilters
            filters={filters}
            onFilterChange={setFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {filteredFisheries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFisheries.map(fishery => (
                <FisheryCard
                  key={fishery.id}
                  fishery={fishery}
                  onClick={() => onNavigate('venue', { id: fishery.id })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icons.Fish />
              <h3 className="text-xl font-semibold text-stone-800 mt-4 mb-2">No waters found</h3>
              <p className="text-stone-500">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters */}
      <AdvancedFilters
        filters={filters}
        onFilterChange={setFilters}
        isOpen={false}
        onToggle={() => {}}
      />
    </div>
  );
};

// ============================================================================
// VENUE DETAIL PAGE
// ============================================================================

const VenueDetailPage = ({ onNavigate, params }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(null);

  const venue = fisheries.find(f => f.id === params?.id);

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Venue not found</h2>
        <button onClick={() => onNavigate('search')} className="text-teal-600 hover:text-teal-700">
          Back to search
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'species', label: 'Species & Records' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'rules', label: 'Rules' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'stays', label: 'Nearby Stays' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-teal-600">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('search', { type: venue.type })} className="hover:text-teal-600 capitalize">{venue.type} Fishing</button>
        <span>/</span>
        <span className="text-stone-800">{venue.name}</span>
      </div>

      {/* Photo Carousel */}
      <PhotoCarousel images={venue.gallery || []} title={venue.name} />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">{venue.name}</h1>
            <div className="flex items-center gap-4 text-stone-500">
              <div className="flex items-center gap-1">
                <Icons.MapPin />
                <span>{regions.find(r => r.id === venue.region)?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <StarRating rating={venue.rating} />
                <span>({venue.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            {venue.price === 0 ? (
              <div className="text-2xl font-bold text-green-600">Free Fishing</div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-stone-800">£{venue.price}</div>
                <div className="text-stone-500">per day</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-stone-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div>
                <p className="text-stone-600 leading-relaxed mb-6">{venue.description}</p>
                <h3 className="text-xl font-semibold text-stone-800 mb-4">What to Expect</h3>
                <WhatToExpect venue={venue} />
                <h3 className="text-xl font-semibold text-stone-800 mt-8 mb-4">Highlights</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {venue.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-stone-600">
                      <Icons.Check />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'species' && (
              <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-4">Target Species</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                  {venue.species.map(species => (
                    <span key={species} className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-medium">
                      {species}
                    </span>
                  ))}
                </div>
                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-800 mb-2">Venue Record</h4>
                  <p className="text-amber-700 text-lg">{venue.recordFish}</p>
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="grid md:grid-cols-2 gap-4">
                {facilitiesList.map(facility => {
                  const hasFacility = venue.facilities.includes(facility.id);
                  return (
                    <div
                      key={facility.id}
                      className={`flex items-center gap-3 p-4 rounded-xl ${hasFacility ? 'bg-green-50 text-green-700' : 'bg-stone-50 text-stone-400'}`}
                    >
                      {Icons[facility.icon] ? React.createElement(Icons[facility.icon]) : <Icons.Check />}
                      <span className={hasFacility ? 'font-medium' : ''}>{facility.name}</span>
                      {hasFacility && <Icons.Check />}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'rules' && (
              <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-4">Venue Rules</h3>
                <ul className="space-y-3">
                  {venue.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span className="text-stone-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-800">Customer Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={venue.rating} />
                      <span className="text-stone-500">Based on {venue.reviewCount} reviews</span>
                    </div>
                  </div>
                </div>
                <ReviewsList reviews={venue.reviewsList || []} />
              </div>
            )}

            {activeTab === 'stays' && (
              <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-4">Nearby Accommodation</h3>
                {venue.coordinates && venue.nearbyStays && (
                  <NearbyStaysMap venue={venue} stays={venue.nearbyStays} />
                )}
                <div className="space-y-4 mt-6">
                  {(venue.nearbyStays || []).map(stay => (
                    <AccommodationCard key={stay.id} stay={stay} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-4">Book Your Session</h3>

            {venue.bookingType === 'free' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎣</div>
                <h4 className="text-lg font-semibold text-green-600 mb-2">Free Access</h4>
                <p className="text-stone-500 text-sm">No booking required. Just turn up with your rod licence!</p>
              </div>
            ) : (
              <div>
                <SimpleDatePicker
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  availability={venue.availability || {}}
                />

                {selectedDate && (
                  <div className="mt-4 p-4 bg-teal-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-600">Selected date:</span>
                      <span className="font-semibold text-stone-800">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    {venue.availability?.[selectedDate]?.price && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-stone-600">Price:</span>
                        <span className="font-semibold text-stone-800">£{venue.availability[selectedDate].price}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={!selectedDate && venue.bookingType === 'instant'}
                  className={`w-full mt-4 py-3 rounded-xl font-semibold transition-colors ${
                    venue.bookingType === 'instant'
                      ? 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {venue.bookingType === 'instant' ? 'Book Now' : 'Send Enquiry'}
                </button>

                {venue.bookingType === 'enquiry' && (
                  <p className="text-xs text-stone-500 text-center mt-3">
                    This venue requires an enquiry. The owner will respond within 24 hours.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// INSTRUCTOR DETAIL PAGE
// ============================================================================

const InstructorDetailPage = ({ onNavigate, params }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const instructor = instructors.find(i => i.id === params?.id);

  if (!instructor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Instructor not found</h2>
        <button onClick={() => onNavigate('instructors')} className="text-teal-600 hover:text-teal-700">
          Back to instructors
        </button>
      </div>
    );
  }

  // Convert availability array to object format for calendar
  const availabilityObj = {};
  (instructor.availability || []).forEach(date => {
    availabilityObj[date] = { status: 'available', price: instructor.price };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-teal-600">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('instructors')} className="hover:text-teal-600">Guides & Instructors</button>
        <span>/</span>
        <span className="text-stone-800">{instructor.name}</span>
      </div>

      {/* Photo Gallery */}
      <PhotoCarousel images={instructor.gallery || []} title={instructor.name} />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">{instructor.name}</h1>
            <div className="flex items-center gap-4 text-stone-500 mb-4">
              <div className="flex items-center gap-1">
                <Icons.MapPin />
                <span>{instructor.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <StarRating rating={instructor.rating} />
                <span>({instructor.reviewCount} reviews)</span>
              </div>
            </div>
            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {instructor.certifications.map(cert => (
                <CertificationBadge key={cert} cert={cert} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-stone-800">£{instructor.price}</div>
            <div className="text-stone-500">per day</div>
            <div className="text-sm text-teal-600 mt-1">{instructor.experience} experience</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-4">About {instructor.name.split(' ')[0]}</h3>
            <p className="text-stone-600 leading-relaxed">{instructor.bio}</p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="font-medium text-stone-800 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map(spec => (
                    <span key={spec} className="bg-teal-100 text-teal-700 text-sm px-3 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="font-medium text-stone-800 mb-2">Details</h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>Languages: {instructor.languages.join(', ')}</li>
                  <li>Max group size: {instructor.maxGroupSize} anglers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Typical Day */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-6">A Typical Day</h3>
            <TypicalDayTimeline schedule={instructor.typicalDay || []} />
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-stone-800">Reviews</h3>
              <div className="flex items-center gap-2">
                <StarRating rating={instructor.rating} />
                <span className="text-stone-500">({instructor.reviewCount})</span>
              </div>
            </div>
            <ReviewsList reviews={instructor.reviewsList || []} />
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Calendar Booking (if available) */}
            {instructor.hasCalendar && (
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Book a Session</h3>
                <SimpleDatePicker
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  availability={availabilityObj}
                />

                {selectedDate && (
                  <div className="mt-4 p-4 bg-teal-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-600">Selected:</span>
                      <span className="font-semibold text-stone-800">
                        {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-stone-600">Price:</span>
                      <span className="font-semibold text-stone-800">£{instructor.price}</span>
                    </div>
                  </div>
                )}

                <button
                  disabled={!selectedDate}
                  className="w-full mt-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
                >
                  Book Now
                </button>
              </div>
            )}

            {/* Contact Form */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">
                {instructor.hasCalendar ? 'Or Send a Message' : 'Get in Touch'}
              </h3>

              {!showContactForm ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Icons.Mail />
                    Send Message
                  </button>
                  <button className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 flex items-center justify-center gap-2 transition-colors">
                    <Icons.Phone />
                    Request Call Back
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); setShowContactForm(false); }}>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                    <input type="text" required className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                    <textarea rows="4" required className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Tell them about your experience level and what you'd like to learn..." />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                      Send
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INSTRUCTORS PAGE
// ============================================================================

const InstructorsPage = ({ onNavigate }) => {
  const [regionFilter, setRegionFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  const allSpecialties = [...new Set(instructors.flatMap(i => i.specialties))];

  const filteredInstructors = instructors.filter(instructor => {
    if (regionFilter && instructor.region !== regionFilter) return false;
    if (specialtyFilter && !instructor.specialties.includes(specialtyFilter)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">Fishing Guides & Instructors</h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto">
          Learn from the UK's finest fishing guides. Whether you're a complete beginner or looking to master advanced techniques, our certified instructors will help you improve.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="px-4 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Specialties</option>
          {allSpecialties.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        {(regionFilter || specialtyFilter) && (
          <button
            onClick={() => { setRegionFilter(''); setSpecialtyFilter(''); }}
            className="px-4 py-2 text-teal-600 hover:text-teal-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInstructors.map(instructor => (
          <InstructorCard
            key={instructor.id}
            instructor={instructor}
            onClick={() => onNavigate('instructor', { id: instructor.id })}
          />
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className="text-center py-16">
          <Icons.Users />
          <h3 className="text-xl font-semibold text-stone-800 mt-4 mb-2">No instructors found</h3>
          <p className="text-stone-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'search':
        return <SearchResultsPage onNavigate={navigate} params={pageParams} />;
      case 'venue':
        return <VenueDetailPage onNavigate={navigate} params={pageParams} />;
      case 'instructor':
        return <InstructorDetailPage onNavigate={navigate} params={pageParams} />;
      case 'instructors':
        return <InstructorsPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Nav currentPage={currentPage} onNavigate={navigate} />
      <main>{renderPage()}</main>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                  <Icons.Fish />
                </div>
                <span className="text-xl font-bold text-white">TightLines</span>
              </div>
              <p className="text-sm">
                The UK's leading fishing booking platform. Find and book day tickets, guides, and experiences across England, Scotland, Wales, and Northern Ireland.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Fishing</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('search', { type: 'game' })} className="hover:text-teal-400">Game Fishing</button></li>
                <li><button onClick={() => navigate('search', { type: 'coarse' })} className="hover:text-teal-400">Coarse Fishing</button></li>
                <li><button onClick={() => navigate('search', { type: 'sea' })} className="hover:text-teal-400">Sea Fishing</button></li>
                <li><button onClick={() => navigate('instructors')} className="hover:text-teal-400">Guides & Instructors</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Regions</h4>
              <ul className="space-y-2 text-sm">
                {regions.slice(0, 4).map(region => (
                  <li key={region.id}>
                    <button onClick={() => navigate('search', { region: region.id })} className="hover:text-teal-400">
                      {region.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400">List Your Water</a></li>
                <li><a href="#" className="hover:text-teal-400">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-sm text-center">
            © 2026 TightLines. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
