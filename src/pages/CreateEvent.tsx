import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  cost: number;
  sport_type: string;
  sport_category?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  max_participants: number;
  age_min: number;
  age_max: number;
  equipment_provided: string[];
  equipment_required: string[];
}

const CreateEvent = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    cost: 0,
    sport_type: 'soccer',
    sport_category: 'soccer',
    difficulty_level: 'all_levels',
    max_participants: 10,
    age_min: 5,
    age_max: 18,
    equipment_provided: [],
    equipment_required: []
  });

  // Redirect if not a coach
  if (profile?.role !== 'coach') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only verified coaches can create events. Please contact an administrator if you believe this is an error.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the coach ID
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (coachError) {
        console.error('Coach query error:', coachError);
        throw new Error('Error checking coach profile. Please try again.');
      }

      if (!coachData) {
        throw new Error('Coach profile not found. Please contact support to verify your coach status.');
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_time: formData.start_time,
          end_time: formData.end_time,
          cost: formData.cost,
          sport_type: formData.sport_category,
          sport_category: formData.sport_category,
          difficulty_level: formData.difficulty_level,
          max_participants: formData.max_participants,
          age_min: formData.age_min,
          age_max: formData.age_max,
          coach_id: coachData.id,
          status: 'pending' // Events need admin approval
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your event has been submitted for approval. You'll be notified once it's reviewed.",
      });

      navigate('/my-events');
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

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
          <p className="text-muted-foreground">Share your expertise by hosting a youth sports event</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
            <CardDescription>
              Fill out the information below to create your event. All events require admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Youth Soccer Training Camp"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport_category">Sport Category *</Label>
                  <Select value={formData.sport_category} onValueChange={(value) => handleInputChange('sport_category', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soccer">Soccer</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="baseball">Baseball</SelectItem>
                      <SelectItem value="volleyball">Volleyball</SelectItem>
                      <SelectItem value="track_field">Track & Field</SelectItem>
                      <SelectItem value="martial_arts">Martial Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what participants will learn and experience..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Central Park Soccer Field, NYC"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all_levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Date & Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Date & Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_participants}
                    onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 10)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_min">Minimum Age</Label>
                  <Input
                    id="age_min"
                    type="number"
                    min="4"
                    max="18"
                    value={formData.age_min}
                    onChange={(e) => handleInputChange('age_min', parseInt(e.target.value) || 5)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_max">Maximum Age</Label>
                  <Input
                    id="age_max"
                    type="number"
                    min="4"
                    max="25"
                    value={formData.age_max}
                    onChange={(e) => handleInputChange('age_max', parseInt(e.target.value) || 18)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Event...' : 'Create Event'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/my-events')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateEvent;