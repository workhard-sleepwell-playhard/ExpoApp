import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
  onPress,
  style,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCardStyles = () => {
    const baseStyles = [styles.card];
    
    // Variant styles
    switch (variant) {
      case 'default':
        baseStyles.push([
          styles.default,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]);
        break;
      case 'elevated':
        baseStyles.push([
          styles.elevated,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]);
        break;
      case 'outlined':
        baseStyles.push([
          styles.outlined,
          { 
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderColor: isDark ? '#3A3A3C' : '#E5E5EA'
          }
        ]);
        break;
      case 'flat':
        baseStyles.push([
          styles.flat,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]);
        break;
    }
    
    // Padding styles
    baseStyles.push(styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`]);
    
    // Margin styles
    if (margin !== 'none') {
      baseStyles.push(styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}`]);
    }
    
    // Border radius styles
    if (borderRadius !== 'none') {
      baseStyles.push(styles[`radius${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)}`]);
    }
    
    // Disabled state
    if (disabled) {
      baseStyles.push(styles.disabled);
    }
    
    return baseStyles;
  };

  const CardContent = () => (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={style}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  // Variants
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
  },
  flat: {
    // No shadow or border
  },
  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 12,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
  // Margin
  marginSmall: {
    margin: 8,
  },
  marginMedium: {
    margin: 16,
  },
  marginLarge: {
    margin: 24,
  },
  // Border radius
  radiusNone: {
    borderRadius: 0,
  },
  radiusSmall: {
    borderRadius: 8,
  },
  radiusMedium: {
    borderRadius: 12,
  },
  radiusLarge: {
    borderRadius: 16,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});
