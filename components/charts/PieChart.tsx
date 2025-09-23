import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: string;
  showLegend?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  showLegend = true,
  showValues = true,
  showPercentages = true,
  size = 'medium',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate total value
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages and angles
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: (item.value / totalValue) * 100,
    angle: (item.value / totalValue) * 360,
  }));

  const getChartSize = () => {
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
        return { title: 14, legend: 10, value: 10 };
      case 'medium':
        return { title: 16, legend: 12, value: 12 };
      case 'large':
        return { title: 18, legend: 14, value: 14 };
      default:
        return { title: 16, legend: 12, value: 12 };
    }
  };

  const textSizes = getTextSizes();
  const chartSize = getChartSize();

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <ThemedText style={styles.emptyText}>No data available</ThemedText>
      </View>
    );
  }

  // Create pie slices using View components (simplified representation)
  const renderPieSlice = (item: typeof dataWithPercentages[0], startAngle: number) => {
    // This is a simplified pie chart representation
    // For a more accurate pie chart, you'd want to use SVG or a charting library
    return (
      <View
        key={item.label}
        style={[
          styles.pieSlice,
          {
            backgroundColor: item.color,
            width: chartSize * (item.percentage / 100),
            height: chartSize * 0.8,
            borderRadius: chartSize * 0.4,
          }
        ]}
      />
    );
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
      
      <View style={styles.chartContainer}>
        {/* Simplified pie chart representation */}
        <View style={[styles.pieChartContainer, { width: chartSize, height: chartSize }]}>
          <View style={styles.pieChart}>
            {dataWithPercentages.map((item, index) => {
              const startAngle = dataWithPercentages.slice(0, index).reduce((sum, prev) => sum + prev.angle, 0);
              return renderPieSlice(item, startAngle);
            })}
            
            {/* Center circle */}
            <View style={[
              styles.centerCircle,
              {
                width: chartSize * 0.6,
                height: chartSize * 0.6,
                borderRadius: chartSize * 0.3,
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              }
            ]}>
              <ThemedText style={styles.centerText}>
                {totalValue}
              </ThemedText>
              <ThemedText style={styles.centerSubtext}>
                Total
              </ThemedText>
            </View>
          </View>
        </View>
        
        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            {dataWithPercentages.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <View style={styles.legendTextContainer}>
                  <ThemedText 
                    style={[
                      styles.legendLabel,
                      { fontSize: textSizes.legend }
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  <View style={styles.legendValues}>
                    {showValues && (
                      <ThemedText 
                        style={[
                          styles.legendValue,
                          { fontSize: textSizes.value }
                        ]}
                      >
                        {item.value}
                      </ThemedText>
                    )}
                    {showPercentages && (
                      <ThemedText 
                        style={[
                          styles.legendPercentage,
                          { fontSize: textSizes.value }
                        ]}
                      >
                        ({item.percentage.toFixed(1)}%)
                      </ThemedText>
                    )}
                  </View>
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
    alignItems: 'center',
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
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pieChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pieSlice: {
    margin: 1,
  },
  centerCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  centerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    minWidth: 120,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontWeight: '500',
    marginBottom: 2,
  },
  legendValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendValue: {
    fontWeight: '600',
    marginRight: 4,
  },
  legendPercentage: {
    opacity: 0.7,
  },
});
