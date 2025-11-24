import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, DollarSign, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Event, Registration } from '@/types';

const MyEvents = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<{ [eventId: string]: Registration[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'coach') {
      fetchMyEvents();
    }
  }, [profile]);

  const fetchMyEvents = async () => {
    try {
      // Get coach ID first
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (coachError || !coachData) {
        throw new Error('Coach profile not found');
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('coach_id', coachData.id)
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      // Fetch registrations for each event
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(event => event.id);
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('event_registrations')
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              email
            )
          `)
          .in('event_id', eventIds);

        if (registrationsError) throw registrationsError;

        // Group registrations by event ID
        const groupedRegistrations: { [eventId: string]: Registration[] } = {};
        registrationsData?.forEach(reg => {
          if (!groupedRegistrations[reg.event_id]) {
            groupedRegistrations[reg.event_id] = [];
          }
          groupedRegistrations[reg.event_id].push(reg);
        });

        setRegistrations(groupedRegistrations);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const updateAttendance = async (registrationId: string, attended: boolean) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ attended })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Attendance ${attended ? 'marked' : 'unmarked'}`,
      });

      fetchMyEvents(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'coach') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only coaches can access this page.
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

  const upcomingEvents = events.filter(event => new Date(event.start_time) > new Date());
  const pastEvents = events.filter(event => new Date(event.start_time) <= new Date());

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Events</h1>
            <p className="text-muted-foreground">Manage your coaching events and participants</p>
          </div>
          <Button asChild>
            <Link to="/create-event">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No upcoming events</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Create your first event to start coaching!
                  </p>
                  <Button asChild>
                    <Link to="/create-event">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Created {format(new Date(event.created_at), 'MMM dd, yyyy')}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                          <Badge className={getDifficultyColor(event.difficulty_level)}>
                            {event.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                          <span>{event.current_participants}/{event.max_participants} participants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${event.cost}</span>
                        </div>
                      </div>

                      {/* Participants List */}
                      {registrations[event.id] && registrations[event.id].length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Registered Participants:</h4>
                          <div className="space-y-1">
                            {registrations[event.id].map((reg) => (
                              <div key={reg.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                <span>{reg.profiles.first_name} {reg.profiles.last_name}</span>
                                <Badge variant={reg.status === 'confirmed' ? 'default' : 'secondary'}>
                                  {reg.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No past events</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your completed events will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Completed {format(new Date(event.end_time), 'MMM dd, yyyy')}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.current_participants}/{event.max_participants} participants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${event.cost}</span>
                        </div>
                      </div>

                      {/* Attendance Tracking for Past Events */}
                      {registrations[event.id] && registrations[event.id].length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Attendance:</h4>
                          <div className="space-y-1">
                            {registrations[event.id].map((reg) => (
                              <div key={reg.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                <span>{reg.profiles.first_name} {reg.profiles.last_name}</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={reg.attended ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateAttendance(reg.id, !reg.attended)}
                                  >
                                    {reg.attended ? 'Present' : 'Absent'}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyEvents;