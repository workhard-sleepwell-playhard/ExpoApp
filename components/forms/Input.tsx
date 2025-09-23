import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: 'default' | 'outlined' | 'filled' | 'underline';
  size?: 'small' | 'medium' | 'large';
  type?: 'text' | 'email' | 'password' | 'number' | 'phone';
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  type = 'text',
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  helperText,
  disabled = false,
  required = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  style,
  inputStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type === 'number' ? 'numeric' : 'default';
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email': return 'email-address';
      case 'number': return 'numeric';
      case 'phone': return 'phone-pad';
      default: return 'default';
    }
  };

  const getContainerStyles = () => {
    const baseStyles = [styles.container];
    
    if (disabled) baseStyles.push(styles.disabled);
    if (error) baseStyles.push(styles.error);
    if (isFocused) baseStyles.push(styles.focused);
    
    switch (variant) {
      case 'outlined':
        baseStyles.push([
          styles.outlined,
          {
            borderColor: error ? '#FF3B30' : isFocused ? Colors[colorScheme ?? 'light'].tint : isDark ? '#3A3A3C' : '#E5E5EA',
          }
        ]);
        break;
      case 'filled':
        baseStyles.push([
          styles.filled,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]);
        break;
      case 'underline':
        baseStyles.push([
          styles.underline,
          {
            borderBottomColor: error ? '#FF3B30' : isFocused ? Colors[colorScheme ?? 'light'].tint : isDark ? '#3A3A3C' : '#E5E5EA',
          }
        ]);
        break;
      default:
        baseStyles.push([
          styles.default,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]);
        break;
    }
    
    return baseStyles;
  };

  const getInputStyles = () => {
    const baseStyles = [styles.input];
    
    switch (size) {
      case 'small':
        baseStyles.push(styles.inputSmall);
        break;
      case 'medium':
        baseStyles.push(styles.inputMedium);
        break;
      case 'large':
        baseStyles.push(styles.inputLarge);
        break;
    }
    
    if (error) baseStyles.push({ color: '#FF3B30' });
    if (disabled) baseStyles.push({ color: isDark ? '#8E8E93' : '#8E8E93' });
    
    return baseStyles;
  };

  const handlePasswordToggle = () => {
    if (type === 'password') {
      setShowPassword(!showPassword);
    }
  };

  const getRightIcon = () => {
    if (type === 'password') {
      return showPassword ? 'eye.slash' : 'eye';
    }
    return rightIcon;
  };

  const handleRightIconPress = () => {
    if (type === 'password') {
      handlePasswordToggle();
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  return (
    <View style={[style]}>
      {label && (
        <ThemedText style={[
          styles.label,
          error && styles.errorLabel,
          disabled && styles.disabledLabel
        ]}>
          {label}
          {required && <ThemedText style={styles.required}> *</ThemedText>}
        </ThemedText>
      )}
      
      <View style={getContainerStyles()}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <IconSymbol 
              name={leftIcon as any} 
              size={20} 
              color={isDark ? '#8E8E93' : '#8E8E93'} 
            />
          </View>
        )}
        
        <TextInput
          style={[getInputStyles(), inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
          secureTextEntry={type === 'password' && !showPassword}
          keyboardType={getKeyboardType()}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {(getRightIcon() || type === 'password') && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={handleRightIconPress}
            disabled={!getRightIcon() && type !== 'password'}
          >
            <IconSymbol 
              name={getRightIcon() as any} 
              size={20} 
              color={isDark ? '#8E8E93' : '#8E8E93'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <ThemedText style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {error || helperText}
        </ThemedText>
      )}
      
      {maxLength && (
        <ThemedText style={styles.characterCount}>
          {value.length}/{maxLength}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Variants
  default: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  outlined: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filled: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  underline: {
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  // Input styles
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  inputSmall: {
    fontSize: 14,
  },
  inputMedium: {
    fontSize: 16,
  },
  inputLarge: {
    fontSize: 18,
  },
  // Icon containers
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  // Text styles
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.5,
    textAlign: 'right',
  },
  required: {
    color: '#FF3B30',
  },
  // States
  focused: {
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    borderColor: '#FF3B30',
  },
  errorLabel: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.5,
  },
});
