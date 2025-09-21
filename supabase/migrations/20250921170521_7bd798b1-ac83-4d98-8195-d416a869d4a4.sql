-- Update sports_categories table with proper enum values
INSERT INTO public.sports_categories (name, display_name, description, icon_name) VALUES
('basketball', 'Basketball', 'Fast-paced team sport played on a court with hoops', 'Basketball'),
('soccer', 'Soccer/Football', 'World''s most popular sport played with feet and a ball', 'Football'),
('tennis', 'Tennis', 'Racket sport played individually or in doubles', 'Racquet'),
('swimming', 'Swimming', 'Water sport great for fitness and competition', 'Waves'),
('volleyball', 'Volleyball', 'Team sport played with hands over a net', 'VolleyBall'),
('baseball', 'Baseball', 'Bat and ball sport with bases and innings', 'Baseball'),
('track_field', 'Track & Field', 'Collection of running, jumping, and throwing events', 'Trophy'),
('martial_arts', 'Martial Arts', 'Combat sports and self-defense disciplines', 'Shield'),
('gymnastics', 'Gymnastics', 'Sport involving strength, flexibility, and artistry', 'Star'),
('other', 'Other Sports', 'Various other recreational and competitive sports', 'Target')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name;

-- Create admin_users table for dedicated admin management
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_super_admin BOOLEAN DEFAULT false,
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Super admins can manage all admin accounts"
ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users a
    WHERE a.user_id = auth.uid() AND a.is_super_admin = true
  )
);

CREATE POLICY "Admins can view admin accounts"
ON public.admin_users
FOR SELECT
USING (is_admin());

-- Add trigger for admin_users updated_at
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to include more fields for comprehensive user data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_sports sport_category[],
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS activity_preferences TEXT[],
ADD COLUMN IF NOT EXISTS budget_range_min NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_range_max NUMERIC DEFAULT 1000,
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS availability_schedule JSONB,
ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
ADD COLUMN IF NOT EXISTS parent_guardian_name TEXT,
ADD COLUMN IF NOT EXISTS parent_guardian_phone TEXT,
ADD COLUMN IF NOT EXISTS school_institution TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Enhanced recommendations table with AI tracking
ALTER TABLE public.recommendations 
ADD COLUMN IF NOT EXISTS algorithm_version TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS input_factors JSONB,
ADD COLUMN IF NOT EXISTS recommendation_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_interaction_data JSONB,
ADD COLUMN IF NOT EXISTS effectiveness_rating INTEGER,
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE;

-- Create leaderboards table for gamification
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- weekly, monthly, yearly, all_time
  sport_category sport_category,
  rank INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leaderboards
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboards
CREATE POLICY "Anyone can view leaderboards"
ON public.leaderboards
FOR SELECT
USING (true);

CREATE POLICY "System can manage leaderboards"
ON public.leaderboards
FOR ALL
USING (is_admin());

-- Add trigger for leaderboards updated_at
CREATE TRIGGER update_leaderboards_updated_at
BEFORE UPDATE ON public.leaderboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create daily_challenges table for engagement
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- activity, social, learning
  sport_category sport_category,
  target_value INTEGER,
  points_reward INTEGER NOT NULL DEFAULT 10,
  difficulty_level difficulty_level DEFAULT 'beginner',
  active_date DATE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on daily_challenges
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_challenges
CREATE POLICY "Anyone can view active challenges"
ON public.daily_challenges
FOR SELECT
USING (is_active = true AND active_date <= CURRENT_DATE AND expires_at > now());

CREATE POLICY "Admins can manage challenges"
ON public.daily_challenges
FOR ALL
USING (is_admin());

-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on user_challenge_progress
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_challenge_progress
CREATE POLICY "Users can view their own challenge progress"
ON public.user_challenge_progress
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own challenge progress"
ON public.user_challenge_progress
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own challenge progress"
ON public.user_challenge_progress
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all challenge progress"
ON public.user_challenge_progress
FOR SELECT
USING (is_admin());

-- Add trigger for user_challenge_progress updated_at
CREATE TRIGGER update_user_challenge_progress_updated_at
BEFORE UPDATE ON public.user_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();