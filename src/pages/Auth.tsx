import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';

// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long').trim(),
  phone: z.string().regex(/^(\+?[0-9]{10,15})?$/, 'Invalid phone number format').optional().or(z.literal('')),
  location: z.string().max(100, 'Location is too long').optional(),
  dateOfBirth: z.string().optional(),
  role: z.enum(['student', 'parent', 'coach', 'admin'], { required_error: 'Please select a role' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'coach' | 'admin'>('student');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setValidationErrors({});
    
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setValidationErrors({});
    
    const result = signUpSchema.safeParse({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      location,
      dateOfBirth,
      role,
    });
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const userData = {
      first_name: firstName,
      last_name: lastName,
      role,
      phone,
      date_of_birth: dateOfBirth,
      location
    };

    await signUp(email, password, userData);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Youth Sports Platform</h1>
          <p className="text-muted-foreground mt-2">Join the community and discover amazing sports opportunities</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className={validationErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={validationErrors.password ? 'border-destructive' : ''}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        maxLength={50}
                        className={validationErrors.firstName ? 'border-destructive' : ''}
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-destructive">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        maxLength={50}
                        className={validationErrors.lastName ? 'border-destructive' : ''}
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-destructive">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select value={role} onValueChange={(value: 'student' | 'parent' | 'coach' | 'admin') => setRole(value)}>
                      <SelectTrigger className={validationErrors.role ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.role && (
                      <p className="text-sm text-destructive">{validationErrors.role}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className={validationErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={15}
                      className={validationErrors.phone ? 'border-destructive' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-sm text-destructive">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-of-birth">Date of Birth (optional)</Label>
                    <Input
                      id="date-of-birth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (optional)</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={100}
                      className={validationErrors.location ? 'border-destructive' : ''}
                    />
                    {validationErrors.location && (
                      <p className="text-sm text-destructive">{validationErrors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={validationErrors.password ? 'border-destructive' : ''}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      8+ characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
