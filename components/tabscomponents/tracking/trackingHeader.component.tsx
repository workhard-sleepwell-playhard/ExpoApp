import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const TrackingHeader: React.FC = () => {
  return (
    <ThemedView style={styles.header}>
      <ThemedText type="title">Time Tracking</ThemedText>
      <ThemedText style={styles.subtitle}>Track your daily activities</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
});
