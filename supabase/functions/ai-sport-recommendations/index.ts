import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced scoring weights
const SCORING_WEIGHTS = {
  aiConfidence: 0.25,
  userPreference: 0.30,
  profileMatch: 0.20,
  diversityBonus: 0.15,
  trendingBonus: 0.10
};

// Calculate profile match score
function calculateProfileMatchScore(userContext: any, sport: string): number {
  let score = 0.5; // baseline
  
  // Age appropriateness
  const ageScores: Record<string, number[]> = {
    basketball: [10, 35],
    soccer: [8, 40],
    tennis: [12, 50],
    swimming: [5, 65],
    volleyball: [12, 40],
    martial_arts: [8, 45],
    gymnastics: [5, 25],
    track_field: [10, 50]
  };
  
  const [minAge, maxAge] = ageScores[sport] || [10, 50];
  if (userContext.age >= minAge && userContext.age <= maxAge) {
    score += 0.2;
  }
  
  // Budget match
  const sportCosts: Record<string, number> = {
    basketball: 30,
    soccer: 25,
    tennis: 50,
    swimming: 40,
    volleyball: 30,
    martial_arts: 60,
    gymnastics: 70,
    track_field: 20
  };
  
  const estimatedCost = sportCosts[sport] || 35;
  if (estimatedCost >= userContext.budgetMin && estimatedCost <= userContext.budgetMax) {
    score += 0.2;
  }
  
  // Experience level match
  if (userContext.eventsAttended > 5) {
    score += 0.1; // More experienced users
  }
  
  return Math.min(1.0, score);
}

// Calculate diversity bonus (encourage trying new sports)
function calculateDiversityBonus(userPreferences: any[], sport: string): number {
  const preference = userPreferences.find(p => p.sport_type === sport);
  if (!preference || preference.interaction_count === 0) {
    return 0.8; // High bonus for unexplored sports
  }
  if (preference.interaction_count < 3) {
    return 0.5; // Medium bonus for rarely tried
  }
  return 0.2; // Low bonus for familiar sports
}

// Get active A/B test variant
async function getABTestVariant(supabase: any, experimentName: string): Promise<any> {
  const { data: experiments } = await supabase
    .from('recommendation_experiments')
    .select('*')
    .eq('experiment_name', experimentName)
    .eq('is_active', true);
  
  if (!experiments || experiments.length === 0) {
    return { variant_name: 'control', config: {} };
  }
  
  // Weighted random selection
  const totalWeight = experiments.reduce((sum: number, exp: any) => sum + (exp.weight || 0), 0);
  let random = Math.random() * totalWeight;
  
  for (const exp of experiments) {
    random -= exp.weight || 0;
    if (random <= 0) {
      return exp;
    }
  }
  
  return experiments[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, profileId, forceNewRecommendation = false } = await req.json();

    if (!userId || !profileId) {
      return new Response(
        JSON.stringify({ error: 'User ID and Profile ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get A/B test variant
    const abVariant = await getABTestVariant(supabase, 'recommendation_strategy');
    console.log('Using A/B variant:', abVariant.variant_name);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's gamification stats
    const { data: stats } = await supabase
      .from('gamification_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user's event history
    const { data: eventHistory } = await supabase
      .from('event_registrations')
      .select('event:events(sport_type)')
      .eq('user_id', userId)
      .eq('attended', true);

    // Get user sport preferences (learning data)
    const { data: userPreferences } = await supabase
      .from('user_sport_preferences')
      .select('*')
      .eq('user_id', userId);

    // Check if we have recent recommendations (unless forced)
    if (!forceNewRecommendation) {
      const { data: recentRecommendations } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentRecommendations && recentRecommendations.length > 0) {
        return new Response(
          JSON.stringify({ 
            recommendations: recentRecommendations,
            cached: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare user context
    const attendedSports = eventHistory?.map((e: any) => e.event?.sport_type).filter(Boolean) || [];
    const userContext = {
      age: profile.date_of_birth ? 
        Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        16,
      location: profile.location || 'Not specified',
      preferredSports: profile.preferred_sports || [],
      skillLevel: profile.skill_level || 'beginner',
      activityPreferences: profile.activity_preferences || [],
      budgetMin: profile.budget_range_min || 0,
      budgetMax: profile.budget_range_max || 1000,
      fitnessGoals: profile.fitness_goals || [],
      currentLevel: stats?.current_level || 1,
      totalPoints: stats?.total_points || 0,
      eventsAttended: stats?.events_attended || 0,
      attendedSports,
      userPreferences: userPreferences || []
    };

    // Generate multiple recommendations based on A/B variant
    const numberOfRecs = abVariant.config?.count || 3;
    const aiPrompt = `
    You are an advanced AI sports recommendation expert. Based on the user profile, recommend ${numberOfRecs} different personalized sports activities.

    User Profile:
    - Age: ${userContext.age}
    - Location: ${userContext.location}
    - Current Level: ${userContext.currentLevel}
    - Skill Level: ${userContext.skillLevel}
    - Events Attended: ${userContext.eventsAttended}
    - Previously Attended Sports: ${attendedSports.join(', ') || 'None'}
    - Preferred Sports: ${userContext.preferredSports.join(', ') || 'None specified'}
    - Budget Range: $${userContext.budgetMin} - $${userContext.budgetMax}
    - Fitness Goals: ${userContext.fitnessGoals.join(', ') || 'General fitness'}
    - Activity Preferences: ${userContext.activityPreferences.join(', ') || 'Open to all'}

    Available sports: basketball, soccer, tennis, swimming, volleyball, baseball, track_field, martial_arts, gymnastics, other

    ${abVariant.config?.focus === 'diversity' ? 'FOCUS: Recommend sports they haven\'t tried before.' : ''}
    ${abVariant.config?.focus === 'optimization' ? 'FOCUS: Recommend sports that best match their stated preferences.' : ''}

    Provide ${numberOfRecs} recommendations in this JSON format:
    {
      "recommendations": [
        {
          "sport": "sport_category",
          "reasoning": "compelling 2-3 sentence explanation",
          "confidence": 85,
          "benefits": ["benefit1", "benefit2", "benefit3"],
          "matchFactors": ["factor1", "factor2"]
        }
      ]
    }
    `;

    // Call Lovable AI Gateway
    const lovableAIResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an advanced sports recommendation AI that provides personalized, data-driven suggestions.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!lovableAIResponse.ok) {
      const errorText = await lovableAIResponse.text();
      console.error('Lovable AI error:', lovableAIResponse.status, errorText);
      throw new Error(`AI Gateway error: ${lovableAIResponse.statusText}`);
    }

    const aiResult = await lovableAIResponse.json();
    const aiRecommendations = JSON.parse(aiResult.choices[0].message.content);

    // Calculate advanced scores for each recommendation
    const scoredRecommendations = await Promise.all(
      aiRecommendations.recommendations.map(async (rec: any) => {
        const aiConfidence = rec.confidence / 100;
        
        // Get user preference for this sport
        const preference = userPreferences?.find((p: any) => p.sport_type === rec.sport);
        const userPreferenceScore = preference?.preference_score || 0.5;
        
        // Calculate component scores
        const profileMatchScore = calculateProfileMatchScore(userContext, rec.sport);
        const diversityBonus = calculateDiversityBonus(userPreferences || [], rec.sport);
        
        // Trending bonus (placeholder - could be based on recent platform activity)
        const trendingBonus = 0.5;
        
        // Calculate final weighted score
        const finalScore = (
          aiConfidence * SCORING_WEIGHTS.aiConfidence +
          userPreferenceScore * SCORING_WEIGHTS.userPreference +
          profileMatchScore * SCORING_WEIGHTS.profileMatch +
          diversityBonus * SCORING_WEIGHTS.diversityBonus +
          trendingBonus * SCORING_WEIGHTS.trendingBonus
        );

        // Save recommendation to database
        const { data: savedRec, error: saveError } = await supabase
          .from('recommendations')
          .insert({
            user_id: userId,
            sport_type: rec.sport,
            recommendation_data: {
              reasoning: rec.reasoning,
              benefits: rec.benefits,
              sport: rec.sport,
              matchFactors: rec.matchFactors || [],
              scoringBreakdown: {
                aiConfidence,
                userPreferenceScore,
                profileMatchScore,
                diversityBonus,
                trendingBonus,
                finalScore
              },
              abVariant: abVariant.variant_name
            },
            confidence_score: finalScore
          })
          .select()
          .single();

        if (saveError) {
          console.error('Error saving recommendation:', saveError);
        }

        return {
          ...savedRec,
          benefits: rec.benefits,
          matchFactors: rec.matchFactors
        };
      })
    );

    // Sort by final score
    scoredRecommendations.sort((a, b) => 
      (b.confidence_score || 0) - (a.confidence_score || 0)
    );

    return new Response(
      JSON.stringify({ 
        recommendations: scoredRecommendations,
        cached: false,
        abVariant: abVariant.variant_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
