import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
// useColorScheme removed - not used

// Import Redux selectors and actions
import { 
  selectLeaderboardsState // Consolidated selector
} from '../../store/leaderboards/leaderboards.selector';
import { 
  handleTabChange, 
  refreshLeaderboardData
} from '../../store/leaderboards/leaderboards.action';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCentralizedListener } from '../../hooks/use-centralized-listener';

// Import new components
import { LeaderboardHeader } from '../../components/tabscomponents/leaderboards/leaderboardsHeader.component';
import { UserStatsCard } from '../../components/tabscomponents/leaderboards/leaderboardsUserStatsCard.component';
import { RankingsList } from '../../components/tabscomponents/leaderboards/leaderboardsRankingsList.component';

export default function LeaderboardsScreen() {
  const dispatch = useDispatch();
  // colorScheme removed - not used
  
  // Auth context for current user
  const { currentUser, isAuthenticated } = useAuth();
  
  // Redux state - Consolidated selector
  const leaderboardsState = useSelector(selectLeaderboardsState);
  
  // Extract values from consolidated state
  const {
    rankings,
    selectedTab,
    isLoading,
    error,
    userGlobalRank: globalRank,
    userTotalPoints: totalPoints,
    userTimeRemaining: timeRemainingToClimb
  } = leaderboardsState;
  
  // Get current rankings for selected tab
  const currentRankings = rankings[selectedTab] || [];
  
  // Initialize only leaderboard-related listeners
  useCentralizedListener({
    enablePosts: false,        // Leaderboards tab doesn't need posts
    enableUserData: true,      // Need userData for current user stats
    enableTasks: false,        // Leaderboards tab doesn't need tasks
    enableLeaderboards: true   // Need leaderboards for this tab
  });

  // Debug logging removed for production

  // Show loading state
  if (isLoading && currentRankings.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading leaderboards...</ThemedText>
      </ThemedView>
    );
  }

  // Show error state
  if (error && currentRankings.length === 0) {
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
        rankings={currentRankings}
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