import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ActionCardProps {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors[colorScheme ?? 'light'].tint,
          titleColor: 'white',
          descriptionColor: 'rgba(255, 255, 255, 0.8)',
          iconColor: 'white',
        };
      case 'secondary':
        return {
          backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
          titleColor: Colors[colorScheme ?? 'light'].text,
          descriptionColor: Colors[colorScheme ?? 'light'].text + '80',
          iconColor: Colors[colorScheme ?? 'light'].tint,
        };
      default:
        return {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          titleColor: Colors[colorScheme ?? 'light'].text,
          descriptionColor: Colors[colorScheme ?? 'light'].text + '80',
          iconColor: iconColor || Colors[colorScheme ?? 'light'].tint,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const getIconSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'medium': return 24;
      case 'large': return 28;
      default: return 24;
    }
  };

  const getTextSizes = () => {
    switch (size) {
      case 'small':
        return {
          title: 14,
          description: 12,
        };
      case 'medium':
        return {
          title: 16,
          description: 14,
        };
      case 'large':
        return {
          title: 18,
          description: 16,
        };
      default:
        return {
          title: 16,
          description: 14,
        };
    }
  };

  const textSizes = getTextSizes();

  const CardContent = () => (
    <View style={[
      styles.container,
      { backgroundColor: variantStyles.backgroundColor },
      styles[size],
      disabled && styles.disabled,
      style
    ]}>
      <View style={styles.content}>
        {icon && (
          <View style={[
            styles.iconContainer,
            variant === 'primary' && styles.primaryIconContainer
          ]}>
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
              { 
                fontSize: textSizes.title,
                color: variantStyles.titleColor
              }
            ]}
          >
            {title}
          </ThemedText>
          {description && (
            <ThemedText 
              style={[
                styles.description,
                { 
                  fontSize: textSizes.description,
                  color: variantStyles.descriptionColor
                }
              ]}
            >
              {description}
            </ThemedText>
          )}
        </View>
        {onPress && (
          <View style={styles.arrowContainer}>
            <IconSymbol 
              name="chevron.right" 
              size={16} 
              color={variantStyles.titleColor + '60'} 
            />
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  primaryIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
