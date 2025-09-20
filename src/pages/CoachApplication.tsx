import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Shield, Star, Trophy } from 'lucide-react';

interface CoachApplicationData {
  experience_years: number;
  hourly_rate: number;
  specializations: string[];
  bio: string;
  certifications: string[];
  verification_documents: string[];
}

const CoachApplication = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CoachApplicationData>({
    experience_years: 0,
    hourly_rate: 0,
    specializations: [],
    bio: '',
    certifications: [],
    verification_documents: []
  });

  const sportsOptions = [
    'soccer', 'basketball', 'tennis', 'swimming', 
    'baseball', 'volleyball', 'track_field', 'martial_arts'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Check if user already has a coach profile
      const { data: existingCoach, error: checkError } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingCoach) {
        toast({
          title: "Application Already Exists",
          description: "You have already submitted a coach application.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // Get profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Create coach profile
      const { error } = await supabase
        .from('coaches')
        .insert({
          user_id: user.id,
          profile_id: profileData.id,
          experience_years: formData.experience_years,
          hourly_rate: formData.hourly_rate,
          specializations: formData.specializations as any,
          certifications: formData.certifications,
          verification_documents: formData.verification_documents,
          is_verified: false
        });

      if (error) throw error;

      // Update profile with bio if provided
      if (formData.bio) {
        await supabase
          .from('profiles')
          .update({ bio: formData.bio })
          .eq('id', profileData.id);
      }

      toast({
        title: "Application Submitted!",
        description: "Your coach application has been submitted for review. You'll be notified once it's approved.",
      });

      navigate('/dashboard');
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

  const handleSpecializationChange = (sport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specializations: checked 
        ? [...prev.specializations, sport]
        : prev.specializations.filter(s => s !== sport)
    }));
  };

  const handleInputChange = (field: keyof CoachApplicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Redirect if user is already a coach
  if (profile?.role === 'coach') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Already a Coach
              </CardTitle>
              <CardDescription>
                You are already registered as a coach. Visit your dashboard to manage your events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Become a Coach</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Share your passion and help young athletes grow
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Help young athletes develop skills and confidence
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Earn Income</h3>
                <p className="text-sm text-muted-foreground">
                  Set your own rates and schedule
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Verified Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Safe, secure environment with background checks
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Coach Application
            </CardTitle>
            <CardDescription>
              Fill out the information below to apply as a coach. All applications are reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience *</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 50.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sports Specializations *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sportsOptions.map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={formData.specializations.includes(sport)}
                        onCheckedChange={(checked) => handleSpecializationChange(sport, checked as boolean)}
                      />
                      <Label htmlFor={sport} className="text-sm capitalize">
                        {sport.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.specializations.length === 0 && (
                  <p className="text-sm text-destructive">Please select at least one sport</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About You *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your coaching philosophy, achievements, and what makes you a great coach..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Input
                  id="certifications"
                  value={formData.certifications.join(', ')}
                  onChange={(e) => handleInputChange('certifications', e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert))}
                  placeholder="e.g., CPR Certified, Youth Sports Coaching License"
                />
                <p className="text-xs text-muted-foreground">
                  List any relevant certifications you hold
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification_documents">Additional Information</Label>
                <Textarea
                  id="verification_documents"
                  value={formData.verification_documents.join('\n')}
                  onChange={(e) => handleInputChange('verification_documents', e.target.value.split('\n').filter(doc => doc.trim()))}
                  placeholder="Any additional information you'd like to share (awards, references, special qualifications)..."
                  rows={3}
                />
              </div>

              <div className="pt-6 border-t">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Application Review Process</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Background check will be conducted for all coaches</p>
                    <p>• Verification of certifications and experience</p>
                    <p>• Review typically takes 3-5 business days</p>
                    <p>• You'll be notified via email once approved</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={loading || formData.specializations.length === 0} 
                  className="flex-1"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
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

export default CoachApplication;