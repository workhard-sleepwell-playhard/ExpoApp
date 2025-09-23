import React from 'react';
import { View, StyleSheet, ViewStyle, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface DataListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: string;
  value?: string | number;
  badge?: string | number;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export interface DataListProps {
  data: DataListItem[];
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'card' | 'outlined' | 'divided';
  itemVariant?: 'default' | 'compact' | 'detailed';
  size?: 'small' | 'medium' | 'large';
  showDividers?: boolean;
  emptyText?: string;
  emptyIcon?: string;
  onItemPress?: (item: DataListItem, index: number) => void;
  style?: ViewStyle;
}

export const DataList: React.FC<DataListProps> = ({
  data,
  title,
  subtitle,
  variant = 'default',
  itemVariant = 'default',
  size = 'medium',
  showDividers = true,
  emptyText = 'No items found',
  emptyIcon = '📝',
  onItemPress,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      case 'divided':
        baseStyles.push(styles.divided);
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
          title: 12,
          subtitle: 10,
          description: 9,
          value: 12,
        };
      case 'medium':
        return {
          title: 14,
          subtitle: 12,
          description: 11,
          value: 14,
        };
      case 'large':
        return {
          title: 16,
          subtitle: 14,
          description: 12,
          value: 16,
        };
      default:
        return {
          title: 14,
          subtitle: 12,
          description: 11,
          value: 14,
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

  const renderItem = ({ item, index }: { item: DataListItem; index: number }) => {
    const handlePress = () => {
      if (item.onPress) {
        item.onPress();
      } else if (onItemPress) {
        onItemPress(item, index);
      }
    };

    return (
      <View key={item.id}>
        <View style={[
          styles.item,
          itemVariant === 'compact' && styles.itemCompact,
          itemVariant === 'detailed' && styles.itemDetailed,
          item.disabled && styles.itemDisabled,
          item.selected && styles.itemSelected,
        ]}>
          {/* Left content */}
          <View style={styles.leftContent}>
            {item.image && (
              <View style={styles.imageContainer}>
                <ThemedText style={styles.image}>{item.image}</ThemedText>
              </View>
            )}
            
            {item.icon && (
              <View style={[
                styles.iconContainer,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}>
                <IconSymbol 
                  name={item.icon as any} 
                  size={getIconSize()} 
                  color={Colors[colorScheme ?? 'light'].tint} 
                />
              </View>
            )}
            
            <View style={styles.textContent}>
              <ThemedText 
                style={[
                  styles.itemTitle,
                  { fontSize: textSizes.title },
                  item.disabled && styles.disabledText
                ]}
                numberOfLines={itemVariant === 'compact' ? 1 : 2}
              >
                {item.title}
              </ThemedText>
              
              {item.subtitle && (
                <ThemedText 
                  style={[
                    styles.itemSubtitle,
                    { fontSize: textSizes.subtitle },
                    item.disabled && styles.disabledText
                  ]}
                  numberOfLines={itemVariant === 'compact' ? 1 : 2}
                >
                  {item.subtitle}
                </ThemedText>
              )}
              
              {item.description && itemVariant === 'detailed' && (
                <ThemedText 
                  style={[
                    styles.itemDescription,
                    { fontSize: textSizes.description },
                    item.disabled && styles.disabledText
                  ]}
                  numberOfLines={3}
                >
                  {item.description}
                </ThemedText>
              )}
            </View>
          </View>
          
          {/* Right content */}
          <View style={styles.rightContent}>
            {item.badge && (
              <View style={[
                styles.badge,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
              ]}>
                <ThemedText style={styles.badgeText}>
                  {item.badge}
                </ThemedText>
              </View>
            )}
            
            {item.value && (
              <ThemedText 
                style={[
                  styles.itemValue,
                  { fontSize: textSizes.value },
                  item.disabled && styles.disabledText
                ]}
              >
                {item.value}
              </ThemedText>
            )}
            
            {item.rightElement}
            
            {(item.onPress || onItemPress) && (
              <IconSymbol 
                name="chevron.right" 
                size={16} 
                color={isDark ? '#8E8E93' : '#8E8E93'} 
              />
            )}
          </View>
        </View>
        
        {showDividers && index < data.length - 1 && (
          <View style={[
            styles.divider,
            { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }
          ]} />
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyIcon}>
        {emptyIcon}
      </ThemedText>
      <ThemedText style={[
        styles.emptyText,
        { color: isDark ? '#8E8E93' : '#8E8E93' }
      ]}>
        {emptyText}
      </ThemedText>
    </View>
  );

  const renderHeader = () => {
    if (!title && !subtitle) return null;
    
    return (
      <View style={styles.header}>
        {title && (
          <ThemedText style={styles.title}>
            {title}
          </ThemedText>
        )}
        {subtitle && (
          <ThemedText style={[
            styles.subtitle,
            { color: isDark ? '#8E8E93' : '#8E8E93' }
          ]}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <View style={[getContainerStyles(), style]}>
      {renderHeader()}
      
      {data.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.listContainer}>
          {data.map((item, index) => renderItem({ item, index }))}
        </View>
      )}
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
  divided: {
    // No additional styling
  },
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  // List container
  listContainer: {
    flex: 1,
  },
  // Item styles
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemCompact: {
    paddingVertical: 8,
  },
  itemDetailed: {
    paddingVertical: 16,
    alignItems: 'flex-start',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  // Content layout
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  // Left content styles
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  image: {
    fontSize: 20,
  },
  textContent: {
    flex: 1,
  },
  // Text styles
  itemTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    opacity: 0.7,
    marginBottom: 4,
  },
  itemDescription: {
    opacity: 0.6,
    lineHeight: 18,
  },
  itemValue: {
    fontWeight: '600',
    marginRight: 8,
  },
  // Badge styles
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  // Divider styles
  divider: {
    height: 1,
    marginLeft: 16,
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
  // States
  disabledText: {
    opacity: 0.5,
  },
});
