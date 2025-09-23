import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export const LeaderboardHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <ThemedText style={styles.headerEmoji}>🏆</ThemedText>
      <ThemedText type="title" style={styles.headerTitle}>Leaderboards</ThemedText>
      <ThemedText style={styles.headerSubtitle}>Compete with others and climb the rankings.</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
