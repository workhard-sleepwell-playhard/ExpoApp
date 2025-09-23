import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface SummaryCardProps {
  totalHours: number;
  categories: number;
  productivity: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  totalHours,
  categories,
  productivity,
}) => {
  return (
    <ThemedView style={styles.summaryCard}>
      <ThemedText type="subtitle" style={styles.cardTitle}>Today's Summary</ThemedText>
      <View style={styles.summaryStats}>
        <View style={styles.summaryItem}>
          <ThemedText type="defaultSemiBold" style={styles.summaryNumber}>{totalHours}</ThemedText>
          <ThemedText style={styles.summaryLabel}>Total Hours</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText type="defaultSemiBold" style={styles.summaryNumber}>{categories}</ThemedText>
          <ThemedText style={styles.summaryLabel}>Categories</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText type="defaultSemiBold" style={styles.summaryNumber}>{productivity}%</ThemedText>
          <ThemedText style={styles.summaryLabel}>Productivity</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});
