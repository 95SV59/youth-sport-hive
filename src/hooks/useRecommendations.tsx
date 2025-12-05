import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Recommendation } from '@/types';

const CACHE_KEY = 'sport_recommendations_cache';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CachedRecommendations {
  recommendations: Recommendation[];
  timestamp: number;
  userId: string;
}

// Helper to get cached recommendations from localStorage
function getCachedRecommendations(userId: string): Recommendation[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedRecommendations = JSON.parse(cached);
    
    // Check if cache is valid (same user and not expired)
    if (data.userId !== userId) return null;
    if (Date.now() - data.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data.recommendations;
  } catch {
    return null;
  }
}

// Helper to save recommendations to localStorage
function setCachedRecommendations(userId: string, recommendations: Recommendation[]) {
  try {
    const data: CachedRecommendations = {
      recommendations,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
}

export function useRecommendations() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchRecommendations = useCallback(async (forceNew = false) => {
    if (!user || !profile) return;

    // Check localStorage cache first (instant)
    if (!forceNew) {
      const cached = getCachedRecommendations(user.id);
      if (cached && cached.length > 0) {
        setRecommendations(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const { data, error } = await supabase.functions.invoke('ai-sport-recommendations', {
        body: {
          userId: user.id,
          profileId: profile.id,
          forceNewRecommendation: forceNew
        }
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('Recommendation error:', error);
        throw error;
      }

      if (data && data.recommendations) {
        setRecommendations(data.recommendations);
        setCachedRecommendations(user.id, data.recommendations);
        
        if (!data.cached && data.recommendations?.length > 0) {
          toast({
            title: "New Recommendations Generated!",
            description: "We've found some great sports for you to try.",
          });
        }
      } else {
        setRecommendations([]);
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      
      // Try to use stale cache on error
      const staleCache = getCachedRecommendations(user.id);
      if (staleCache) {
        setRecommendations(staleCache);
        toast({
          title: "Using cached recommendations",
          description: "Showing your previous recommendations.",
        });
        return;
      }
      
      setRecommendations([]);
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        toast({
          title: "Timeout",
          description: "Recommendations are taking too long. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate recommendations. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, profile, toast]);

  const updateRecommendationFeedback = useCallback(async (
    recommendationId: string, 
    wasAccepted: boolean, 
    feedback?: string,
    sportType?: string,
    timeToDecisionSeconds?: number
  ) => {
    if (!user) return;

    try {
      const { error: recError } = await supabase
        .from('recommendations')
        .update({
          was_accepted: wasAccepted,
          user_feedback: feedback,
          user_interaction_data: {
            interacted_at: new Date().toISOString(),
            feedback_provided: !!feedback,
            timeToDecisionSeconds
          }
        })
        .eq('id', recommendationId);

      if (recError) throw recError;

      if (sportType) {
        const { error: prefError } = await supabase.rpc('update_sport_preference', {
          p_user_id: user.id,
          p_sport_type: sportType,
          p_is_positive: wasAccepted
        });

        if (prefError) {
          console.error('Error updating preference:', prefError);
        }
      }

      await supabase
        .from('recommendation_analytics')
        .insert({
          recommendation_id: recommendationId,
          user_id: user.id,
          time_to_decision_seconds: timeToDecisionSeconds,
          engagement_score: wasAccepted ? 1.0 : 0.0,
          context_data: {
            feedback_provided: !!feedback,
            feedback_length: feedback?.length || 0
          }
        });

      // Clear cache to get fresh recommendations next time
      localStorage.removeItem(CACHE_KEY);

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our recommendations.",
      });
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && profile && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchRecommendations();
    }
  }, [user, profile, fetchRecommendations]);

  // Reset ref when user changes
  useEffect(() => {
    fetchedRef.current = false;
  }, [user?.id]);

  return {
    recommendations,
    loading,
    fetchRecommendations,
    updateRecommendationFeedback
  };
}
