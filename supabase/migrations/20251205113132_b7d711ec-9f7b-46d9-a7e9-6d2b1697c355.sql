-- Recreate view with SECURITY INVOKER to respect RLS policies of the querying user
DROP VIEW IF EXISTS public.public_coach_profiles;

CREATE VIEW public.public_coach_profiles
WITH (security_invoker = true)
AS
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