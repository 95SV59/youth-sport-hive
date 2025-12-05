-- Fix admin_users RLS infinite recursion by using direct subquery instead of is_admin() function
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;

CREATE POLICY "Admins can view admin_users"
ON public.admin_users FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create a public view for coach profiles that excludes sensitive PII
CREATE OR REPLACE VIEW public.public_coach_profiles AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.bio,
  p.avatar_url,
  c.id as coach_id,
  c.specializations,
  c.experience_years,
  c.rating,
  c.total_reviews,
  c.hourly_rate,
  c.is_verified
FROM profiles p
JOIN coaches c ON c.user_id = p.id
WHERE c.is_verified = true;

-- Drop the overly permissive coach profiles policy that exposes PII
DROP POLICY IF EXISTS "Users can view coach profiles" ON public.profiles;

-- Add policy for admins to view all profiles (needed for admin panel)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Add policy for admins to manage events (approve/reject)
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Add policy for admins to view all events including pending
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Add policy for admins to update coaches (verify them)
DROP POLICY IF EXISTS "Admins can update coaches" ON public.coaches;
CREATE POLICY "Admins can update coaches"
ON public.coaches FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Add policy for admins to view all coaches including unverified
DROP POLICY IF EXISTS "Admins can view all coaches" ON public.coaches;
CREATE POLICY "Admins can view all coaches"
ON public.coaches FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Add policy for admins to update user profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));