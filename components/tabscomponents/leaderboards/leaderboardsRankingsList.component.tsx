import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface Ranking {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  totalPoints: number;
  weeklyPoints: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  isCurrentUser?: boolean;
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
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'overall' && styles.activeTab]}
          onPress={() => onTabChange('overall')}
        >
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'overall' && styles.activeTabText
          ]}>
            Overall
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
          onPress={() => onTabChange('weekly')}
        >
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'weekly' && styles.activeTabText
          ]}>
            Weekly
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'streaks' && styles.activeTab]}
          onPress={() => onTabChange('streaks')}
        >
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'streaks' && styles.activeTabText
          ]}>
            Streaks
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      <View style={styles.leaderboardList}>
        {rankings.map((user) => (
          <ThemedView key={user.id} style={[
            styles.userCard,
            user.rank <= 3 && styles.topThreeCard,
            user.isCurrentUser && styles.currentUserCard,
            { backgroundColor: getRankBackgroundColor(user.rank) }
          ]}>
            {/* Rank Section */}
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
            <View style={[
              styles.avatarContainer,
              user.isCurrentUser && styles.currentUserAvatar
            ]}>
              <ThemedText style={[
                styles.avatarText,
                user.isCurrentUser && styles.currentUserAvatarText
              ]}>
                {user.avatar || user.initials}
              </ThemedText>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <ThemedText style={[
                  styles.userName,
                  user.isCurrentUser && styles.currentUserName
                ]}>
                  {user.name}
                </ThemedText>
                {user.isCurrentUser && (
                  <ThemedText style={styles.youBadge}>YOU</ThemedText>
                )}
              </View>
              
              {/* Stats based on selected tab */}
              <View style={styles.userStats}>
                {selectedTab === 'overall' && (
                  <ThemedText style={styles.statText}>
                    🏆 {user.totalPoints.toLocaleString()} points
                  </ThemedText>
                )}
                {selectedTab === 'weekly' && (
                  <ThemedText style={styles.statText}>
                    📈 {user.weeklyPoints} this week
                  </ThemedText>
                )}
                {selectedTab === 'streaks' && (
                  <ThemedText style={styles.statText}>
                    🔥 {user.currentStreak} day streak
                  </ThemedText>
                )}
              </View>
              
              {/* Additional info */}
              <View style={styles.additionalInfo}>
                <ThemedText style={styles.additionalText}>
                  Best: {user.bestStreak} days
                </ThemedText>
              </View>
            </View>
          </ThemedView>
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
    gap: 12,
  },
  // Enhanced User Card Styles
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  rankEmoji: {
    fontSize: 28,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  currentUserAvatar: {
    backgroundColor: '#007AFF',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
  },
  currentUserAvatarText: {
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
  },
  currentUserName: {
    color: '#007AFF',
  },
  youBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  userStats: {
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});
