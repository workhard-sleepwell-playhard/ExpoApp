import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface StatsCardProps {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  totalPoints: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  totalTasks,
  completedTasks,
  currentStreak,
  totalPoints,
}) => {
  return (
    <ThemedView style={styles.statsCard}>
      <ThemedText type="subtitle" style={styles.cardTitle}>Your Stats</ThemedText>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {totalTasks}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Tasks</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {completedTasks}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {currentStreak}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {totalPoints.toLocaleString()}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Points</ThemedText>
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
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});
