-- Create table for tracking user preferences and learning patterns
CREATE TABLE IF NOT EXISTS public.user_sport_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_type TEXT NOT NULL,
  preference_score NUMERIC DEFAULT 0.5, -- 0 to 1 scale
  interaction_count INTEGER DEFAULT 0,
  positive_interactions INTEGER DEFAULT 0,
  negative_interactions INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, sport_type)
);

-- Create table for recommendation analytics and success tracking
CREATE TABLE IF NOT EXISTS public.recommendation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_to_decision_seconds INTEGER,
  resulted_in_registration BOOLEAN DEFAULT false,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  engagement_score NUMERIC DEFAULT 0,
  ab_test_variant TEXT,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for A/B testing experiments
CREATE TABLE IF NOT EXISTS public.recommendation_experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  weight NUMERIC DEFAULT 0.5, -- probability of selection
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(experiment_name, variant_name)
);

-- Enable RLS
ALTER TABLE public.user_sport_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sport_preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_sport_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_sport_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_sport_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for recommendation_analytics
CREATE POLICY "Users can view own analytics"
  ON public.recommendation_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.recommendation_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON public.recommendation_analytics FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for recommendation_experiments
CREATE POLICY "Anyone can view active experiments"
  ON public.recommendation_experiments FOR SELECT
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX idx_user_sport_preferences_user_id ON public.user_sport_preferences(user_id);
CREATE INDEX idx_user_sport_preferences_sport_type ON public.user_sport_preferences(sport_type);
CREATE INDEX idx_recommendation_analytics_user_id ON public.recommendation_analytics(user_id);
CREATE INDEX idx_recommendation_analytics_recommendation_id ON public.recommendation_analytics(recommendation_id);
CREATE INDEX idx_recommendation_experiments_active ON public.recommendation_experiments(is_active);

-- Function to update preference scores based on interactions
CREATE OR REPLACE FUNCTION public.update_sport_preference(
  p_user_id UUID,
  p_sport_type TEXT,
  p_is_positive BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_sport_preferences (
    user_id,
    sport_type,
    interaction_count,
    positive_interactions,
    negative_interactions,
    preference_score,
    last_interaction_at
  ) VALUES (
    p_user_id,
    p_sport_type,
    1,
    CASE WHEN p_is_positive THEN 1 ELSE 0 END,
    CASE WHEN p_is_positive THEN 0 ELSE 1 END,
    CASE WHEN p_is_positive THEN 0.7 ELSE 0.3 END,
    now()
  )
  ON CONFLICT (user_id, sport_type)
  DO UPDATE SET
    interaction_count = user_sport_preferences.interaction_count + 1,
    positive_interactions = user_sport_preferences.positive_interactions + CASE WHEN p_is_positive THEN 1 ELSE 0 END,
    negative_interactions = user_sport_preferences.negative_interactions + CASE WHEN p_is_positive THEN 0 ELSE 1 END,
    preference_score = LEAST(1.0, GREATEST(0.0, 
      user_sport_preferences.preference_score + CASE WHEN p_is_positive THEN 0.1 ELSE -0.15 END
    )),
    last_interaction_at = now(),
    updated_at = now();
END;
$$;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_sport_preferences_updated_at
  BEFORE UPDATE ON public.user_sport_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();