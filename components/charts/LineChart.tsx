import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface LineChartData {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartProps {
  data: LineChartData[];
  title?: string;
  maxValue?: number;
  minValue?: number;
  showValues?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  maxValue,
  minValue,
  showValues = true,
  showLabels = true,
  showGrid = true,
  size = 'medium',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate min and max values if not provided
  const calculatedMinValue = minValue !== undefined ? minValue : Math.min(...data.map(item => item.value));
  const calculatedMaxValue = maxValue !== undefined ? maxValue : Math.max(...data.map(item => item.value));
  const valueRange = calculatedMaxValue - calculatedMinValue;

  const getValuePosition = (value: number) => {
    return ((value - calculatedMinValue) / valueRange) * 100;
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

  // Generate grid lines
  const generateGridLines = () => {
    if (!showGrid) return null;
    
    const gridLines = [];
    for (let i = 0; i <= 4; i++) {
      const yPosition = (i / 4) * 100;
      gridLines.push(
        <View
          key={i}
          style={[
            styles.gridLine,
            {
              bottom: `${yPosition}%`,
              backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA',
            }
          ]}
        />
      );
    }
    return gridLines;
  };

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
        {/* Grid lines */}
        {generateGridLines()}
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Data points and connecting lines */}
          {data.map((item, index) => {
            const nextItem = data[index + 1];
            const currentPosition = getValuePosition(item.value);
            const nextPosition = nextItem ? getValuePosition(nextItem.value) : null;
            
            return (
              <View key={index}>
                {/* Data point */}
                <View
                  style={[
                    styles.dataPoint,
                    {
                      left: `${(index / (data.length - 1)) * 100}%`,
                      bottom: `${currentPosition}%`,
                      backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint,
                    }
                  ]}
                />
                
                {/* Value label */}
                {showValues && (
                  <ThemedText
                    style={[
                      styles.valueLabel,
                      {
                        left: `${(index / (data.length - 1)) * 100}%`,
                        bottom: `${currentPosition + 5}%`,
                        fontSize: textSizes.value,
                      }
                    ]}
                  >
                    {item.value}
                  </ThemedText>
                )}
                
                {/* Connecting line */}
                {nextItem && (
                  <View
                    style={[
                      styles.connectingLine,
                      {
                        left: `${(index / (data.length - 1)) * 100}%`,
                        width: `${100 / (data.length - 1)}%`,
                        bottom: `${Math.min(currentPosition, nextPosition!)}%`,
                        height: `${Math.abs(currentPosition - nextPosition!)}%`,
                        backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint,
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              nextPosition! - currentPosition,
                              100 / (data.length - 1)
                            )}rad`
                          }
                        ],
                      }
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
        
        {/* X-axis labels */}
        {showLabels && (
          <View style={styles.xAxisLabels}>
            {data.map((item, index) => (
              <ThemedText
                key={index}
                style={[
                  styles.xAxisLabel,
                  {
                    left: `${(index / (data.length - 1)) * 100}%`,
                    fontSize: textSizes.label,
                  }
                ]}
                numberOfLines={1}
              >
                {item.label}
              </ThemedText>
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
    position: 'relative',
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
  chartArea: {
    position: 'relative',
    flex: 1,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginBottom: -4,
  },
  valueLabel: {
    position: 'absolute',
    fontWeight: '600',
    marginLeft: -10,
    marginBottom: -10,
    minWidth: 20,
    textAlign: 'center',
  },
  connectingLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  xAxisLabels: {
    position: 'relative',
    height: 20,
    marginHorizontal: 20,
  },
  xAxisLabel: {
    position: 'absolute',
    opacity: 0.7,
    textAlign: 'center',
    transform: [{ translateX: -20 }],
  },
});
