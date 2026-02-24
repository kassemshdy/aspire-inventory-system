-- Fix infinite recursion in user_profiles RLS policies
-- The issue: policies were checking user_profiles to determine access, causing recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Create new, non-recursive policies

-- 1. All authenticated users can view their own profile
CREATE POLICY "Enable read access for own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Enable update for own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Enable insert for authenticated users (for signup trigger)
CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. For admin functionality, we'll handle permissions in the application layer
-- instead of recursive RLS policies

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
