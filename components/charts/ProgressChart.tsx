import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ProgressChartProps {
  title?: string;
  value: number;
  maxValue: number;
  showValue?: boolean;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'bar' | 'circular' | 'linear';
  style?: ViewStyle;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  value,
  maxValue,
  showValue = true,
  showPercentage = true,
  color,
  backgroundColor,
  size = 'medium',
  variant = 'bar',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const percentage = Math.min((value / maxValue) * 100, 100);

  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          height: 8,
          fontSize: 14,
          titleSize: 12,
          circularSize: 60,
        };
      case 'medium':
        return {
          height: 12,
          fontSize: 16,
          titleSize: 14,
          circularSize: 80,
        };
      case 'large':
        return {
          height: 16,
          fontSize: 20,
          titleSize: 16,
          circularSize: 100,
        };
      default:
        return {
          height: 12,
          fontSize: 16,
          titleSize: 14,
          circularSize: 80,
        };
    }
  };

  const sizes = getSizes();

  const getProgressColor = () => {
    if (color) return color;
    
    // Dynamic color based on percentage
    if (percentage >= 80) return '#34C759'; // Green
    if (percentage >= 60) return '#FF9500'; // Orange
    if (percentage >= 40) return '#FFCC00'; // Yellow
    return '#FF3B30'; // Red
  };

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    return isDark ? '#3A3A3C' : '#E5E5EA';
  };

  const renderBarProgress = () => (
    <View style={styles.barContainer}>
      <View style={[
        styles.barBackground,
        {
          height: sizes.height,
          backgroundColor: getBackgroundColor(),
        }
      ]}>
        <View style={[
          styles.barFill,
          {
            height: sizes.height,
            width: `${percentage}%`,
            backgroundColor: getProgressColor(),
          }
        ]} />
      </View>
    </View>
  );

  const renderLinearProgress = () => (
    <View style={styles.linearContainer}>
      <View style={styles.linearBackground}>
        <View style={[
          styles.linearFill,
          {
            width: `${percentage}%`,
            backgroundColor: getProgressColor(),
          }
        ]} />
      </View>
      {showValue && (
        <View style={styles.linearValue}>
          <ThemedText style={[
            styles.valueText,
            { fontSize: sizes.fontSize }
          ]}>
            {value}
          </ThemedText>
          <ThemedText style={[
            styles.maxValueText,
            { fontSize: sizes.fontSize * 0.8 }
          ]}>
            / {maxValue}
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderCircularProgress = () => {
    const radius = sizes.circularSize / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[
        styles.circularContainer,
        { width: sizes.circularSize, height: sizes.circularSize }
      ]}>
        {/* Background circle */}
        <View style={[
          styles.circularBackground,
          {
            width: sizes.circularSize,
            height: sizes.circularSize,
            borderRadius: sizes.circularSize / 2,
            borderColor: getBackgroundColor(),
          }
        ]} />
        
        {/* Progress circle (simplified representation) */}
        <View style={[
          styles.circularProgress,
          {
            width: sizes.circularSize,
            height: sizes.circularSize,
            borderRadius: sizes.circularSize / 2,
            borderColor: getProgressColor(),
            borderWidth: 4,
            transform: [{ rotate: `${percentage * 3.6}deg` }],
          }
        ]} />
        
        {/* Center text */}
        <View style={styles.circularCenter}>
          {showValue && (
            <ThemedText style={[
              styles.circularValue,
              { fontSize: sizes.fontSize }
            ]}>
              {value}
            </ThemedText>
          )}
          {showPercentage && (
            <ThemedText style={[
              styles.circularPercentage,
              { fontSize: sizes.titleSize }
            ]}>
              {percentage.toFixed(0)}%
            </ThemedText>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <ThemedText style={[
            styles.title,
            { fontSize: sizes.titleSize }
          ]}>
            {title}
          </ThemedText>
          {showPercentage && variant !== 'circular' && (
            <ThemedText style={[
              styles.percentage,
              { fontSize: sizes.titleSize }
            ]}>
              {percentage.toFixed(0)}%
            </ThemedText>
          )}
        </View>
      )}
      
      <View style={styles.chartContainer}>
        {variant === 'bar' && renderBarProgress()}
        {variant === 'linear' && renderLinearProgress()}
        {variant === 'circular' && renderCircularProgress()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  percentage: {
    fontWeight: '600',
    opacity: 0.7,
  },
  chartContainer: {
    alignItems: 'center',
  },
  // Bar progress styles
  barContainer: {
    width: '100%',
  },
  barBackground: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 6,
  },
  // Linear progress styles
  linearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  linearBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  linearFill: {
    height: '100%',
    borderRadius: 4,
  },
  linearValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontWeight: 'bold',
  },
  maxValueText: {
    opacity: 0.6,
  },
  // Circular progress styles
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularBackground: {
    position: 'absolute',
    borderWidth: 4,
  },
  circularProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circularCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularValue: {
    fontWeight: 'bold',
  },
  circularPercentage: {
    opacity: 0.7,
  },
});
