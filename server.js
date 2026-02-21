// TheAnglersNet Backend Server – Supabase Version

// Express + Supabase + JWT Auth + Role-Based Access

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@theanglersnet.co.uk';

// Email setup (Zoho SMTP)
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

let emailTransporter = null;
console.log(`SMTP config: host=${SMTP_HOST ? 'SET' : 'EMPTY'}, user=${SMTP_USER ? 'SET' : 'EMPTY'}, pass=${SMTP_PASS ? 'SET' : 'EMPTY'}, port=${SMTP_PORT}`);
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  emailTransporter.verify().then(() => {
    console.log('Email transporter ready');
  }).catch(err => {
    console.error('Email transporter error:', err.message);
  });
} else {
  console.log('SMTP not configured — email features disabled');
}

// Send email helper (fire and forget, never throws)
// Accepts either sendEmail({ to, subject, html }) or sendEmail(to, subject, html)
const sendEmail = async (toOrOpts, subject, html) => {
  let to;
  if (typeof toOrOpts === 'object' && toOrOpts !== null) {
    ({ to, subject, html } = toOrOpts);
  } else {
    to = toOrOpts;
  }
  if (!emailTransporter) {
    console.log('[Email] Skipped (no transporter):', subject, '->', to);
    return;
  }
  try {
    await emailTransporter.sendMail({
      from: `"TheAnglersNet" <${SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log('[Email] Sent:', subject, '->', to);
  } catch (err) {
    console.error('[Email] Failed:', err.message);
  }
};

// Email templates
const emailTemplates = {
  inquiryToOwner: ({ anglerName, anglerEmail, waterName, message, date, guests }) => ({
    subject: `New Inquiry for ${waterName} — TheAnglersNet`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New Booking Inquiry</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 16px;">You've received a new inquiry for <strong>${waterName}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 8px 0; color: #78716c;">From</td><td style="padding: 8px 0; font-weight: 600;">${anglerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #78716c;">Email</td><td style="padding: 8px 0;"><a href="mailto:${anglerEmail}" style="color: #0f766e;">${anglerEmail}</a></td></tr>
            ${date ? `<tr><td style="padding: 8px 0; color: #78716c;">Date</td><td style="padding: 8px 0;">${date}</td></tr>` : ''}
            ${guests ? `<tr><td style="padding: 8px 0; color: #78716c;">Guests</td><td style="padding: 8px 0;">${guests}</td></tr>` : ''}
          </table>
          ${message ? `<div style="background: #f5f5f4; padding: 16px; border-radius: 8px; margin-bottom: 16px;"><p style="margin: 0; color: #44403c;">${message}</p></div>` : ''}
          <p style="color: #78716c; font-size: 13px; margin: 0;">Reply directly to the angler's email to confirm or discuss the booking.</p>
        </div>
      </div>
    `
  }),

  inquiryConfirmation: ({ anglerName, waterName, ownerName }) => ({
    subject: `Inquiry Sent — ${waterName}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Inquiry Confirmation</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${anglerName},</p>
          <p>Your inquiry for <strong>${waterName}</strong> has been sent successfully. ${ownerName ? `${ownerName} will` : 'The fishery will'} be in touch shortly to confirm your booking.</p>
          <p>You can track the status of your inquiries in your <strong>Profile</strong> page.</p>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">— TheAnglersNet</p>
        </div>
      </div>
    `
  }),

  instructorInquiry: ({ anglerName, anglerEmail, instructorName, message, date }) => ({
    subject: `New Student Inquiry — TheAnglersNet`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New Student Inquiry</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${instructorName},</p>
          <p>You've received a new inquiry from <strong>${anglerName}</strong> (<a href="mailto:${anglerEmail}" style="color: #0f766e;">${anglerEmail}</a>).</p>
          ${date ? `<p><strong>Preferred date:</strong> ${date}</p>` : ''}
          ${message ? `<div style="background: #f5f5f4; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0; color: #44403c;">${message}</p></div>` : ''}
          <p style="color: #78716c; font-size: 13px;">Reply directly to the student's email to discuss and confirm.</p>
        </div>
      </div>
    `
  }),

  newListingAdmin: ({ type, name, ownerName, ownerEmail }) => ({
    subject: `New ${type} Listing: ${name}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: #f59e0b; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New ${type} Pending Review</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>A new ${type.toLowerCase()} listing needs your review:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #78716c;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #78716c;">Submitted by</td><td style="padding: 8px 0;">${ownerName} (${ownerEmail})</td></tr>
          </table>
          <p style="margin-top: 16px;">Log in to the admin dashboard to approve or reject.</p>
        </div>
      </div>
    `
  }),

  listingApproved: ({ type, name, ownerName }) => ({
    subject: `Your ${type} "${name}" Has Been Approved!`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Listing Approved!</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${ownerName},</p>
          <p>Great news — your ${type.toLowerCase()} <strong>"${name}"</strong> has been approved and is now live on TheAnglersNet!</p>
          <p>Anglers can now find and book with you. You can manage your listing from your dashboard.</p>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">— TheAnglersNet</p>
        </div>
      </div>
    `
  }),

  listingRejected: ({ type, name, ownerName }) => ({
    subject: `Update on Your ${type} "${name}"`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Listing Update</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${ownerName},</p>
          <p>Unfortunately, your ${type.toLowerCase()} <strong>"${name}"</strong> wasn't approved at this time.</p>
          <p>This could be due to incomplete information, unclear photos, or content that doesn't meet our guidelines. Please review your listing and resubmit, or contact us if you have questions.</p>
          <p>Email us at <a href="mailto:hello@theanglersnet.co.uk" style="color: #0f766e;">hello@theanglersnet.co.uk</a></p>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">— TheAnglersNet</p>
        </div>
      </div>
    `
  }),

  bookingConfirmation: ({ anglerName, locationName, date, numberOfDays, message }) => ({
    subject: `Booking Confirmed — ${locationName}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Booking Confirmed!</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${anglerName},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          <div style="background: #f5f5f4; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #78716c;">Location</td><td style="padding: 6px 0; font-weight: 600;">${locationName}</td></tr>
              <tr><td style="padding: 6px 0; color: #78716c;">Date</td><td style="padding: 6px 0;">${date}</td></tr>
              ${numberOfDays > 1 ? `<tr><td style="padding: 6px 0; color: #78716c;">Duration</td><td style="padding: 6px 0;">${numberOfDays} days</td></tr>` : ''}
            </table>
          </div>
          ${message ? `<div style="background: #f5f5f4; padding: 16px; border-radius: 8px; margin-bottom: 16px;"><p style="margin: 0; color: #44403c;"><strong>Your notes:</strong> ${message}</p></div>` : ''}
          <p>If you have any questions, reply to this email or contact the venue directly.</p>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">Tight Lines! — TheAnglersNet</p>
        </div>
      </div>
    `
  }),

  inquiryConfirmed: ({ anglerName, locationName, ownerMessage, date }) => ({
    subject: `Great News — Your Inquiry for ${locationName} Has Been Confirmed!`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Inquiry Confirmed!</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${anglerName},</p>
          <p>Great news — your inquiry for <strong>${locationName}</strong>${date ? ` on <strong>${date}</strong>` : ''} has been confirmed!</p>
          ${ownerMessage ? `<div style="background: #f5f5f4; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0 0 4px; color: #78716c; font-size: 13px;">Message from the host:</p><p style="margin: 0; color: #44403c;">${ownerMessage}</p></div>` : ''}
          <p>You can view the status of all your bookings in your <strong>Profile</strong> page on TheAnglersNet.</p>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">Tight Lines! — TheAnglersNet</p>
        </div>
      </div>
    `
  }),

  inquiryDeclined: ({ anglerName, locationName, ownerMessage }) => ({
    subject: `Update on Your Inquiry for ${locationName}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Inquiry Update</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${anglerName},</p>
          <p>Unfortunately, your inquiry for <strong>${locationName}</strong> was not confirmed at this time.</p>
          ${ownerMessage ? `<div style="background: #f5f5f4; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0 0 4px; color: #78716c; font-size: 13px;">Message from the host:</p><p style="margin: 0; color: #44403c;">${ownerMessage}</p></div>` : ''}
          <p>Don't worry — there are plenty of great waters and instructors on TheAnglersNet. Browse our listings to find another perfect spot.</p>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">— TheAnglersNet</p>
        </div>
      </div>
    `
  })
};

// Stripe setup
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('Stripe initialized');
} else {
  console.log('STRIPE_SECRET_KEY not set — payment features disabled');
}

// Supabase setup — set these in Render environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set as environment variables.');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Old Resend email helper removed — now using nodemailer with Zoho SMTP (see top of file)

const app = express();
const PORT = process.env.PORT || 3001;
if (!process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET not set in environment. Using fallback (not safe for production).');
}
const JWT_SECRET = process.env.JWT_SECRET || 'anglersnet-dev-fallback-key';

// Middleware
app.use(cors({ origin: '*', credentials: false, methods: ['GET', 'POST', 'DELETE', 'PUT'] }));

// Stripe webhook needs raw body — must come before express.json()
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'Stripe not configured' });

  let event;
  if (STRIPE_WEBHOOK_SECRET) {
    try {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Without webhook secret, parse the event directly (test mode)
    try {
      event = JSON.parse(req.body);
    } catch (err) {
      return res.status(400).send('Invalid payload');
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingMeta = session.metadata || {};

    try {
      // Create the booking record now that payment is confirmed
      const booking = {
        user_id: bookingMeta.userId || null,
        user_name: bookingMeta.anglerName || session.customer_details?.name || '',
        user_email: bookingMeta.anglerEmail || session.customer_details?.email || '',
        user_phone: bookingMeta.anglerPhone || '',
        water_id: bookingMeta.waterId || null,
        instructor_id: bookingMeta.instructorId || null,
        booking_option_id: bookingMeta.bookingOptionId || null,
        date: bookingMeta.date || null,
        start_date: bookingMeta.startDate || bookingMeta.date || null,
        end_date: bookingMeta.endDate || bookingMeta.date || null,
        number_of_days: parseInt(bookingMeta.numberOfDays) || 1,
        message: bookingMeta.message || '',
        type: 'booking',
        status: 'confirmed',
        stripe_session_id: session.id,
        amount_paid: session.amount_total / 100,
        created_at: new Date().toISOString()
      };

      const { data: newBooking, error } = await supabase
        .from('inquiries')
        .insert([booking])
        .select()
        .single();

      if (!error && newBooking) {
        // Send confirmation emails
        const waterName = bookingMeta.waterId ? (await supabase.from('waters').select('name').eq('id', bookingMeta.waterId).single())?.data?.name : null;
        const instructorName = bookingMeta.instructorId ? (await supabase.from('instructors').select('name').eq('id', bookingMeta.instructorId).single())?.data?.name : null;
        const locationName = waterName || instructorName || 'your booking';

        await sendEmail(booking.user_email, `Booking Confirmed - ${locationName}`, `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1B5E3B; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">TheAnglersNet</h1>
            </div>
            <div style="padding: 32px 24px; background: #fff;">
              <h2 style="color: #1a1a1a;">Payment Received & Booking Confirmed!</h2>
              <p style="color: #555;">Hi ${booking.user_name},</p>
              <p style="color: #555;">Your payment of <strong>£${booking.amount_paid}</strong> has been received and your booking is confirmed.</p>
              <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Location:</strong> ${locationName}</p>
                <p style="margin: 4px 0;"><strong>Date:</strong> ${booking.date}</p>
                ${booking.number_of_days > 1 ? `<p style="margin: 4px 0;"><strong>Duration:</strong> ${booking.number_of_days} days</p>` : ''}
              </div>
              <p style="color: #888; font-size: 12px; margin-top: 32px;">Tight Lines & Happy Fishing!</p>
            </div>
          </div>
        `);

        await sendEmail(ADMIN_EMAIL, `Payment Received - ${locationName}`, `
          <p>Payment received and booking confirmed:</p>
          <ul>
            <li><strong>Customer:</strong> ${booking.user_name} (${booking.user_email})</li>
            <li><strong>Location:</strong> ${locationName}</li>
            <li><strong>Date:</strong> ${booking.date}</li>
            <li><strong>Amount:</strong> £${booking.amount_paid}</li>
          </ul>
        `);
      }
    } catch (err) {
      console.error('Error processing Stripe webhook:', err);
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

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
      .eq('email', 'admin@theanglersnet.co.uk')
      .single();

    if (!admin) {
      const adminPwd = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPwd = await bcrypt.hash(adminPwd, 10);
      await supabase
        .from('users')
        .insert([{
          email: 'admin@theanglersnet.co.uk',
          password: hashedPwd,
          name: 'Admin',
          role: 'admin',
          created_at: new Date().toISOString()
        }]);
      console.log('Admin account created: admin@theanglersnet.co.uk');
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

app.post('/api/auth/register', authLimiter, async (req, res) => {
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

app.post('/api/auth/login', authLimiter, async (req, res) => {
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

    // Check if user has any water listings or instructor profiles
    const { data: userWaters } = await supabase
      .from('waters')
      .select('id, status')
      .or(`owner_id.eq.${user.id},owner_email.eq.${user.email}`);

    const { data: userInstructors } = await supabase
      .from('instructors')
      .select('id, status')
      .eq('user_id', user.id);

    const hasWaters = (userWaters || []).length > 0;
    const hasInstructorProfile = (userInstructors || []).length > 0;

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
      privacy: user.privacy || { profilePublic: false, showCatches: true, showFavourites: false },
      hasWaters,
      hasInstructorProfile
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

// Get user's submitted applications (waters and instructor listings)
app.get('/api/user/applications', authenticateToken, async (req, res) => {
  try {
    // Fetch waters owned by this user
    const { data: waters, error: watersError } = await supabase
      .from('waters')
      .select('id, name, type, region, status, created_at, owner_email')
      .eq('owner_id', req.user.id);

    // Fetch instructor profiles for this user
    const { data: instructorProfiles, error: instError } = await supabase
      .from('instructors')
      .select('id, name, region, status, created_at, email')
      .eq('user_id', req.user.id);

    if (watersError) console.error('[Applications] Error fetching user waters:', watersError);
    if (instError) console.error('[Applications] Error fetching user instructors:', instError);

    // Also check by email if owner_id wasn't set
    let extraWaters = [];
    if (req.user.email) {
      const { data: byEmail } = await supabase
        .from('waters')
        .select('id, name, type, region, status, created_at, owner_email')
        .eq('owner_email', req.user.email.toLowerCase());

      const existingIds = new Set((waters || []).map(w => w.id));
      extraWaters = (byEmail || []).filter(w => !existingIds.has(w.id));
    }

    // Also check instructors by email fallback
    let extraInstructors = [];
    if (req.user.email) {
      const { data: instByEmail } = await supabase
        .from('instructors')
        .select('id, name, region, status, created_at, email')
        .eq('email', req.user.email.toLowerCase());

      const existingInstIds = new Set((instructorProfiles || []).map(i => i.id));
      extraInstructors = (instByEmail || []).filter(i => !existingInstIds.has(i.id));
    }

    const allWaters = [...(waters || []), ...extraWaters].map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      region: w.region,
      status: w.status,
      createdAt: w.created_at,
      email: w.owner_email
    }));

    const allInstructors = [...(instructorProfiles || []), ...extraInstructors].map(i => ({
      id: i.id,
      name: i.name,
      region: i.region,
      status: i.status,
      createdAt: i.created_at,
      email: i.email
    }));

    res.json({ waters: allWaters, instructors: allInstructors });
  } catch (e) {
    console.error('[Applications] Exception:', e);
    res.status(500).json({ error: 'Failed to fetch applications' });
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
      isPublic: c.is_public,
      verified: c.verified,
      createdAt: c.created_at,
      anglerName: c.angler_name
    }));

    res.json({ catches: formattedCatches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch catches' });
  }
});

// Get user's reviews
app.get('/api/reviews/user', authenticateToken, async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    // Convert snake_case to camelCase for response
    const formattedReviews = reviews.map(r => ({
      id: r.id,
      userId: r.user_id,
      waterId: r.water_id,
      instructorId: r.instructor_id,
      rating: r.rating,
      title: r.title,
      text: r.text,
      verified: r.verified,
      createdAt: r.created_at
    }));

    res.json({ reviews: formattedReviews });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Update a review
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { rating, title, text } = req.body;

    // Check review belongs to user
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .update({ rating, title: title || '', text, created_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update review' });
    }

    // Recalculate rating for water/instructor
    const targetTable = existing.water_id ? 'waters' : 'instructors';
    const targetId = existing.water_id || existing.instructor_id;
    const targetColumn = existing.water_id ? 'water_id' : 'instructor_id';

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq(targetColumn, targetId);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from(targetTable)
        .update({ rating: Number(avgRating.toFixed(1)), review_count: allReviews.length })
        .eq('id', targetId);
    }

    res.json({ message: 'Review updated', review });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    // Check review belongs to user
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: 'Failed to delete review' });
    }

    // Recalculate rating for water/instructor
    const targetTable = existing.water_id ? 'waters' : 'instructors';
    const targetId = existing.water_id || existing.instructor_id;
    const targetColumn = existing.water_id ? 'water_id' : 'instructor_id';

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq(targetColumn, targetId);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from(targetTable)
        .update({ rating: Number(avgRating.toFixed(1)), review_count: allReviews.length })
        .eq('id', targetId);
    } else {
      await supabase
        .from(targetTable)
        .update({ rating: 0, review_count: 0 })
        .eq('id', targetId);
    }

    res.json({ message: 'Review deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get user's inquiries/bookings
app.get('/api/inquiries/user', authenticateToken, async (req, res) => {
  try {
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        waters:water_id(name),
        instructors:instructor_id(name)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }

    // Convert snake_case to camelCase for response
    const formattedInquiries = inquiries.map(i => ({
      id: i.id,
      userId: i.user_id,
      waterId: i.water_id,
      instructorId: i.instructor_id,
      waterName: i.waters?.name || null,
      instructorName: i.instructors?.name || null,
      name: i.name,
      email: i.email,
      phone: i.phone,
      numberOfPeople: i.number_of_people,
      preferredDate: i.preferred_date,
      message: i.message,
      status: i.status,
      createdAt: i.created_at
    }));

    res.json({ inquiries: formattedInquiries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
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
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
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
    const emailResult = await sendEmail(email, 'TheAnglersNet - Your Password Has Been Reset', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">TheAnglersNet</h1>
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
    sendEmail(ADMIN_EMAIL, `[TheAnglersNet] Password reset for ${email}`, `<p>User <strong>${email}</strong> requested a password reset.</p>`).catch(() => {});

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

    // Respond immediately — don't wait for emails
    res.json({ message: 'Booking confirmed!', bookingId: newBooking.id, booking: newBooking });

    // Send emails in background (fire and forget)
    const waterName = waterId ? (await supabase.from('waters').select('name').eq('id', waterId).single())?.data?.name : null;
    const instructorName = instructorId ? (await supabase.from('instructors').select('name').eq('id', instructorId).single())?.data?.name : null;
    const locationName = waterName || instructorName || 'your booking';

    const bookingTmpl = emailTemplates.bookingConfirmation({
      anglerName, locationName, date: date || startDate, numberOfDays: numberOfDays || 1, message
    });
    sendEmail({ to: anglerEmail, ...bookingTmpl }).catch(() => {});

    sendEmail(ADMIN_EMAIL, `New Booking - ${locationName}`, `
      <p>New booking received:</p>
      <ul>
        <li><strong>Customer:</strong> ${anglerName} (${anglerEmail})</li>
        <li><strong>Location:</strong> ${locationName}</li>
        <li><strong>Date:</strong> ${date || startDate}</li>
        <li><strong>Days:</strong> ${numberOfDays || 1}</li>
        ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
      </ul>
    `).catch(() => {});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Stripe checkout session – creates a payment page for instant bookings
app.post('/api/create-checkout-session', optionalAuth, async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'Payments are not yet available. Please enquire instead.' });

  try {
    const { waterId, instructorId, bookingOptionId, date, startDate, endDate, numberOfDays, anglerName, anglerEmail, anglerPhone, message, amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    if (!anglerEmail) return res.status(400).json({ error: 'Email required' });

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://theanglersnet.co.uk';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: anglerEmail,
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: description || 'Fishing Booking',
          },
          unit_amount: Math.round(amount * 100), // pence
        },
        quantity: 1,
      }],
      metadata: {
        userId: req.user?.id || '',
        waterId: waterId || '',
        instructorId: instructorId || '',
        bookingOptionId: bookingOptionId || '',
        date: date || startDate || '',
        startDate: startDate || date || '',
        endDate: endDate || '',
        numberOfDays: String(numberOfDays || 1),
        anglerName: anglerName || '',
        anglerEmail: anglerEmail || '',
        anglerPhone: anglerPhone || '',
        message: (message || '').substring(0, 500),
      },
      success_url: `${origin}?booking=success`,
      cancel_url: `${origin}?booking=cancelled`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error('Stripe checkout error:', e);
    res.status(500).json({ error: 'Failed to create checkout session' });
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

    // Respond immediately — don't wait for emails
    res.json({ message: 'Enquiry submitted! We\'ll be in touch soon.', inquiryId: newInquiry.id });

    // Send emails in background (fire and forget)
    const waterName = waterId ? (await supabase.from('waters').select('name').eq('id', waterId).single())?.data?.name : null;
    const instructorName = instructorId ? (await supabase.from('instructors').select('name').eq('id', instructorId).single())?.data?.name : null;
    const locationName = waterName || instructorName || 'TheAnglersNet';

    sendEmail(email, `Enquiry Received - ${locationName}`, `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #0f766e, #134e4a); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Enquiry Received</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${name},</p>
          <p>Thanks for your enquiry about <strong>${locationName}</strong>. We've passed it on and you should hear back within 24-48 hours.</p>
          <div style="background: #f5f5f4; border-radius: 8px; padding: 16px; margin: 16px 0;">
            ${date ? `<p style="margin: 4px 0;"><strong>Preferred date:</strong> ${date}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Your message:</strong> ${message}</p>
          </div>
          <p style="color: #78716c; font-size: 13px; margin-top: 24px;">Tight Lines! — TheAnglersNet</p>
        </div>
      </div>
    `).catch(() => {});

    sendEmail(ADMIN_EMAIL, `New Enquiry - ${locationName}`, `
      <p>New enquiry received:</p>
      <ul>
        <li><strong>From:</strong> ${name} (${email})</li>
        <li><strong>About:</strong> ${locationName}</li>
        ${date ? `<li><strong>Date:</strong> ${date}</li>` : ''}
        <li><strong>Message:</strong> ${message}</li>
      </ul>
    `).catch(() => {});
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

    // Track page view (fire and forget)
    supabase.from('page_views').insert({
      water_id: water.id,
      viewed_at: new Date().toISOString()
    }).then(() => {}).catch(() => {});

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

    console.log(`[Favorites API] Adding water ${waterId} for user ${req.user.id}`);

    const { data: exists } = await supabase
      .from('favourite_waters')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('water_id', waterId)
      .single();

    if (!exists) {
      const { data, error } = await supabase
        .from('favourite_waters')
        .insert([{
          user_id: req.user.id,
          water_id: waterId,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('[Favorites API] Insert error:', error);
        return res.status(500).json({ error: 'Failed to insert favorite', details: error.message });
      }

      console.log('[Favorites API] Successfully inserted water favorite');
    } else {
      console.log('[Favorites API] Water favorite already exists');
    }

    res.json({ success: true, message: 'Added to favourites', waterId });
  } catch (e) {
    console.error('[Favorites API] Exception:', e);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

app.delete('/api/favourites/waters/:id', authenticateToken, async (req, res) => {
  try {
    const waterId = req.params.id;
    console.log(`[Favorites API] Removing water ${waterId} for user ${req.user.id}`);

    const { error } = await supabase
      .from('favourite_waters')
      .delete()
      .eq('user_id', req.user.id)
      .eq('water_id', waterId);

    if (error) {
      console.error('[Favorites API] Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete favorite', details: error.message });
    }

    console.log('[Favorites API] Successfully deleted water favorite');
    res.json({ success: true, message: 'Removed', waterId });
  } catch (e) {
    console.error('[Favorites API] Exception:', e);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

app.post('/api/favourites/instructors', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.body;
    if (!instructorId) return res.status(400).json({ error: 'instructorId required' });

    console.log(`[Favorites API] Adding instructor ${instructorId} for user ${req.user.id}`);

    const { data: exists } = await supabase
      .from('favourite_instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('instructor_id', instructorId)
      .single();

    if (!exists) {
      const { error } = await supabase
        .from('favourite_instructors')
        .insert([{
          user_id: req.user.id,
          instructor_id: instructorId,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('[Favorites API] Insert error:', error);
        return res.status(500).json({ error: 'Failed to insert favorite', details: error.message });
      }

      console.log('[Favorites API] Successfully inserted instructor favorite');
    } else {
      console.log('[Favorites API] Instructor favorite already exists');
    }

    res.json({ success: true, message: 'Added to favourites', instructorId });
  } catch (e) {
    console.error('[Favorites API] Exception:', e);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

app.delete('/api/favourites/instructors/:id', authenticateToken, async (req, res) => {
  try {
    const instructorId = req.params.id;
    console.log(`[Favorites API] Removing instructor ${instructorId} for user ${req.user.id}`);

    const { error } = await supabase
      .from('favourite_instructors')
      .delete()
      .eq('user_id', req.user.id)
      .eq('instructor_id', instructorId);

    if (error) {
      console.error('[Favorites API] Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete favorite', details: error.message });
    }

    console.log('[Favorites API] Successfully deleted instructor favorite');
    res.json({ success: true, message: 'Removed', instructorId });
  } catch (e) {
    console.error('[Favorites API] Exception:', e);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

// ============================================================================
// CATCHES ROUTES
// ============================================================================

app.post('/api/catches', authenticateToken, async (req, res) => {
  try {
    const { waterId, species, weight, method, comment, isPublic, verified } = req.body;
    if (!waterId || !species) return res.status(400).json({ error: 'waterId and species required' });

    const catchRecord = {
      user_id: req.user.id,
      water_id: waterId,
      species,
      weight,
      method,
      comment,
      is_public: isPublic !== undefined ? isPublic : true,
      verified: verified || false,
      created_at: new Date().toISOString(),
      angler_name: req.user.name
    };

    const { data: newCatch, error } = await supabase
      .from('catches')
      .insert([catchRecord])
      .select()
      .single();

    if (error) {
      console.error('Catch insert error:', error);
      return res.status(400).json({ error: 'Failed to create catch' });
    }

    res.json({ message: 'Catch reported', catchId: newCatch.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to report catch' });
  }
});

app.delete('/api/catches/:id', authenticateToken, async (req, res) => {
  try {
    const catchId = req.params.id;

    // Verify the catch belongs to the user
    const { data: existing, error: fetchError } = await supabase
      .from('catches')
      .select('user_id')
      .eq('id', catchId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this catch' });
    }

    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('id', catchId);

    if (error) {
      console.error('Failed to delete catch:', error);
      return res.status(500).json({ error: 'Failed to delete catch' });
    }

    res.json({ success: true, message: 'Catch deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete catch' });
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
      isPublic: c.is_public,
      verified: c.verified,
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
// REVIEWS ROUTES
// ============================================================================

app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { waterId, instructorId, rating, title, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Review text is required' });
    }

    if (!waterId && !instructorId) {
      return res.status(400).json({ error: 'Either waterId or instructorId is required' });
    }

    // Check if user has a confirmed booking for this water/instructor
    const { data: bookings } = await supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'confirmed')
      .or(waterId ? `water_id.eq.${waterId}` : `instructor_id.eq.${instructorId}`);

    const hasBooking = bookings && bookings.length > 0;

    if (!hasBooking) {
      return res.status(403).json({ error: 'You can only review after a confirmed booking' });
    }

    // Check if user already reviewed this water/instructor
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .or(waterId ? `water_id.eq.${waterId}` : `instructor_id.eq.${instructorId}`);

    if (existingReviews && existingReviews.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this. You can edit your existing review from your profile.' });
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: req.user.id,
        water_id: waterId || null,
        instructor_id: instructorId || null,
        author_name: req.user.name,
        rating,
        title: title || '',
        text,
        verified: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create review' });
    }

    // Update rating and review count for water/instructor
    if (waterId) {
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('water_id', waterId);

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await supabase
          .from('waters')
          .update({
            rating: Number(avgRating.toFixed(1)),
            review_count: allReviews.length
          })
          .eq('id', waterId);
      }
    }

    if (instructorId) {
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('instructor_id', instructorId);

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await supabase
          .from('instructors')
          .update({
            rating: Number(avgRating.toFixed(1)),
            review_count: allReviews.length
          })
          .eq('id', instructorId);
      }
    }

    res.json({
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        author: review.author_name,
        rating: review.rating,
        title: review.title,
        text: review.text,
        verified: review.verified,
        date: review.created_at
      },
      verified: true
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.get('/api/reviews/water/:id', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('water_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      author: r.author_name,
      rating: r.rating,
      title: r.title,
      text: r.text,
      verified: r.verified,
      date: r.created_at
    }));

    res.json({ reviews: formattedReviews });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/reviews/instructor/:id', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('instructor_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      author: r.author_name,
      rating: r.rating,
      title: r.title,
      text: r.text,
      verified: r.verified,
      date: r.created_at
    }));

    res.json({ reviews: formattedReviews });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch reviews' });
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
      console.error('[Register Water] Insert error:', waterError);
      return res.status(400).json({ error: 'Failed to create water', details: waterError.message });
    }

    console.log(`[Register Water] Created water "${waterName}" (${water.id}) for user ${user.id} - status: pending`);

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

    // Send confirmation email to owner
    await sendEmail(ownerEmail, `Water Listing Submitted - ${waterName}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B5E3B; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">TheAnglersNet</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff;">
          <h2 style="color: #1a1a1a;">Listing Submitted!</h2>
          <p style="color: #555;">Hi ${ownerName},</p>
          <p style="color: #555;">Thanks for submitting <strong>${waterName}</strong> to TheAnglersNet. Our team will review your listing within 48 hours.</p>
          <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Water:</strong> ${waterName}</p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${waterType}</p>
            <p style="margin: 4px 0;"><strong>Region:</strong> ${region}</p>
            <p style="margin: 4px 0;"><strong>Booking options:</strong> ${processedOptions.length}</p>
          </div>
          ${isNewUser ? `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 16px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Account</h3>
              <p style="color: #555;">We've created an account for you to manage your listing:</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${ownerEmail}</p>
              <p style="margin: 4px 0;"><strong>Temporary password:</strong> ${tempPassword}</p>
              <p style="color: #888; font-size: 12px;">Please change your password after your first login.</p>
            </div>
          ` : ''}
          <p style="color: #555;">Once approved, your water will go live and you'll get a dashboard to manage bookings.</p>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">Tight Lines & Happy Fishing!</p>
        </div>
      </div>
    `);

    // Notify admin
    await sendEmail(ADMIN_EMAIL, `New Water Listing - ${waterName}`, `
      <p>New water listing submitted for review:</p>
      <ul>
        <li><strong>Water:</strong> ${waterName}</li>
        <li><strong>Owner:</strong> ${ownerName} (${ownerEmail})</li>
        <li><strong>Type:</strong> ${waterType}</li>
        <li><strong>Region:</strong> ${region}</li>
        <li><strong>Booking options:</strong> ${processedOptions.length}</li>
        <li><strong>New user:</strong> ${isNewUser ? 'Yes' : 'No'}</li>
      </ul>
      <p>Log in to the admin dashboard to approve or reject.</p>
    `);

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
    const { name, email, phone, specialties, region, experience, bio, price, certifications, availability, booking_options, whatYouLearn, teachingPhilosophy, equipmentProvided } = req.body;

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
        booking_options: booking_options || [],
        what_you_learn: whatYouLearn || '',
        teaching_philosophy: teachingPhilosophy || '',
        equipment_provided: equipmentProvided || '',
        images: [],
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('[Register Instructor] Insert error:', error);
      return res.status(400).json({ error: 'Failed to create instructor', details: error.message });
    }

    console.log(`[Register Instructor] Created instructor "${name}" (${instructor.id}) for user ${user.id} - status: pending`);

    // Send confirmation email
    await sendEmail(email, `Instructor Profile Submitted - ${name}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B5E3B; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">TheAnglersNet</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff;">
          <h2 style="color: #1a1a1a;">Profile Submitted!</h2>
          <p style="color: #555;">Hi ${name},</p>
          <p style="color: #555;">Thanks for registering as an instructor on TheAnglersNet. Our team will review your profile within 48 hours.</p>
          <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 4px 0;"><strong>Region:</strong> ${region}</p>
            <p style="margin: 4px 0;"><strong>Specialties:</strong> ${(specialties || []).join(', ')}</p>
          </div>
          ${isNewUser ? `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 16px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Account</h3>
              <p style="color: #555;">We've created an account for you:</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Temporary password:</strong> ${tempPassword}</p>
              <p style="color: #888; font-size: 12px;">Please change your password after your first login.</p>
            </div>
          ` : ''}
          <p style="color: #555;">Once approved, your profile will go live and students can book sessions with you.</p>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">Tight Lines & Happy Fishing!</p>
        </div>
      </div>
    `);

    // Notify admin
    await sendEmail(ADMIN_EMAIL, `New Instructor - ${name}`, `
      <p>New instructor registration for review:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Region:</strong> ${region}</li>
        <li><strong>Specialties:</strong> ${(specialties || []).join(', ')}</li>
        <li><strong>Experience:</strong> ${experience} years</li>
        <li><strong>New user:</strong> ${isNewUser ? 'Yes' : 'No'}</li>
      </ul>
      <p>Log in to the admin dashboard to approve or reject.</p>
    `);

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

    // Send email notifications (fire and forget)
    if (waterId) {
      // Fetch water details for email
      const { data: water } = await supabase.from('waters').select('name, owner_email, owner_name').eq('id', waterId).single();
      if (water?.owner_email) {
        const tmpl = emailTemplates.inquiryToOwner({
          anglerName: req.user.name, anglerEmail: req.user.email,
          waterName: water.name, message, date
        });
        sendEmail({ to: water.owner_email, ...tmpl });
      }
      // Confirmation to angler
      const confirmTmpl = emailTemplates.inquiryConfirmation({
        anglerName: req.user.name, waterName: water?.name || 'the water', ownerName: water?.owner_name
      });
      sendEmail({ to: req.user.email, ...confirmTmpl });
    } else if (instructorId) {
      // Fetch instructor details
      const { data: instructor } = await supabase.from('instructors').select('name, email').eq('id', instructorId).single();
      if (instructor?.email) {
        const tmpl = emailTemplates.instructorInquiry({
          anglerName: req.user.name, anglerEmail: req.user.email,
          instructorName: instructor.name, message, date
        });
        sendEmail({ to: instructor.email, ...tmpl });
      }
      // Confirmation to angler
      const confirmTmpl = emailTemplates.inquiryConfirmation({
        anglerName: req.user.name, waterName: instructor?.name || 'the instructor', ownerName: instructor?.name
      });
      sendEmail({ to: req.user.email, ...confirmTmpl });
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
    const { data: approved, error: approvedError } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'approved');

    const { data: pending, error: pendingError } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'pending');

    const { data: removalRequested, error: removalError } = await supabase
      .from('waters')
      .select('*')
      .eq('status', 'removal_requested');

    if (approvedError) console.error('[Admin] Error fetching approved waters:', approvedError);
    if (pendingError) console.error('[Admin] Error fetching pending waters:', pendingError);
    if (removalError) console.error('[Admin] Error fetching removal_requested waters:', removalError);

    // Attach booking options to each water
    const allWaters = [...(approved || []), ...(pending || []), ...(removalRequested || [])];
    const waterIds = allWaters.map(w => w.id);
    let optionsByWater = {};
    if (waterIds.length > 0) {
      const { data: allOptions } = await supabase
        .from('booking_options')
        .select('*')
        .in('water_id', waterIds)
        .order('sort_order', { ascending: true });
      (allOptions || []).forEach(opt => {
        if (!optionsByWater[opt.water_id]) optionsByWater[opt.water_id] = [];
        optionsByWater[opt.water_id].push(opt);
      });
    }

    const attachOptions = (waters) => (waters || []).map(w => ({
      ...w,
      booking_options: optionsByWater[w.id] || []
    }));

    console.log(`[Admin] Waters: ${(approved || []).length} approved, ${(pending || []).length} pending, ${(removalRequested || []).length} removal_requested`);
    res.json({ approved: attachOptions(approved), pending: attachOptions(pending), removal_requested: attachOptions(removalRequested) });
  } catch (e) {
    console.error('[Admin] Exception fetching waters:', e);
    res.status(500).json({ error: 'Failed to fetch waters' });
  }
});

app.get('/api/admin/instructors', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: approved, error: approvedError } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'approved');

    const { data: pending, error: pendingError } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'pending');

    if (approvedError) console.error('[Admin] Error fetching approved instructors:', approvedError);
    if (pendingError) console.error('[Admin] Error fetching pending instructors:', pendingError);

    console.log(`[Admin] Instructors: ${(approved || []).length} approved, ${(pending || []).length} pending`);
    res.json({ approved: approved || [], pending: pending || [] });
  } catch (e) {
    console.error('[Admin] Exception fetching instructors:', e);
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

    // Send approval/rejection email to water owner
    if (req.body.status === 'approved' && updated.owner_email) {
      const tmpl = emailTemplates.listingApproved({ type: 'Water', name: updated.name, ownerName: updated.owner_name || 'there' });
      sendEmail({ to: updated.owner_email, ...tmpl });
    } else if (req.body.status === 'rejected' && updated.owner_email) {
      const tmpl = emailTemplates.listingRejected({ type: 'Water', name: updated.name, ownerName: updated.owner_name || 'there' });
      sendEmail({ to: updated.owner_email, ...tmpl });
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

    // Send approval/rejection email to instructor
    if (req.body.status === 'approved' && updated.email) {
      const tmpl = emailTemplates.listingApproved({ type: 'Instructor Profile', name: updated.name, ownerName: updated.name || 'there' });
      sendEmail({ to: updated.email, ...tmpl });
    } else if (req.body.status === 'rejected' && updated.email) {
      const tmpl = emailTemplates.listingRejected({ type: 'Instructor Profile', name: updated.name, ownerName: updated.name || 'there' });
      sendEmail({ to: updated.email, ...tmpl });
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

app.get('/api/owner/waters', authenticateToken, async (req, res) => {
  try {
    const { data: waters, error } = await supabase
      .from('waters')
      .select('*')
      .or(`owner_id.eq.${req.user.id},owner_email.eq.${req.user.email}`);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch waters' });
    }

    // Attach booking options
    const waterIds = (waters || []).map(w => w.id);
    let optionsByWater = {};
    if (waterIds.length > 0) {
      const { data: allOptions } = await supabase
        .from('booking_options')
        .select('*')
        .in('water_id', waterIds)
        .order('sort_order', { ascending: true });
      (allOptions || []).forEach(opt => {
        if (!optionsByWater[opt.water_id]) optionsByWater[opt.water_id] = [];
        optionsByWater[opt.water_id].push(opt);
      });
    }

    const watersWithOptions = (waters || []).map(w => ({
      ...w,
      booking_options: optionsByWater[w.id] || []
    }));

    res.json({ waters: watersWithOptions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch waters' });
  }
});

app.put('/api/owner/waters/:id', authenticateToken, async (req, res) => {
  try {
    const waterId = req.params.id;

    const { data: water, error: fetchError } = await supabase
      .from('waters')
      .select('*')
      .eq('id', waterId)
      .single();

    const isOwner = water && (water.owner_id === req.user.id || water.owner_email === req.user.email);
    if (fetchError || !water || !isOwner) {
      return res.status(404).json({ error: 'Not found or not yours' });
    }

    const allowed = ['name', 'description', 'price', 'facilities', 'rules', 'images', 'booking_type', 'species', 'amenities', 'region', 'type', 'location', 'booking_options'];
    const updates = {};
    allowed.forEach(k => {
      // Convert camelCase to snake_case if needed
      const snakeCaseKey = k === 'bookingType' ? 'booking_type' : k;
      if (req.body[k] !== undefined) updates[snakeCaseKey] = req.body[k];
      if (req.body[snakeCaseKey] !== undefined) updates[snakeCaseKey] = req.body[snakeCaseKey];
    });

    updates.last_edited_at = new Date().toISOString();

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

// Request removal of a water listing
app.post('/api/owner/waters/:id/request-removal', authenticateToken, async (req, res) => {
  try {
    const waterId = req.params.id;
    const { data: water, error: fetchError } = await supabase
      .from('waters')
      .select('*')
      .eq('id', waterId)
      .single();

    const isOwner = water && (water.owner_id === req.user.id || water.owner_email === req.user.email);
    if (fetchError || !water || !isOwner) {
      return res.status(404).json({ error: 'Not found or not yours' });
    }

    const { error: updateError } = await supabase
      .from('waters')
      .update({ status: 'removal_requested' })
      .eq('id', waterId);

    if (updateError) {
      return res.status(400).json({ error: 'Failed to request removal' });
    }

    res.json({ message: 'Removal requested' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to request removal' });
  }
});

// Analytics for water owners
app.get('/api/owner/analytics', authenticateToken, async (req, res) => {
  try {
    // Get owner's water IDs
    const { data: waters } = await supabase
      .from('waters')
      .select('id, name')
      .eq('owner_id', req.user.id);

    if (!waters || waters.length === 0) {
      return res.json({ waters: [], totals: { views: 0, inquiries: 0, bookings: 0, favourites: 0 } });
    }

    const waterIds = waters.map(w => w.id);

    // Get page views per water (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: views } = await supabase
      .from('page_views')
      .select('water_id, viewed_at')
      .in('water_id', waterIds)
      .gte('viewed_at', thirtyDaysAgo);

    // Get inquiries per water
    const { data: inquiries } = await supabase
      .from('inquiries')
      .select('water_id, status, created_at')
      .in('water_id', waterIds);

    // Get favourites count per water
    const { data: favourites } = await supabase
      .from('favourite_waters')
      .select('water_id')
      .in('water_id', waterIds);

    // Get reviews per water
    const { data: reviews } = await supabase
      .from('reviews')
      .select('water_id, rating')
      .in('water_id', waterIds);

    // Build per-water analytics
    const waterAnalytics = waters.map(w => {
      const waterViews = (views || []).filter(v => v.water_id === w.id);
      const waterInquiries = (inquiries || []).filter(i => i.water_id === w.id);
      const waterFavourites = (favourites || []).filter(f => f.water_id === w.id);
      const waterReviews = (reviews || []).filter(r => r.water_id === w.id);
      const confirmed = waterInquiries.filter(i => i.status === 'confirmed');

      return {
        id: w.id,
        name: w.name,
        views: waterViews.length,
        inquiries: waterInquiries.length,
        bookings: confirmed.length,
        favourites: waterFavourites.length,
        avgRating: waterReviews.length > 0
          ? (waterReviews.reduce((sum, r) => sum + r.rating, 0) / waterReviews.length).toFixed(1)
          : null,
        reviewCount: waterReviews.length
      };
    });

    // Build daily views for the chart (last 30 days)
    const dailyViews = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      dailyViews[date] = 0;
    }
    (views || []).forEach(v => {
      const date = v.viewed_at.split('T')[0];
      if (dailyViews[date] !== undefined) dailyViews[date]++;
    });

    const totals = {
      views: (views || []).length,
      inquiries: (inquiries || []).length,
      bookings: (inquiries || []).filter(i => i.status === 'confirmed').length,
      favourites: (favourites || []).length
    };

    res.json({
      waters: waterAnalytics,
      totals,
      dailyViews: Object.entries(dailyViews).map(([date, count]) => ({ date, count }))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch analytics' });
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

// --- Owner: Respond to inquiry (confirm / decline) ---
app.put('/api/owner/inquiries/:id/respond', authenticateToken, requireRole('water_owner', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message: ownerMessage } = req.body;
    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be confirmed or declined' });
    }

    // Verify this inquiry belongs to one of the owner's waters
    const { data: waters } = await supabase.from('waters').select('id, name').eq('owner_id', req.user.id);
    const waterIds = waters?.map(w => w.id) || [];

    const { data: inquiry, error: fetchErr } = await supabase
      .from('inquiries').select('*').eq('id', id).single();

    if (fetchErr || !inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    if (!waterIds.includes(inquiry.water_id)) return res.status(403).json({ error: 'Not authorised' });

    const { error: updateErr } = await supabase
      .from('inquiries').update({ status }).eq('id', id);

    if (updateErr) return res.status(400).json({ error: 'Failed to update inquiry' });

    // Email the angler
    const waterName = waters.find(w => w.id === inquiry.water_id)?.name || 'the water';
    const anglerEmail = inquiry.user_email;
    const anglerName = inquiry.user_name || 'there';

    if (anglerEmail) {
      if (status === 'confirmed') {
        const tmpl = emailTemplates.inquiryConfirmed({ anglerName, locationName: waterName, ownerMessage, date: inquiry.date });
        sendEmail({ to: anglerEmail, ...tmpl });
      } else {
        const tmpl = emailTemplates.inquiryDeclined({ anglerName, locationName: waterName, ownerMessage });
        sendEmail({ to: anglerEmail, ...tmpl });
      }
    }

    res.json({ message: `Inquiry ${status}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to respond to inquiry' });
  }
});

// --- Instructor: Respond to inquiry (confirm / decline) ---
app.put('/api/instructor/inquiries/:id/respond', authenticateToken, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message: instructorMessage } = req.body;
    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be confirmed or declined' });
    }

    // Verify this inquiry belongs to the instructor
    const { data: instructor } = await supabase
      .from('instructors').select('id, name').eq('user_id', req.user.id).single();

    if (!instructor) return res.status(404).json({ error: 'Instructor not found' });

    const { data: inquiry, error: fetchErr } = await supabase
      .from('inquiries').select('*').eq('id', id).single();

    if (fetchErr || !inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    if (inquiry.instructor_id !== instructor.id) return res.status(403).json({ error: 'Not authorised' });

    const { error: updateErr } = await supabase
      .from('inquiries').update({ status }).eq('id', id);

    if (updateErr) return res.status(400).json({ error: 'Failed to update inquiry' });

    // Email the angler
    const anglerEmail = inquiry.user_email;
    const anglerName = inquiry.user_name || 'there';

    if (anglerEmail) {
      if (status === 'confirmed') {
        const tmpl = emailTemplates.inquiryConfirmed({ anglerName, locationName: instructor.name, ownerMessage: instructorMessage, date: inquiry.date });
        sendEmail({ to: anglerEmail, ...tmpl });
      } else {
        const tmpl = emailTemplates.inquiryDeclined({ anglerName, locationName: instructor.name, ownerMessage: instructorMessage });
        sendEmail({ to: anglerEmail, ...tmpl });
      }
    }

    res.json({ message: `Inquiry ${status}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to respond to inquiry' });
  }
});

// ============================================================================
// INSTRUCTOR ROUTES
// ============================================================================

app.get('/api/instructor/profile', authenticateToken, async (req, res) => {
  try {
    // Try by user_id first, then by email
    let { data: instructor, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !instructor) {
      const { data: byEmail } = await supabase
        .from('instructors')
        .select('*')
        .eq('email', req.user.email)
        .single();
      instructor = byEmail;
    }

    if (!instructor) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ instructor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/instructor/profile', authenticateToken, async (req, res) => {
  try {
    const { data: instructor, error: fetchError } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !instructor) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const allowed = ['name', 'bio', 'price', 'availability', 'specialties', 'images', 'phone', 'region', 'certifications', 'experience', 'booking_options', 'what_you_learn', 'teaching_philosophy', 'equipment_provided'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    updates.last_edited_at = new Date().toISOString();

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

app.post('/api/instructor/profile/request-removal', authenticateToken, async (req, res) => {
  try {
    const { data: instructor, error: fetchError } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !instructor) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { error } = await supabase
      .from('instructors')
      .update({ status: 'removal_requested' })
      .eq('id', instructor.id);

    if (error) {
      return res.status(400).json({ error: 'Failed to request removal' });
    }

    res.json({ message: 'Removal requested' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to request removal' });
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

    // Validate file extension
    const ext = fileName.split('.').pop().toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({ error: `Invalid file type. Allowed: ${allowedExts.join(', ')}` });
    }

    // Strip data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(400).json({ error: 'Image too large. Maximum size is 5MB.' });
    }

    // Determine content type
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
   TheAnglersNet Backend Server Running on Port ${PORT}
=====================================================

Using Supabase Database:
  URL: ${SUPABASE_URL}

Admin Login:
  Email: admin@theanglersnet.co.uk

API Endpoints:
  Auth:    POST /api/auth/register, /api/auth/login
  Waters:  GET /api/waters, /api/waters/:id
  Guides:  GET /api/instructors, /api/instructors/:id
  Favs:    POST/DELETE /api/favourites/waters/:id
  Admin:   GET /api/admin/stats, /api/admin/pending

=====================================================
  `);
});
