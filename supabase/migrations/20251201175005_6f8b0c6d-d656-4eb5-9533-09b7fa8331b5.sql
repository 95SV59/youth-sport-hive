-- Fix the search_path security warning for the update_sport_preference function
DROP FUNCTION IF EXISTS public.update_sport_preference(UUID, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION public.update_sport_preference(
  p_user_id UUID,
  p_sport_type TEXT,
  p_is_positive BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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