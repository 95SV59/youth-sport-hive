import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Recommendation } from '@/types';

export function useRecommendations() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (forceNew = false) => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      // Add timeout to prevent hanging on AI recommendations
      const recommendationPromise = supabase.functions.invoke('ai-sport-recommendations', {
        body: {
          userId: user.id,
          profileId: profile.id,
          forceNewRecommendation: forceNew
        }
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Recommendation timeout')), 30000)
      );

      const { data, error } = await Promise.race([
        recommendationPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Recommendation error:', error);
        throw error;
      }

      if (data && data.recommendations) {
        setRecommendations(data.recommendations);
        
        if (!data.cached && data.recommendations?.length > 0) {
          toast({
            title: "New Recommendations Generated!",
            description: "We've found some great sports for you to try.",
          });
        }
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
      
      if (error.message === 'Recommendation timeout') {
        toast({
          title: "Timeout Error",
          description: "Recommendations are taking too long to generate. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate recommendations. Please complete your profile and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationFeedback = async (
    recommendationId: string, 
    wasAccepted: boolean, 
    feedback?: string,
    sportType?: string,
    timeToDecisionSeconds?: number
  ) => {
    if (!user) return;

    try {
      // Update recommendation
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

      // Update user sport preference (learning)
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

      // Track analytics
      const { error: analyticsError } = await supabase
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

      if (analyticsError) {
        console.error('Error tracking analytics:', analyticsError);
      }

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our recommendations.",
      });
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, profile]);

  return {
    recommendations,
    loading,
    fetchRecommendations,
    updateRecommendationFeedback
  };
}