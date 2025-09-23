import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface TaskStatsProps {
  pendingCount: number;
  completedCount: number;
  progressPercentage: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({
  pendingCount,
  completedCount,
  progressPercentage,
}) => {
  return (
    <ThemedView style={styles.statsContainer}>
      <View style={styles.statItem}>
        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{pendingCount}</ThemedText>
        <ThemedText style={styles.statLabel}>Pending</ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{completedCount}</ThemedText>
        <ThemedText style={styles.statLabel}>Completed</ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{progressPercentage}%</ThemedText>
        <ThemedText style={styles.statLabel}>Progress</ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
});
