import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, CheckCircle } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    challenge_type: string;
    sport_category?: string;
    target_value: number;
    points_reward: number;
    difficulty_level: string;
    expires_at: string;
    progress?: {
      current_progress: number;
      completed: boolean;
      points_earned: number;
    };
  };
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const { startChallenge, updateChallengeProgress } = useGamification();

  const getProgressPercentage = () => {
    if (!challenge.progress) return 0;
    return Math.min((challenge.progress.current_progress / challenge.target_value) * 100, 100);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Target className="h-4 w-4" />;
      case 'social': return <Trophy className="h-4 w-4" />;
      case 'learning': return <CheckCircle className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const formatSportCategory = (category: string) => {
    if (!category) return '';
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDaysRemaining = () => {
    const expiryDate = new Date(challenge.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleStartChallenge = () => {
    startChallenge(challenge.id);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getChallengeTypeIcon(challenge.challenge_type)}
            <span className="text-lg">{challenge.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(challenge.difficulty_level)}>
              {challenge.difficulty_level}
            </Badge>
            {challenge.progress?.completed && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {challenge.description}
        </p>

        {challenge.sport_category && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {formatSportCategory(challenge.sport_category)}
            </Badge>
          </div>
        )}

        {challenge.progress ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progress</span>
              <span>
                {challenge.progress.current_progress} / {challenge.target_value}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
            {challenge.progress.completed && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                🎉 Challenge completed! Earned {challenge.progress.points_earned} points
              </p>
            )}
          </div>
        ) : (
          <Button onClick={handleStartChallenge} className="w-full">
            Start Challenge
          </Button>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4" />
            <span>{challenge.points_reward} points</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{getDaysRemaining()} days left</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;