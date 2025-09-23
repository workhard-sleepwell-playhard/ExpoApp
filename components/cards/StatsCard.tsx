import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'stable';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconColor,
  trend,
  size = 'medium',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return '#34C759';
      case 'negative':
        return '#FF3B30';
      default:
        return Colors[colorScheme ?? 'light'].text;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'arrow.up.right';
      case 'down':
        return 'arrow.down.right';
      default:
        return 'minus';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#34C759';
      case 'down':
        return '#FF3B30';
      default:
        return Colors[colorScheme ?? 'light'].text;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getTextSizes = () => {
    switch (size) {
      case 'small':
        return {
          title: 12,
          value: 18,
          change: 10,
        };
      case 'medium':
        return {
          title: 14,
          value: 24,
          change: 12,
        };
      case 'large':
        return {
          title: 16,
          value: 32,
          change: 14,
        };
      default:
        return {
          title: 14,
          value: 24,
          change: 12,
        };
    }
  };

  const textSizes = getTextSizes();

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
      styles[size],
      style
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText 
            style={[
              styles.title,
              { fontSize: textSizes.title }
            ]}
          >
            {title}
          </ThemedText>
          <ThemedText 
            style={[
              styles.value,
              { fontSize: textSizes.value }
            ]}
          >
            {value}
          </ThemedText>
        </View>
        {icon && (
          <View style={[
            styles.iconContainer,
            { backgroundColor: (iconColor || Colors[colorScheme ?? 'light'].tint) + '20' }
          ]}>
            <IconSymbol 
              name={icon as any} 
              size={getIconSize()} 
              color={iconColor || Colors[colorScheme ?? 'light'].tint} 
            />
          </View>
        )}
      </View>
      
      {change && (
        <View style={styles.changeContainer}>
          <View style={styles.changeRow}>
            {trend && (
              <IconSymbol 
                name={getTrendIcon() as any} 
                size={12} 
                color={getTrendColor()} 
              />
            )}
            <ThemedText 
              style={[
                styles.change,
                { 
                  fontSize: textSizes.change,
                  color: getChangeColor()
                }
              ]}
            >
              {change}
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Sizes
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontWeight: '600',
    marginLeft: 4,
  },
});
