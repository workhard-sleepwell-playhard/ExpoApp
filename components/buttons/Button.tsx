import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyles = () => {
    const baseStyles = [styles.button, styles[size]];
    
    if (fullWidth) baseStyles.push(styles.fullWidth);
    if (disabled) baseStyles.push(styles.disabled);
    
    switch (variant) {
      case 'primary':
        baseStyles.push([
          styles.primary,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]);
        break;
      case 'secondary':
        baseStyles.push([
          styles.secondary,
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
        baseStyles.push([
          styles.ghost,
          { backgroundColor: 'transparent' }
        ]);
        break;
      case 'destructive':
        baseStyles.push([
          styles.destructive,
          { backgroundColor: '#FF3B30' }
        ]);
        break;
    }
    
    return baseStyles;
  };

  const getTextStyles = () => {
    const baseStyles = [styles.text, styles[`${size}Text`]];
    
    if (disabled) baseStyles.push(styles.disabledText);
    
    switch (variant) {
      case 'primary':
        baseStyles.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyles.push({ color: Colors[colorScheme ?? 'light'].text });
        break;
      case 'outline':
        baseStyles.push({ color: Colors[colorScheme ?? 'light'].tint });
        break;
      case 'ghost':
        baseStyles.push({ color: Colors[colorScheme ?? 'light'].tint });
        break;
      case 'destructive':
        baseStyles.push(styles.destructiveText);
        break;
    }
    
    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'destructive' ? 'white' : Colors[colorScheme ?? 'light'].tint} 
        />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>
          {icon && `${icon} `}
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 52,
  },
  // Variants
  primary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
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
    // No additional styles needed
  },
  destructive: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: 'white',
  },
  destructiveText: {
    color: 'white',
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
});
