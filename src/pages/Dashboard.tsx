import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Trophy, Users, Target, TrendingUp, Clock, Lightbulb, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecommendationCard from '@/components/RecommendationCard';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { recommendations } = useRecommendations();
  const [stats, setStats] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!profile || !isMounted) return;
      
      await fetchDashboardData();
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [profile?.id]); // Only depend on profile ID to prevent unnecessary refetches

  const fetchDashboardData = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      // Use Promise.all for parallel queries with timeout
      const queries = [
        // Fetch gamification stats
        supabase
          .from('gamification_stats')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle() as any,

        // Fetch upcoming events (registered events)
        supabase
          .from('event_registrations')
          .select('*')
          .eq('user_id', user?.id)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: true })
          .limit(3) as any,

        // Fetch recent achievements
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user?.id)
          .order('earned_at', { ascending: false })
          .limit(3) as any
      ];

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Dashboard data timeout')), 15000)
      );

      const [statsResult, eventsResult, achievementsResult] = await Promise.race([
        Promise.all(queries),
        timeoutPromise
      ]) as any;

      setStats(statsResult.data || null);
      setUpcomingEvents(eventsResult.data || []);
      setAchievements(achievementsResult.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values to prevent blank screen
      setStats(null);
      setUpcomingEvents([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const pointsForNextLevel = stats.current_level * 100;
    const pointsInCurrentLevel = stats.total_points % 100;
    return (pointsInCurrentLevel / 100) * 100;
  };

  const formatSportCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.first_name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening in your sports journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground">
                Level {stats?.current_level || 1}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.events_attended || 0}</div>
              <p className="text-xs text-muted-foreground">
                This year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                Days active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Sport</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.favorite_sport ? formatSportCategory(stats.favorite_sport) : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                Most played
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Level Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Level {stats?.current_level || 1}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(getLevelProgress())}% to next level
                </span>
              </div>
              <Progress value={getLevelProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Keep participating in events to earn more points and level up!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations Section */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>AI Sport Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 2).map((recommendation) => (
                  <div key={recommendation.id} className="p-4 bg-primary/5 rounded-lg border">
                    <h4 className="font-semibold text-primary">
                      {recommendation.recommended_sport.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {recommendation.reasoning.substring(0, 100)}...
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant="outline">
                        {Math.round(recommendation.confidence_score * 100)}% match
                      </Badge>
                      <Link to="/recommendations">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link to="/recommendations">
                  <Button variant="outline">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    View All Recommendations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Events</span>
              </CardTitle>
              <Link to="/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{registration.events.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(registration.events.start_time).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatSportCategory(registration.events.sport_category)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{registration.events.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${registration.events.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                  <Link to="/events">
                    <Button className="mt-4">Discover Events</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Recent Achievements</span>
              </CardTitle>
              <Link to="/challenges">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {achievement.badge_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            +{achievement.points_awarded} points
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start participating in events to earn your first achievement!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;