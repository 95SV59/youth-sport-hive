import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Users, BookOpen } from 'lucide-react';
import ChallengeCard from '@/components/ChallengeCard';
import LeaderboardTable from '@/components/LeaderboardTable';
import Layout from '@/components/Layout';

const Challenges = () => {
  const { challenges, leaderboards, loading } = useGamification();

  const filterChallengesByType = (type: string) => {
    return challenges.filter(challenge => challenge.challenge_type === type);
  };

  const getActiveChallenges = () => {
    return challenges.filter(challenge => 
      challenge.progress && !challenge.progress.completed
    );
  };

  const getCompletedChallenges = () => {
    return challenges.filter(challenge => 
      challenge.progress && challenge.progress.completed
    );
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Target className="h-5 w-5" />;
      case 'social': return <Users className="h-5 w-5" />;
      case 'learning': return <BookOpen className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span>Challenges & Leaderboards</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete challenges, earn points, and climb the leaderboards!
          </p>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="challenges" className="space-y-6">
            {/* Challenge Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getActiveChallenges().length}</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCompletedChallenges().length}</div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{challenges.length}</div>
                  <p className="text-xs text-muted-foreground">Total challenges</p>
                </CardContent>
              </Card>
            </div>

            {/* Challenge Categories */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Challenges</TabsTrigger>
                <TabsTrigger value="activity">
                  <Target className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="social">
                  <Users className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="learning">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterChallengesByType('activity').map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="social" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterChallengesByType('social').map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="learning" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterChallengesByType('learning').map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="leaderboards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LeaderboardTable
                entries={leaderboards.weekly}
                title="Weekly Leaders"
                period="This Week"
              />
              <LeaderboardTable
                entries={leaderboards.monthly}
                title="Monthly Champions"
                period="This Month"
              />
              <LeaderboardTable
                entries={leaderboards.yearly}
                title="Yearly Legends"
                period="This Year"
              />
            </div>
          </TabsContent>
        </Tabs>

        {challenges.length === 0 && (
          <Card className="text-center py-16">
            <CardHeader>
              <CardTitle>No Challenges Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Check back soon for new challenges to earn points and achievements!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Challenges;