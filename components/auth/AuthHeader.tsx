import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const AuthHeader: React.FC = () => {
  return (
    <ThemedView style={styles.header}>
      <View style={styles.logoContainer}>
        <ThemedText style={styles.logo}>🏁</ThemedText>
      </View>
      <ThemedText type="title" style={styles.title}>
        FinishIt
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Complete your tasks and achieve your goals
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
