import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

    const { userId, profileId, forceNewRecommendation = false } = await req.json();

    if (!userId || !profileId) {
      return new Response(
        JSON.stringify({ error: 'User ID and Profile ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      .eq('profile_id', profileId)
      .single();

    // Get user's event history
    const { data: eventHistory } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (
          sport_category,
          difficulty_level,
          cost,
          location
        )
      `)
      .eq('profile_id', profileId)
      .eq('attended', true);

    // Check if we have recent recommendations (unless forced)
    if (!forceNewRecommendation) {
      const { data: recentRecommendation } = await supabase
        .from('recommendations')
        .select('*')
        .eq('profile_id', profileId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours ago
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentRecommendation && recentRecommendation.length > 0) {
        return new Response(
          JSON.stringify({ 
            recommendations: [recentRecommendation[0]],
            cached: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare AI prompt with user data
    const userContext = {
      age: profile.date_of_birth ? 
        Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null,
      location: profile.location,
      preferredSports: profile.preferred_sports || [],
      skillLevel: profile.skill_level || 'beginner',
      activityPreferences: profile.activity_preferences || [],
      budgetMin: profile.budget_range_min || 0,
      budgetMax: profile.budget_range_max || 1000,
      preferredLocations: profile.preferred_locations || [],
      fitnessGoals: profile.fitness_goals || [],
      medicalConditions: profile.medical_conditions || [],
      currentLevel: stats?.current_level || 1,
      totalPoints: stats?.total_points || 0,
      eventsAttended: stats?.events_attended || 0,
      favoriteSport: stats?.favorite_sport,
      eventHistory: eventHistory || []
    };

    const aiPrompt = `
    You are an AI sports recommendation expert. Based on the following user profile, recommend personalized sports activities:

    User Profile:
    - Age: ${userContext.age || 'Not specified'}
    - Location: ${userContext.location || 'Not specified'}
    - Current Level: ${userContext.currentLevel}
    - Skill Level: ${userContext.skillLevel}
    - Events Attended: ${userContext.eventsAttended}
    - Preferred Sports: ${userContext.preferredSports.join(', ') || 'None specified'}
    - Budget Range: $${userContext.budgetMin} - $${userContext.budgetMax}
    - Fitness Goals: ${userContext.fitnessGoals.join(', ') || 'None specified'}
    - Activity Preferences: ${userContext.activityPreferences.join(', ') || 'None specified'}
    - Medical Considerations: ${userContext.medicalConditions.join(', ') || 'None'}
    - Past Event Types: ${userContext.eventHistory.map(e => e.events?.sport_category).filter(Boolean).join(', ') || 'None'}

    Available sports categories: basketball, soccer, tennis, swimming, volleyball, baseball, track_field, martial_arts, gymnastics, other

    Please recommend ONE most suitable sport from the available categories and provide:
    1. The sport category (must be exactly one of the available options)
    2. A compelling reason why this sport is perfect for them (2-3 sentences)
    3. Confidence score (0-100) based on how well it matches their profile
    4. Key benefits specific to their goals and preferences

    Respond in this exact JSON format:
    {
      "sport": "sport_category",
      "reasoning": "explanation here",
      "confidence": 85,
      "benefits": ["benefit1", "benefit2", "benefit3"]
    }
    `;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a sports recommendation AI that provides personalized suggestions.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const aiResult = await openAIResponse.json();
    const recommendation = JSON.parse(aiResult.choices[0].message.content);

    // Save recommendation to database
    const { data: savedRecommendation, error: saveError } = await supabase
      .from('recommendations')
      .insert({
        user_id: userId,
        profile_id: profileId,
        recommended_sport: recommendation.sport,
        reasoning: recommendation.reasoning,
        confidence_score: recommendation.confidence / 100,
        algorithm_version: 'v2.0-openai',
        input_factors: userContext,
        recommendation_score: recommendation.confidence / 100
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving recommendation:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        recommendations: [{
          ...savedRecommendation,
          benefits: recommendation.benefits
        }],
        cached: false 
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