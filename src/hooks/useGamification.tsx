import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  sport_category: string;
  target_value: number;
  points_reward: number;
  difficulty_level: string;
  active_date: string;
  expires_at: string;
  progress?: {
    current_progress: number;
    completed: boolean;
    points_earned: number;
  };
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  points: number;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export function useGamification() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboards, setLeaderboards] = useState<{
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    yearly: LeaderboardEntry[];
  }>({
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [loading, setLoading] = useState(false);

  const fetchChallenges = async () => {
    if (!user || !profile) return;

    try {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .lte('active_date', new Date().toISOString().split('T')[0]);

      if (challengesError) throw challengesError;

      // Fetch user progress for these challenges
      const challengeIds = challengesData.map(c => c.id);
      const { data: progressData } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('challenge_id', challengeIds);

      // Merge challenges with progress
      const challengesWithProgress = challengesData.map(challenge => ({
        ...challenge,
        progress: progressData?.find(p => p.challenge_id === challenge.id)
      }));

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      const periods = ['weekly', 'monthly', 'yearly'];
      const leaderboardData: any = {};

      for (const period of periods) {
        const { data, error } = await supabase
          .from('leaderboards')
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('category', period)
          .order('rank', { ascending: true })
          .limit(10);

        if (error) throw error;
        leaderboardData[period] = data || [];
      }

      setLeaderboards(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  const startChallenge = async (challengeId: string) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          challenge_id: challengeId,
          current_progress: 0,
          completed: false
        });

      if (error) throw error;

      toast({
        title: "Challenge Started!",
        description: "Good luck! You can track your progress in the challenges section.",
      });

      fetchChallenges(); // Refresh to show progress
    } catch (error) {
      console.error('Error starting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to start challenge. You may have already started it.",
        variant: "destructive",
      });
    }
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    if (!user) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const completed = progress >= challenge.target_value;

      const { error } = await supabase
        .from('user_challenge_progress')
        .update({
          current_progress: progress,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      if (completed) {
        // Trigger gamification engine for challenge completion
        await supabase.functions.invoke('gamification-engine', {
          body: {
            action: 'challenge_completed',
            userId: user.id,
            profileId: profile?.id,
            data: { challengeId }
          }
        });

        toast({
          title: "Challenge Completed! 🎉",
          description: `You earned ${challenge.points_reward} points!`,
        });
      }

      fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const awardEventAttendance = async (eventId: string) => {
    if (!user || !profile) return;

    try {
      await supabase.functions.invoke('gamification-engine', {
        body: {
          action: 'event_attended',
          userId: user.id,
          profileId: profile.id,
          eventId
        }
      });

      toast({
        title: "Points Earned! 🏆",
        description: "Great job attending the event!",
      });
    } catch (error) {
      console.error('Error awarding event attendance:', error);
    }
  };

  useEffect(() => {
    if (user && profile) {
      setLoading(true);
      Promise.all([
        fetchChallenges(),
        fetchLeaderboards()
      ]).finally(() => setLoading(false));
    }
  }, [user, profile]);

  return {
    challenges,
    leaderboards,
    loading,
    startChallenge,
    updateChallengeProgress,
    awardEventAttendance,
    fetchChallenges,
    fetchLeaderboards
  };
}