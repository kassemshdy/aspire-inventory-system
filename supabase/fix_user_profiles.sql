-- Fix: Update user_profiles to set full_name for test users
-- Problem: full_name is NULL for existing users, causing "Unknown" in activity logs

-- Update admin user
UPDATE user_profiles
SET full_name = 'Admin User'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@test.com'
);

-- Update manager user
UPDATE user_profiles
SET full_name = 'Manager User'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'manager@test.com'
);

-- Update viewer user
UPDATE user_profiles
SET full_name = 'Viewer User'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'viewer@test.com'
);

-- Verify the updates
SELECT
  up.id,
  au.email,
  up.full_name,
  up.role
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.role;
