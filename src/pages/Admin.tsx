import React, { useState, useEffect, useCallback } from 'react';
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
  Check, X, Shield, UserCheck 
} from 'lucide-react';
import { format } from 'date-fns';

const Admin = () => {
  const { profile } = useAuth();
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdminData = useCallback(async () => {
    if (profile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      // Parallel fetch all data
      const [eventsResult, coachesResult, usersResult] = await Promise.allSettled([
        supabase
          .from('events')
          .select(`
            *,
            coaches (
              id,
              rating,
              user_id
            )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('coaches')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              email,
              phone,
              bio,
              avatar_url
            )
          `)
          .eq('is_verified', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
        setPendingEvents(eventsResult.value.data);
      }
      if (coachesResult.status === 'fulfilled' && coachesResult.value.data) {
        setCoaches(coachesResult.value.data);
      }
      if (usersResult.status === 'fulfilled' && usersResult.value.data) {
        setUsers(usersResult.value.data);
      }
    } catch (error: any) {
      console.error('Admin data fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.role, toast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

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

      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
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

      setCoaches(prev => prev.filter(c => c.id !== coachId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
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

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Access denied for non-admins
  if (profile && profile.role !== 'admin') {
    return (
      <Layout requiredRoles={['admin']}>
        <div className="flex items-center justify-center min-h-[400px]">
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
      <Layout requiredRoles={['admin']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requiredRoles={['admin']}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
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
              Users ({users.length})
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
                            {event.sport_type || event.sport_category || 'General'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.start_time ? format(new Date(event.start_time), 'MMM dd, yyyy') : 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{event.location || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.max_participants || 0} max</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${event.cost || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => updateEventStatus(event.id, 'approved')}
                          className="flex-1"
                          size="sm"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => updateEventStatus(event.id, 'rejected')}
                          className="flex-1"
                          size="sm"
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
                            {coach.profiles?.first_name || 'Unknown'} {coach.profiles?.last_name || ''}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {coach.profiles?.email || 'No email'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Experience:</span> {coach.experience_years || 0} years
                        </div>
                        <div>
                          <span className="font-medium">Specializations:</span>{' '}
                          {coach.specializations?.join(', ') || 'None specified'}
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span> ${coach.hourly_rate || 0}/hour
                        </div>
                      </div>

                      <Button 
                        onClick={() => verifyCoach(coach.id)}
                        className="w-full"
                        size="sm"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {user.first_name || 'Unknown'} {user.last_name || ''}
                        </CardTitle>
                        <CardDescription className="text-xs truncate">
                          {user.email}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline"
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
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      Joined: {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'Unknown'}
                    </div>
                    {user.role !== 'admin' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserRole(user.id, user.role === 'coach' ? 'student' : 'coach')}
                        className="w-full"
                      >
                        Make {user.role === 'coach' ? 'Student' : 'Coach'}
                      </Button>
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
