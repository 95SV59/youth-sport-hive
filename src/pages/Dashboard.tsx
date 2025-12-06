import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Trophy, Target, TrendingUp, Clock, Lightbulb, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

interface DashboardStats {
  total_points: number;
  current_level: number;
  events_attended: number;
  current_streak: number;
  favorite_sport?: string;
}

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { recommendations } = useRecommendations();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Parallel queries with individual error handling
      const [statsResult, eventsResult, achievementsResult] = await Promise.allSettled([
        supabase
          .from('gamification_stats')
          .select('total_points, current_level, events_attended, current_streak')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('event_registrations')
          .select(`
            id,
            status,
            event_id,
            events:event_id (
              id,
              title,
              start_time,
              location,
              cost,
              sport_category
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false })
          .limit(3)
      ]);

      // Process results safely
      if (statsResult.status === 'fulfilled' && statsResult.value.data) {
        setStats(statsResult.value.data);
      }

      if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
        setUpcomingEvents(eventsResult.value.data.filter((e: any) => e.events));
      }

      if (achievementsResult.status === 'fulfilled' && achievementsResult.value.data) {
        setAchievements(achievementsResult.value.data);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    
    if (user?.id && isMounted) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, fetchDashboardData]);

  const getLevelProgress = () => {
    if (!stats) return 0;
    const pointsInCurrentLevel = (stats.total_points || 0) % 100;
    return pointsInCurrentLevel;
  };

  const formatSportCategory = (category: string | null | undefined) => {
    if (!category) return 'General';
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your sports journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">Days active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Sport</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">
                {stats?.favorite_sport ? formatSportCategory(stats.favorite_sport) : 'None yet'}
              </div>
              <p className="text-xs text-muted-foreground">Most played</p>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Level {stats?.current_level || 1}</span>
                <span className="text-sm text-muted-foreground">
                  {getLevelProgress()}% to next level
                </span>
              </div>
              <Progress value={getLevelProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Keep participating in events to earn more points!
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
                {recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-4 bg-primary/5 rounded-lg border">
                    <h4 className="font-semibold text-primary">
                      {formatSportCategory(rec.sport_type || rec.recommendation_data?.sport)}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {rec.recommendation_data?.reasoning || 'Personalized recommendation based on your profile'}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant="outline">
                        {Math.round((rec.confidence_score || 0) * 100)}% match
                      </Badge>
                      <Link to="/recommendations">
                        <Button size="sm" variant="outline">View Details</Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Your Events</span>
              </CardTitle>
              <Link to="/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{registration.events?.title || 'Event'}</p>
                        <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {registration.events?.start_time 
                              ? new Date(registration.events.start_time).toLocaleDateString()
                              : 'TBD'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatSportCategory(registration.events?.sport_category)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium">${registration.events?.cost || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No registered events yet</p>
                  <Link to="/events">
                    <Button className="mt-3" size="sm">Discover Events</Button>
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
                <span>Achievements</span>
              </CardTitle>
              <Link to="/challenges">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => {
                    const data = achievement.achievement_data || {};
                    return (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{data.title || achievement.achievement_type}</p>
                          <p className="text-xs text-muted-foreground truncate">{data.description || 'Achievement unlocked!'}</p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {achievement.achievement_type}
                            </Badge>
                            {data.points && (
                              <span className="text-xs text-muted-foreground">
                                +{data.points} points
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No achievements yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start participating to earn achievements!
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
