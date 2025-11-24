import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb, Star } from 'lucide-react';
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
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const handleAccept = () => {
    updateRecommendationFeedback(recommendation.id, true, 'User accepted recommendation');
    onAccept?.();
  };

  const handleDecline = () => {
    updateRecommendationFeedback(recommendation.id, false, 'User declined recommendation');
    onDecline?.();
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-foreground">Perfect Match</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${getConfidenceColor(recommendation.confidence_score)} border-current`}
          >
            <Star className="h-3 w-3 mr-1 fill-current" />
            {getConfidenceLabel(recommendation.confidence_score)} ({Math.round(recommendation.confidence_score * 100)}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Sport Name Display */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border-2 border-primary/20">
          <h3 className="text-3xl font-bold text-primary mb-2">
            {formatSportName(recommendation.sport_type || recommendation.recommendation_data.sport)}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            Recommended for you
          </p>
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

        {/* Benefits Section */}
        {recommendation.recommendation_data.benefits && recommendation.recommendation_data.benefits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Key Benefits
            </h4>
            <ul className="space-y-2 pl-3">
              {recommendation.recommendation_data.benefits.map((benefit, index) => (
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
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;