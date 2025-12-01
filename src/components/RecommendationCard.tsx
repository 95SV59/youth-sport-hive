import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb, Star, Sparkles, TrendingUp } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Recommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept?: () => void;
  onDecline?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onDecline
}) => {
  const { updateRecommendationFeedback } = useRecommendations();
  const [viewStartTime] = useState(Date.now());

  const formatSportName = (sport: string) => {
    return sport.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Potential Match';
  };

  const handleAccept = () => {
    const timeToDecision = Math.floor((Date.now() - viewStartTime) / 1000);
    updateRecommendationFeedback(
      recommendation.id, 
      true, 
      'User accepted recommendation',
      recommendation.sport_type,
      timeToDecision
    );
    onAccept?.();
  };

  const handleDecline = () => {
    const timeToDecision = Math.floor((Date.now() - viewStartTime) / 1000);
    updateRecommendationFeedback(
      recommendation.id, 
      false, 
      'User declined recommendation',
      recommendation.sport_type,
      timeToDecision
    );
    onDecline?.();
  };

  // Extract scoring breakdown if available
  const scoringBreakdown = recommendation.recommendation_data?.scoringBreakdown;

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-foreground">AI-Powered Match</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${getConfidenceColor(recommendation.confidence_score)} border-current`}
          >
            <Star className="h-3 w-3 mr-1 fill-current" />
            {getConfidenceLabel(recommendation.confidence_score)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Sport Name Display with Score */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border-2 border-primary/20">
          <h3 className="text-3xl font-bold text-primary mb-2">
            {formatSportName(recommendation.sport_type || recommendation.recommendation_data.sport)}
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground font-medium">
              Match Score: {Math.round((recommendation.confidence_score || 0) * 100)}%
            </span>
          </div>
        </div>

        {/* Reasoning Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
            <span className="w-1 h-5 bg-primary rounded"></span>
            Why this sport is perfect for you
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed pl-3 border-l-2 border-muted">
            {recommendation.recommendation_data.reasoning}
          </p>
        </div>

        {/* Match Factors (if available) */}
        {recommendation.recommendation_data.matchFactors && recommendation.recommendation_data.matchFactors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recommendation.recommendation_data.matchFactors.map((factor: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {factor}
              </Badge>
            ))}
          </div>
        )}

        {/* Benefits Section */}
        {recommendation.recommendation_data.benefits && recommendation.recommendation_data.benefits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Key Benefits
            </h4>
            <ul className="space-y-2 pl-3">
              {recommendation.recommendation_data.benefits.map((benefit: string, index: number) => (
                <li 
                  key={index} 
                  className="text-sm text-muted-foreground flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-primary font-bold text-lg leading-none mt-0.5">✓</span>
                  <span className="flex-1">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Advanced Scoring Breakdown (for power users) */}
        {scoringBreakdown && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground transition-colors">
              View detailed scoring breakdown
            </summary>
            <div className="mt-2 p-3 bg-muted/30 rounded space-y-1">
              <div>AI Confidence: {Math.round((scoringBreakdown.aiConfidence || 0) * 100)}%</div>
              <div>Your Preference: {Math.round((scoringBreakdown.userPreferenceScore || 0) * 100)}%</div>
              <div>Profile Match: {Math.round((scoringBreakdown.profileMatchScore || 0) * 100)}%</div>
              <div>Diversity Bonus: {Math.round((scoringBreakdown.diversityBonus || 0) * 100)}%</div>
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleAccept}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I'm Interested
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Not for Me
          </Button>
        </div>

        {/* Metadata */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Generated on {new Date(recommendation.created_at).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
            {recommendation.recommendation_data.abVariant && (
              <span className="ml-2 opacity-50">• {recommendation.recommendation_data.abVariant}</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
