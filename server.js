// TightLines Backend Server - Complete Version
// Express + JSON Database + JWT Auth + Role-Based Access

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
let nodemailer;
let emailTransporter;
try {
  nodemailer = require('nodemailer');
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
  console.log('[EMAIL] Nodemailer loaded');
} catch (e) {
  console.log('[EMAIL] Nodemailer not installed — emails disabled. Run: npm install nodemailer');
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'calypsoheights@gmail.com';

// Helper to send emails (fails silently if nodemailer not installed or SMTP not configured)
const sendEmail = async (to, subject, html) => {
  if (!emailTransporter || !process.env.SMTP_USER) {
    console.log(`[EMAIL NOT SENT - not configured] To: ${to}, Subject: ${subject}`);
    return false;
  }
  try {
    const fromAddress = process.env.SMTP_USER;
    await emailTransporter.sendMail({ from: `TightLines <${fromAddress}>`, to, subject, html });
    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    return false;
  }
};

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tightlines-secret-key-change-in-production';
const DB_PATH = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

const defaultDB = {
  users: [],
  waters: [
    {
      id: 1,
      name: 'River Test',
      ownerId: null,
      type: 'game',
      region: 'south-west',
      description: 'One of England\'s finest chalk streams, world-renowned for its wild brown trout and grayling fishing.',
      species: ['Brown Trout', 'Grayling', 'Rainbow Trout'],
      price: 150,
      bookingType: 'enquiry',
      rating: 4.9,
      reviewCount: 127,
      facilities: ['Parking', 'Ghillie Service', 'Rod Hire'],
      rules: ['Catch & Release', 'Barbless Hooks Only', 'No Wading'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Loch Lomond',
      ownerId: null,
      type: 'game',
      region: 'scotland',
      description: 'Scotland\'s largest freshwater loch offering exceptional salmon, trout and pike fishing.',
      species: ['Atlantic Salmon', 'Brown Trout', 'Pike', 'Perch'],
      price: 45,
      bookingType: 'instant',
      rating: 4.7,
      reviewCount: 89,
      facilities: ['Boat Hire', 'Parking', 'Tackle Shop'],
      rules: ['Permit Required', 'Catch Limits Apply'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Linear Fisheries',
      ownerId: null,
      type: 'coarse',
      region: 'south-east',
      description: 'Premier carp fishing complex with multiple lakes holding fish to 50lb+.',
      species: ['Carp', 'Tench', 'Bream', 'Roach'],
      price: 35,
      bookingType: 'instant',
      rating: 4.8,
      reviewCount: 234,
      facilities: ['24hr Fishing', 'On-site Shop', 'Cafe', 'Showers'],
      rules: ['Unhooking Mats Required', 'No Keepnets'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Chesil Beach',
      ownerId: null,
      type: 'sea',
      region: 'south-west',
      description: 'Iconic 18-mile shingle beach famous for bass, cod and mackerel fishing.',
      species: ['Bass', 'Cod', 'Mackerel', 'Plaice'],
      price: 0,
      bookingType: 'free',
      rating: 4.5,
      reviewCount: 156,
      facilities: ['Free Parking', 'Tackle Shops Nearby'],
      rules: ['Bass Size Limits', 'Check Local Bylaws'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'River Wye',
      ownerId: null,
      type: 'game',
      region: 'wales',
      description: 'Beautiful Welsh river famous for salmon and wild brown trout.',
      species: ['Atlantic Salmon', 'Brown Trout', 'Grayling'],
      price: 80,
      bookingType: 'enquiry',
      rating: 4.6,
      reviewCount: 98,
      facilities: ['Parking', 'Guides Available'],
      rules: ['Catch & Release for Salmon', 'Fly Only Sections'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Bewl Water',
      ownerId: null,
      type: 'game',
      region: 'south-east',
      description: 'England\'s largest reservoir in the South East, stocked with quality rainbow and brown trout.',
      species: ['Rainbow Trout', 'Brown Trout'],
      price: 32,
      bookingType: 'instant',
      rating: 4.4,
      reviewCount: 167,
      facilities: ['Boat Hire', 'Lodge', 'Restaurant', 'Tackle Shop'],
      rules: ['Catch Limits Apply', 'Barbless Hooks'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    }
  ],
  instructors: [
    {
      id: 1,
      userId: null,
      name: 'James Morrison',
      email: 'james@example.com',
      specialties: ['Fly Fishing', 'Salmon', 'Trout'],
      region: 'scotland',
      experience: '15 years',
      bio: 'AAPGAI qualified instructor specializing in salmon and trout fishing across the Scottish Highlands.',
      price: 250,
      rating: 4.9,
      reviewCount: 67,
      certifications: ['AAPGAI', 'SGAIC'],
      availability: ['Weekdays', 'Weekends'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      userId: null,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      specialties: ['Carp Fishing', 'Coarse', 'Beginners'],
      region: 'midlands',
      experience: '10 years',
      bio: 'Passionate about introducing newcomers to fishing. Patient, friendly approach perfect for beginners.',
      price: 150,
      rating: 4.8,
      reviewCount: 89,
      certifications: ['Level 2 Angling Coach'],
      availability: ['Weekends'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      userId: null,
      name: 'Mike Thompson',
      email: 'mike@example.com',
      specialties: ['Sea Fishing', 'Bass', 'Shore Fishing'],
      region: 'south-west',
      experience: '20 years',
      bio: 'Expert sea angler with decades of experience along the South West coast. Specializing in bass fishing.',
      price: 180,
      rating: 4.7,
      reviewCount: 45,
      certifications: ['RYA Powerboat', 'First Aid'],
      availability: ['Weekdays', 'Weekends'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      userId: null,
      name: 'Emma Clarke',
      email: 'emma@example.com',
      specialties: ['Fly Tying', 'Fly Fishing', 'Women\'s Courses'],
      region: 'south-east',
      experience: '8 years',
      bio: 'Dedicated to making fly fishing accessible to everyone. Runs popular women-only introduction courses.',
      price: 175,
      rating: 4.9,
      reviewCount: 72,
      certifications: ['GAIA', 'Level 2 Coach'],
      availability: ['Weekdays'],
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString()
    }
  ],
  pendingWaters: [],
  pendingInstructors: [],
  favourite_waters: [],
  favourite_instructors: [],
  catches: [],
  inquiries: [],
  nextUserId: 2,
  nextWaterId: 7,
  nextInstructorId: 5,
  nextCatchId: 1,
  nextInquiryId: 1
};

// Load or init database
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      // Merge defaults with existing data
      return { ...defaultDB, ...data };
    }
  } catch (e) {
    console.error('DB load error:', e);
  }
  return { ...defaultDB };
}

function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

let db = loadDB();

// Create admin user if not exists
(async () => {
  let admin = db.users.find(u => u.email === 'admin@tightlines.co.uk');
  if (!admin) {
    const hashedPwd = await bcrypt.hash('admin123', 10);
    admin = {
      id: db.nextUserId++,
      email: 'admin@tightlines.co.uk',
      password: hashedPwd,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    db.users.push(admin);
    saveDB();
    console.log('Admin account created: admin@tightlines.co.uk / admin123');
  }
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

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !roles.includes(user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
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
    if (db.users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const user = {
      id: db.nextUserId++,
      email: email.toLowerCase(),
      password: hashedPwd,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDB();

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
    const user = db.users.find(u => u.email === email?.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

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

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt } });
});

// Password Reset - generates a new temporary password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = db.users.find(u => u.email === email.toLowerCase());
    if (!user) {
      // Don't reveal whether user exists — always show success
      return res.json({ message: 'If that email is registered, a new password has been generated.' });
    }

    // Generate new temporary password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    const hashedPwd = await bcrypt.hash(newPassword, 10);
    user.password = hashedPwd;
    saveDB();

    console.log(`\n=== PASSWORD RESET ===`);
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`SMTP_USER configured: ${!!process.env.SMTP_USER}`);
    console.log(`SMTP_PASS configured: ${!!process.env.SMTP_PASS}`);
    console.log(`Transporter exists: ${!!emailTransporter}`);
    console.log(`=====================\n`);

    // Send email BEFORE responding so we can see the result in logs
    console.log('[EMAIL] Attempting to send password reset email...');
    try {
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
      console.log('[EMAIL] Result:', emailResult);
    } catch (emailErr) {
      console.error('[EMAIL] FAILED:', emailErr);
    }

    res.json({ message: 'If that email is registered, a new password has been sent to your inbox.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// ============================================================================
// BOOKING ROUTES
// ============================================================================

app.post('/api/bookings', optionalAuth, (req, res) => {
  const { waterId, instructorId, date, startDate, endDate, numberOfDays, anglerName, anglerEmail, anglerPhone, message, type } = req.body;
  if (!date && !startDate) return res.status(400).json({ error: 'Date required' });
  if (!anglerName || !anglerEmail) return res.status(400).json({ error: 'Name and email required' });

  const booking = {
    id: db.nextInquiryId++,
    userId: req.user?.id || null,
    userName: anglerName,
    userEmail: anglerEmail,
    userPhone: anglerPhone || '',
    waterId: waterId || null,
    instructorId: instructorId || null,
    date: date || startDate,
    startDate: startDate || date,
    endDate: endDate || startDate || date,
    numberOfDays: numberOfDays || 1,
    message: message || '',
    type: type || 'booking',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  db.inquiries.push(booking);
  saveDB();
  res.json({ message: 'Booking confirmed!', bookingId: booking.id, booking });
});

// Contact/inquiry endpoint (no auth required for public enquiries)
app.post('/api/contact', (req, res) => {
  const { waterId, instructorId, name, email, phone, message, date, type } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required' });

  const inquiry = {
    id: db.nextInquiryId++,
    userId: null,
    userName: name,
    userEmail: email,
    userPhone: phone || '',
    waterId: waterId || null,
    instructorId: instructorId || null,
    date: date || null,
    message,
    type: type || 'enquiry',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.inquiries.push(inquiry);
  saveDB();
  res.json({ message: 'Enquiry submitted! We\'ll be in touch soon.', inquiryId: inquiry.id });
});

// ============================================================================
// WATERS ROUTES (Public)
// ============================================================================

app.get('/api/waters', optionalAuth, (req, res) => {
  let waters = db.waters.filter(w => w.status === 'approved');
  const { type, region, species, minPrice, maxPrice, search } = req.query;

  if (type) waters = waters.filter(w => w.type === type);
  if (region) waters = waters.filter(w => w.region === region);
  if (species) {
    const list = species.split(',');
    waters = waters.filter(w => list.some(s => w.species.includes(s)));
  }
  if (minPrice) waters = waters.filter(w => w.price >= parseInt(minPrice));
  if (maxPrice) waters = waters.filter(w => w.price <= parseInt(maxPrice));
  if (search) {
    const s = search.toLowerCase();
    waters = waters.filter(w =>
      w.name.toLowerCase().includes(s) ||
      w.description.toLowerCase().includes(s) ||
      w.species.some(sp => sp.toLowerCase().includes(s))
    );
  }

  res.json({ waters });
});

app.get('/api/waters/:id', (req, res) => {
  const water = db.waters.find(w => w.id === parseInt(req.params.id));
  if (!water) return res.status(404).json({ error: 'Not found' });
  res.json({ water });
});

// ============================================================================
// INSTRUCTORS ROUTES (Public)
// ============================================================================

app.get('/api/instructors', optionalAuth, (req, res) => {
  let instructors = db.instructors.filter(i => i.status === 'approved');
  const { region, specialty, search } = req.query;

  if (region) instructors = instructors.filter(i => i.region === region);
  if (specialty) {
    const list = specialty.split(',');
    instructors = instructors.filter(i => list.some(s => i.specialties.includes(s)));
  }
  if (search) {
    const s = search.toLowerCase();
    instructors = instructors.filter(i =>
      i.name.toLowerCase().includes(s) ||
      i.bio.toLowerCase().includes(s)
    );
  }

  res.json({ instructors });
});

app.get('/api/instructors/:id', (req, res) => {
  const instructor = db.instructors.find(i => i.id === parseInt(req.params.id));
  if (!instructor) return res.status(404).json({ error: 'Not found' });
  res.json({ instructor });
});

// ============================================================================
// FAVOURITES ROUTES
// ============================================================================

app.get('/api/user/favourites', authenticateToken, (req, res) => {
  const waters = db.favourite_waters.filter(f => f.userId === req.user.id).map(f => f.waterId);
  const instructors = db.favourite_instructors.filter(f => f.userId === req.user.id).map(f => f.instructorId);
  res.json({ waters, instructors });
});

app.post('/api/favourites/waters', authenticateToken, (req, res) => {
  const { waterId } = req.body;
  if (!waterId) return res.status(400).json({ error: 'waterId required' });

  const exists = db.favourite_waters.find(f => f.userId === req.user.id && f.waterId === waterId);
  if (!exists) {
    db.favourite_waters.push({ userId: req.user.id, waterId, createdAt: new Date().toISOString() });
    saveDB();
  }
  res.json({ message: 'Added to favourites', waterId });
});

app.delete('/api/favourites/waters/:id', authenticateToken, (req, res) => {
  const waterId = parseInt(req.params.id);
  db.favourite_waters = db.favourite_waters.filter(f => !(f.userId === req.user.id && f.waterId === waterId));
  saveDB();
  res.json({ message: 'Removed', waterId });
});

app.post('/api/favourites/instructors', authenticateToken, (req, res) => {
  const { instructorId } = req.body;
  if (!instructorId) return res.status(400).json({ error: 'instructorId required' });

  const exists = db.favourite_instructors.find(f => f.userId === req.user.id && f.instructorId === instructorId);
  if (!exists) {
    db.favourite_instructors.push({ userId: req.user.id, instructorId, createdAt: new Date().toISOString() });
    saveDB();
  }
  res.json({ message: 'Added to favourites', instructorId });
});

app.delete('/api/favourites/instructors/:id', authenticateToken, (req, res) => {
  const instructorId = parseInt(req.params.id);
  db.favourite_instructors = db.favourite_instructors.filter(f => !(f.userId === req.user.id && f.instructorId === instructorId));
  saveDB();
  res.json({ message: 'Removed', instructorId });
});

// ============================================================================
// CATCHES ROUTES
// ============================================================================

app.post('/api/catches', authenticateToken, (req, res) => {
  const { waterId, species, weight, method, comment } = req.body;
  if (!waterId || !species) return res.status(400).json({ error: 'waterId and species required' });

  const c = {
    id: db.nextCatchId++,
    userId: req.user.id,
    waterId,
    species,
    weight,
    method,
    comment,
    createdAt: new Date().toISOString(),
    anglerName: req.user.name
  };
  db.catches.push(c);
  saveDB();
  res.json({ message: 'Catch reported', catchId: c.id });
});

app.get('/api/catches/water/:id', (req, res) => {
  const catches = db.catches.filter(c => c.waterId === parseInt(req.params.id));
  res.json({ catches });
});

// ============================================================================
// REGISTRATION FORMS - List Water / Register Instructor
// ============================================================================

app.post('/api/register/water', async (req, res) => {
  try {
    const { ownerName, ownerEmail, ownerPhone, waterName, waterType, region, description, species, price, bookingType, facilities, rules } = req.body;

    // Create or find user
    let user = db.users.find(u => u.email === ownerEmail?.toLowerCase());
    let isNewUser = false;
    let tempPassword = null;

    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8);
      const hashedPwd = await bcrypt.hash(tempPassword, 10);
      user = {
        id: db.nextUserId++,
        email: ownerEmail.toLowerCase(),
        password: hashedPwd,
        name: ownerName,
        phone: ownerPhone,
        role: 'pending_water_owner',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      isNewUser = true;
    }

    const water = {
      id: db.nextWaterId++,
      name: waterName,
      ownerId: user.id,
      ownerName,
      ownerEmail,
      ownerPhone,
      type: waterType,
      region,
      description,
      species: species || [],
      price: parseInt(price) || 0,
      bookingType: bookingType || 'enquiry',
      rating: 0,
      reviewCount: 0,
      facilities: facilities || [],
      rules: rules || [],
      images: [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.pendingWaters.push(water);
    saveDB();

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

    let user = db.users.find(u => u.email === email?.toLowerCase());
    let isNewUser = false;
    let tempPassword = null;

    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8);
      const hashedPwd = await bcrypt.hash(tempPassword, 10);
      user = {
        id: db.nextUserId++,
        email: email.toLowerCase(),
        password: hashedPwd,
        name,
        phone,
        role: 'pending_instructor',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      isNewUser = true;
    }

    const instructor = {
      id: db.nextInstructorId++,
      userId: user.id,
      name,
      email,
      phone,
      specialties: specialties || [],
      region,
      experience,
      bio,
      price: parseInt(price) || 0,
      rating: 0,
      reviewCount: 0,
      certifications: certifications || [],
      availability: availability || [],
      images: [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.pendingInstructors.push(instructor);
    saveDB();

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

app.post('/api/inquiries', authenticateToken, (req, res) => {
  const { waterId, instructorId, date, message, type } = req.body;

  const inquiry = {
    id: db.nextInquiryId++,
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    waterId,
    instructorId,
    date,
    message,
    type,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.inquiries.push(inquiry);
  saveDB();
  res.json({ message: 'Inquiry submitted', inquiryId: inquiry.id });
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.get('/api/admin/stats', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({
    totalUsers: db.users.length,
    totalWaters: db.waters.length,
    totalInstructors: db.instructors.length,
    pendingWaters: db.pendingWaters.length,
    pendingInstructors: db.pendingInstructors.length,
    totalInquiries: db.inquiries.length,
    totalCatches: db.catches.length
  });
});

app.get('/api/admin/pending', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ pendingWaters: db.pendingWaters, pendingInstructors: db.pendingInstructors });
});

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  const users = db.users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }));
  res.json({ users });
});

app.get('/api/admin/waters', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ approved: db.waters, pending: db.pendingWaters });
});

app.get('/api/admin/instructors', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ approved: db.instructors, pending: db.pendingInstructors });
});

app.post('/api/admin/approve/water/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.pendingWaters.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const water = db.pendingWaters.splice(idx, 1)[0];
  water.status = 'approved';
  db.waters.push(water);

  // Upgrade user role
  const user = db.users.find(u => u.id === water.ownerId);
  if (user && user.role === 'pending_water_owner') user.role = 'water_owner';

  saveDB();
  res.json({ message: 'Approved', water });
});

app.post('/api/admin/reject/water/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  db.pendingWaters = db.pendingWaters.filter(w => w.id !== id);
  saveDB();
  res.json({ message: 'Rejected' });
});

app.post('/api/admin/approve/instructor/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.pendingInstructors.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const instructor = db.pendingInstructors.splice(idx, 1)[0];
  instructor.status = 'approved';
  db.instructors.push(instructor);

  const user = db.users.find(u => u.id === instructor.userId);
  if (user && user.role === 'pending_instructor') user.role = 'instructor';

  saveDB();
  res.json({ message: 'Approved', instructor });
});

app.post('/api/admin/reject/instructor/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  db.pendingInstructors = db.pendingInstructors.filter(i => i.id !== id);
  saveDB();
  res.json({ message: 'Rejected' });
});

app.put('/api/admin/waters/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.waters.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.waters[idx] = { ...db.waters[idx], ...req.body };
  saveDB();
  res.json({ message: 'Updated', water: db.waters[idx] });
});

app.delete('/api/admin/waters/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  db.waters = db.waters.filter(w => w.id !== id);
  saveDB();
  res.json({ message: 'Deleted' });
});

app.put('/api/admin/instructors/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.instructors.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.instructors[idx] = { ...db.instructors[idx], ...req.body };
  saveDB();
  res.json({ message: 'Updated', instructor: db.instructors[idx] });
});

app.delete('/api/admin/instructors/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  db.instructors = db.instructors.filter(i => i.id !== id);
  saveDB();
  res.json({ message: 'Deleted' });
});

// ============================================================================
// WATER OWNER ROUTES
// ============================================================================

app.get('/api/owner/waters', authenticateToken, requireRole('water_owner', 'admin'), (req, res) => {
  const waters = db.waters.filter(w => w.ownerId === req.user.id);
  res.json({ waters });
});

app.put('/api/owner/waters/:id', authenticateToken, requireRole('water_owner', 'admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.waters.findIndex(w => w.id === id && w.ownerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found or not yours' });

  const allowed = ['description', 'price', 'facilities', 'rules', 'images', 'bookingType'];
  allowed.forEach(k => { if (req.body[k] !== undefined) db.waters[idx][k] = req.body[k]; });
  saveDB();
  res.json({ message: 'Updated', water: db.waters[idx] });
});

app.get('/api/owner/inquiries', authenticateToken, requireRole('water_owner', 'admin'), (req, res) => {
  const waterIds = db.waters.filter(w => w.ownerId === req.user.id).map(w => w.id);
  const inquiries = db.inquiries.filter(i => waterIds.includes(i.waterId));
  res.json({ inquiries });
});

// ============================================================================
// INSTRUCTOR ROUTES
// ============================================================================

app.get('/api/instructor/profile', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
  const instructor = db.instructors.find(i => i.userId === req.user.id);
  if (!instructor) return res.status(404).json({ error: 'Profile not found' });
  res.json({ instructor });
});

app.put('/api/instructor/profile', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
  const idx = db.instructors.findIndex(i => i.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Profile not found' });

  const allowed = ['bio', 'price', 'availability', 'specialties', 'images'];
  allowed.forEach(k => { if (req.body[k] !== undefined) db.instructors[idx][k] = req.body[k]; });
  saveDB();
  res.json({ message: 'Updated', instructor: db.instructors[idx] });
});

app.get('/api/instructor/inquiries', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
  const instructor = db.instructors.find(i => i.userId === req.user.id);
  if (!instructor) return res.status(404).json({ error: 'Not found' });
  const inquiries = db.inquiries.filter(i => i.instructorId === instructor.id);
  res.json({ inquiries });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
=====================================================
   TightLines Backend Server Running on Port ${PORT}
=====================================================

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
