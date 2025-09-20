import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Calendar, 
  Target, 
  TrendingUp,
  Star,
  Zap,
  Medal,
  Activity
} from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Calendar,
      title: "Discover Events",
      description: "Find sports events in your area with smart cost-based filtering and location search."
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn points, badges, and level up through participation in sports activities."
    },
    {
      icon: Target,
      title: "AI Recommendations",
      description: "Get personalized sport recommendations based on your preferences and profile."
    },
    {
      icon: MapPin,
      title: "Community Heatmap",
      description: "Visualize community participation trends and discover popular sports in your area."
    },
    {
      icon: Users,
      title: "Coach Network",
      description: "Connect with verified coaches and create or join coaching opportunities."
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Read and write reviews to help maintain quality across the platform."
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "10,000+" },
    { icon: Calendar, label: "Events Hosted", value: "5,000+" },
    { icon: Trophy, label: "Achievements Earned", value: "25,000+" },
    { icon: Medal, label: "Verified Coaches", value: "500+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Youth Sports Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Zap className="h-4 w-4 mr-2" />
            AI-Powered Sports Discovery
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Enhancing Youth Sports Participation with{' '}
            <span className="text-primary">AI & Gamification</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover sports events, connect with coaches, track your progress, and build a vibrant sports community with smart technology solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/coach-application">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Become a Coach
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Youth Sports
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform combines modern technology with sports community building to create the ultimate youth sports experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Youth Sports?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students, parents, and coaches already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">Youth Sports Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Youth Sports Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
