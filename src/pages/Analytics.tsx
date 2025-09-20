import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Star, DollarSign, 
  Target, Award, Activity, Clock, MapPin 
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface AnalyticsData {
  totalEvents: number;
  totalParticipants: number;
  averageRating: number;
  totalRevenue: number;
  upcomingEvents: number;
  completedEvents: number;
  attendanceRate: number;
  popularSports: { sport: string; count: number; color: string }[];
  monthlyTrends: { month: string; events: number; participants: number; revenue: number }[];
  weeklyActivity: { day: string; events: number }[];
}

const Analytics = () => {
  const { profile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'coach' || profile?.role === 'admin') {
      fetchAnalyticsData();
    }
  }, [profile]);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data for demonstration - in real app, this would come from the database
      const mockData: AnalyticsData = {
        totalEvents: 24,
        totalParticipants: 186,
        averageRating: 4.8,
        totalRevenue: 2850,
        upcomingEvents: 8,
        completedEvents: 16,
        attendanceRate: 92,
        popularSports: [
          { sport: 'Soccer', count: 8, color: '#8B5CF6' },
          { sport: 'Basketball', count: 6, color: '#06B6D4' },
          { sport: 'Tennis', count: 4, color: '#10B981' },
          { sport: 'Swimming', count: 3, color: '#F59E0B' },
          { sport: 'Baseball', count: 3, color: '#EF4444' }
        ],
        monthlyTrends: [
          { month: 'Jan', events: 3, participants: 24, revenue: 380 },
          { month: 'Feb', events: 4, participants: 32, revenue: 520 },
          { month: 'Mar', events: 5, participants: 38, revenue: 680 },
          { month: 'Apr', events: 6, participants: 45, revenue: 750 },
          { month: 'May', events: 6, participants: 47, revenue: 820 }
        ],
        weeklyActivity: [
          { day: 'Mon', events: 2 },
          { day: 'Tue', events: 4 },
          { day: 'Wed', events: 3 },
          { day: 'Thu', events: 5 },
          { day: 'Fri', events: 6 },
          { day: 'Sat', events: 8 },
          { day: 'Sun', events: 4 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'coach' && profile?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Analytics are only available for coaches and administrators.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!analyticsData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No Data Available</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Analytics data will appear once you start hosting events.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {profile?.role === 'admin' ? 'Platform-wide insights' : 'Your coaching performance insights'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{analyticsData.totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{analyticsData.totalParticipants}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+18%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{analyticsData.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+0.2</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${analyticsData.totalRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+24%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="sports">Sports Breakdown</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Upcoming Events</span>
                      <Badge variant="outline">{analyticsData.upcomingEvents}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed Events</span>
                      <Badge variant="outline">{analyticsData.completedEvents}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Attendance Rate</span>
                      <Badge className="bg-green-500/10 text-green-500">{analyticsData.attendanceRate}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>Events scheduled by day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Track your growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="events" 
                      stackId="1"
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="participants" 
                      stackId="2"
                      stroke="#06B6D4" 
                      fill="#06B6D4" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sports Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Sports</CardTitle>
                  <CardDescription>Distribution of events by sport</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.popularSports}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ sport, count }) => `${sport}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.popularSports.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sports List */}
              <Card>
                <CardHeader>
                  <CardTitle>Sports Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.popularSports.map((sport, index) => (
                      <div key={sport.sport} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{sport.sport}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{sport.count} events</span>
                          <Badge variant="outline">
                            {Math.round((sport.count / analyticsData.totalEvents) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Event Duration</p>
                      <p className="text-2xl font-bold">2.5 hrs</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Most Popular Location</p>
                      <p className="text-2xl font-bold">Central Park</p>
                    </div>
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Achievement Rate</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;