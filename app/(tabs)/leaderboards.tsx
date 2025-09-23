import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Import Redux selectors and actions
import { 
  selectUserStats, 
  selectCurrentRankings, 
  selectSelectedTab,
  selectUserGlobalRank,
  selectUserTotalPoints,
  selectUserTimeRemaining
} from '../../store/leaderboards/leaderboards.selector';
import { 
  handleTabChange, 
  loadUserStats, 
  loadAllRankings
} from '../../store/leaderboards/leaderboards.action';

// Import new components
import { LeaderboardHeader } from '../../components/tabscomponents/leaderboards/leaderboardsHeader.component';
import { UserStatsCard } from '../../components/tabscomponents/leaderboards/leaderboardsUserStatsCard.component';
import { RankingsList } from '../../components/tabscomponents/leaderboards/leaderboardsRankingsList.component';

export default function LeaderboardsScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Redux state
  const userStats = useSelector(selectUserStats);
  const rankings = useSelector(selectCurrentRankings);
  const selectedTab = useSelector(selectSelectedTab);
  const globalRank = useSelector(selectUserGlobalRank);
  const totalPoints = useSelector(selectUserTotalPoints);
  const timeRemainingToClimb = useSelector(selectUserTimeRemaining);
  
  // Load initial data when component mounts
  React.useEffect(() => {
    // Load user stats and rankings
    dispatch(loadUserStats({
      globalRank: 5,
      totalPoints: 1987,
      timeRemainingToClimb: '2d 8h',
      weeklyRank: 3,
      streakRank: 7,
      currentStreak: 4,
      bestStreak: 12,
      weeklyPoints: 298
    }) as any);
    
    dispatch(loadAllRankings() as any);
  }, [dispatch]);

  return (
    <ScrollView style={styles.container}>
      <LeaderboardHeader />
      <UserStatsCard 
        globalRank={globalRank}
        totalPoints={totalPoints}
        timeRemainingToClimb={timeRemainingToClimb}
      />
      <RankingsList 
        rankings={rankings}
        selectedTab={selectedTab}
        onTabChange={(tab) => dispatch(handleTabChange(tab) as any)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});