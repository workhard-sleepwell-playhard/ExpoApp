import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: string;
  rightIcon?: string;
  leftImage?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  selected?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  leftImage,
  rightElement,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  selected = false,
  showChevron = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getContainerStyles = () => {
    const baseStyles = [styles.container];
    
    switch (variant) {
      case 'compact':
        baseStyles.push(styles.compact);
        break;
      case 'detailed':
        baseStyles.push(styles.detailed);
        break;
      default:
        baseStyles.push(styles.default);
        break;
    }
    
    if (disabled) baseStyles.push(styles.disabled);
    if (selected) baseStyles.push(styles.selected);
    
    return baseStyles;
  };

  const getTextSizes = () => {
    switch (size) {
      case 'small':
        return {
          title: 14,
          subtitle: 12,
          description: 11,
        };
      case 'medium':
        return {
          title: 16,
          subtitle: 14,
          description: 12,
        };
      case 'large':
        return {
          title: 18,
          subtitle: 16,
          description: 14,
        };
      default:
        return {
          title: 16,
          subtitle: 14,
          description: 12,
        };
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

  const textSizes = getTextSizes();

  const renderLeftContent = () => {
    if (leftImage) {
      return (
        <View style={styles.leftImageContainer}>
          <ThemedText style={styles.leftImage}>{leftImage}</ThemedText>
        </View>
      );
    }
    
    if (leftIcon) {
      return (
        <View style={[
          styles.leftIconContainer,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]}>
          <IconSymbol 
            name={leftIcon as any} 
            size={getIconSize()} 
            color={Colors[colorScheme ?? 'light'].tint} 
          />
        </View>
      );
    }
    
    return null;
  };

  const renderRightContent = () => {
    if (rightElement) {
      return rightElement;
    }
    
    if (rightIcon) {
      return (
        <IconSymbol 
          name={rightIcon as any} 
          size={getIconSize()} 
          color={isDark ? '#8E8E93' : '#8E8E93'} 
        />
      );
    }
    
    if (showChevron && onPress) {
      return (
        <IconSymbol 
          name="chevron.right" 
          size={16} 
          color={isDark ? '#8E8E93' : '#8E8E93'} 
        />
      );
    }
    
    return null;
  };

  const ListContent = () => (
    <View style={getContainerStyles()}>
      {renderLeftContent()}
      
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText 
            style={[
              styles.title,
              { fontSize: textSizes.title },
              disabled && styles.disabledText
            ]}
            numberOfLines={variant === 'compact' ? 1 : 2}
          >
            {title}
          </ThemedText>
          
          {subtitle && (
            <ThemedText 
              style={[
                styles.subtitle,
                { fontSize: textSizes.subtitle },
                disabled && styles.disabledText
              ]}
              numberOfLines={variant === 'compact' ? 1 : 2}
            >
              {subtitle}
            </ThemedText>
          )}
          
          {description && variant === 'detailed' && (
            <ThemedText 
              style={[
                styles.description,
                { fontSize: textSizes.description },
                disabled && styles.disabledText
              ]}
              numberOfLines={3}
            >
              {description}
            </ThemedText>
          )}
        </View>
        
        {renderRightContent() && (
          <View style={styles.rightContainer}>
            {renderRightContent()}
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
        style={style}
      >
        <ListContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={style}>
      <ListContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  // Variants
  default: {
    // Already included in container
  },
  compact: {
    paddingVertical: 8,
  },
  detailed: {
    paddingVertical: 16,
    alignItems: 'flex-start',
  },
  // Content layout
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  rightContainer: {
    marginLeft: 12,
  },
  // Left content
  leftIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leftImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftImage: {
    fontSize: 20,
  },
  // Text styles
  title: {
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 4,
  },
  description: {
    opacity: 0.6,
    lineHeight: 18,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  selected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
});
