
-- Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS age_min INTEGER,
ADD COLUMN IF NOT EXISTS age_max INTEGER;

-- Add missing columns to daily_challenges table  
ALTER TABLE public.daily_challenges
ADD COLUMN IF NOT EXISTS active_date DATE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Add foreign key from coaches to profiles
ALTER TABLE public.coaches DROP CONSTRAINT IF EXISTS coaches_user_id_fkey;
ALTER TABLE public.coaches ADD CONSTRAINT coaches_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from event_registrations to profiles  
ALTER TABLE public.event_registrations DROP CONSTRAINT IF EXISTS event_registrations_user_id_fkey;
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
