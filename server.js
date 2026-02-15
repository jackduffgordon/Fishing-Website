// TightLines Backend Server - Supabase Version
// Express + Supabase + JWT Auth + Role-Based Access

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'calypsoheights@gmail.com';

// Supabase setup — set these in Render environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set as environment variables.');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper to send emails via Resend (simple HTTP API — no SMTP needed)
const sendEmail = async (to, subject, html) => {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL NOT SENT - RESEND_API_KEY not set] To: ${to}, Subject: ${subject}`);
    return false;
  }
  try {
    console.log(`[EMAIL] Sending to ${to}...`);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TightLines <onboarding@resend.dev>',
        to: [to],
        subject,
        html
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      console.log(`[EMAIL SENT] To: ${to}, ID: ${data.id}`);
      return true;
    } else {
      console.error(`[EMAIL ERROR] ${resp.status}:`, JSON.stringify(data));
      return false;
    }
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    return false;
  }
};

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tightlines-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'dist')));

// ============================================================================
// DATABASE INITIALIZATION & SEED DATA
// ============================================================================

const seedData = async () => {
  try {
    // Check if waters already seeded
    const { count } = await supabase
      .from('waters')
      .select('*', { count: 'exact', head: true });

    if (count > 0) {
      console.log('Database already seeded, skipping seed data.');
      return;
    }

    console.log('Seeding database with initial data...');

    // ---- WATERS (matching the 7 fisheries in app-v3.js) ----
    const defaultWaters = [
      {
        name: 'River Wye - Letton Beat',
        owner_id: null, type: 'game', region: 'wales', price: 85, booking_type: 'enquiry',
        rating: 4.8, review_count: 124,
        species: ['Atlantic Salmon', 'Brown Trout', 'Grayling'],
        description: 'One of the finest salmon beats on the River Wye, offering 1.5 miles of double-bank fishing through stunning Welsh countryside.',
        highlights: ['Double-bank access', '1.5 miles of water', 'Historic salmon beat', 'Wading friendly'],
        facilities: ['parking', 'toilets'],
        rules: ['Catch and release for salmon', 'Barbless hooks only', 'No night fishing', 'Rod licence required'],
        experience_level: 'intermediate',
        season_info: 'Mar-Oct for salmon, year-round for trout',
        coordinates: { lat: 52.1234, lng: -3.0567 },
        gallery: [{ id: 1, gradient: 'from-emerald-600 to-teal-700', label: 'River View' }, { id: 2, gradient: 'from-blue-600 to-cyan-700', label: 'Salmon Pool' }, { id: 3, gradient: 'from-green-600 to-emerald-700', label: 'Autumn Colors' }],
        reviews_list: [{ id: 1, author: 'James M.', rating: 5, date: '2025-10-15', title: 'Exceptional salmon fishing', text: 'Had an incredible day on the Letton Beat.', verified: true }],
        nearby_stays: [{ id: 1, name: "The Angler's Rest B&B", type: 'B&B', distance: '2.3 miles', priceRange: '£85-£120', rating: 4.6, reviewCount: 89, amenities: ['Breakfast', 'Rod storage', 'Drying room'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Loch Awe - Kilchurn Bay',
        owner_id: null, type: 'game', region: 'scotland', price: 45, booking_type: 'instant',
        rating: 4.6, review_count: 89,
        species: ['Brown Trout', 'Rainbow Trout', 'Pike', 'Perch'],
        description: "Fish in the shadow of the iconic Kilchurn Castle on Scotland's longest freshwater loch.",
        highlights: ['Historic castle backdrop', 'Wild brown trout', 'Boat hire available', 'Stunning scenery'],
        facilities: ['parking', 'cafe', 'toilets'],
        rules: ['Boat fishing only in designated areas', 'Pike must be returned', 'No live bait'],
        experience_level: 'beginner',
        season_info: 'Mar-Oct (best May-Sep)',
        coordinates: { lat: 56.4023, lng: -5.0287 },
        gallery: [{ id: 1, gradient: 'from-blue-700 to-indigo-800', label: 'Loch View' }, { id: 2, gradient: 'from-slate-600 to-blue-700', label: 'Kilchurn Castle' }],
        reviews_list: [{ id: 1, author: 'Duncan S.', rating: 5, date: '2025-09-18', title: 'Magical location', text: 'The setting is absolutely stunning.', verified: true }],
        nearby_stays: [{ id: 1, name: 'Kilchurn Lodge', type: 'Guest House', distance: '3.1 miles', priceRange: '£75-£110', rating: 4.5, reviewCount: 67, amenities: ['Breakfast', 'Packed lunches', 'Parking'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Packington Somers Fishery',
        owner_id: null, type: 'coarse', region: 'midlands', price: 25, booking_type: 'instant',
        rating: 4.9, review_count: 312,
        species: ['Carp', 'Tench', 'Bream', 'Roach', 'Perch'],
        description: 'Award-winning coarse fishery set in the historic Packington Estate. Four pristine lakes stocked with specimen carp to 35lb+.',
        highlights: ['Specimen carp to 35lb+', '4 lakes to choose from', 'Well-maintained swims', 'Match & pleasure fishing'],
        facilities: ['parking', 'cafe', 'toilets', 'disabled', 'wifi'],
        rules: ['Barbless hooks only', 'No braided mainline', 'Landing nets must be used', 'Keep nets by arrangement'],
        experience_level: 'beginner',
        season_info: 'Year-round',
        coordinates: { lat: 52.5123, lng: -1.5678 },
        gallery: [{ id: 1, gradient: 'from-green-600 to-emerald-700', label: 'Main Lake' }, { id: 2, gradient: 'from-emerald-600 to-teal-700', label: 'Specimen Lake' }],
        reviews_list: [{ id: 1, author: 'Steve B.', rating: 5, date: '2025-11-02', title: 'Best fishery in the Midlands', text: 'Consistently brilliant fishing.', verified: true }],
        nearby_stays: [{ id: 1, name: 'Packington Hall Hotel', type: 'Hotel', distance: '0.8 miles', priceRange: '£95-£150', rating: 4.4, reviewCount: 203, amenities: ['Restaurant', 'Bar', 'Pool'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Chesil Beach - West Bexington',
        owner_id: null, type: 'sea', region: 'south-west', price: 0, booking_type: 'free',
        rating: 4.5, review_count: 178,
        species: ['Bass', 'Cod', 'Mackerel', 'Pollock', 'Plaice'],
        description: 'Iconic 18-mile shingle beach offering world-class bass fishing and excellent winter cod. Free access.',
        highlights: ['Free fishing', 'World-famous bass venue', '18 miles of beach', 'Jurassic Coast UNESCO site'],
        facilities: ['parking'],
        rules: ['Bass size limits apply', 'No fishing in marked swimming areas', 'Respect other beach users'],
        experience_level: 'intermediate',
        season_info: 'Bass Apr-Nov, Cod Nov-Feb',
        coordinates: { lat: 50.6789, lng: -2.6543 },
        gallery: [{ id: 1, gradient: 'from-blue-500 to-cyan-600', label: 'Beach View' }, { id: 2, gradient: 'from-orange-500 to-amber-600', label: 'Sunset Fishing' }],
        reviews_list: [{ id: 1, author: 'Tom H.', rating: 5, date: '2025-10-28', title: 'Bass fishing at its best', text: 'Nothing beats Chesil for bass.', verified: true }],
        nearby_stays: [{ id: 1, name: 'The Seaside B&B', type: 'B&B', distance: '0.3 miles', priceRange: '£70-£95', rating: 4.3, reviewCount: 112, amenities: ['Sea views', 'Breakfast', 'Bait freezer'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'River Test - Broadlands Estate',
        owner_id: null, type: 'game', region: 'south-england', price: 250, booking_type: 'enquiry',
        rating: 4.9, review_count: 67,
        species: ['Brown Trout', 'Rainbow Trout', 'Grayling'],
        description: 'The legendary River Test at Broadlands - arguably the finest chalk stream fishing in the world.',
        highlights: ['World-famous chalk stream', 'Wild brown trout', 'Pristine water quality', 'Historic estate'],
        facilities: ['parking', 'toilets'],
        rules: ['Dry fly and upstream nymph only', 'Catch and release', 'Wading by arrangement', 'No dogs'],
        experience_level: 'expert',
        season_info: 'May-Sep (best Jun-Jul)',
        coordinates: { lat: 50.9876, lng: -1.5234 },
        gallery: [{ id: 1, gradient: 'from-emerald-500 to-green-600', label: 'Chalk Stream' }, { id: 2, gradient: 'from-teal-500 to-emerald-600', label: 'Mayfly Hatch' }],
        reviews_list: [{ id: 1, author: 'Richard E.', rating: 5, date: '2025-07-22', title: 'Bucket list experience', text: 'Finally fished the Test and it exceeded all expectations.', verified: true }],
        nearby_stays: [{ id: 1, name: 'The Mill at Broadlands', type: 'Hotel', distance: '0.2 miles', priceRange: '£180-£280', rating: 4.9, reviewCount: 89, amenities: ['Restaurant', 'Bar', 'River views'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Linear Fisheries - St Johns',
        owner_id: null, type: 'coarse', region: 'south-england', price: 35, booking_type: 'instant',
        rating: 4.7, review_count: 445,
        species: ['Carp', 'Catfish', 'Tench', 'Bream'],
        description: "One of the UK's premier carp venues with multiple lakes holding fish to over 50lb.",
        highlights: ['Carp to 50lb+', 'Multiple lakes', '24hr fishing available', 'On-site tackle shop'],
        facilities: ['parking', 'cafe', 'toilets', 'night', 'wifi'],
        rules: ['Minimum 42" landing net', 'Unhooking mat required', 'No fixed leads', 'Booking essential'],
        experience_level: 'intermediate',
        season_info: 'Year-round (best Apr-Oct)',
        coordinates: { lat: 51.8234, lng: -1.2345 },
        gallery: [{ id: 1, gradient: 'from-green-700 to-emerald-800', label: 'St Johns Lake' }, { id: 2, gradient: 'from-amber-600 to-orange-700', label: 'Specimen Carp' }],
        reviews_list: [{ id: 1, author: 'Mark C.', rating: 5, date: '2025-10-05', title: 'Incredible carp fishing', text: 'Did a 48hr session and landed 7 carp including a 38lb mirror.', verified: true }],
        nearby_stays: [{ id: 1, name: 'On-site Bivvy Hire', type: 'Bivvy', distance: 'On-site', priceRange: '£30/night', rating: 4.2, reviewCount: 234, amenities: ['Bedchair', 'Sleeping bag', 'Cooking gear'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'River Tweed - Junction Pool',
        owner_id: null, type: 'game', region: 'scotland', price: 150, booking_type: 'enquiry',
        rating: 4.8, review_count: 98,
        species: ['Atlantic Salmon', 'Sea Trout', 'Brown Trout'],
        description: "The famous Junction Pool where the Teviot meets the Tweed. One of Scotland's most productive salmon beats.",
        highlights: ['Famous junction pool', 'Prolific autumn runs', 'Historic fishing huts', 'Experienced ghillies'],
        facilities: ['parking', 'toilets'],
        rules: ['Catch and release encouraged', 'Fly fishing only Sep-Nov', 'Spinning permitted early season'],
        experience_level: 'intermediate',
        season_info: 'Feb-Nov (best Sep-Oct)',
        coordinates: { lat: 55.5989, lng: -2.4367 },
        gallery: [{ id: 1, gradient: 'from-indigo-600 to-purple-700', label: 'Junction Pool' }, { id: 2, gradient: 'from-emerald-600 to-teal-700', label: 'Autumn Run' }],
        reviews_list: [{ id: 1, author: 'Angus M.', rating: 5, date: '2025-10-12', title: 'The ultimate salmon beat', text: 'Hooked into 3 fresh autumn salmon.', verified: true }],
        nearby_stays: [{ id: 1, name: 'Kelso Bridge Hotel', type: 'Hotel', distance: '1.2 miles', priceRange: '£95-£160', rating: 4.6, reviewCount: 134, amenities: ['Restaurant', 'Bar', 'Drying room'] }],
        images: [], status: 'approved', created_at: new Date().toISOString()
      }
    ];

    const { data: insertedWaters, error: waterError } = await supabase
      .from('waters')
      .insert(defaultWaters)
      .select();

    if (waterError) {
      console.error('Error seeding waters:', waterError);
      return;
    }
    console.log(`Seeded ${insertedWaters.length} waters`);

    // ---- BOOKING OPTIONS for each water ----
    // Map water names to their generated UUIDs
    const waterIdMap = {};
    insertedWaters.forEach(w => { waterIdMap[w.name] = w.id; });

    const allBookingOptions = [
      // River Wye
      { water_id: waterIdMap['River Wye - Letton Beat'], category: 'day-tickets', name: 'Day Rod', description: 'Full day on the beat, 1 rod', price: 85, price_type: 'day', booking_type: 'enquiry', sort_order: 0 },
      { water_id: waterIdMap['River Wye - Letton Beat'], category: 'day-tickets', name: 'Half Day Rod', description: 'Morning or afternoon session', price: 55, price_type: 'half-day', booking_type: 'enquiry', sort_order: 1 },
      { water_id: waterIdMap['River Wye - Letton Beat'], category: 'guided', name: 'Guided Day with Ghillie', description: 'Expert ghillie, all advice and assistance', price: 150, price_type: 'day', booking_type: 'enquiry', sort_order: 2 },
      { water_id: waterIdMap['River Wye - Letton Beat'], category: 'accommodation', name: '2-Night Fishing Package', description: '2 nights B&B plus 2 days on the beat', price: 320, price_type: 'person', booking_type: 'enquiry', sort_order: 3 },
      { water_id: waterIdMap['River Wye - Letton Beat'], category: 'extras', name: 'Tackle Hire', description: 'Salmon rod, reel, line and flies', price: 25, price_type: 'day', booking_type: 'instant', sort_order: 4 },
      // Loch Awe
      { water_id: waterIdMap['Loch Awe - Kilchurn Bay'], category: 'day-tickets', name: 'Day Ticket (Bank)', description: 'Full day bank fishing', price: 45, price_type: 'day', booking_type: 'instant', sort_order: 0 },
      { water_id: waterIdMap['Loch Awe - Kilchurn Bay'], category: 'day-tickets', name: 'Day Ticket (Boat)', description: 'Full day with boat hire included', price: 65, price_type: 'day', booking_type: 'instant', sort_order: 1 },
      { water_id: waterIdMap['Loch Awe - Kilchurn Bay'], category: 'day-tickets', name: 'Evening Ticket', description: '4pm to dusk', price: 25, price_type: 'session', booking_type: 'instant', sort_order: 2 },
      { water_id: waterIdMap['Loch Awe - Kilchurn Bay'], category: 'guided', name: 'Guided Boat Trip', description: 'Half day with local guide and boat', price: 120, price_type: 'person', booking_type: 'enquiry', sort_order: 3 },
      { water_id: waterIdMap['Loch Awe - Kilchurn Bay'], category: 'extras', name: 'Boat Hire', description: 'Self-drive rowing boat', price: 30, price_type: 'day', booking_type: 'instant', sort_order: 4 },
      // Packington
      { water_id: waterIdMap['Packington Somers Fishery'], category: 'day-tickets', name: 'Day Ticket', description: 'Dawn to dusk on any lake', price: 25, price_type: 'day', booking_type: 'instant', sort_order: 0 },
      { water_id: waterIdMap['Packington Somers Fishery'], category: 'day-tickets', name: '24hr Ticket', description: '24 hours including night fishing', price: 40, price_type: 'session', booking_type: 'instant', sort_order: 1 },
      { water_id: waterIdMap['Packington Somers Fishery'], category: 'day-tickets', name: '48hr Ticket', description: 'Full weekend session', price: 70, price_type: 'session', booking_type: 'instant', sort_order: 2 },
      { water_id: waterIdMap['Packington Somers Fishery'], category: 'guided', name: 'Beginner Lesson', description: '2hr session with qualified instructor, tackle included', price: 55, price_type: 'person', booking_type: 'instant', sort_order: 3 },
      { water_id: waterIdMap['Packington Somers Fishery'], category: 'extras', name: 'Bait Package', description: 'Boilies, pellets and particles', price: 12, price_type: 'session', booking_type: 'instant', sort_order: 4 },
      // Chesil Beach - no options (free venue)
      // River Test
      { water_id: waterIdMap['River Test - Broadlands Estate'], category: 'day-tickets', name: 'Day Rod', description: 'Full day on the beat, 2 rods', price: 250, price_type: 'day', booking_type: 'enquiry', sort_order: 0 },
      { water_id: waterIdMap['River Test - Broadlands Estate'], category: 'day-tickets', name: 'Half Day Rod', description: 'Morning or afternoon session', price: 160, price_type: 'half-day', booking_type: 'enquiry', sort_order: 1 },
      { water_id: waterIdMap['River Test - Broadlands Estate'], category: 'guided', name: 'Guided Day with Keeper', description: 'Full day with expert river keeper, lunch included', price: 395, price_type: 'day', booking_type: 'enquiry', sort_order: 2 },
      { water_id: waterIdMap['River Test - Broadlands Estate'], category: 'accommodation', name: 'Rod & Lodge Package', description: '2 nights at The Mill plus 2 days fishing', price: 650, price_type: 'person', booking_type: 'enquiry', sort_order: 3 },
      { water_id: waterIdMap['River Test - Broadlands Estate'], category: 'extras', name: 'Tackle Hire', description: 'Complete chalk stream setup including waders', price: 35, price_type: 'day', booking_type: 'instant', sort_order: 4 },
      // Linear Fisheries
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'day-tickets', name: 'Day Ticket', description: 'Dawn to dusk', price: 35, price_type: 'day', booking_type: 'instant', sort_order: 0 },
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'day-tickets', name: '24hr Ticket', description: '24 hours including night fishing', price: 55, price_type: 'session', booking_type: 'instant', sort_order: 1 },
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'day-tickets', name: '48hr Ticket', description: 'Full weekend session with 2 nights', price: 95, price_type: 'session', booking_type: 'instant', sort_order: 2 },
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'accommodation', name: 'Lakeside Lodge', description: 'Private lodge overlooking specimen lake, fishing included', price: 120, price_type: 'night', booking_type: 'enquiry', sort_order: 3 },
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'guided', name: 'Carp Masterclass', description: 'Full day 1-to-1 with pro angler, all tackle provided', price: 150, price_type: 'person', booking_type: 'instant', sort_order: 4 },
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'extras', name: 'Bait Package', description: 'Boilies, pellets and particles', price: 15, price_type: 'session', booking_type: 'instant', sort_order: 5 },
      { water_id: waterIdMap['Linear Fisheries - St Johns'], category: 'extras', name: 'Bivvy Hire', description: '2-man bivvy with bedchair and sleeping bag', price: 30, price_type: 'night', booking_type: 'instant', sort_order: 6 },
      // River Tweed
      { water_id: waterIdMap['River Tweed - Junction Pool'], category: 'day-tickets', name: 'Day Rod', description: 'Full day on the Junction Beat', price: 150, price_type: 'day', booking_type: 'enquiry', sort_order: 0 },
      { water_id: waterIdMap['River Tweed - Junction Pool'], category: 'guided', name: 'Guided Day with Ghillie', description: 'Full day with experienced Tweed ghillie', price: 280, price_type: 'day', booking_type: 'enquiry', sort_order: 1 },
      { water_id: waterIdMap['River Tweed - Junction Pool'], category: 'accommodation', name: '3-Night Salmon Package', description: '3 nights at Kelso Bridge Hotel plus 3 days fishing', price: 750, price_type: 'person', booking_type: 'enquiry', sort_order: 2 },
      { water_id: waterIdMap['River Tweed - Junction Pool'], category: 'extras', name: 'Tackle Hire', description: '15ft Spey rod, reel and flies', price: 30, price_type: 'day', booking_type: 'instant', sort_order: 3 }
    ];

    const { error: optionsError } = await supabase
      .from('booking_options')
      .insert(allBookingOptions);

    if (optionsError) {
      console.error('Error seeding booking options:', optionsError);
    } else {
      console.log(`Seeded ${allBookingOptions.length} booking options`);
    }

    // ---- INSTRUCTORS ----
    const defaultInstructors = [
      {
        name: 'James Morrison', user_id: null, email: 'james@example.com',
        specialties: ['Fly Fishing', 'Salmon', 'Trout'], region: 'scotland',
        experience: '15 years',
        bio: 'AAPGAI qualified instructor specializing in salmon and trout fishing across the Scottish Highlands.',
        price: 250, rating: 4.9, review_count: 67,
        certifications: ['AAPGAI', 'SGAIC'], availability: ['Weekdays', 'Weekends'],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Sarah Williams', user_id: null, email: 'sarah@example.com',
        specialties: ['Carp Fishing', 'Coarse', 'Beginners'], region: 'midlands',
        experience: '10 years',
        bio: 'Passionate about introducing newcomers to fishing. Patient, friendly approach perfect for beginners.',
        price: 150, rating: 4.8, review_count: 89,
        certifications: ['Level 2 Angling Coach'], availability: ['Weekends'],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Mike Thompson', user_id: null, email: 'mike@example.com',
        specialties: ['Sea Fishing', 'Bass', 'Shore Fishing'], region: 'south-west',
        experience: '20 years',
        bio: 'Expert sea angler with decades of experience along the South West coast. Specializing in bass fishing.',
        price: 180, rating: 4.7, review_count: 45,
        certifications: ['RYA Powerboat', 'First Aid'], availability: ['Weekdays', 'Weekends'],
        images: [], status: 'approved', created_at: new Date().toISOString()
      },
      {
        name: 'Emma Clarke', user_id: null, email: 'emma@example.com',
        specialties: ['Fly Tying', 'Fly Fishing', "Women's Courses"], region: 'south-east',
        experience: '8 years',
        bio: 'Dedicated to making fly fishing accessible to everyone. Runs popular women-only introduction courses.',
        price: 175, rating: 4.9, review_count: 72,
        certifications: ['GAIA', 'Level 2 Coach'], availability: ['Weekdays'],
        images: [], status: 'approved', created_at: new Date().toISOString()
      }
    ];

    const { error: instructorError } = await supabase
      .from('instructors')
      .insert(defaultInstructors);

    if (instructorError) {
      console.error('Error seeding instructors:', instructorError);
    } else {
      console.log('Instructors seeded successfully');
    }
  } catch (e) {
    console.error('Seed error:', e);
  }
};

// Create admin user if not exists
const ensureAdminUser = async () => {
  try {
    const { data: admin } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@tightlines.co.uk')
      .single();

    if (!admin) {
      const hashedPwd = await bcrypt.hash('admin123', 10);
      await supabase
        .from('users')
        .insert([{
          email: 'admin@tightlines.co.uk',
          password: hashedPwd,
          name: 'Admin',
          role: 'admin',
          created_at: new Date().toISOString()
        }]);
      console.log('Admin account created: admin@tightlines.co.uk / admin123');
    }
  } catch (e) {
    console.error('Admin user check error:', e);
  }
};

// Initialize on startup
(async () => {
  await ensureAdminUser();
  await seedData();
})();

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
    });
  }
  next();
};

const requireRole = (...roles) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  } catch (e) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        password: hashedPwd,
        name,
        role: 'user',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Registration failed' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Account created', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email?.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      favouriteSpecies: user.favourite_species || '',
      experienceLevel: user.experience_level || 'beginner',
      notifications: user.notifications || { bookings: true, catches: true, newsletters: false, promotions: false },
      privacy: user.privacy || { profilePublic: false, showCatches: true, showFavourites: false }
    }});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, location, bio, favouriteSpecies, experienceLevel } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (bio !== undefined) updates.bio = bio;
    if (favouriteSpecies !== undefined) updates.favourite_species = favouriteSpecies;
    if (experienceLevel !== undefined) updates.experience_level = experienceLevel;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        favouriteSpecies: user.favourite_species,
        experienceLevel: user.experience_level
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Update notification preferences
app.put('/api/auth/notifications', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ notifications: req.body })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Notification preferences updated', notifications: user.notifications });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Update privacy settings
app.put('/api/auth/privacy', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ privacy: req.body })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Privacy settings updated', privacy: user.privacy });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Change password
app.put('/api/auth/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashedPwd = await bcrypt.hash(newPassword, 10);
    await supabase
      .from('users')
      .update({ password: hashedPwd })
      .eq('id', req.user.id);

    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Get user's catches
app.get('/api/catches/user', authenticateToken, async (req, res) => {
  try {
    const { data: catches, error } = await supabase
      .from('catches')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch catches' });
    }

    // Convert snake_case to camelCase for response
    const formattedCatches = catches.map(c => ({
      id: c.id,
      userId: c.user_id,
      waterId: c.water_id,
      species: c.species,
      weight: c.weight,
      method: c.method,
      comment: c.comment,
      createdAt: c.created_at,
      anglerName: c.angler_name
    }));

    res.json({ catches: formattedCatches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch catches' });
  }
});

// Delete account
app.delete('/api/auth/account', authenticateToken, async (req, res) => {
  try {
    // Delete user's catches first
    await supabase
      .from('catches')
      .delete()
      .eq('user_id', req.user.id);

    // Delete user
    await supabase
      .from('users')
      .delete()
      .eq('id', req.user.id);

    res.json({ message: 'Account deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

// Password Reset - generates a new temporary password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      // Don't reveal whether user exists — always show success
      return res.json({ message: 'If that email is registered, a new password has been generated.' });
    }

    // Generate new temporary password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    const hashedPwd = await bcrypt.hash(newPassword, 10);

    await supabase
      .from('users')
      .update({ password: hashedPwd })
      .eq('id', user.id);

    console.log(`\n=== PASSWORD RESET ===`);
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`RESEND_API_KEY configured: ${!!RESEND_API_KEY}`);
    console.log(`=====================\n`);

    // Send email then respond
    const emailResult = await sendEmail(email, 'TightLines - Your Password Has Been Reset', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">TightLines</h1>
          <p style="color: #99f6e4; margin: 8px 0 0;">Password Reset</p>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <p style="color: #44403c;">Hi ${user.name || 'there'},</p>
          <p style="color: #44403c;">Your password has been reset. Here is your new temporary password:</p>
          <div style="background: white; border: 2px solid #0d9488; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <code style="font-size: 20px; font-weight: bold; color: #0d9488; letter-spacing: 2px;">${newPassword}</code>
          </div>
          <p style="color: #78716c; font-size: 14px;">We recommend changing this once you sign in.</p>
          <p style="color: #44403c;">Tight lines!</p>
        </div>
      </div>
    `);

    // Notify admin in background
    sendEmail(ADMIN_EMAIL, `[TightLines] Password reset for ${email}`, `<p>User <strong>${email}</strong> requested a password reset.</p>`).catch(() => {});

    res.json({ message: emailResult ? 'A new password has been sent to your email.' : 'Password has been reset. Check your email.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// ============================================================================
// BOOKING ROUTES
// ============================================================================

app.post('/api/bookings', optionalAuth, async (req, res) => {
  try {
    const { waterId, instructorId, bookingOptionId, date, startDate, endDate, numberOfDays, anglerName, anglerEmail, anglerPhone, message, type } = req.body;
    if (!date && !startDate) return res.status(400).json({ error: 'Date required' });
    if (!anglerName || !anglerEmail) return res.status(400).json({ error: 'Name and email required' });

    const booking = {
      user_id: req.user?.id || null,
      user_name: anglerName,
      user_email: anglerEmail,
      user_phone: anglerPhone || '',
      water_id: waterId || null,
      instructor_id: instructorId || null,
      booking_option_id: bookingOptionId || null,
      date: date || startDate,
      start_date: startDate || date,
      end_date: endDate || startDate || date,
      number_of_days: numberOfDays || 1,
      message: message || '',
      type: type || 'booking',
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    const { data: newBooking, error } = await supabase
      .from('inquiries')
      .insert([booking])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Booking failed' });
    }

    res.json({ message: 'Booking confirmed!', bookingId: newBooking.id, booking: newBooking });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Contact/inquiry endpoint (no auth required for public enquiries)
app.post('/api/contact', async (req, res) => {
  try {
    const { waterId, instructorId, bookingOptionId, name, email, phone, message, date, type } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required' });

    const inquiry = {
      user_id: null,
      user_name: name,
      user_email: email,
      user_phone: phone || '',
      water_id: waterId || null,
      instructor_id: instructorId || null,
      booking_option_id: bookingOptionId || null,
      date: date || null,
      message,
      type: type || 'enquiry',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: newInquiry, error } = await supabase
      .from('inquiries')
      .insert([inquiry])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Submission failed' });
    }

    res.json({ message: 'Enquiry submitted! We\'ll be in touch soon.', inquiryId: newInquiry.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Contact submission failed' });
  }
});

// ============================================================================
// HELPER: Fetch waters with booking options
// ============================================================================

// Convert a booking_options row from snake_case (DB) to camelCase (frontend)
const formatBookingOption = (opt) => ({
  id: opt.id,
  waterId: opt.water_id,
  category: opt.category,
  name: opt.name,
  description: opt.description,
  price: opt.price,
  priceType: opt.price_type,
  bookingType: opt.booking_type,
  sortOrder: opt.sort_order
});

// Convert a water row from snake_case (DB) to camelCase (frontend)
const formatWater = (w) => ({
  id: w.id,
  name: w.name,
  ownerId: w.owner_id,
  ownerName: w.owner_name,
  ownerEmail: w.owner_email,
  ownerPhone: w.owner_phone,
  type: w.type,
  waterBodyType: w.water_body_type,
  region: w.region,
  location: w.location,
  townCity: w.town_city,
  county: w.county,
  postcode: w.postcode,
  description: w.description,
  highlights: w.highlights,
  species: w.species,
  price: w.price,
  priceType: w.price_type,
  bookingType: w.booking_type,
  rating: w.rating,
  reviewCount: w.review_count,
  facilities: w.facilities,
  rules: w.rules,
  images: w.images,
  experienceLevel: w.experience_level,
  typicalSessionHours: w.typical_session_hours,
  bestTimeOfDay: w.best_time_of_day,
  averageCatchRate: w.average_catch_rate,
  blankRate: w.blank_rate,
  recordFish: w.record_fish,
  seasonInfo: w.season_info,
  openingHours: w.opening_hours,
  seasonDates: w.season_dates,
  coordinates: w.coordinates,
  gallery: w.gallery,
  nearbyStays: w.nearby_stays,
  availability: w.availability,
  reviewsList: w.reviews_list,
  status: w.status,
  createdAt: w.created_at,
  bookingOptions: w.bookingOptions || []
});

const getWaterWithBookingOptions = async (waterId) => {
  const { data: water, error: waterError } = await supabase
    .from('waters')
    .select('*')
    .eq('id', waterId)
    .single();

  if (waterError || !water) return null;

  const { data: bookingOptions } = await supabase
    .from('booking_options')
    .select('*')
    .eq('water_id', waterId)
    .order('sort_order', { ascending: true });

  return formatWater({
    ...water,
    bookingOptions: (bookingOptions || []).map(formatBookingOption)
  });
};

const getWatersWithBookingOptions = async (waters) => {
  if (waters.length === 0) return [];

  // Batch fetch all booking options for all water IDs
  const waterIds = waters.map(w => w.id);
  const { data: allOptions } = await supabase
    .from('booking_options')
    .select('*')
    .in('water_id', waterIds)
    .order('sort_order', { ascending: true });

  // Group options by water_id
  const optionsByWater = {};
  (allOptions || []).forEach(opt => {
    if (!optionsByWater[opt.water_id]) optionsByWater[opt.water_id] = [];
    optionsByWater[opt.water_id].push(formatBookingOption(opt));
  });

  return waters.map(water => formatWater({
    ...water,
    bookingOptions: optionsByWater[water.id] || []
  }));
};

// ============================================================================
// WATERS ROUTES (Public)
// ============================================================================

app.get('/api/waters', optionalAuth, async (req, res) => {
  try {
    let query = supabase
      .from('waters')
      .select('*')
      .eq('status', 'approved');

    const { type, region, species, minPrice, maxPrice, search } = req.query;

    if (type) query = query.eq('type', type);
    if (region) query = query.eq('region', region);
    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));

    let { data: waters, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch waters' });
    }

    // Filter by species (client-side for now)
    if (species) {
      const list = species.split(',');
      waters = waters.filter(w => list.some(s => w.species && w.species.includes(s)));
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      waters = waters.filter(w =>
        w.name.toLowerCase().includes(s) ||
        w.description.toLowerCase().includes(s) ||
        (w.species && w.species.some(sp => sp.toLowerCase().includes(s)))
      );
    }

    // Fetch booking options for each water
    const watersWithOptions = await getWatersWithBookingOptions(waters);

    res.json({ waters: watersWithOptions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch waters' });
  }
});

app.get('/api/waters/:id', async (req, res) => {
  try {
    const water = await getWaterWithBookingOptions(req.params.id);
    if (!water) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ water });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch water' });
  }
});

// ============================================================================
// INSTRUCTORS ROUTES (Public)
// ============================================================================

app.get('/api/instructors', optionalAuth, async (req, res) => {
  try {
    let query = supabase
      .from('instructors')
      .select('*')
      .eq('status', 'approved');

    const { region, specialty, search } = req.query;

    if (region) query = query.eq('region', region);

    let { data: instructors, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch instructors' });
    }

    // Filter by specialty (client-side)
    if (specialty) {
      const list = specialty.split(',');
      instructors = instructors.filter(i => list.some(s => i.specialties && i.specialties.includes(s)));
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      instructors = instructors.filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.bio.toLowerCase().includes(s)
      );
    }

    res.json({ instructors });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

app.get('/api/instructors/:id', async (req, res) => {
  try {
    const { data: instructor, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !instructor) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ instructor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch instructor' });
  }
});

// ============================================================================
// FAVOURITES ROUTES
// ============================================================================

app.get('/api/user/favourites', authenticateToken, async (req, res) => {
  try {
    const { data: favWaters, error: waterError } = await supabase
      .from('favourite_waters')
      .select('water_id')
      .eq('user_id', req.user.id);

    const { data: favInstructors, error: instError } = await supabase
      .from('favourite_instructors')
      .select('instructor_id')
      .eq('user_id', req.user.id);

    if (waterError || instError) {
      return res.status(500).json({ error: 'Failed to fetch favourites' });
    }

    res.json({
      waters: favWaters.map(f => f.water_id),
      instructors: favInstructors.map(f => f.instructor_id)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

app.post('/api/favourites/waters', authenticateToken, async (req, res) => {
  try {
    const { waterId } = req.body;
    if (!waterId) return res.status(400).json({ error: 'waterId required' });

    const { data: exists } = await supabase
      .from('favourite_waters')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('water_id', waterId)
      .single();

    if (!exists) {
      await supabase
        .from('favourite_waters')
        .insert([{
          user_id: req.user.id,
          water_id: waterId,
          created_at: new Date().toISOString()
        }]);
    }

    res.json({ message: 'Added to favourites', waterId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

app.delete('/api/favourites/waters/:id', authenticateToken, async (req, res) => {
  try {
    const waterId = req.params.id;
    await supabase
      .from('favourite_waters')
      .delete()
      .eq('user_id', req.user.id)
      .eq('water_id', waterId);

    res.json({ message: 'Removed', waterId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

app.post('/api/favourites/instructors', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.body;
    if (!instructorId) return res.status(400).json({ error: 'instructorId required' });

    const { data: exists } = await supabase
      .from('favourite_instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('instructor_id', instructorId)
      .single();

    if (!exists) {
      await supabase
        .from('favourite_instructors')
        .insert([{
          user_id: req.user.id,
          instructor_id: instructorId,
          created_at: new Date().toISOString()
        }]);
    }

    res.json({ message: 'Added to favourites', instructorId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

app.delete('/api/favourites/instructors/:id', authenticateToken, async (req, res) => {
  try {
    const instructorId = req.params.id;
    await supabase
      .from('favourite_instructors')
      .delete()
      .eq('user_id', req.user.id)
      .eq('instructor_id', instructorId);

    res.json({ message: 'Removed', instructorId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

// ============================================================================
// CATCHES ROUTES
// ============================================================================

app.post('/api/catches', authenticateToken, async (req, res) => {
  try {
    const { waterId, species, weight, method, comment } = req.body;
    if (!waterId || !species) return res.status(400).json({ error: 'waterId and species required' });

    const catchRecord = {
      user_id: req.user.id,
      water_id: waterId,
      species,
      weight,
      method,
      comment,
      created_at: new Date().toISOString(),
      angler_name: req.user.name
    };

    const { data: newCatch, error } = await supabase
      .from('catches')
      .insert([catchRecord])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create catch' });
    }

    res.json({ message: 'Catch reported', catchId: newCatch.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to report catch' });
  }
});

app.get('/api/catches/water/:id', async (req, res) => {
  try {
    const { data: catches, error } = await supabase
      .from('catches')
      .select('*')
      .eq('water_id', req.params.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch catches' });
    }

    // Convert snake_case to camelCase
    const formattedCatches = catches.map(c => ({
      id: c.id,
      userId: c.user_id,
      waterId: c.water_id,
      species: c.species,
      weight: c.weight,
      method: c.method,
      comment: c.comment,
      createdAt: c.created_at,
      anglerName: c.angler_name
    }));

    res.json({ catches: formattedCatches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch catches' });
  }
});

// ============================================================================
// REGISTRATION FORMS - List Water / Register Instructor
// ============================================================================

app.post('/api/register/water', async (req, res) => {
  try {
    const { ownerName, ownerEmail, ownerPhone, waterName, waterType, region, description, species, price, bookingType, facilities, rules, bookingOptions } = req.body;

    // Create or find user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', ownerEmail?.toLowerCase())
      .single();

    let isNewUser = false;
    let tempPassword = null;

    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8);
      const hashedPwd = await bcrypt.hash(tempPassword, 10);
      const { data: newUser } = await supabase
        .from('users')
        .insert([{
          email: ownerEmail.toLowerCase(),
          password: hashedPwd,
          name: ownerName,
          phone: ownerPhone,
          role: 'pending_water_owner',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      user = newUser;
      isNewUser = true;
    }

    // Process booking options
    const processedOptions = (bookingOptions || []).map((opt, i) => ({
      category: opt.category || 'day-tickets',
      name: opt.name,
      description: opt.description || '',
      price: parseInt(opt.price) || 0,
      price_type: opt.priceType || 'day',
      booking_type: opt.bookingType || 'enquiry'
    }));

    // Derive legacy price from cheapest option for backward compat
    const prices = processedOptions.map(o => o.price).filter(p => p > 0);
    const derivedPrice = prices.length > 0 ? Math.min(...prices) : (parseInt(price) || 0);
    const derivedBookingType = processedOptions.length > 0
      ? (processedOptions.some(o => o.booking_type === 'instant') ? 'instant' : 'enquiry')
      : (bookingType || 'enquiry');

    // Create water
    const { data: water, error: waterError } = await supabase
      .from('waters')
      .insert([{
        name: waterName,
        owner_id: user.id,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        type: waterType,
        region,
        description,
        species: species || [],
        price: derivedPrice,
        booking_type: derivedBookingType,
        rating: 0,
        review_count: 0,
        facilities: facilities || [],
        rules: rules || [],
        images: [],
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (waterError) {
      return res.status(400).json({ error: 'Failed to create water' });
    }

    // Insert booking options for this water
    if (processedOptions.length > 0) {
      const optionsWithWaterId = processedOptions.map(opt => ({
        ...opt,
        water_id: water.id
      }));

      await supabase
        .from('booking_options')
        .insert(optionsWithWaterId);
    }

    res.json({
      message: 'Submitted for approval',
      waterId: water.id,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
      loginEmail: isNewUser ? ownerEmail : undefined
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Submission failed' });
  }
});

app.post('/api/register/instructor', async (req, res) => {
  try {
    const { name, email, phone, specialties, region, experience, bio, price, certifications, availability } = req.body;

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email?.toLowerCase())
      .single();

    let isNewUser = false;
    let tempPassword = null;

    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8);
      const hashedPwd = await bcrypt.hash(tempPassword, 10);
      const { data: newUser } = await supabase
        .from('users')
        .insert([{
          email: email.toLowerCase(),
          password: hashedPwd,
          name,
          phone,
          role: 'pending_instructor',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      user = newUser;
      isNewUser = true;
    }

    const { data: instructor, error } = await supabase
      .from('instructors')
      .insert([{
        user_id: user.id,
        name,
        email,
        phone,
        specialties: specialties || [],
        region,
        experience,
        bio,
        price: parseInt(price) || 0,
        rating: 0,
        review_count: 0,
        certifications: certifications || [],
        availability: availability || [],
        images: [],
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create instructor' });
    }

    res.json({
      message: 'Submitted for approval',
      instructorId: instructor.id,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
      loginEmail: isNewUser ? email : undefined
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// ============================================================================
// INQUIRIES
// ============================================================================

app.post('/api/inquiries', authenticateToken, async (req, res) => {
  try {
    const { waterId, instructorId, date, message, type } = req.body;

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([{
        user_id: req.user.id,
        user_name: req.user.name,
        user_email: req.user.email,
        water_id: waterId,
        instructor_id: instructorId,
        date,
        message,
        type,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create inquiry' });
    }

    res.json({ message: 'Inquiry submitted', inquiryId: inquiry.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Inquiry submission failed' });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.get('/api/admin/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: waterCount } = await supabase
      .from('waters')
      .select('*', { count: 'exact', head: true });

    const { count: instructorCount } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true });

    const { count: inquiryCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    const { count: catchCount } = await supabase
      .from('catches')
      .select('*', { count: 'exact', head: true });

    // Get pending counts
    const { data: pendingWaters } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'pending');

    const { data: pendingInstructors } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'pending');

    res.json({
      totalUsers: userCount,
      totalWaters: waterCount,
      totalInstructors: instructorCount,
      pendingWaters: pendingWaters.length,
      pendingInstructors: pendingInstructors.length,
      totalInquiries: inquiryCount,
      totalCatches: catchCount
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: pendingWaters } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'pending');

    const { data: pendingInstructors } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'pending');

    res.json({ pendingWaters, pendingInstructors });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch pending items' });
  }
});

app.get('/api/admin/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, name, role, created_at');

    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at
    }));

    res.json({ users: formatted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/waters', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: approved } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'approved');

    const { data: pending } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'pending');

    res.json({ approved, pending });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch waters' });
  }
});

app.get('/api/admin/instructors', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: approved } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'approved');

    const { data: pending } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'pending');

    res.json({ approved, pending });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

app.post('/api/admin/approve/water/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const waterId = req.params.id;

    // Fetch the water
    const { data: water, error: fetchError } = await supabase
      .from('waters')
      .select('*')
      .eq('id', waterId)
      .single();

    if (fetchError || !water) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Update water status
    const { data: updated, error: updateError } = await supabase
      .from('waters')
      .update({ status: 'approved' })
      .eq('id', waterId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: 'Update failed' });
    }

    // Upgrade user role if needed
    if (water.owner_id) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', water.owner_id)
        .single();

      if (user && user.role === 'pending_water_owner') {
        await supabase
          .from('users')
          .update({ role: 'water_owner' })
          .eq('id', water.owner_id);
      }
    }

    res.json({ message: 'Approved', water: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve water' });
  }
});

app.post('/api/admin/reject/water/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const waterId = req.params.id;

    // Delete booking options first
    await supabase
      .from('booking_options')
      .delete()
      .eq('water_id', waterId);

    // Delete the water
    await supabase
      .from('waters')
      .delete()
      .eq('id', waterId);

    res.json({ message: 'Rejected' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject water' });
  }
});

app.post('/api/admin/approve/instructor/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const instructorId = req.params.id;

    // Fetch the instructor
    const { data: instructor, error: fetchError } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', instructorId)
      .single();

    if (fetchError || !instructor) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Update instructor status
    const { data: updated, error: updateError } = await supabase
      .from('instructors')
      .update({ status: 'approved' })
      .eq('id', instructorId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: 'Update failed' });
    }

    // Upgrade user role if needed
    if (instructor.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', instructor.user_id)
        .single();

      if (user && user.role === 'pending_instructor') {
        await supabase
          .from('users')
          .update({ role: 'instructor' })
          .eq('id', instructor.user_id);
      }
    }

    res.json({ message: 'Approved', instructor: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve instructor' });
  }
});

app.post('/api/admin/reject/instructor/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const instructorId = req.params.id;

    await supabase
      .from('instructors')
      .delete()
      .eq('id', instructorId);

    res.json({ message: 'Rejected' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject instructor' });
  }
});

app.put('/api/admin/waters/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const waterId = req.params.id;

    const { data: updated, error } = await supabase
      .from('waters')
      .update(req.body)
      .eq('id', waterId)
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ message: 'Updated', water: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update water' });
  }
});

app.delete('/api/admin/waters/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const waterId = req.params.id;

    // Delete booking options first
    await supabase
      .from('booking_options')
      .delete()
      .eq('water_id', waterId);

    // Delete the water
    await supabase
      .from('waters')
      .delete()
      .eq('id', waterId);

    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete water' });
  }
});

app.put('/api/admin/instructors/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const instructorId = req.params.id;

    const { data: updated, error } = await supabase
      .from('instructors')
      .update(req.body)
      .eq('id', instructorId)
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ message: 'Updated', instructor: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update instructor' });
  }
});

app.delete('/api/admin/instructors/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const instructorId = req.params.id;

    await supabase
      .from('instructors')
      .delete()
      .eq('id', instructorId);

    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete instructor' });
  }
});

// ============================================================================
// WATER OWNER ROUTES
// ============================================================================

app.get('/api/owner/waters', authenticateToken, requireRole('water_owner', 'admin'), async (req, res) => {
  try {
    const { data: waters, error } = await supabase
      .from('waters')
      .select('*')
      .eq('owner_id', req.user.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch waters' });
    }

    res.json({ waters });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch waters' });
  }
});

app.put('/api/owner/waters/:id', authenticateToken, requireRole('water_owner', 'admin'), async (req, res) => {
  try {
    const waterId = req.params.id;

    const { data: water, error: fetchError } = await supabase
      .from('waters')
      .select('*')
      .eq('id', waterId)
      .single();

    if (fetchError || !water || water.owner_id !== req.user.id) {
      return res.status(404).json({ error: 'Not found or not yours' });
    }

    const allowed = ['description', 'price', 'facilities', 'rules', 'images', 'booking_type'];
    const updates = {};
    allowed.forEach(k => {
      // Convert camelCase to snake_case if needed
      const snakeCaseKey = k === 'bookingType' ? 'booking_type' : k;
      if (req.body[k] !== undefined) updates[snakeCaseKey] = req.body[k];
      if (req.body[snakeCaseKey] !== undefined) updates[snakeCaseKey] = req.body[snakeCaseKey];
    });

    const { data: updated, error: updateError } = await supabase
      .from('waters')
      .update(updates)
      .eq('id', waterId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: 'Update failed' });
    }

    res.json({ message: 'Updated', water: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update water' });
  }
});

app.get('/api/owner/inquiries', authenticateToken, requireRole('water_owner', 'admin'), async (req, res) => {
  try {
    const { data: waters } = await supabase
      .from('waters')
      .select('id')
      .eq('owner_id', req.user.id);

    const waterIds = waters.map(w => w.id);

    let query = supabase
      .from('inquiries')
      .select('*');

    // Filter by water IDs if any
    if (waterIds.length > 0) {
      query = query.in('water_id', waterIds);
    } else {
      // If owner has no waters, return empty list
      return res.json({ inquiries: [] });
    }

    const { data: inquiries, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }

    res.json({ inquiries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// ============================================================================
// INSTRUCTOR ROUTES
// ============================================================================

app.get('/api/instructor/profile', authenticateToken, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { data: instructor, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !instructor) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ instructor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/instructor/profile', authenticateToken, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { data: instructor, error: fetchError } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !instructor) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const allowed = ['bio', 'price', 'availability', 'specialties', 'images'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const { data: updated, error: updateError } = await supabase
      .from('instructors')
      .update(updates)
      .eq('id', instructor.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: 'Update failed' });
    }

    res.json({ message: 'Updated', instructor: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/instructor/inquiries', authenticateToken, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { data: instructor, error: fetchError } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !instructor) {
      return res.status(404).json({ error: 'Not found' });
    }

    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('instructor_id', instructor.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }

    res.json({ inquiries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// ============================================================================
// IMAGE UPLOAD (Supabase Storage)
// ============================================================================

// Simple in-memory file handling (no multer dependency needed)
app.post('/api/upload', authenticateToken, async (req, res) => {
  try {
    // For now, accept base64-encoded image data
    const { imageData, fileName, type } = req.body;

    if (!imageData || !fileName) {
      return res.status(400).json({ error: 'imageData and fileName required' });
    }

    // Strip data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine content type
    const ext = fileName.split('.').pop().toLowerCase();
    const contentTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif'
    };
    const contentType = contentTypes[ext] || 'image/jpeg';

    // Upload to Supabase Storage
    const storagePath = `${type || 'general'}/${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(storagePath, buffer, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath);

    res.json({
      message: 'Upload successful',
      url: urlData.publicUrl,
      path: storagePath
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ============================================================================
// CATCH-ALL ROUTE - Must be LAST, after all API routes
// ============================================================================
// Serve React app for all other routes (enables client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
=====================================================
   TightLines Backend Server Running on Port ${PORT}
=====================================================

Using Supabase Database:
  URL: ${SUPABASE_URL}

Admin Login:
  Email: admin@tightlines.co.uk
  Password: admin123

API Endpoints:
  Auth:    POST /api/auth/register, /api/auth/login
  Waters:  GET /api/waters, /api/waters/:id
  Guides:  GET /api/instructors, /api/instructors/:id
  Favs:    POST/DELETE /api/favourites/waters/:id
  Admin:   GET /api/admin/stats, /api/admin/pending

=====================================================
  `);
});
