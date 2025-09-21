import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Dummy data for leaderboards matching the design
const userStats = {
  globalRank: 9,
  totalPoints: 19,
  timeRemainingToClimb: '2d 5h'
};

const rankings = [
  { 
    id: 1, 
    name: 'Alex Chen', 
    initials: 'AC', 
    totalPoints: 1250, 
    rank: 1 
  },
  { 
    id: 2, 
    name: 'Sarah Kim', 
    initials: 'SK', 
    totalPoints: 1100, 
    rank: 2 
  },
  { 
    id: 3, 
    name: 'Mike Rodriguez', 
    initials: 'MR', 
    totalPoints: 980, 
    rank: 3 
  },
  { 
    id: 4, 
    name: 'Emma Wilson', 
    initials: 'EW', 
    totalPoints: 865, 
    rank: 4 
  },
  { 
    id: 5, 
    name: 'David Park', 
    initials: 'DP', 
    totalPoints: 720, 
    rank: 5 
  },
  { 
    id: 6, 
    name: 'Lisa Zhang', 
    initials: 'LZ', 
    totalPoints: 650, 
    rank: 6 
  },
  { 
    id: 7, 
    name: 'Tom Anderson', 
    initials: 'TA', 
    totalPoints: 580, 
    rank: 7 
  },
  { 
    id: 8, 
    name: 'Nina Patel', 
    initials: 'NP', 
    totalPoints: 520, 
    rank: 8 
  }
];

export default function LeaderboardsScreen() {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = React.useState<'overall' | 'weekly' | 'streaks'>('overall');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'crown.fill';
      case 2: return 'medal.fill';
      case 3: return 'rosette';
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver  
      case 3: return '#CD7F32'; // Bronze
      default: return '#666666';
    }
  };


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerEmoji}>🏆</ThemedText>
        <ThemedText type="title" style={styles.headerTitle}>Leaderboards</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Compete with others and climb the rankings.</ThemedText>
      </View>

      {/* Your Stats Section */}
      <ThemedView style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <ThemedText style={styles.statsEmoji}>⭐</ThemedText>
          <ThemedText style={styles.statsTitle}>Your Stats</ThemedText>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>🏅 {userStats.globalRank}</ThemedText>
            <ThemedText style={styles.statLabel}>Global Rank</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>💎 {userStats.totalPoints}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Points</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>⏰ {userStats.timeRemainingToClimb}</ThemedText>
            <ThemedText style={styles.statLabel}>Time to Climb</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Rankings Section */}
      <ThemedView style={styles.rankingsCard}>
        <View style={styles.rankingsHeader}>
          <ThemedText style={styles.rankingsEmoji}>👥</ThemedText>
          <ThemedText style={styles.rankingsTitle}>Rankings</ThemedText>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'overall' && styles.activeTab]}
            onPress={() => setSelectedTab('overall')}
          >
            <IconSymbol 
              name="trophy.fill" 
              size={16} 
              color={selectedTab === 'overall' ? '#FFD700' : '#666666'} 
            />
            <ThemedText style={[
              styles.tabText, 
              selectedTab === 'overall' && styles.activeTabText
            ]}>
              Overall
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
            onPress={() => setSelectedTab('weekly')}
          >
            <IconSymbol 
              name="chart.line.uptrend.xyaxis" 
              size={16} 
              color={selectedTab === 'weekly' ? '#FFD700' : '#666666'} 
            />
            <ThemedText style={[
              styles.tabText, 
              selectedTab === 'weekly' && styles.activeTabText
            ]}>
              Weekly
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'streaks' && styles.activeTab]}
            onPress={() => setSelectedTab('streaks')}
          >
            <IconSymbol 
              name="flame.fill" 
              size={16} 
              color={selectedTab === 'streaks' ? '#FFD700' : '#666666'} 
            />
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
          {rankings.map((user) => {
            const getRankBackgroundColor = (rank: number) => {
              switch (rank) {
                case 1: return 'rgba(255, 215, 0, 0.15)'; // Gold background
                case 2: return 'rgba(192, 192, 192, 0.15)'; // Silver background
                case 3: return 'rgba(205, 127, 50, 0.15)'; // Bronze background
                default: return 'transparent';
              }
            };

            return (
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
            );
          })}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  headerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333333',
  },
  statsEmoji: {
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
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
