import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Calendar, MapPin, Users, Clock, DollarSign, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface EventData {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  cost: number;
  max_participants: number;
  current_participants: number;
  sport_type: string;
  sport_category: string | null;
  difficulty_level: string | null;
  age_min: number | null;
  age_max: number | null;
  status: string;
  coach_id: string;
}

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [registering, setRegistering] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }

    setRegistering(eventId);
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event",
        });
        return;
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed',
          payment_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have been registered for this event",
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || 
                        event.sport_category === sportFilter || 
                        event.sport_type === sportFilter;
    const matchesDifficulty = difficultyFilter === 'all' || event.difficulty_level === difficultyFilter;
    
    return matchesSearch && matchesSport && matchesDifficulty;
  });

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const formatSportName = (sport: string | null) => {
    if (!sport) return 'General';
    return sport.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Upcoming Events</h1>
          <p className="text-muted-foreground">Discover and join youth sports events</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              <SelectItem value="soccer">Soccer</SelectItem>
              <SelectItem value="basketball">Basketball</SelectItem>
              <SelectItem value="tennis">Tennis</SelectItem>
              <SelectItem value="swimming">Swimming</SelectItem>
              <SelectItem value="volleyball">Volleyball</SelectItem>
              <SelectItem value="baseball">Baseball</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatSportName(event.sport_category || event.sport_type)}
                      </CardDescription>
                    </div>
                    {event.difficulty_level && (
                      <Badge className={getDifficultyColor(event.difficulty_level)}>
                        {event.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{format(new Date(event.start_time), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>
                        {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{event.current_participants}/{event.max_participants} spots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>${event.cost}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {(event.age_min || event.age_max) && (
                      <Badge variant="outline" className="text-xs">
                        Ages {event.age_min || '0'}-{event.age_max || '18'}
                      </Badge>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <Link to={`/event/${event.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                      <Button 
                        onClick={() => handleRegister(event.id)}
                        disabled={event.current_participants >= event.max_participants || registering === event.id}
                        size="sm"
                      >
                        {registering === event.id ? 'Registering...' : 
                         event.current_participants >= event.max_participants ? 'Full' : 'Register'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No events found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
