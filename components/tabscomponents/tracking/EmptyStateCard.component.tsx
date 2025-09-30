import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

interface EmptyStateCardProps {
  fromDate: string;
  toDate: string;
  isCustomDateRange: boolean;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  fromDate,
  toDate,
  isCustomDateRange
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDateRangeText = () => {
    if (isCustomDateRange) {
      return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    }
    return formatDate(fromDate);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol 
          name="calendar.badge.clock" 
          size={48} 
          color={Colors.light.tint} 
        />
      </View>
      
      <ThemedText style={styles.title}>
        No Progress Recorded
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        {isCustomDateRange ? 'for this date range' : 'for this date'}
      </ThemedText>
      
      <View style={styles.dateContainer}>
        <ThemedText style={styles.dateText}>
          {getDateRangeText()}
        </ThemedText>
      </View>
      
      <ThemedText style={styles.message}>
        Start tracking your time to see your progress and analytics here.
      </ThemedText>
      
      <View style={styles.tipContainer}>
        <IconSymbol 
          name="lightbulb" 
          size={16} 
          color={Colors.light.tint} 
        />
        <ThemedText style={styles.tipText}>
          Try selecting a different date range or create some sample data to get started.
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderStyle: 'dashed',
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.tint,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});

