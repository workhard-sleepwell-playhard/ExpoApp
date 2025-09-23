import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  disabled?: boolean;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  position = 'bottom-right',
  disabled = false,
  style,
}) => {
  const colorScheme = useColorScheme();

  const getButtonStyles = () => {
    const baseStyles = [
      styles.fab,
      styles[size],
      styles[position],
    ];
    
    if (disabled) baseStyles.push(styles.disabled);
    
    return baseStyles;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'medium': return 24;
      case 'large': return 28;
      default: return 24;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <IconSymbol 
        name={icon as any} 
        size={getIconSize()} 
        color="white" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Sizes
  small: {
    width: 48,
    height: 48,
  },
  medium: {
    width: 56,
    height: 56,
  },
  large: {
    width: 64,
    height: 64,
  },
  // Positions
  'bottom-right': {
    bottom: 20,
    right: 20,
  },
  'bottom-left': {
    bottom: 20,
    left: 20,
  },
  'bottom-center': {
    bottom: 20,
    alignSelf: 'center',
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});
