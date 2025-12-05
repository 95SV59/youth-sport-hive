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

    // SECURITY: Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Invalid authentication:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, profileId, eventId, data } = await req.json();

    // SECURITY: Verify the user is operating on their own data
    if (user.id !== userId) {
      console.error('User attempted to modify another users gamification data');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Cannot modify other users data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Gamification action: ${action} for authenticated user: ${userId}`);

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
    .eq('user_id', userId)
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
    .eq('user_id', userId)
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
    .eq('user_id', userId)
    .single();

  const newTotalPoints = currentStats.total_points + challenge.points_reward;
  const newLevel = Math.floor(newTotalPoints / 100) + 1;

  await supabase
    .from('gamification_stats')
    .update({
      total_points: newTotalPoints,
      current_level: newLevel
    })
    .eq('user_id', userId);

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
      .select('user_id, total_points')
      .gte('updated_at', startDate.toISOString())
      .order('total_points', { ascending: false })
      .limit(100);

    if (topPerformers) {
      // Clear existing leaderboard for this period
      await supabase
        .from('leaderboards')
        .delete()
        .eq('period', period.category);

      // Insert new rankings
      const leaderboardEntries = topPerformers.map((performer: any, index: number) => ({
        user_id: performer.user_id,
        period: period.category,
        rank: index + 1,
        score: performer.total_points,
        sport_type: 'all'
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
      achievement_type: 'first_event',
      achievement_data: {
        title: 'Getting Started',
        description: 'Attended your first sports event!',
        points_awarded: 25,
        icon_name: 'Trophy'
      }
    });
  }

  // Level Up Achievements
  if (stats.current_level === 5) {
    achievements.push({
      user_id: userId,
      achievement_type: 'level_milestone',
      achievement_data: {
        title: 'Rising Star',
        description: 'Reached level 5!',
        points_awarded: 50,
        icon_name: 'Star'
      }
    });
  }

  // Streak Achievements
  if (stats.current_streak === 7) {
    achievements.push({
      user_id: userId,
      achievement_type: 'streak',
      achievement_data: {
        title: 'Week Warrior',
        description: 'Maintained a 7-day activity streak!',
        points_awarded: 75,
        icon_name: 'Calendar'
      }
    });
  }

  // Insert achievements
  if (achievements.length > 0) {
    for (const achievement of achievements) {
      // Check if already awarded
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_type', achievement.achievement_type)
        .single();
      
      if (!existing) {
        await supabase
          .from('user_achievements')
          .insert(achievement);
        console.log(`Awarded achievement ${achievement.achievement_type} to user ${userId}`);
      }
    }
  }

  return achievements;
}

async function awardAchievement(supabase: any, userId: string, profileId: string, achievementData: any) {
  // Check if already awarded
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_type', achievementData.achievement_type)
    .single();
  
  if (existing) {
    return new Response(
      JSON.stringify({ success: true, message: 'Achievement already awarded' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: achievement, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_type: achievementData.achievement_type,
      achievement_data: achievementData
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
