-- 1. Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'parent', 'student');

-- 2. Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 6. Fix admin_users RLS recursion - drop problematic policy and recreate
DROP POLICY IF EXISTS "Admins can view all admin_users" ON public.admin_users;

CREATE POLICY "Admins can view admin_users"
ON public.admin_users FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 7. Fix profiles RLS - restrict to own profile only (protect PII)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow coaches to be discoverable (limited fields via application logic)
CREATE POLICY "Users can view coach profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches 
    WHERE coaches.user_id = profiles.id AND coaches.is_verified = true
  )
);

-- 8. Create notification trigger for event registrations
CREATE OR REPLACE FUNCTION public.notify_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.user_id, 
    'registration', 
    'Event Registration Confirmed', 
    'You have successfully registered for an event.'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_registration
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_registration();

-- 9. Migrate existing profile roles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role 
FROM public.profiles 
WHERE role IN ('admin', 'coach', 'parent', 'student')
ON CONFLICT (user_id, role) DO NOTHING;