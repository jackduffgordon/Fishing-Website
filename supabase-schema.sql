-- ============================================
-- TIGHTLINES - SUPABASE SCHEMA
-- Full database schema for the fishing platform
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  bio TEXT,
  favourite_species TEXT,
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'water_owner', 'instructor', 'pending_water_owner', 'pending_instructor')),
  notifications JSONB DEFAULT '{"bookings": true, "catches": true, "newsletters": true, "promotions": false}'::jsonb,
  privacy JSONB DEFAULT '{"profilePublic": true, "showCatches": true, "showFavourites": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WATERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('game', 'coarse', 'sea')),
  water_body_type TEXT,
  region TEXT NOT NULL,
  location TEXT,
  town_city TEXT,
  county TEXT,
  postcode TEXT,
  description TEXT,
  highlights TEXT[],
  species TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  price_type TEXT DEFAULT 'day',
  booking_type TEXT DEFAULT 'enquiry' CHECK (booking_type IN ('instant', 'enquiry', 'free')),
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  facilities TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  experience_level TEXT,
  typical_session_hours INTEGER,
  best_time_of_day TEXT,
  average_catch_rate TEXT,
  blank_rate TEXT,
  record_fish TEXT,
  season_info TEXT,
  opening_hours TEXT,
  season_dates TEXT,
  coordinates JSONB,
  gallery JSONB DEFAULT '[]'::jsonb,
  nearby_stays JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '{}'::jsonb,
  reviews_list JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKING OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS booking_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  water_id UUID NOT NULL REFERENCES waters(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'day-tickets' CHECK (category IN ('day-tickets', 'guided', 'accommodation', 'extras')),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  price_type TEXT NOT NULL DEFAULT 'day' CHECK (price_type IN ('day', 'half-day', 'session', 'night', 'person', 'season', 'year')),
  booking_type TEXT NOT NULL DEFAULT 'enquiry' CHECK (booking_type IN ('instant', 'enquiry')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSTRUCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  region TEXT,
  specialties TEXT[] DEFAULT '{}',
  experience TEXT,
  bio TEXT,
  price INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  max_group_size INTEGER,
  has_calendar BOOLEAN DEFAULT false,
  availability TEXT[] DEFAULT '{}',
  typical_day JSONB DEFAULT '[]'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  reviews_list JSONB DEFAULT '[]'::jsonb,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAVOURITE WATERS
-- ============================================
CREATE TABLE IF NOT EXISTS favourite_waters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  water_id UUID NOT NULL REFERENCES waters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, water_id)
);

-- ============================================
-- FAVOURITE INSTRUCTORS
-- ============================================
CREATE TABLE IF NOT EXISTS favourite_instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, instructor_id)
);

-- ============================================
-- CATCHES / CATCH REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS catches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  water_id UUID REFERENCES waters(id) ON DELETE SET NULL,
  angler_name TEXT,
  species TEXT NOT NULL,
  weight NUMERIC(5,2),
  method TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INQUIRIES / BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  water_id UUID REFERENCES waters(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  booking_option_id UUID REFERENCES booking_options(id) ON DELETE SET NULL,
  date TEXT,
  start_date TEXT,
  end_date TEXT,
  number_of_days INTEGER,
  message TEXT,
  type TEXT DEFAULT 'enquiry' CHECK (type IN ('booking', 'enquiry')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_waters_status ON waters(status);
CREATE INDEX IF NOT EXISTS idx_waters_type ON waters(type);
CREATE INDEX IF NOT EXISTS idx_waters_region ON waters(region);
CREATE INDEX IF NOT EXISTS idx_waters_owner ON waters(owner_id);
CREATE INDEX IF NOT EXISTS idx_booking_options_water ON booking_options(water_id);
CREATE INDEX IF NOT EXISTS idx_instructors_status ON instructors(status);
CREATE INDEX IF NOT EXISTS idx_instructors_region ON instructors(region);
CREATE INDEX IF NOT EXISTS idx_favourite_waters_user ON favourite_waters(user_id);
CREATE INDEX IF NOT EXISTS idx_favourite_instructors_user ON favourite_instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_water ON catches(water_id);
CREATE INDEX IF NOT EXISTS idx_catches_user ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_water ON inquiries(water_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waters ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourite_waters ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourite_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read policies (no auth needed for browsing)
CREATE POLICY "waters_public_read" ON waters FOR SELECT USING (status = 'approved');
CREATE POLICY "booking_options_public_read" ON booking_options FOR SELECT USING (true);
CREATE POLICY "instructors_public_read" ON instructors FOR SELECT USING (status = 'approved');
CREATE POLICY "catches_public_read" ON catches FOR SELECT USING (true);

-- Service role can do everything (backend uses service key)
CREATE POLICY "service_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_waters" ON waters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_booking_options" ON booking_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_instructors" ON instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_favourite_waters" ON favourite_waters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_favourite_instructors" ON favourite_instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_catches" ON catches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_inquiries" ON inquiries FOR ALL USING (true) WITH CHECK (true);
