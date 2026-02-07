const { useState, useEffect } = React;

// ============================================
// UK REGIONS DATA
// ============================================
const ukRegions = [
  { id: 'scotland', name: 'Scotland', waters: 156, image: 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)', description: 'Legendary salmon rivers & wild lochs' },
  { id: 'wales', name: 'Wales', waters: 89, image: 'linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)', description: 'Pristine rivers & reservoir trout' },
  { id: 'southwest', name: 'South West', waters: 124, image: 'linear-gradient(135deg, #4a6a5a 0%, #2a4a3a 100%)', description: 'Wild moorland streams & sea fishing' },
  { id: 'south', name: 'South', waters: 98, image: 'linear-gradient(135deg, #3a6a5a 0%, #1a4a3a 100%)', description: 'Famous chalk streams' },
  { id: 'southeast', name: 'South East', waters: 142, image: 'linear-gradient(135deg, #5a7a6a 0%, #3a5a4a 100%)', description: 'Specimen carp & commercial fisheries' },
  { id: 'midlands', name: 'Midlands', waters: 167, image: 'linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)', description: 'Canal fishing & mixed coarse' },
  { id: 'north', name: 'North', waters: 134, image: 'linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)', description: 'Wild brown trout & grayling' },
  { id: 'eastanglia', name: 'East Anglia', waters: 78, image: 'linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)', description: 'Broads pike & specimen tench' },
];

// UK SPECIES DATA
const ukSpecies = [
  { name: 'Atlantic Salmon', type: 'game', icon: '🐟', waters: 89 },
  { name: 'Brown Trout', type: 'game', icon: '🐟', waters: 234 },
  { name: 'Rainbow Trout', type: 'game', icon: '🐟', waters: 312 },
  { name: 'Grayling', type: 'game', icon: '🐟', waters: 67 },
  { name: 'Common Carp', type: 'coarse', icon: '🐟', waters: 445 },
  { name: 'Pike', type: 'coarse', icon: '🐟', waters: 189 },
  { name: 'Tench', type: 'coarse', icon: '🐟', waters: 156 },
  { name: 'Barbel', type: 'coarse', icon: '🐟', waters: 78 },
  { name: 'Perch', type: 'coarse', icon: '🐟', waters: 234 },
  { name: 'Bream', type: 'coarse', icon: '🐟', waters: 198 },
  { name: 'Bass', type: 'sea', icon: '🐟', waters: 56 },
  { name: 'Cod', type: 'sea', icon: '🐟', waters: 34 },
];

// FISHERIES DATA
const fisheries = [
  { id: 1, name: "River Wye - Letton Beat", type: "game", waterType: "River Beat", location: "Herefordshire", region: "Wales", species: ["Atlantic Salmon", "Brown Trout", "Grayling"], price: 150, priceType: "per rod/day", rating: 4.9, reviews: 47, image: "linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)", gallery: ["linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)", "linear-gradient(135deg, #3d6a5a 0%, #2a4a40 100%)"], bookingType: "enquiry", featured: true, topRated: true,
    shortDescription: "One of the finest salmon beats on the Wye, offering 1.5 miles of double-bank fishing.",
    fullDescription: "The Letton Beat represents some of the most productive salmon fishing the River Wye has to offer. Stretching for 1.5 miles of double-bank fishing, this historic beat has been managed for over a century.\n\nThe water comprises pools, glides, and faster runs. Notable lies include the Cathedral Pool and the Ash Tree Run.",
    season: { opens: "1st February", closes: "17th October", bestMonths: ["March", "April", "September", "October"] },
    expectations: { averageCatch: "2-3 salmon per rod over 3 days", recordFish: "28lb salmon", blankRate: "30%" },
    amenities: ["Fishing hut", "Ghillie available", "Wading access", "Parking", "Lunch available"],
    rules: ["Barbless hooks only", "Catch & release for salmon", "No night fishing"],
    contact: { name: "Edward Williams", email: "fishing@lettonbeat.co.uk" }, rods: 4 },
  { id: 2, name: "Chew Valley Lake", type: "game", waterType: "Stillwater Reservoir", location: "Somerset", region: "South West", species: ["Rainbow Trout", "Brown Trout"], price: 45, priceType: "day ticket", rating: 4.7, reviews: 124, image: "linear-gradient(135deg, #4a6fa5 0%, #2d4a6a 100%)", gallery: ["linear-gradient(135deg, #4a6fa5 0%, #2d4a6a 100%)"], bookingType: "instant", featured: true, topRated: true,
    shortDescription: "A prestigious 1,200-acre reservoir renowned for quality trout and exceptional fly hatches.",
    fullDescription: "Chew Valley Lake is one of England's premier stillwater trout fisheries. The lake is stocked with rainbow trout averaging 2-3lbs, plus wild browns to 8lbs.\n\nProlific hatches of buzzers, sedges, and olives provide consistent fishing throughout the season.",
    season: { opens: "Mid-March", closes: "End October", bestMonths: ["April", "May", "September"] },
    expectations: { averageCatch: "3-4 fish per day", recordFish: "11lb 8oz brown", blankRate: "Less than 10%" },
    amenities: ["Lodge restaurant", "Tackle shop", "Boat hire", "Toilets", "Parking"],
    rules: ["Fly only", "4 fish limit", "Barbless for C&R"],
    contact: { name: "Fishery Office", email: "info@chewvalleylake.co.uk" }, rods: 50 },
  { id: 3, name: "Linear Fisheries - Manor Farm", type: "coarse", waterType: "Specimen Lake", location: "Oxfordshire", region: "South East", species: ["Carp", "Tench", "Bream", "Pike"], price: 25, priceType: "day ticket", rating: 4.8, reviews: 312, image: "linear-gradient(135deg, #5a7a4a 0%, #3a5a2a 100%)", gallery: ["linear-gradient(135deg, #5a7a4a 0%, #3a5a2a 100%)"], bookingType: "instant", featured: false, topRated: true,
    shortDescription: "Well-established specimen lakes known for big carp to 40lb+ in beautiful countryside.",
    fullDescription: "Linear Fisheries at Manor Farm is one of the UK's most respected carp venues. Multiple lakes offer varied challenges.\n\nSt Johns has carp to 45lb, Hardwick has 30lb+ fish, Manor Farm Lake is ideal for first 20s.",
    season: { opens: "Year-round", closes: "N/A", bestMonths: ["May", "June", "September"] },
    expectations: { averageCatch: "2-5 carp per session", recordFish: "45lb 8oz mirror", blankRate: "Rare" },
    amenities: ["Tackle shop", "Café", "Showers", "Night fishing", "Fish care equipment"],
    rules: ["Unhooking mats mandatory", "Barbless hooks", "No keepnets"],
    contact: { name: "Fishery Office", email: "info@linearfisheries.co.uk" }, rods: 30 },
  { id: 4, name: "River Tweed - Junction Beat", type: "game", waterType: "River Beat", location: "Scottish Borders", region: "Scotland", species: ["Atlantic Salmon", "Sea Trout"], price: 350, priceType: "per rod/day", rating: 5.0, reviews: 28, image: "linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)", gallery: ["linear-gradient(135deg, #3a5a6a 0%, #1a3a4a 100%)"], bookingType: "enquiry", featured: true, topRated: true,
    shortDescription: "The legendary Junction Pool - arguably the most famous salmon lie in Scotland.",
    fullDescription: "The Junction Beat encompasses one of the most storied salmon lies in the world. The Junction Pool, where the Teviot meets the Tweed, has produced countless memorable fish.\n\nAn experienced ghillie is included.",
    season: { opens: "1st February", closes: "30th November", bestMonths: ["October", "November"] },
    expectations: { averageCatch: "Quality over quantity", recordFish: "30lb+ fish recorded", blankRate: "Challenging" },
    amenities: ["Ghillie included", "Fishing hut", "Lunch provided", "Waders available"],
    rules: ["Fly only", "Catch & release", "Ghillie guidance required"],
    contact: { name: "Alastair MacKenzie", email: "fishing@junctionbeat.com" }, rods: 2 },
  { id: 5, name: "River Test - Broadlands", type: "game", waterType: "Chalk Stream", location: "Hampshire", region: "South", species: ["Wild Brown Trout", "Rainbow Trout", "Grayling"], price: 295, priceType: "per rod/day", rating: 4.9, reviews: 52, image: "linear-gradient(135deg, #3a6a5a 0%, #1a4a3a 100%)", gallery: ["linear-gradient(135deg, #3a6a5a 0%, #1a4a3a 100%)"], bookingType: "enquiry", featured: true, topRated: false,
    shortDescription: "Premium chalk stream fishing on one of England's most celebrated rivers.",
    fullDescription: "The Broadlands Estate offers some of the finest chalk stream trout fishing in the world. Crystal-clear water flows through ancient water meadows.\n\nA river keeper is included. This is technical fishing at its finest.",
    season: { opens: "1st May", closes: "15th October", bestMonths: ["May", "June", "September"] },
    expectations: { averageCatch: "4-6 fish is good", recordFish: "Wild brown to 6lb", blankRate: "Rare" },
    amenities: ["River keeper", "Lunch included", "Rod room", "Parking"],
    rules: ["Dry fly & upstream nymph only", "Catch & release wild fish", "Barbless hooks"],
    contact: { name: "James Portman", email: "fishing@broadlands.co.uk" }, rods: 4 },
  { id: 6, name: "Grafham Water", type: "game", waterType: "Stillwater Reservoir", location: "Cambridgeshire", region: "East Anglia", species: ["Rainbow Trout", "Brown Trout"], price: 38, priceType: "day ticket", rating: 4.6, reviews: 89, image: "linear-gradient(135deg, #4a5a7a 0%, #2a3a5a 100%)", gallery: ["linear-gradient(135deg, #4a5a7a 0%, #2a3a5a 100%)"], bookingType: "instant", featured: false, topRated: false,
    shortDescription: "Large reservoir with excellent bank and boat fishing for quality trout.",
    fullDescription: "Grafham Water is one of England's premier trout reservoirs. Bank and boat fishing available.",
    season: { opens: "April", closes: "October", bestMonths: ["May", "June"] },
    expectations: { averageCatch: "3-5 fish", recordFish: "9lb rainbow", blankRate: "15%" },
    amenities: ["Lodge", "Boat hire", "Tackle shop"],
    rules: ["Fly only", "8 fish limit"],
    contact: { name: "Reception", email: "info@grafham.co.uk" }, rods: 100 },
];

// INSTRUCTORS DATA
const instructors = [
  { id: 1, name: "James MacPherson", title: "AAPGAI Master Instructor", specialties: ["Atlantic Salmon", "Spey Casting", "Scottish Rivers"], location: "Scottish Highlands", price: 275, priceType: "full day", rating: 5.0, reviews: 67, image: "linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)",
    bio: "30 years guiding on Scotland's finest salmon rivers. One of the UK's most respected Spey casting instructors.",
    fullBio: "James MacPherson has dedicated his life to Atlantic salmon and Spey casting. Born on the banks of the River Spey, he qualified as an AAPGAI Master Instructor in 1998.",
    teachingPhilosophy: "Everyone can learn to Spey cast well - it's about understanding the mechanics, not strength.",
    whatYouLearn: ["Spey casting mechanics", "Single Spey, double Spey, snake roll", "Reading water", "Fly selection"],
    equipmentProvided: ["Spey rods", "Reels and lines", "Flies", "Waders"],
    certifications: ["AAPGAI Master", "SGAIC", "First Aid"],
    website: "www.speymasterclasses.co.uk",
    testimonials: [{ name: "Robert T.", text: "James transformed my casting in a single day.", date: "Oct 2025" }] },
  { id: 2, name: "Sarah Thornton", title: "GAIA Advanced Instructor", specialties: ["Trout", "Stillwater", "Beginners", "Women's Courses"], location: "Derbyshire", price: 175, priceType: "full day", rating: 4.9, reviews: 89, image: "linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)",
    bio: "Patient, encouraging instruction for newcomers. Specialist in stillwater tactics and women-only courses.",
    fullBio: "Sarah discovered fly fishing at 25. Her empathy for beginners comes from being a late starter herself.",
    teachingPhilosophy: "Fly fishing should be fun from day one. I structure courses so you catch fish quickly.",
    whatYouLearn: ["Casting fundamentals", "Knots and setup", "Reading stillwater", "Fly selection"],
    equipmentProvided: ["Rod and reel", "Flies", "Leaders"],
    certifications: ["GAIA Advanced", "Angling Trust Level 2", "DBS"],
    website: "www.sarahthorntonfly.co.uk",
    testimonials: [{ name: "Jennifer K.", text: "Sarah made everything so approachable. I caught 4 trout!", date: "Sep 2025" }] },
  { id: 3, name: "Tom Ashworth", title: "Specimen Carp Specialist", specialties: ["Carp", "Pike", "Rig Mechanics", "Watercraft"], location: "Cambridgeshire", price: 150, priceType: "full day", rating: 4.8, reviews: 134, image: "linear-gradient(135deg, #6a6a5a 0%, #4a4a3a 100%)",
    bio: "Former match angler turned specimen hunter. Carp to 52lb, helping anglers catch PBs.",
    fullBio: "Tom's practical, no-nonsense approach focuses on what actually works in modern carp fishing.",
    teachingPhilosophy: "Carp fishing is 70% location, 20% presentation, 10% luck. Most focus on the wrong 10%.",
    whatYouLearn: ["Finding carp", "Rig construction", "Bait strategies", "Landing big fish"],
    equipmentProvided: ["Rigs", "Terminal tackle", "Bait"],
    certifications: ["Angling Trust Level 2", "DBS", "First Aid"],
    website: "www.tomashworthcarp.co.uk",
    testimonials: [{ name: "Steve J.", text: "Tom changed how I approach a water. Three new PBs within a month.", date: "Oct 2025" }] },
  { id: 4, name: "Emily Ward", title: "Wild Trout Specialist", specialties: ["Wild Brown Trout", "Small Streams", "Dry Fly", "Tenkara"], location: "Devon", price: 195, priceType: "full day", rating: 4.9, reviews: 56, image: "linear-gradient(135deg, #5a7a6a 0%, #3a5a4a 100%)",
    bio: "Passionate about wild trout on Devon's small streams. Teaches traditional and tenkara techniques.",
    fullBio: "Emily holds permits on miles of rarely-fished Devon streams. A wildlife ecologist by training.",
    teachingPhilosophy: "Small stream fishing is about slowing down and becoming part of the landscape.",
    whatYouLearn: ["Stealth and approach", "Reading small streams", "Dry fly selection", "Tenkara"],
    equipmentProvided: ["Fly rod or tenkara", "Flies", "Lunch"],
    certifications: ["GAIA Level 2", "Wild Trout Trust Guide", "Tenkara Ambassador"],
    website: "www.devonwildtrout.co.uk",
    testimonials: [{ name: "Mark T.", text: "This is what fly fishing should be about - wild fish in wild places.", date: "Jul 2025" }] },
];

// TESTIMONIALS
const testimonials = [
  { name: "David Hughes", location: "Manchester", text: "Found my dream salmon beat through TightLines. The booking was seamless and the beat exceeded expectations. Already planning my return!", rating: 5, fishery: "River Wye" },
  { name: "Emma Richardson", location: "Bristol", text: "As a beginner, I was nervous about booking. TightLines made it easy to find beginner-friendly waters. Now I'm hooked!", rating: 5, fishery: "Chew Valley Lake" },
  { name: "James Cooper", location: "London", text: "The instructor booking feature is brilliant. Sarah's course transformed my casting in just one day.", rating: 5, instructor: "Sarah Thornton" },
];

// ============================================
// ICONS COMPONENT
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
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Award: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  Globe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Quote: () => <svg className="w-6 h-6 text-brand-200" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>,
  Camera: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

// ============================================
// SIGN IN MODAL
// ============================================
const SignInModal = ({ isOpen, onClose, onSignIn }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (mode === 'register' && !name) { setError('Please enter your name'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignIn({ email, name: name || email.split('@')[0] });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><Icons.X /></button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-brand-700"><Icons.Fish /></div>
          <h2 className="text-2xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-stone-500 text-sm mt-1">{mode === 'signin' ? 'Sign in to manage your bookings' : 'Join thousands of anglers'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Icons.User /></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="John Smith" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Icons.Mail /></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Icons.Lock /></span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 transition">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'signin' ? (
            <p className="text-stone-600">Don't have an account? <button onClick={() => setMode('register')} className="text-brand-700 font-medium hover:underline">Sign up</button></p>
          ) : (
            <p className="text-stone-600">Already have an account? <button onClick={() => setMode('signin')} className="text-brand-700 font-medium hover:underline">Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// LIST YOUR WATER MODAL
// ============================================
const ListWaterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', type: 'game', location: '', region: '', description: '', species: [], price: '', amenities: [], contactName: '', contactEmail: '', contactPhone: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const updateForm = (field, value) => setFormData({ ...formData, [field]: value });
  const toggleSpecies = (s) => updateForm('species', formData.species.includes(s) ? formData.species.filter(x => x !== s) : [...formData.species, s]);
  const toggleAmenity = (a) => updateForm('amenities', formData.amenities.includes(a) ? formData.amenities.filter(x => x !== a) : [...formData.amenities, a]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><Icons.Check /></div>
          <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
          <p className="text-stone-600 mb-6">Thank you for listing {formData.name}. Our team will review your submission and be in touch within 48 hours.</p>
          <button onClick={() => { onClose(); setSubmitted(false); setStep(1); }} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">List Your Water</h2>
            <p className="text-stone-500 text-sm">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><Icons.X /></button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-brand-600' : 'bg-stone-200'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Water Name *</label>
              <input type="text" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="e.g. River Test - Manor Beat" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => updateForm('type', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl">
                  <option value="game">Game Fishing</option>
                  <option value="coarse">Coarse Fishing</option>
                  <option value="sea">Sea Fishing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Region *</label>
                <select value={formData.region} onChange={(e) => updateForm('region', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl">
                  <option value="">Select region</option>
                  {ukRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Location / Nearest Town *</label>
              <input type="text" value={formData.location} onChange={(e) => updateForm('location', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="e.g. Stockbridge, Hampshire" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
              <textarea rows={4} value={formData.description} onChange={(e) => updateForm('description', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="Describe your water, what makes it special, what anglers can expect..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Species & Facilities</h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Species Available (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {['Atlantic Salmon', 'Brown Trout', 'Rainbow Trout', 'Grayling', 'Carp', 'Pike', 'Tench', 'Barbel', 'Perch', 'Bream', 'Roach', 'Chub'].map(s => (
                  <button key={s} type="button" onClick={() => toggleSpecies(s)} className={`px-3 py-1.5 rounded-full text-sm transition ${formData.species.includes(s) ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Amenities (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {['Parking', 'Toilets', 'Fishing hut', 'Café/Lodge', 'Tackle shop', 'Boat hire', 'Ghillie/Guide', 'Night fishing', 'Disabled access', 'Dog friendly'].map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 rounded-full text-sm transition ${formData.amenities.includes(a) ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Day Ticket Price (£)</label>
              <input type="number" value={formData.price} onChange={(e) => updateForm('price', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="e.g. 45" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Details</h3>
            <p className="text-stone-500 text-sm">We'll use these details to contact you about your listing.</p>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Name *</label>
              <input type="text" value={formData.contactName} onChange={(e) => updateForm('contactName', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
              <input type="email" value={formData.contactEmail} onChange={(e) => updateForm('contactEmail', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
              <input type="tel" value={formData.contactPhone} onChange={(e) => updateForm('contactPhone', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="07123 456789" />
            </div>
            <div className="bg-brand-50 p-4 rounded-xl">
              <h4 className="font-medium text-brand-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-brand-700 space-y-1">
                <li>• We'll review your submission within 48 hours</li>
                <li>• Our team may contact you for additional details</li>
                <li>• Once approved, your water goes live on TightLines</li>
                <li>• You'll get a dashboard to manage bookings</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-6 border-t border-stone-200">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 border border-stone-300 rounded-xl font-medium hover:bg-stone-50">Back</button>
          ) : <div></div>}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800">Continue</button>
          ) : (
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800">Submit Listing</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// NAVIGATION
// ============================================
const Nav = ({ currentTab, setCurrentTab, setCurrentPage, user, setUser, onSignIn, onListWater }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <button onClick={() => { setCurrentPage('home'); setCurrentTab('waters'); }} className="flex items-center space-x-2 text-brand-700 hover:text-brand-800">
            <Icons.Fish />
            <span className="text-xl font-bold">TightLines</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <button onClick={() => { setCurrentPage('home'); setCurrentTab('waters'); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'waters' ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-50'}`}>Find Waters</button>
            <button onClick={() => { setCurrentPage('instructors'); setCurrentTab('instructors'); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'instructors' ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-50'}`}>Instructors</button>
            <div className="w-px h-6 bg-stone-200 mx-2"></div>
            <button onClick={onListWater} className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-brand-700 transition">List Your Water</button>
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium">{user.name[0]}</div>
                <span className="text-sm font-medium">{user.name}</span>
                <button onClick={() => setUser(null)} className="text-xs text-stone-400 hover:text-stone-600">Sign out</button>
              </div>
            ) : (
              <button onClick={onSignIn} className="ml-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800">Sign In</button>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2"><Icons.Menu /></button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 py-2">
          <button onClick={() => { setCurrentPage('home'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50">Find Waters</button>
          <button onClick={() => { setCurrentPage('instructors'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50">Instructors</button>
          <button onClick={() => { onListWater(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50">List Your Water</button>
          <button onClick={() => { onSignIn(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-brand-700 font-medium">Sign In</button>
        </div>
      )}
    </nav>
  );
};

// Continue in next part...

// ============================================
// CARD COMPONENTS
// ============================================
const FisheryCard = ({ fishery, onClick }) => {
  const typeColors = { game: 'bg-blue-50 text-blue-700', coarse: 'bg-green-50 text-green-700', sea: 'bg-cyan-50 text-cyan-700' };
  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer group">
      <div className="h-48 relative" style={{ background: fishery.image }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[fishery.type]}`}>{fishery.type === 'game' ? 'Game' : fishery.type === 'coarse' ? 'Coarse' : 'Sea'}</span>
          {fishery.topRated && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Top Rated</span>}
        </div>
        {fishery.bookingType === 'instant' && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500 text-white">Instant Book</span>}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-white/90 text-sm">{fishery.waterType}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-stone-900 group-hover:text-brand-700 transition mb-1">{fishery.name}</h3>
        <div className="flex items-center text-sm text-stone-500 mb-2"><Icons.MapPin /><span className="ml-1">{fishery.location}, {fishery.region}</span></div>
        <p className="text-stone-600 text-sm mb-3 line-clamp-2">{fishery.shortDescription}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {fishery.species.slice(0, 3).map(s => <span key={s} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full">{s}</span>)}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1"><Icons.Star /><span className="font-medium">{fishery.rating}</span><span className="text-stone-400 text-sm">({fishery.reviews})</span></div>
          <div><span className="text-lg font-bold text-stone-900">£{fishery.price}</span><span className="text-stone-500 text-sm ml-1">/{fishery.priceType}</span></div>
        </div>
      </div>
    </div>
  );
};

const InstructorCard = ({ instructor, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg transition cursor-pointer group">
    <div className="flex">
      <div className="w-32 md:w-40 h-full min-h-[200px] flex-shrink-0" style={{ background: instructor.image }}></div>
      <div className="flex-1 p-5">
        <h3 className="font-semibold text-lg text-stone-900 group-hover:text-brand-700 transition">{instructor.name}</h3>
        <p className="text-brand-600 text-sm mb-2">{instructor.title}</p>
        <div className="flex items-center text-sm text-stone-500 mb-3"><Icons.MapPin /><span className="ml-1">{instructor.location}</span></div>
        <div className="flex flex-wrap gap-1 mb-3">
          {instructor.specialties.slice(0, 3).map(s => <span key={s} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full">{s}</span>)}
        </div>
        <p className="text-stone-600 text-sm mb-3 line-clamp-2">{instructor.bio}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><Icons.Star /><span className="font-medium">{instructor.rating}</span><span className="text-stone-400 text-sm">({instructor.reviews})</span></div>
          <div><span className="text-lg font-bold">£{instructor.price}</span><span className="text-stone-500 text-sm">/{instructor.priceType}</span></div>
        </div>
      </div>
    </div>
  </div>
);

const RegionCard = ({ region, onClick }) => (
  <div onClick={onClick} className="relative rounded-2xl overflow-hidden cursor-pointer group h-40">
    <div className="absolute inset-0" style={{ background: region.image }}></div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition"></div>
    <div className="absolute bottom-4 left-4 right-4 text-white">
      <h3 className="font-semibold text-lg">{region.name}</h3>
      <p className="text-white/80 text-sm">{region.waters} waters</p>
    </div>
  </div>
);

const SpeciesCard = ({ species, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center p-4 bg-white rounded-xl border border-stone-200 hover:border-brand-300 hover:shadow-md transition group">
    <span className="text-3xl mb-2">{species.icon}</span>
    <span className="font-medium text-stone-800 group-hover:text-brand-700 text-sm text-center">{species.name}</span>
    <span className="text-xs text-stone-400">{species.waters} waters</span>
  </button>
);

// ============================================
// HOMEPAGE
// ============================================
const HomePage = ({ onSearch, onSelectFishery, onSelectRegion }) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const featured = fisheries.filter(f => f.featured);
  const topRated = fisheries.filter(f => f.topRated);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-400 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">Find & Book the Best Fishing in the UK</h1>
            <p className="text-lg md:text-xl text-brand-100">From legendary salmon beats to specimen carp lakes. Discover 500+ waters across Britain.</p>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Where do you want to fish?</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Icons.MapPin /></span>
                    <input type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="River, lake, or region..." className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Fishing Type</label>
                  <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-600 bg-white focus:ring-2 focus:ring-brand-500">
                    <option value="">All Types</option>
                    <option value="game">Game Fishing</option>
                    <option value="coarse">Coarse Fishing</option>
                    <option value="sea">Sea Fishing</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={onSearch} className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition flex items-center justify-center gap-2">
                    <Icons.Search /><span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-10 text-center">
            <div><span className="text-3xl font-bold">500+</span><p className="text-brand-200 text-sm">Waters</p></div>
            <div><span className="text-3xl font-bold">150+</span><p className="text-brand-200 text-sm">River Beats</p></div>
            <div><span className="text-3xl font-bold">80+</span><p className="text-brand-200 text-sm">Instructors</p></div>
            <div><span className="text-3xl font-bold">12k+</span><p className="text-brand-200 text-sm">Bookings</p></div>
          </div>
        </div>
      </section>

      {/* Popular Regions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Explore by Region</h2>
              <p className="text-stone-600 mt-1">From Scottish highlands to southern chalk streams</p>
            </div>
            <button onClick={onSearch} className="hidden md:flex items-center text-brand-700 hover:text-brand-800 font-medium">View all <Icons.ChevronRight /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ukRegions.slice(0, 8).map(r => <RegionCard key={r.id} region={r} onClick={() => onSelectRegion(r)} />)}
          </div>
        </div>
      </section>

      {/* Popular Species */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">What Do You Want to Catch?</h2>
            <p className="text-stone-600 mt-1">Find waters by your target species</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {ukSpecies.slice(0, 12).map(s => <SpeciesCard key={s.name} species={s} onClick={onSearch} />)}
          </div>
        </div>
      </section>

      {/* Featured Waters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Featured Waters</h2>
              <p className="text-stone-600 mt-1">Hand-picked fisheries offering exceptional sport</p>
            </div>
            <button onClick={onSearch} className="hidden md:flex items-center text-brand-700 hover:text-brand-800 font-medium">View all <Icons.ChevronRight /></button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(f => <FisheryCard key={f.id} fishery={f} onClick={() => onSelectFishery(f)} />)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How TightLines Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Icons.Search />, title: "Search", desc: "Browse 500+ waters across the UK. Filter by species, region, or fishing type." },
              { icon: <Icons.Calendar />, title: "Book", desc: "Book day tickets instantly or send enquiries for premium beats with ghillies." },
              { icon: <Icons.Fish />, title: "Fish", desc: "Get your confirmation, arrive prepared, and enjoy your day on the water!" }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">{step.icon}</div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-brand-100">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What Anglers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <Icons.Quote />
                <p className="text-stone-700 my-4">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{t.name}</p>
                    <p className="text-stone-500 text-sm">{t.location}</p>
                  </div>
                  <div className="flex">{[...Array(t.rating)].map((_, i) => <Icons.Star key={i} />)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <Icons.Shield />, title: "Secure Booking", desc: "Safe payments" },
              { icon: <Icons.Check />, title: "Verified Waters", desc: "Quality assured" },
              { icon: <Icons.Heart />, title: "24/7 Support", desc: "We're here to help" },
              { icon: <Icons.Award />, title: "Best Price", desc: "Guaranteed rates" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-brand-600 mb-2">{item.icon}</div>
                <h4 className="font-semibold text-stone-900">{item.title}</h4>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4"><Icons.Fish /><span className="text-xl font-bold">TightLines</span></div>
              <p className="text-sm">The UK's premier fishing booking platform. Find and book your perfect day on the water.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Anglers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Search Waters</a></li>
                <li><a href="#" className="hover:text-white">Find Instructors</a></li>
                <li><a href="#" className="hover:text-white">Gift Vouchers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Fisheries</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">List Your Water</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-sm text-center">© 2026 TightLines. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// SEARCH RESULTS PAGE
// ============================================
const SearchResultsPage = ({ onSelectFishery, onBack }) => {
  const [filters, setFilters] = useState({ type: '', region: '', waterType: '' });
  const [sortBy, setSortBy] = useState('rating');

  const filteredFisheries = fisheries
    .filter(f => !filters.type || f.type === filters.type)
    .filter(f => !filters.region || f.region === filters.region)
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'price-low' ? a.price - b.price : b.price - a.price);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Search header */}
      <div className="bg-brand-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button onClick={onBack} className="flex items-center text-brand-200 hover:text-white mb-4"><Icons.ChevronLeft /><span>Back to Home</span></button>
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Water</h1>
          <p className="text-brand-100">Browse {filteredFisheries.length} waters across the UK</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fishing Type</label>
                  <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                    <option value="">All Types</option>
                    <option value="game">Game Fishing</option>
                    <option value="coarse">Coarse Fishing</option>
                    <option value="sea">Sea Fishing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Region</label>
                  <select value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                    <option value="">All Regions</option>
                    {ukRegions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <button onClick={() => setFilters({ type: '', region: '', waterType: '' })} className="w-full py-2 text-sm text-brand-700 hover:bg-brand-50 rounded-lg transition">Clear Filters</button>
              </div>
            </div>
          </div>

          {/* Results grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-stone-600">{filteredFisheries.length} waters found</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white">
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredFisheries.map(f => <FisheryCard key={f.id} fishery={f} onClick={() => onSelectFishery(f)} />)}
            </div>
            {filteredFisheries.length === 0 && (
              <div className="text-center py-16">
                <Icons.Fish />
                <p className="text-stone-500 mt-4">No waters match your filters. Try adjusting your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// VENUE DETAIL PAGE
// ============================================
const VenueDetailPage = ({ fishery, onBack, user, onSignIn }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleBooking = () => {
    if (!user) { onSignIn(); return; }
    setBookingSubmitted(true);
  };

  if (bookingSubmitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><Icons.Check /></div>
          <h2 className="text-2xl font-bold mb-2">{fishery.bookingType === 'instant' ? 'Booking Confirmed!' : 'Enquiry Sent!'}</h2>
          <p className="text-stone-600 mb-6">
            {fishery.bookingType === 'instant'
              ? `Your day ticket for ${fishery.name} has been booked. Check your email for confirmation.`
              : `Your enquiry has been sent to ${fishery.name}. They'll respond within 24-48 hours.`}
          </p>
          <button onClick={onBack} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800">Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Image */}
      <div className="h-64 md:h-96 relative" style={{ background: fishery.gallery?.[selectedImage] || fishery.image }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <button onClick={onBack} className="absolute top-4 left-4 px-4 py-2 bg-white/90 rounded-lg flex items-center gap-2 text-stone-700 hover:bg-white transition"><Icons.ChevronLeft /> Back</button>
        {fishery.gallery && fishery.gallery.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            {fishery.gallery.map((_, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`w-12 h-12 rounded-lg border-2 ${i === selectedImage ? 'border-white' : 'border-white/50'}`} style={{ background: fishery.gallery[i] }}></button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{fishery.name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center text-stone-500"><Icons.MapPin /><span className="ml-1">{fishery.location}, {fishery.region}</span></span>
                      <span className="flex items-center gap-1"><Icons.Star /><span className="font-medium">{fishery.rating}</span><span className="text-stone-400">({fishery.reviews} reviews)</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fishery.species.map(s => <span key={s} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">{s}</span>)}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-stone-200">
                {['overview', 'details', 'rules'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium capitalize transition ${activeTab === tab ? 'text-brand-700 border-b-2 border-brand-700' : 'text-stone-500 hover:text-stone-700'}`}>{tab}</button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">About This Water</h3>
                      <p className="text-stone-600 whitespace-pre-line">{fishery.fullDescription}</p>
                    </div>
                    {fishery.season && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Season</h3>
                        <p className="text-stone-600">Opens: {fishery.season.opens} • Closes: {fishery.season.closes}</p>
                        {fishery.season.bestMonths && <p className="text-stone-600 mt-1">Best months: {fishery.season.bestMonths.join(', ')}</p>}
                      </div>
                    )}
                    {fishery.expectations && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">What to Expect</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-stone-50 rounded-lg p-4"><p className="text-sm text-stone-500">Average catch</p><p className="font-medium">{fishery.expectations.averageCatch}</p></div>
                          <div className="bg-stone-50 rounded-lg p-4"><p className="text-sm text-stone-500">Record fish</p><p className="font-medium">{fishery.expectations.recordFish}</p></div>
                          <div className="bg-stone-50 rounded-lg p-4"><p className="text-sm text-stone-500">Blank rate</p><p className="font-medium">{fishery.expectations.blankRate}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {fishery.amenities && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {fishery.amenities.map(a => <span key={a} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"><Icons.Check /> {a}</span>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Water Type</h3>
                      <p className="text-stone-600">{fishery.waterType}</p>
                    </div>
                    {fishery.rods && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Rod Allocation</h3>
                        <p className="text-stone-600">{fishery.rods} rods available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Fishery Rules</h3>
                    {fishery.rules ? (
                      <ul className="space-y-2">
                        {fishery.rules.map((r, i) => <li key={i} className="flex items-start gap-2 text-stone-600"><span className="text-brand-600 mt-1"><Icons.Check /></span>{r}</li>)}
                      </ul>
                    ) : <p className="text-stone-500">Contact the fishery for specific rules.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-stone-900">£{fishery.price}</span>
                <span className="text-stone-500 ml-1">/{fishery.priceType}</span>
              </div>

              {fishery.bookingType === 'instant' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Select Date</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  </div>
                  <button onClick={handleBooking} disabled={!selectedDate} className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    {user ? 'Book Now' : 'Sign In to Book'}
                  </button>
                  <p className="text-center text-sm text-stone-500">Instant confirmation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-stone-600 text-center">This is a premium beat with limited availability. Send an enquiry to check dates.</p>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Date(s)</label>
                    <input type="text" placeholder="e.g. 15-17 September 2026" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                    <textarea rows={3} value={enquiryMessage} onChange={e => setEnquiryMessage(e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="Tell them about your experience, number in party, etc." />
                  </div>
                  <button onClick={handleBooking} className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition">
                    {user ? 'Send Enquiry' : 'Sign In to Enquire'}
                  </button>
                </div>
              )}

              {fishery.contact && (
                <div className="mt-6 pt-6 border-t border-stone-200 text-center">
                  <p className="text-sm text-stone-500">Questions? Contact</p>
                  <p className="font-medium text-stone-800">{fishery.contact.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INSTRUCTORS PAGE
// ============================================
const InstructorsPage = ({ onSelectInstructor, onBack }) => {
  const [filters, setFilters] = useState({ specialty: '' });

  const specialties = [...new Set(instructors.flatMap(i => i.specialties))];
  const filteredInstructors = instructors.filter(i => !filters.specialty || i.specialties.includes(filters.specialty));

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-brand-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Find a Fishing Instructor</h1>
          <p className="text-brand-100">Learn from {instructors.length} certified instructors across the UK</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <h3 className="font-semibold mb-4">Filter by Specialty</h3>
              <div className="space-y-2">
                <button onClick={() => setFilters({ specialty: '' })} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!filters.specialty ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'}`}>All Instructors</button>
                {specialties.slice(0, 10).map(s => (
                  <button key={s} onClick={() => setFilters({ specialty: s })} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${filters.specialty === s ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor list */}
          <div className="flex-1 space-y-4">
            {filteredInstructors.map(i => <InstructorCard key={i.id} instructor={i} onClick={() => onSelectInstructor(i)} />)}
            {filteredInstructors.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-stone-500">No instructors match your filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INSTRUCTOR DETAIL PAGE
// ============================================
const InstructorDetailPage = ({ instructor, onBack, user, onSignIn }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');

  const handleBooking = () => {
    if (!user) { onSignIn(); return; }
    setBookingSubmitted(true);
  };

  if (bookingSubmitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><Icons.Check /></div>
          <h2 className="text-2xl font-bold mb-2">Booking Request Sent!</h2>
          <p className="text-stone-600 mb-6">{instructor.name} will review your request and get back to you within 24-48 hours.</p>
          <button onClick={onBack} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800">Back to Instructors</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-brand-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button onClick={onBack} className="flex items-center text-brand-200 hover:text-white mb-4"><Icons.ChevronLeft /><span>Back to Instructors</span></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Profile header */}
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0" style={{ background: instructor.image }}></div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-stone-900">{instructor.name}</h1>
                  <p className="text-brand-600 font-medium mb-2">{instructor.title}</p>
                  <div className="flex items-center text-stone-500 mb-3"><Icons.MapPin /><span className="ml-1">{instructor.location}</span></div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {instructor.specialties.map(s => <span key={s} className="px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-full">{s}</span>)}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Icons.Star /><span className="font-medium">{instructor.rating}</span><span className="text-stone-400">({instructor.reviews} reviews)</span></span>
                    {instructor.website && <a href={'https://' + instructor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-600 hover:text-brand-800"><Icons.Globe /> Website</a>}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-stone-200">
                {['about', 'what you learn', 'reviews'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium capitalize transition ${activeTab === tab ? 'text-brand-700 border-b-2 border-brand-700' : 'text-stone-500 hover:text-stone-700'}`}>{tab}</button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">About {instructor.name.split(' ')[0]}</h3>
                      <p className="text-stone-600">{instructor.fullBio}</p>
                    </div>
                    {instructor.teachingPhilosophy && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Teaching Philosophy</h3>
                        <p className="text-stone-600 italic">"{instructor.teachingPhilosophy}"</p>
                      </div>
                    )}
                    {instructor.certifications && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                          {instructor.certifications.map(c => <span key={c} className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"><Icons.Award /> {c}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'what you learn' && (
                  <div className="space-y-6">
                    {instructor.whatYouLearn && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">What You'll Learn</h3>
                        <ul className="space-y-2">
                          {instructor.whatYouLearn.map((item, i) => <li key={i} className="flex items-start gap-2 text-stone-600"><span className="text-brand-600 mt-1"><Icons.Check /></span>{item}</li>)}
                        </ul>
                      </div>
                    )}
                    {instructor.equipmentProvided && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Equipment Provided</h3>
                        <div className="flex flex-wrap gap-2">
                          {instructor.equipmentProvided.map(e => <span key={e} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">{e}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {instructor.testimonials && instructor.testimonials.length > 0 ? (
                      <div className="space-y-4">
                        {instructor.testimonials.map((t, i) => (
                          <div key={i} className="bg-stone-50 rounded-xl p-4">
                            <p className="text-stone-700 mb-3">"{t.text}"</p>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-stone-800">{t.name}</span>
                              <span className="text-stone-400 text-sm">{t.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-stone-500">No reviews yet.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-stone-900">£{instructor.price}</span>
                <span className="text-stone-500 ml-1">/{instructor.priceType}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Your Experience Level</label>
                  <select className="w-full px-4 py-2.5 border border-stone-300 rounded-xl">
                    <option>Complete Beginner</option>
                    <option>Some Experience</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Message (optional)</label>
                  <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="Tell them what you'd like to focus on..." />
                </div>
                <button onClick={handleBooking} className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition">
                  {user ? 'Request Booking' : 'Sign In to Book'}
                </button>
                <p className="text-center text-sm text-stone-500">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTab, setCurrentTab] = useState('waters');
  const [selectedFishery, setSelectedFishery] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showListWater, setShowListWater] = useState(false);

  const handleSelectFishery = (fishery) => {
    setSelectedFishery(fishery);
    setCurrentPage('venue');
  };

  const handleSelectInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setCurrentPage('instructor-detail');
  };

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Nav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setCurrentPage={setCurrentPage}
        user={user}
        setUser={setUser}
        onSignIn={() => setShowSignIn(true)}
        onListWater={() => setShowListWater(true)}
      />

      {currentPage === 'home' && (
        <HomePage
          onSearch={() => setCurrentPage('search')}
          onSelectFishery={handleSelectFishery}
          onSelectRegion={() => setCurrentPage('search')}
        />
      )}

      {currentPage === 'search' && (
        <SearchResultsPage
          onSelectFishery={handleSelectFishery}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'venue' && selectedFishery && (
        <VenueDetailPage
          fishery={selectedFishery}
          onBack={() => setCurrentPage('search')}
          user={user}
          onSignIn={() => setShowSignIn(true)}
        />
      )}

      {currentPage === 'instructors' && (
        <InstructorsPage
          onSelectInstructor={handleSelectInstructor}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'instructor-detail' && selectedInstructor && (
        <InstructorDetailPage
          instructor={selectedInstructor}
          onBack={() => { setCurrentPage('instructors'); setCurrentTab('instructors'); }}
          user={user}
          onSignIn={() => setShowSignIn(true)}
        />
      )}

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={handleSignIn}
      />

      <ListWaterModal
        isOpen={showListWater}
        onClose={() => setShowListWater(false)}
      />
    </div>
  );
};

// ============================================
// RENDER APP
// ============================================
ReactDOM.createRoot(document.getElementById('root')).render(<App />);