import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'ghost';
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  color,
  disabled = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyles = () => {
    const baseStyles = [styles.button, styles[size]];
    
    if (disabled) baseStyles.push(styles.disabled);
    
    switch (variant) {
      case 'default':
        baseStyles.push([
          styles.default,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]);
        break;
      case 'outline':
        baseStyles.push([
          styles.outline,
          { 
            borderColor: Colors[colorScheme ?? 'light'].tint,
            backgroundColor: 'transparent'
          }
        ]);
        break;
      case 'ghost':
        baseStyles.push(styles.ghost);
        break;
    }
    
    return baseStyles;
  };

  const getIconColor = () => {
    if (color) return color;
    if (disabled) return Colors[colorScheme ?? 'light'].text + '50';
    if (variant === 'outline') return Colors[colorScheme ?? 'light'].tint;
    return Colors[colorScheme ?? 'light'].text;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <IconSymbol 
        name={icon as any} 
        size={getIconSize()} 
        color={getIconColor()} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sizes
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 44,
    height: 44,
  },
  large: {
    width: 56,
    height: 56,
  },
  // Variants
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  outline: {
    borderWidth: 1.5,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});
