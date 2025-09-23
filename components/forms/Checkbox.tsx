import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface CheckboxProps {
  label?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  labelStyle?: any;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onToggle,
  variant = 'default',
  size = 'medium',
  color,
  disabled = false,
  required = false,
  style,
  labelStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCheckboxSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'medium': return 12;
      case 'large': return 16;
      default: return 12;
    }
  };

  const getCheckboxStyles = () => {
    const checkboxSize = getCheckboxSize();
    const baseStyles = [
      styles.checkbox,
      { width: checkboxSize, height: checkboxSize }
    ];
    
    if (disabled) baseStyles.push(styles.disabled);
    
    switch (variant) {
      case 'outlined':
        baseStyles.push([
          styles.outlined,
          {
            borderColor: checked 
              ? (color || Colors[colorScheme ?? 'light'].tint)
              : isDark ? '#3A3A3C' : '#E5E5EA',
            backgroundColor: checked 
              ? (color || Colors[colorScheme ?? 'light'].tint)
              : 'transparent',
          }
        ]);
        break;
      case 'filled':
        baseStyles.push([
          styles.filled,
          {
            backgroundColor: checked 
              ? (color || Colors[colorScheme ?? 'light'].tint)
              : isDark ? '#2C2C2E' : '#F2F2F7',
            borderColor: checked 
              ? (color || Colors[colorScheme ?? 'light'].tint)
              : 'transparent',
          }
        ]);
        break;
      default:
        baseStyles.push([
          styles.default,
          {
            backgroundColor: checked 
              ? (color || Colors[colorScheme ?? 'light'].tint)
              : isDark ? '#1C1C1E' : '#FFFFFF',
            borderColor: checked 
              ? (color || Colors[colorScheme ?? 'light'].tint)
              : isDark ? '#3A3A3C' : '#E5E5EA',
          }
        ]);
        break;
    }
    
    return baseStyles;
  };

  const getLabelStyles = () => {
    const baseStyles = [styles.label];
    
    switch (size) {
      case 'small':
        baseStyles.push(styles.labelSmall);
        break;
      case 'medium':
        baseStyles.push(styles.labelMedium);
        break;
      case 'large':
        baseStyles.push(styles.labelLarge);
        break;
    }
    
    if (disabled) baseStyles.push(styles.labelDisabled);
    
    return baseStyles;
  };

  const handlePress = () => {
    if (!disabled) {
      onToggle(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={getCheckboxStyles()}>
        {checked && (
          <IconSymbol
            name="checkmark"
            size={getIconSize()}
            color="white"
          />
        )}
      </View>
      
      {label && (
        <ThemedText style={[getLabelStyles(), labelStyle]}>
          {label}
          {required && <ThemedText style={styles.required}> *</ThemedText>}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Variants
  default: {
    // Already included in checkbox
  },
  outlined: {
    // Border and background set dynamically
  },
  filled: {
    // Border and background set dynamically
  },
  // Label styles
  label: {
    marginLeft: 8,
    flex: 1,
  },
  labelSmall: {
    fontSize: 14,
  },
  labelMedium: {
    fontSize: 16,
  },
  labelLarge: {
    fontSize: 18,
  },
  required: {
    color: '#FF3B30',
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
