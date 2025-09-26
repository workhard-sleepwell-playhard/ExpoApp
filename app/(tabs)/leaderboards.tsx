import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Import Redux selectors and actions
import { 
  selectUserStats, 
  selectCurrentRankings, 
  selectSelectedTab,
  selectUserGlobalRank,
  selectUserTotalPoints,
  selectUserTimeRemaining,
  selectIsLoading,
  selectError
} from '../../store/leaderboards/leaderboards.selector';
import { 
  handleTabChange, 
  fetchLeaderboardData,
  calculateUserStatsFromProfile,
  refreshLeaderboardData
} from '../../store/leaderboards/leaderboards.action';
import { useAuth } from '@/components/auth/AuthProvider';
import { selectUserData } from '../../store/profile/profile.selector';

// Import new components
import { LeaderboardHeader } from '../../components/tabscomponents/leaderboards/leaderboardsHeader.component';
import { UserStatsCard } from '../../components/tabscomponents/leaderboards/leaderboardsUserStatsCard.component';
import { RankingsList } from '../../components/tabscomponents/leaderboards/leaderboardsRankingsList.component';

export default function LeaderboardsScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Auth context for current user
  const { currentUser, isAuthenticated } = useAuth();
  
  // Redux state
  const userStats = useSelector(selectUserStats);
  const rankings = useSelector(selectCurrentRankings);
  const selectedTab = useSelector(selectSelectedTab);
  const globalRank = useSelector(selectUserGlobalRank);
  const totalPoints = useSelector(selectUserTotalPoints);
  const timeRemainingToClimb = useSelector(selectUserTimeRemaining);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Get user profile data from profile store (no duplicate Firebase calls!)
  const userProfile = useSelector(selectUserData);
  
  // Load initial data when component mounts and user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && currentUser?.uid) {
      // Fetch leaderboard data efficiently (no duplicate user data fetch!)
      dispatch(fetchLeaderboardData(currentUser.uid) as any);
    }
  }, [dispatch, isAuthenticated, currentUser?.uid]);

  // Calculate user stats from existing profile data when rankings are available
  React.useEffect(() => {
    if (userProfile && rankings && currentUser?.uid) {
      dispatch(calculateUserStatsFromProfile(userProfile, rankings, currentUser.uid) as any);
    }
  }, [dispatch, userProfile, rankings, currentUser?.uid]);

  // Debug logging
  React.useEffect(() => {
    console.log('Leaderboards Debug Info:', {
      isAuthenticated,
      currentUserId: currentUser?.uid,
      userProfile: !!userProfile,
      rankingsLength: rankings.length,
      selectedTab,
      isLoading,
      error
    });
  }, [isAuthenticated, currentUser?.uid, userProfile, rankings.length, selectedTab, isLoading, error]);

  // Show loading state
  if (isLoading && rankings.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading leaderboards...</ThemedText>
      </ThemedView>
    );
  }

  // Show error state
  if (error && rankings.length === 0) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Error loading leaderboards: {error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            if (currentUser?.uid) {
              dispatch(refreshLeaderboardData(currentUser.uid) as any);
            }
          }}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.authRequiredContainer}>
        <ThemedText style={styles.authRequiredText}>Please sign in to view leaderboards</ThemedText>
      </ThemedView>
    );
  }

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
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authRequiredText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  // Debug styles
  debugContainer: {
    margin: 20,
    marginTop: 0,
    padding: 10,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});