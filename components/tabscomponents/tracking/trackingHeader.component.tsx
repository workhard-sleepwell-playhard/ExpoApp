import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface TrackingHeaderProps {
  onCreateSampleData?: () => void;
}

export const TrackingHeader: React.FC<TrackingHeaderProps> = ({ 
  onCreateSampleData
}) => {
  return (
    <ThemedView style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <ThemedText type="title">Time Tracking</ThemedText>
          <ThemedText style={styles.subtitle}>Track your daily activities</ThemedText>
        </View>
        {onCreateSampleData && (
          <TouchableOpacity style={styles.testButton} onPress={onCreateSampleData}>
            <ThemedText style={styles.testButtonText}>Test Data</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
