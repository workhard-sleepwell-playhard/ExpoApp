import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface UserStatsCardProps {
  globalRank: number;
  totalPoints: number;
  timeRemainingToClimb: string;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  globalRank,
  totalPoints,
  timeRemainingToClimb,
}) => {
  return (
    <ThemedView style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <ThemedText style={styles.statsEmoji}>⭐</ThemedText>
        <ThemedText style={styles.statsTitle}>Your Stats</ThemedText>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>🏅 {globalRank}</ThemedText>
          <ThemedText style={styles.statLabel}>Global Rank</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>💎 {totalPoints}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Points</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>⏰ {timeRemainingToClimb}</ThemedText>
          <ThemedText style={styles.statLabel}>Time to Climb</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
});
