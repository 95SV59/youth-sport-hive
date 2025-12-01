import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Activity, Target, Award } from 'lucide-react';

const RecommendationAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_sport_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('preference_score', { ascending: false });

      // Get recommendation analytics
      const { data: recAnalytics } = await supabase
        .from('recommendation_analytics')
        .select('*')
        .eq('user_id', user.id);

      // Get all recommendations
      const { data: recommendations } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate metrics
      const acceptedRecs = recommendations?.filter(r => r.was_accepted) || [];
      const acceptanceRate = recommendations?.length 
        ? (acceptedRecs.length / recommendations.length) * 100 
        : 0;

      const avgEngagement = recAnalytics?.reduce((sum, a) => sum + (a.engagement_score || 0), 0) / (recAnalytics?.length || 1);
      
      const avgDecisionTime = recAnalytics?.reduce((sum, a) => sum + (a.time_to_decision_seconds || 0), 0) / (recAnalytics?.length || 1);

      setAnalytics({
        preferences: preferences || [],
        acceptanceRate,
        avgEngagement,
        avgDecisionTime: Math.round(avgDecisionTime),
        totalRecommendations: recommendations?.length || 0,
        acceptedRecommendations: acceptedRecs.length
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const preferenceData = analytics?.preferences.map((p: any) => ({
    name: p.sport_type.replace('_', ' ').toUpperCase(),
    score: Math.round(p.preference_score * 100),
    interactions: p.interaction_count
  })) || [];

  const acceptanceData = [
    { name: 'Accepted', value: analytics?.acceptedRecommendations || 0 },
    { name: 'Declined', value: (analytics?.totalRecommendations || 0) - (analytics?.acceptedRecommendations || 0) }
  ];

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Your Recommendation Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Track how our AI learns your preferences over time
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round(analytics?.acceptanceRate || 0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of {analytics?.totalRecommendations || 0} recommendations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Decision Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {analytics?.avgDecisionTime || 0}s
              </div>
              <p className="text-xs text-muted-foreground">
                Time to accept/decline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sports Explored</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {analytics?.preferences.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Different sports tried
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round((analytics?.avgEngagement || 0) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average engagement score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sport Preferences Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Sport Preferences</CardTitle>
              <CardDescription>
                AI-learned preference scores based on your interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferenceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={preferenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No preference data yet. Start interacting with recommendations!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceptance vs Decline</CardTitle>
              <CardDescription>
                How you respond to AI recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.totalRecommendations > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={acceptanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {acceptanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No recommendation data yet. Get your first recommendation!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preference Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Sport Preferences</CardTitle>
            <CardDescription>
              How the AI has learned your preferences over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.preferences.map((pref: any) => (
                <div key={pref.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {pref.sport_type.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pref.interaction_count} interactions • 
                      {pref.positive_interactions} positive • 
                      {pref.negative_interactions} negative
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(pref.preference_score * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Preference Score</div>
                  </div>
                </div>
              ))}
              {analytics?.preferences.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No preferences learned yet. Interact with recommendations to help the AI learn!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RecommendationAnalytics;
