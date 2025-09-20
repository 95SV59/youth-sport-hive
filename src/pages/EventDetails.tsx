import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { 
  Calendar, MapPin, Users, Clock, DollarSign, Star, 
  ArrowLeft, CheckCircle, MessageSquare, Share2 
} from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  cost: number;
  sport_category: string;
  difficulty_level: string;
  max_participants: number;
  current_participants: number;
  age_min: number;
  age_max: number;
  image_url?: string;
  equipment_provided?: string[];
  equipment_required?: string[];
  coaches: {
    id: string;
    is_verified: boolean;
    experience_years: number;
    rating: number;
    total_events_hosted: number;
    profiles: {
      first_name: string;
      last_name: string;
      bio?: string;
      avatar_url?: string;
    };
  };
}

interface Registration {
  id: string;
  status: string;
  registered_at: string;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      checkRegistration();
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          coaches (
            id,
            is_verified,
            experience_years,
            rating,
            total_events_hosted,
            profiles (
              first_name,
              last_name,
              bio,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
      navigate('/events');
    }
  };

  const checkRegistration = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setRegistration(data);
    } catch (error: any) {
      console.error('Error checking registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !event) return;

    setRegistering(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: user.id,
          profile_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: "You have been registered for this event",
      });

      checkRegistration();
      fetchEventDetails(); // Refresh to update participant count
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
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

  const getSportEmoji = (sport: string) => {
    const emojis: { [key: string]: string } = {
      soccer: '⚽',
      basketball: '🏀',
      tennis: '🎾',
      swimming: '🏊‍♂️',
      baseball: '⚾',
      volleyball: '🏐',
      track_field: '🏃‍♂️',
      martial_arts: '🥋'
    };
    return emojis[sport] || '🏃‍♂️';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-muted-foreground">Event not found</h3>
              <Button className="mt-4" onClick={() => navigate('/events')}>
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isEventFull = event.current_participants >= event.max_participants;
  const isEventPast = new Date(event.start_time) < new Date();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{getSportEmoji(event.sport_category)}</span>
              <Badge className={getDifficultyColor(event.difficulty_level)}>
                {event.difficulty_level}
              </Badge>
              <Badge variant="outline">Ages {event.age_min}-{event.age_max}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <div className="h-64 bg-cover bg-center rounded-lg" 
                   style={{ backgroundImage: `url(${event.image_url})` }} />
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{event.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(event.start_time), 'EEEE, MMM dd, yyyy')}</span>
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
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{event.cost === 0 ? 'Free' : `$${event.cost}`}</span>
                  </div>
                </div>

                {/* Equipment Info */}
                {(event.equipment_provided?.length > 0 || event.equipment_required?.length > 0) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {event.equipment_provided?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-green-600">Equipment Provided:</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.equipment_provided.join(', ')}
                          </p>
                        </div>
                      )}
                      {event.equipment_required?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-orange-600">Equipment Required:</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.equipment_required.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Coach Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={event.coaches.profiles.avatar_url} />
                    <AvatarFallback>
                      {event.coaches.profiles.first_name[0]}
                      {event.coaches.profiles.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {event.coaches.profiles.first_name} {event.coaches.profiles.last_name}
                      </h3>
                      {event.coaches.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{event.coaches.rating || 0}/5</span>
                      </div>
                      <span>{event.coaches.experience_years} years experience</span>
                      <span>{event.coaches.total_events_hosted} events hosted</span>
                    </div>
                    
                    {event.coaches.profiles.bio && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.coaches.profiles.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {event.current_participants}/{event.max_participants}
                  </div>
                  <div className="text-sm text-muted-foreground">participants</div>
                </div>

                {registration ? (
                  <div className="text-center space-y-2">
                    <Badge 
                      variant={registration.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {registration.status === 'confirmed' ? 'Registered' : 'Registration Pending'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Registered on {format(new Date(registration.registered_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleRegister}
                    disabled={registering || isEventFull || isEventPast || !user}
                  >
                    {registering ? 'Registering...' : 
                     isEventFull ? 'Event Full' :
                     isEventPast ? 'Event Ended' :
                     !user ? 'Login to Register' : 'Register Now'}
                  </Button>
                )}

                {event.cost > 0 && !registration && (
                  <p className="text-xs text-muted-foreground text-center">
                    Payment will be processed after registration confirmation
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sport Category</span>
                  <span className="text-sm font-medium capitalize">{event.sport_category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60))} hours
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Skill Level</span>
                  <span className="text-sm font-medium capitalize">{event.difficulty_level.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Age Range</span>
                  <span className="text-sm font-medium">{event.age_min}-{event.age_max} years</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Coach */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Coach
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;