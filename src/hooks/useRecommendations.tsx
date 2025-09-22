import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Recommendation {
  id: string;
  recommended_sport: string;
  reasoning: string;
  confidence_score: number;
  algorithm_version: string;
  created_at: string;
  benefits?: string[];
}

export function useRecommendations() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (forceNew = false) => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-sport-recommendations', {
        body: {
          userId: user.id,
          profileId: profile.id,
          forceNewRecommendation: forceNew
        }
      });

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
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please complete your profile and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationFeedback = async (recommendationId: string, wasAccepted: boolean, feedback?: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({
          was_accepted: wasAccepted,
          user_feedback: feedback,
          user_interaction_data: {
            interacted_at: new Date().toISOString(),
            feedback_provided: !!feedback
          }
        })
        .eq('id', recommendationId);

      if (error) throw error;

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