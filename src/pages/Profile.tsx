import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { 
  User, Phone, MapPin, Calendar, Trophy, 
  Target, Zap, Star, Edit, Save, X 
} from 'lucide-react';
import { format } from 'date-fns';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at?: string;
}

interface GamificationStats {
  total_points: number;
  current_level: number;
  events_attended: number;
  current_streak: number;
  longest_streak: number;
  favorite_sport?: string;
  last_activity_date?: string;
}

interface CoachData {
  experience_years: number;
  specializations: ('basketball' | 'soccer' | 'tennis' | 'swimming' | 'baseball' | 'volleyball' | 'track_field' | 'martial_arts' | 'gymnastics' | 'other')[];
  hourly_rate: number;
  is_verified: boolean;
  rating: number;
  total_events_hosted: number;
  total_reviews: number;
}

const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>({
    total_points: 0,
    current_level: 1,
    events_attended: 0,
    current_streak: 0,
    longest_streak: 0,
  });
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchProfileData();
    }
  }, [profile]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile data
      const { data: profileInfo, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      setProfileData(profileInfo);

      // Fetch gamification stats
      const { data: statsData, error: statsError } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      if (statsData) {
        setGamificationStats(statsData);
      }

      // Fetch coach data if user is a coach
      if (profile?.role === 'coach') {
        const { data: coachInfo, error: coachError } = await supabase
          .from('coaches')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (coachError && coachError.code !== 'PGRST116') {
          throw coachError;
        }

        if (coachInfo) {
          setCoachData(coachInfo);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCoachData = async (updates: Partial<CoachData>) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coach profile updated successfully",
      });

      fetchProfileData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPointsForNextLevel = () => {
    return gamificationStats.current_level * 100;
  };

  const getProgressToNextLevel = () => {
    const currentLevelPoints = (gamificationStats.current_level - 1) * 100;
    const nextLevelPoints = gamificationStats.current_level * 100;
    const progressPoints = gamificationStats.total_points - currentLevelPoints;
    return Math.min((progressPoints / (nextLevelPoints - currentLevelPoints)) * 100, 100);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and settings</p>
          </div>
          <Button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            {profile?.role === 'coach' && (
              <TabsTrigger value="coaching">Coaching Profile</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profileData.date_of_birth || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={profileData.emergency_contact_name || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={profileData.emergency_contact_phone || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter emergency contact phone"
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Account Role</span>
                      <Badge 
                        variant={profile?.role === 'admin' ? 'default' : 'outline'}
                        className={
                          profile?.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          profile?.role === 'coach' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-green-500/10 text-green-500 border-green-500/20'
                        }
                      >
                        {profile?.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Member Since</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(profileData.created_at || new Date()), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfileData();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gamificationStats.total_points}</div>
                  <p className="text-xs text-muted-foreground">
                    {getPointsForNextLevel() - gamificationStats.total_points} to next level
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Level {gamificationStats.current_level}</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressToNextLevel()}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gamificationStats.events_attended}</div>
                  <p className="text-xs text-muted-foreground">
                    Total events completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gamificationStats.current_streak}</div>
                  <p className="text-xs text-muted-foreground">
                    Best: {gamificationStats.longest_streak} days
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Your sports and activity summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gamificationStats.favorite_sport && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Favorite Sport</span>
                    <Badge variant="outline">{gamificationStats.favorite_sport}</Badge>
                  </div>
                )}
                
                {gamificationStats.last_activity_date && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Activity</span>
                    <span className="text-muted-foreground">
                      {format(new Date(gamificationStats.last_activity_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{gamificationStats.longest_streak}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{Math.floor(gamificationStats.total_points / 10)}</div>
                    <div className="text-sm text-muted-foreground">Activities Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.role === 'coach' && coachData && (
            <TabsContent value="coaching" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Coaching Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Verification Status</span>
                      <Badge 
                        variant={coachData.is_verified ? "default" : "outline"}
                        className={coachData.is_verified ? 
                          'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }
                      >
                        {coachData.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        value={coachData.experience_years}
                        onChange={(e) => updateCoachData({ experience_years: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={coachData.hourly_rate}
                        onChange={(e) => updateCoachData({ hourly_rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <div className="flex flex-wrap gap-2">
                        {coachData.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Performance Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">{coachData.rating.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Average Rating</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">{coachData.total_reviews}</div>
                        <div className="text-sm text-muted-foreground">Total Reviews</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">{coachData.total_events_hosted}</div>
                        <div className="text-sm text-muted-foreground">Events Hosted</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">${coachData.hourly_rate}</div>
                        <div className="text-sm text-muted-foreground">Per Hour</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;