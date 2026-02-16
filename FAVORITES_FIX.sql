-- ============================================
-- FAVORITES FIX - Verify and fix favorites tables RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's make sure the tables exist with correct structure
CREATE TABLE IF NOT EXISTS favourite_waters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  water_id UUID NOT NULL REFERENCES waters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, water_id)
);

CREATE TABLE IF NOT EXISTS favourite_instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, instructor_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_favourite_waters_user ON favourite_waters(user_id);
CREATE INDEX IF NOT EXISTS idx_favourite_instructors_user ON favourite_instructors(user_id);

-- Enable RLS on both tables
ALTER TABLE favourite_waters ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourite_instructors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them fresh
DROP POLICY IF EXISTS "service_all_favourite_waters" ON favourite_waters;
DROP POLICY IF EXISTS "service_all_favourite_instructors" ON favourite_instructors;

-- Recreate the service policies (these allow ALL operations when using service key)
CREATE POLICY "service_all_favourite_waters"
ON favourite_waters
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "service_all_favourite_instructors"
ON favourite_instructors
FOR ALL
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('favourite_waters', 'favourite_instructors')
ORDER BY tablename, policyname;
