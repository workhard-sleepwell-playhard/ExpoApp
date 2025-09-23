import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface TimePeriodSelectorProps {
  timePeriod: 'week' | 'month' | 'year' | 'all-time';
  onNavigate: (direction: 'prev' | 'next') => void;
  onCustomDateClick: () => void;
  getTimePeriodLabel: () => string;
  getTimePeriodIcon: () => string;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  timePeriod,
  onNavigate,
  onCustomDateClick,
  getTimePeriodLabel,
  getTimePeriodIcon,
}) => {
  return (
    <View style={styles.timePeriodContainer}>
      <View style={styles.timePeriodNavigation}>
        <TouchableOpacity 
          style={styles.timePeriodArrow}
          onPress={() => onNavigate('prev')}
        >
          <ThemedText style={styles.arrowText}>‹</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.timePeriodDisplay}
          onPress={onCustomDateClick}
        >
          <ThemedText style={styles.timePeriodIcon}>{getTimePeriodIcon()}</ThemedText>
          <ThemedText style={styles.timePeriodLabel}>{getTimePeriodLabel()}</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.timePeriodArrow}
          onPress={() => onNavigate('next')}
        >
          <ThemedText style={styles.arrowText}>›</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timePeriodContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  timePeriodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: 'center',
  },
  timePeriodArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  timePeriodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
  },
  timePeriodIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timePeriodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
});
