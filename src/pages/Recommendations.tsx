import React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Lightbulb, TrendingUp } from 'lucide-react';
import RecommendationCard from '@/components/RecommendationCard';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  const { recommendations, loading, fetchRecommendations } = useRecommendations();

  const handleGetNewRecommendations = () => {
    fetchRecommendations(true); // Force new recommendations
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              <span>AI Sport Recommendations</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Personalized sport suggestions based on your profile and preferences
            </p>
          </div>
          <Button 
            onClick={handleGetNewRecommendations}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Get New Suggestions</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAccept={() => {
                  // Redirect to events page with filter
                  window.location.href = `/events?sport=${recommendation.sport_type}`;
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                <span>No Recommendations Yet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Complete your profile to get personalized sport recommendations!
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/profile">
                  <Button variant="outline">
                    Complete Profile
                  </Button>
                </Link>
                <Button onClick={handleGetNewRecommendations}>
                  Generate Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works Section */}
        <Card>
          <CardHeader>
            <CardTitle>How AI Recommendations Work</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold">Profile Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your age, preferences, fitness goals, and activity history
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms match you with sports that fit your lifestyle and goals
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold">Personalized Results</h3>
              <p className="text-sm text-muted-foreground">
                Get tailored recommendations with confidence scores and detailed reasoning
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Recommendations;