-- Create enum types for user roles and various categories
CREATE TYPE public.user_role AS ENUM ('student', 'parent', 'coach', 'admin');
CREATE TYPE public.sport_category AS ENUM ('basketball', 'soccer', 'tennis', 'swimming', 'baseball', 'volleyball', 'track_field', 'martial_arts', 'gymnastics', 'other');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all_levels');
CREATE TYPE public.event_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE public.registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.badge_type AS ENUM ('participation', 'achievement', 'streak', 'milestone', 'special');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sports_categories table
CREATE TABLE public.sports_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name sport_category NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaches table for coach-specific information
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  specializations sport_category[] NOT NULL DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[],
  hourly_rate DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT false,
  verification_documents TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_events_hosted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sport_category sport_category NOT NULL,
  difficulty_level difficulty_level NOT NULL DEFAULT 'all_levels',
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  age_min INTEGER DEFAULT 5,
  age_max INTEGER DEFAULT 18,
  equipment_provided TEXT[],
  equipment_required TEXT[],
  status event_status DEFAULT 'pending',
  image_url TEXT,
  cancellation_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'pending',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Create user_achievements table for badges and achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  points_awarded INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL
);

-- Create gamification_stats table
CREATE TABLE public.gamification_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  events_attended INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  favorite_sport sport_category,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recommendations table for AI recommendations
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommended_sport sport_category NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  reasoning TEXT,
  user_feedback TEXT,
  was_accepted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings_reviews table
CREATE TABLE public.ratings_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, reviewer_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamification_stats_updated_at
  BEFORE UPDATE ON public.gamification_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  
  -- Create gamification stats for the new user
  INSERT INTO public.gamification_stats (user_id, profile_id)
  VALUES (
    NEW.id,
    (SELECT id FROM public.profiles WHERE user_id = NEW.id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default sports categories
INSERT INTO public.sports_categories (name, display_name, description, icon_name) VALUES
('basketball', 'Basketball', 'Fast-paced team sport played on a court', 'basketball'),
('soccer', 'Soccer/Football', 'World''s most popular sport played with feet', 'soccer'),
('tennis', 'Tennis', 'Racquet sport played individually or in pairs', 'tennis'),
('swimming', 'Swimming', 'Aquatic sport and exercise activity', 'swimming'),
('baseball', 'Baseball', 'Bat-and-ball sport played between two teams', 'baseball'),
('volleyball', 'Volleyball', 'Team sport with a net and ball', 'volleyball'),
('track_field', 'Track & Field', 'Collection of running, jumping, and throwing events', 'track'),
('martial_arts', 'Martial Arts', 'Combat sports and self-defense practices', 'martial-arts'),
('gymnastics', 'Gymnastics', 'Sport involving exercises requiring physical strength and flexibility', 'gymnastics'),
('other', 'Other Sports', 'Various other sporting activities', 'other');