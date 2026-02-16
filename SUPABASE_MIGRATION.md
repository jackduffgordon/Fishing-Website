# Supabase Migration - Add Catch Privacy & Verification

## What Changed
- Added `is_public` field to catches so users can keep catches private
- Added `verified` field to catches to mark catches from users with confirmed bookings
- Updated RLS policy to only show public catches to non-owners

## SQL Migration to Run

Go to your **Supabase Dashboard → SQL Editor** and run this:

```sql
-- Add new columns to catches table
ALTER TABLE catches
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Update the RLS policy for public catch reads
DROP POLICY IF EXISTS "catches_public_read" ON catches;
CREATE POLICY "catches_public_read" ON catches
FOR SELECT
USING (is_public = true);
```

## What This Does

1. **Adds `is_public` column**: Users can now choose to keep their catch reports private (only visible to them)
2. **Adds `verified` column**: Catches are automatically marked as verified if the user has a confirmed booking
3. **Updates RLS policy**: Only public catches are visible to everyone; private catches are only visible to the owner via service key

## Testing After Migration

1. **Report a catch as a guest** (no booking):
   - Should allow reporting
   - Catch will be unverified
   - Can choose public/private

2. **Report a catch with a confirmed booking**:
   - Should show green "Verified Booking" badge
   - Catch will be automatically marked as verified
   - Can still choose public/private

3. **View catches on water detail page**:
   - Should only see public catches
   - Private catches don't appear in the public list

## Note on Favorites Issue

The favorites functionality should work with your current RLS policies since you're using the **SUPABASE_SERVICE_KEY**. The service key bypasses all RLS policies.

If favorites still aren't working after the logging shows successful sync, check:

1. **Browser Console Logs**: Look for the `[Favorites]` log messages to see exactly where it's failing
2. **Network Tab**: Check if the POST requests to `/api/favourites/waters` are returning 200 OK
3. **Supabase Dashboard**: Check the `favourite_waters` and `favourite_instructors` tables to see if rows are being created

The updated code now:
- Reads directly from localStorage (not state)
- Only clears localStorage after 100% successful sync
- Has comprehensive error logging
- Retries are safe because duplicate inserts are handled
