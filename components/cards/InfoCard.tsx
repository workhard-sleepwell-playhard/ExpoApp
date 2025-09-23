import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface InfoCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  iconColor?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  variant = 'default',
  size = 'medium',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: isDark ? '#1A3A2E' : '#F0F9F4',
          iconColor: iconColor || '#34C759',
          valueColor: '#34C759',
        };
      case 'warning':
        return {
          backgroundColor: isDark ? '#3A2F1A' : '#FFF8F0',
          iconColor: iconColor || '#FF9500',
          valueColor: '#FF9500',
        };
      case 'error':
        return {
          backgroundColor: isDark ? '#3A1A1A' : '#FFF0F0',
          iconColor: iconColor || '#FF3B30',
          valueColor: '#FF3B30',
        };
      case 'info':
        return {
          backgroundColor: isDark ? '#1A2A3A' : '#F0F4FF',
          iconColor: iconColor || '#007AFF',
          valueColor: '#007AFF',
        };
      default:
        return {
          backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
          iconColor: iconColor || Colors[colorScheme ?? 'light'].tint,
          valueColor: Colors[colorScheme ?? 'light'].text,
        };
    }
  };

  const variantStyles = getVariantStyles();

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
          title: 14,
          subtitle: 12,
          value: 16,
        };
      case 'medium':
        return {
          title: 16,
          subtitle: 14,
          value: 20,
        };
      case 'large':
        return {
          title: 18,
          subtitle: 16,
          value: 24,
        };
      default:
        return {
          title: 16,
          subtitle: 14,
          value: 20,
        };
    }
  };

  const textSizes = getTextSizes();

  return (
    <View style={[
      styles.container,
      { backgroundColor: variantStyles.backgroundColor },
      styles[size],
      style
    ]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: variantStyles.iconColor + '20' }]}>
            <IconSymbol 
              name={icon as any} 
              size={getIconSize()} 
              color={variantStyles.iconColor} 
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText 
            style={[
              styles.title,
              { fontSize: textSizes.title }
            ]}
          >
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText 
              style={[
                styles.subtitle,
                { fontSize: textSizes.subtitle }
              ]}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {value && (
        <View style={styles.valueContainer}>
          <ThemedText 
            style={[
              styles.value,
              { 
                fontSize: textSizes.value,
                color: variantStyles.valueColor
              }
            ]}
          >
            {value}
          </ThemedText>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontWeight: 'bold',
  },
});
