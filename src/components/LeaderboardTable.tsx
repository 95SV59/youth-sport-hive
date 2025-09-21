import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  points: number;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  title: string;
  period: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  title,
  period
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span>{title}</span>
          <Badge variant="outline">{period}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rankings available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start participating in events to see your ranking!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={entry.profiles.avatar_url} 
                      alt={`${entry.profiles.first_name} ${entry.profiles.last_name}`} 
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(entry.profiles.first_name, entry.profiles.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium text-sm">
                      {entry.profiles.first_name} {entry.profiles.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.points.toLocaleString()} points
                    </p>
                  </div>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={getRankBadgeColor(entry.rank)}
                >
                  Rank #{entry.rank}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;