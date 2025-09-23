import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  title?: string;
  maxValue?: number;
  showValues?: boolean;
  showLabels?: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  maxValue,
  showValues = true,
  showLabels = true,
  orientation = 'vertical',
  size = 'medium',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate max value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.map(item => item.value), 1);

  const getBarHeight = (value: number) => {
    return (value / calculatedMaxValue) * 100;
  };

  const getBarWidth = (value: number) => {
    return (value / calculatedMaxValue) * 100;
  };

  const getContainerHeight = () => {
    switch (size) {
      case 'small': return 120;
      case 'medium': return 160;
      case 'large': return 200;
      default: return 160;
    }
  };

  const getTextSizes = () => {
    switch (size) {
      case 'small':
        return { title: 14, label: 10, value: 10 };
      case 'medium':
        return { title: 16, label: 12, value: 12 };
      case 'large':
        return { title: 18, label: 14, value: 14 };
      default:
        return { title: 16, label: 12, value: 12 };
    }
  };

  const textSizes = getTextSizes();

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <ThemedText style={styles.emptyText}>No data available</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {title && (
        <ThemedText 
          style={[
            styles.title,
            { fontSize: textSizes.title }
          ]}
        >
          {title}
        </ThemedText>
      )}
      
      <View style={[
        styles.chartContainer,
        { height: getContainerHeight() }
      ]}>
        {orientation === 'vertical' ? (
          <View style={styles.verticalChart}>
            {data.map((item, index) => (
              <View key={index} style={styles.verticalBarContainer}>
                <View style={styles.barWrapper}>
                  {showValues && (
                    <ThemedText 
                      style={[
                        styles.valueText,
                        { fontSize: textSizes.value }
                      ]}
                    >
                      {item.value}
                    </ThemedText>
                  )}
                  <View 
                    style={[
                      styles.verticalBar,
                      {
                        height: `${getBarHeight(item.value)}%`,
                        backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint,
                      }
                    ]}
                  />
                </View>
                {showLabels && (
                  <ThemedText 
                    style={[
                      styles.labelText,
                      { fontSize: textSizes.label }
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </ThemedText>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.horizontalChart}>
            {data.map((item, index) => (
              <View key={index} style={styles.horizontalBarContainer}>
                {showLabels && (
                  <ThemedText 
                    style={[
                      styles.labelText,
                      { fontSize: textSizes.label, width: 80 }
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </ThemedText>
                )}
                <View style={styles.horizontalBarWrapper}>
                  <View 
                    style={[
                      styles.horizontalBar,
                      {
                        width: `${getBarWidth(item.value)}%`,
                        backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint,
                      }
                    ]}
                  />
                  {showValues && (
                    <ThemedText 
                      style={[
                        styles.valueText,
                        { fontSize: textSizes.value }
                      ]}
                    >
                      {item.value}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    width: '100%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  // Vertical chart styles
  verticalChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 20,
  },
  verticalBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  verticalBar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  // Horizontal chart styles
  horizontalChart: {
    flex: 1,
    justifyContent: 'space-around',
  },
  horizontalBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  horizontalBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  horizontalBar: {
    height: 16,
    borderRadius: 8,
    minWidth: 4,
    marginRight: 8,
  },
  // Text styles
  labelText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  valueText: {
    fontWeight: '600',
    marginBottom: 4,
  },
});
