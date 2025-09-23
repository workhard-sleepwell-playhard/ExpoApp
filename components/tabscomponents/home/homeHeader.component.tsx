import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const HomeHeader: React.FC = () => {
  return (
    <ThemedView style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <ThemedText type="title">Feed</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Stay connected with your productivity community</ThemedText>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <ThemedText style={styles.notificationIcon}>🔔</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
});
