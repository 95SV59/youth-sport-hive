import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, profileId, eventId, data } = await req.json();

    switch (action) {
      case 'event_attended':
        return await handleEventAttended(supabase, userId, profileId, eventId);
      
      case 'challenge_completed':
        return await handleChallengeCompleted(supabase, userId, profileId, data.challengeId);
      
      case 'calculate_leaderboards':
        return await calculateLeaderboards(supabase);
      
      case 'award_achievement':
        return await awardAchievement(supabase, userId, profileId, data);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in gamification engine:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleEventAttended(supabase: any, userId: string, profileId: string, eventId: string) {
  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('sport_category, difficulty_level, cost')
    .eq('id', eventId)
    .single();

  if (!event) {
    throw new Error('Event not found');
  }

  // Calculate points based on event
  let points = 10; // Base points
  if (event.difficulty_level === 'intermediate') points += 5;
  if (event.difficulty_level === 'advanced') points += 10;
  if (event.cost > 50) points += 5; // Premium event bonus

  // Get current stats
  const { data: currentStats } = await supabase
    .from('gamification_stats')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (!currentStats) {
    throw new Error('User stats not found');
  }

  // Update streak
  const today = new Date().toDateString();
  const lastActivity = currentStats.last_activity_date ? 
    new Date(currentStats.last_activity_date).toDateString() : null;
  
  let newStreak = 1;
  if (lastActivity) {
    const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      newStreak = currentStats.current_streak + 1;
    } else if (daysDiff === 0) {
      newStreak = currentStats.current_streak; // Same day
    }
  }

  // Calculate new level
  const newTotalPoints = currentStats.total_points + points;
  const newLevel = Math.floor(newTotalPoints / 100) + 1;

  // Update stats
  const { data: updatedStats, error: updateError } = await supabase
    .from('gamification_stats')
    .update({
      total_points: newTotalPoints,
      current_level: newLevel,
      events_attended: currentStats.events_attended + 1,
      current_streak: newStreak,
      longest_streak: Math.max(currentStats.longest_streak, newStreak),
      last_activity_date: new Date().toISOString(),
      favorite_sport: event.sport_category
    })
    .eq('profile_id', profileId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  // Check for new achievements
  await checkAndAwardAchievements(supabase, userId, profileId, updatedStats, event);

  return new Response(
    JSON.stringify({ 
      success: true, 
      pointsEarned: points,
      newStats: updatedStats 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleChallengeCompleted(supabase: any, userId: string, profileId: string, challengeId: string) {
  // Get challenge details
  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Update challenge progress
  const { error: progressError } = await supabase
    .from('user_challenge_progress')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      points_earned: challenge.points_reward
    })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);

  if (progressError) {
    throw progressError;
  }

  // Update user stats
  const { data: currentStats } = await supabase
    .from('gamification_stats')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  const newTotalPoints = currentStats.total_points + challenge.points_reward;
  const newLevel = Math.floor(newTotalPoints / 100) + 1;

  await supabase
    .from('gamification_stats')
    .update({
      total_points: newTotalPoints,
      current_level: newLevel
    })
    .eq('profile_id', profileId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      pointsEarned: challenge.points_reward 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateLeaderboards(supabase: any) {
  const periods = [
    { category: 'weekly', days: 7 },
    { category: 'monthly', days: 30 },
    { category: 'yearly', days: 365 }
  ];

  for (const period of periods) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period.days);

    // Get top performers for the period
    const { data: topPerformers } = await supabase
      .from('gamification_stats')
      .select('user_id, profile_id, total_points')
      .gte('updated_at', startDate.toISOString())
      .order('total_points', { ascending: false })
      .limit(100);

    if (topPerformers) {
      // Clear existing leaderboard for this period
      await supabase
        .from('leaderboards')
        .delete()
        .eq('category', period.category)
        .gte('period_start', startDate.toISOString().split('T')[0]);

      // Insert new rankings
      const leaderboardEntries = topPerformers.map((performer, index) => ({
        user_id: performer.user_id,
        profile_id: performer.profile_id,
        category: period.category,
        rank: index + 1,
        points: performer.total_points,
        period_start: startDate.toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0]
      }));

      await supabase
        .from('leaderboards')
        .insert(leaderboardEntries);
    }
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkAndAwardAchievements(supabase: any, userId: string, profileId: string, stats: any, event: any) {
  const achievements = [];

  // First Event Achievement
  if (stats.events_attended === 1) {
    achievements.push({
      user_id: userId,
      profile_id: profileId,
      title: 'Getting Started',
      description: 'Attended your first sports event!',
      badge_type: 'first_event',
      points_awarded: 25,
      icon_name: 'Trophy'
    });
  }

  // Level Up Achievements
  if (stats.current_level === 5) {
    achievements.push({
      user_id: userId,
      profile_id: profileId,
      title: 'Rising Star',
      description: 'Reached level 5!',
      badge_type: 'level_milestone',
      points_awarded: 50,
      icon_name: 'Star'
    });
  }

  // Streak Achievements
  if (stats.current_streak === 7) {
    achievements.push({
      user_id: userId,
      profile_id: profileId,
      title: 'Week Warrior',
      description: 'Maintained a 7-day activity streak!',
      badge_type: 'streak',
      points_awarded: 75,
      icon_name: 'Calendar'
    });
  }

  // Insert achievements
  if (achievements.length > 0) {
    await supabase
      .from('user_achievements')
      .insert(achievements);
  }

  return achievements;
}

async function awardAchievement(supabase: any, userId: string, profileId: string, achievementData: any) {
  const { data: achievement, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      profile_id: profileId,
      ...achievementData
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ success: true, achievement }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}