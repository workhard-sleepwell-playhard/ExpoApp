import React from 'react';
import { View, StyleSheet, ViewStyle, FlatList, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'card' | 'outlined' | 'divided';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  emptyText?: string;
  emptyIcon?: string;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const List = <T,>({
  data,
  renderItem,
  keyExtractor,
  title,
  subtitle,
  variant = 'default',
  spacing = 'medium',
  emptyText = 'No items found',
  emptyIcon,
  loading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  style,
  contentContainerStyle,
}: ListProps<T>) => {
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

  const getItemSeparator = () => {
    if (variant === 'divided') {
      return (
        <View style={[
          styles.separator,
          { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }
        ]} />
      );
    }
    return null;
  };

  const getSpacingStyles = () => {
    switch (spacing) {
      case 'none':
        return { paddingVertical: 0 };
      case 'small':
        return { paddingVertical: 4 };
      case 'medium':
        return { paddingVertical: 8 };
      case 'large':
        return { paddingVertical: 12 };
      default:
        return { paddingVertical: 8 };
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {emptyIcon && (
        <ThemedText style={styles.emptyIcon}>
          {emptyIcon}
        </ThemedText>
      )}
      <ThemedText style={[
        styles.emptyText,
        { color: isDark ? '#8E8E93' : '#8E8E93' }
      ]}>
        {emptyText}
      </ThemedText>
    </View>
  );

  const renderListHeader = () => {
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

  const renderListFooter = () => {
    if (loading && data.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <ThemedText style={[
            styles.loadingText,
            { color: isDark ? '#8E8E93' : '#8E8E93' }
          ]}>
            Loading more...
          </ThemedText>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[getContainerStyles(), style]}>
      {renderListHeader()}
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={getItemSeparator}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderListFooter}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme ?? 'light'].tint}
            />
          ) : undefined
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          getSpacingStyles(),
          contentContainerStyle
        ]}
      />
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
  // Separator styles
  separator: {
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
  // Loading styles
  loadingFooter: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});

