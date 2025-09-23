import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ChecklistItem {
  id: string | number;
  text: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: (checked: boolean) => void;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  title?: string;
  subtitle?: string;
  onItemToggle?: (item: ChecklistItem, index: number) => void;
  variant?: 'default' | 'card' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  completedIcon?: string;
  uncheckedIcon?: string;
  style?: ViewStyle;
}

export const Checklist: React.FC<ChecklistProps> = ({
  items,
  title,
  subtitle,
  onItemToggle,
  variant = 'default',
  size = 'medium',
  showProgress = true,
  completedIcon = 'checkmark.circle.fill',
  uncheckedIcon = 'circle',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const completedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getContainerStyles = () => {
    const baseStyles = [styles.container];
    
    switch (variant) {
      case 'card':
        baseStyles.push([
          styles.card,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]);
        break;
      case 'outlined':
        baseStyles.push([
          styles.outlined,
          {
            borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF'
          }
        ]);
        break;
      default:
        baseStyles.push(styles.default);
        break;
    }
    
    return baseStyles;
  };

  const getTextSizes = () => {
    switch (size) {
      case 'small':
        return {
          title: 14,
          subtitle: 12,
          item: 12,
        };
      case 'medium':
        return {
          title: 16,
          subtitle: 14,
          item: 14,
        };
      case 'large':
        return {
          title: 18,
          subtitle: 16,
          item: 16,
        };
      default:
        return {
          title: 16,
          subtitle: 14,
          item: 14,
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

  const handleItemToggle = (item: ChecklistItem, index: number) => {
    if (item.disabled) return;
    
    const newChecked = !item.checked;
    
    if (item.onToggle) {
      item.onToggle(newChecked);
    }
    
    if (onItemToggle) {
      onItemToggle({ ...item, checked: newChecked }, index);
    }
  };

  const renderProgressBar = () => {
    if (!showProgress) return null;
    
    return (
      <View style={styles.progressContainer}>
        <View style={[
          styles.progressBar,
          { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }
        ]}>
          <View 
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          {completedCount}/{totalCount} completed ({progressPercentage.toFixed(0)}%)
        </ThemedText>
      </View>
    );
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;
    
    return (
      <View style={styles.header}>
        {title && (
          <ThemedText style={[
            styles.title,
            { fontSize: textSizes.title }
          ]}>
            {title}
          </ThemedText>
        )}
        {subtitle && (
          <ThemedText style={[
            styles.subtitle,
            { fontSize: textSizes.subtitle },
            { color: isDark ? '#8E8E93' : '#8E8E93' }
          ]}>
            {subtitle}
          </ThemedText>
        )}
        {renderProgressBar()}
      </View>
    );
  };

  const renderItem = (item: ChecklistItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.item,
        item.disabled && styles.itemDisabled,
      ]}
      onPress={() => handleItemToggle(item, index)}
      disabled={item.disabled}
      activeOpacity={0.7}
    >
      <IconSymbol
        name={(item.checked ? completedIcon : uncheckedIcon) as any}
        size={getIconSize()}
        color={
          item.disabled 
            ? (isDark ? '#8E8E93' : '#8E8E93')
            : item.checked 
              ? '#34C759' 
              : Colors[colorScheme ?? 'light'].text
        }
      />
      
      <ThemedText style={[
        styles.itemText,
        { fontSize: textSizes.item },
        item.checked && styles.itemTextCompleted,
        item.disabled && styles.itemTextDisabled,
      ]}>
        {item.text}
      </ThemedText>
      
      {item.checked && (
        <View style={[
          styles.completedIndicator,
          { backgroundColor: '#34C759' }
        ]} />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyIcon}>📝</ThemedText>
      <ThemedText style={[
        styles.emptyText,
        { color: isDark ? '#8E8E93' : '#8E8E93' }
      ]}>
        No items in checklist
      </ThemedText>
    </View>
  );

  return (
    <View style={[getContainerStyles(), style]}>
      {renderHeader()}
      
      <View style={styles.itemsContainer}>
        {items.length === 0 ? (
          renderEmptyState()
        ) : (
          items.map((item, index) => renderItem(item, index))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Variants
  default: {
    // No additional styling
  },
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  outlined: {
    borderRadius: 8,
    borderWidth: 1,
  },
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
  // Progress styles
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
  },
  // Items container
  itemsContainer: {
    flex: 1,
  },
  // Item styles
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemTextDisabled: {
    opacity: 0.5,
  },
  completedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
