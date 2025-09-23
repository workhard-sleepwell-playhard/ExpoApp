import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface Ranking {
  id: number;
  name: string;
  initials: string;
  totalPoints: number;
  rank: number;
}

interface RankingsListProps {
  rankings: Ranking[];
  selectedTab: 'overall' | 'weekly' | 'streaks';
  onTabChange: (tab: 'overall' | 'weekly' | 'streaks') => void;
}

export const RankingsList: React.FC<RankingsListProps> = ({
  rankings,
  selectedTab,
  onTabChange,
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver  
      case 3: return '#CD7F32'; // Bronze
      default: return '#666666';
    }
  };

  const getRankBackgroundColor = (rank: number) => {
    switch (rank) {
      case 1: return 'rgba(255, 215, 0, 0.15)'; // Gold background
      case 2: return 'rgba(192, 192, 192, 0.15)'; // Silver background
      case 3: return 'rgba(205, 127, 50, 0.15)'; // Bronze background
      default: return 'transparent';
    }
  };

  return (
    <ThemedView style={styles.rankingsCard}>
      <View style={styles.rankingsHeader}>
        <ThemedText style={styles.rankingsEmoji}>👥</ThemedText>
        <ThemedText style={styles.rankingsTitle}>Rankings</ThemedText>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={[styles.tab, selectedTab === 'overall' && styles.activeTab]}>
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'overall' && styles.activeTabText
          ]}>
            Overall
          </ThemedText>
        </View>
        
        <View style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}>
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'weekly' && styles.activeTabText
          ]}>
            Weekly
          </ThemedText>
        </View>
        
        <View style={[styles.tab, selectedTab === 'streaks' && styles.activeTab]}>
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'streaks' && styles.activeTabText
          ]}>
            Streaks
          </ThemedText>
        </View>
      </View>

      {/* Leaderboard List */}
      <View style={styles.leaderboardList}>
        {rankings.map((user) => (
          <View key={user.id} style={[
            styles.leaderboardItem,
            user.rank <= 3 && styles.topThreeItem,
            { backgroundColor: getRankBackgroundColor(user.rank) }
          ]}>
            {/* Rank Icon/Number */}
            <View style={styles.rankSection}>
              {user.rank === 1 ? (
                <ThemedText style={styles.rankEmoji}>👑</ThemedText>
              ) : user.rank === 2 ? (
                <ThemedText style={styles.rankEmoji}>🥈</ThemedText>
              ) : user.rank === 3 ? (
                <ThemedText style={styles.rankEmoji}>🥉</ThemedText>
              ) : (
                <ThemedText style={[styles.rankNumber, { color: getRankColor(user.rank) }]}>
                  #{user.rank}
                </ThemedText>
              )}
            </View>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <ThemedText style={styles.avatarText}>{user.initials}</ThemedText>
            </View>

            {/* User Info and Points */}
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{user.name} - 🏆 {user.totalPoints}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  rankingsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  rankingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333333',
  },
  rankingsEmoji: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#666666',
  },
  activeTabText: {
    color: '#333333',
    fontWeight: '600',
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: -12,
  },
  topThreeItem: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  rankSection: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  rankEmoji: {
    fontSize: 24,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});
