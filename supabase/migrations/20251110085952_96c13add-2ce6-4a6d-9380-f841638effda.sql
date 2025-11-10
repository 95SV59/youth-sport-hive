
-- Add missing column to user_challenge_progress
ALTER TABLE public.user_challenge_progress
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Rename 'read' column to 'is_read' in notifications
ALTER TABLE public.notifications
RENAME COLUMN read TO is_read;

-- Add missing columns to gamification_stats
ALTER TABLE public.gamification_stats
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS events_attended INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Fix admin_users RLS policies (currently has no policies)
CREATE POLICY "Admins can view all admin_users" ON public.admin_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid())
);

CREATE POLICY "Only system can insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (false);

-- Fix update_updated_at_column function with CASCADE
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate all the triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamification_stats_updated_at BEFORE UPDATE ON public.gamification_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at BEFORE UPDATE ON public.user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON public.leaderboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
