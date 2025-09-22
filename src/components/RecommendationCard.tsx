import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb, Star } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    recommended_sport: string;
    reasoning: string;
    confidence_score: number;
    benefits?: string[];
    created_at: string;
  };
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span>Sport Recommendation</span>
          </div>
          <Badge variant="outline" className={getConfidenceColor(recommendation.confidence_score)}>
            <Star className="h-3 w-3 mr-1" />
            {getConfidenceLabel(recommendation.confidence_score)} Match
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <h3 className="text-xl font-bold text-primary">
            {formatSportName(recommendation.recommended_sport)}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round(recommendation.confidence_score * 100)}% confidence match
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Why this sport is perfect for you:</h4>
          <p className="text-sm text-muted-foreground">
            {recommendation.reasoning}
          </p>
        </div>

        {recommendation.benefits && recommendation.benefits.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Key Benefits:</h4>
            <ul className="space-y-1">
              {recommendation.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I'm Interested
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Not for Me
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Generated on {new Date(recommendation.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;