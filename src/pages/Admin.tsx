import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { 
  Calendar, MapPin, Users, Clock, DollarSign, 
  Check, X, Shield, UserCheck, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import { Event, Coach, Profile } from '@/types';

const Admin = () => {
  const { profile } = useAuth();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [profile]);

  const fetchAdminData = async () => {
    try {
      // Fetch pending events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          coaches (
            id,
            rating,
            profiles (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch coaches needing verification
      const { data: coachesData, error: coachesError } = await supabase
        .from('coaches')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone,
            bio,
            avatar_url
          )
        `)
        .eq('is_verified', false)
        .order('created_at', { ascending: false });

      if (coachesError) throw coachesError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setPendingEvents(eventsData || []);
      setCoaches(coachesData || []);
      setUsers(usersData || []);
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

  const updateEventStatus = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${status} successfully`,
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const verifyCoach = async (coachId: string) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .update({ is_verified: true })
        .eq('id', coachId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coach verified successfully",
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'student' | 'parent' | 'coach') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                Only administrators can access this page.
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage events, coaches, and users</p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">
              Pending Events ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="coaches">
              Coach Verification ({coaches.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              User Management ({users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {pendingEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No pending events</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    All events have been reviewed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            By {event.coaches?.profiles.first_name} {event.coaches?.profiles.last_name}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Pending Review
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(event.start_time), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(event.start_time), 'h:mm a')} - 
                            {format(new Date(event.end_time), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.max_participants} max participants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${event.cost}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => updateEventStatus(event.id, 'approved')}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => updateEventStatus(event.id, 'rejected')}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="coaches" className="space-y-4">
            {coaches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No pending verifications</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    All coaches have been verified.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {coaches.map((coach) => (
                  <Card key={coach.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {coach.profiles.first_name} {coach.profiles.last_name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {coach.profiles.email}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Needs Verification
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Experience:</span> {coach.experience_years} years
                        </div>
                        <div>
                          <span className="font-medium">Specializations:</span>{' '}
                          {coach.specializations.join(', ') || 'None specified'}
                        </div>
                        <div>
                          <span className="font-medium">Hourly Rate:</span> ${coach.hourly_rate}/hour
                        </div>
                        {coach.profiles.phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {coach.profiles.phone}
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={() => verifyCoach(coach.id)}
                        className="w-full"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Verify Coach
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {user.first_name} {user.last_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {user.email}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        className={
                          user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          user.role === 'coach' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-green-500/10 text-green-500 border-green-500/20'
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Joined:</span>{' '}
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </div>
                      {user.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {user.phone}
                        </div>
                      )}
                      {user.location && (
                        <div>
                          <span className="font-medium">Location:</span> {user.location}
                        </div>
                      )}
                    </div>

                    {user.role !== 'admin' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(user.id, user.role === 'coach' ? 'student' : 'coach')}
                          className="flex-1"
                        >
                          Make {user.role === 'coach' ? 'Student' : 'Coach'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;