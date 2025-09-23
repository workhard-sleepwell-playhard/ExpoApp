import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface MoreItem {
  id: number;
  title: string;
  icon: string;
  action: string;
  url?: string;
  destructive?: boolean;
}

interface MoreSectionProps {
  title: string;
  items: MoreItem[];
  onItemPress: (item: MoreItem) => void;
}

export function MoreSection({ title, items, onItemPress }: MoreSectionProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              index === items.length - 1 && styles.lastItem
            ]}
            onPress={() => onItemPress(item)}
          >
            <View style={styles.itemLeft}>
              <IconSymbol 
                name={item.icon as any} 
                size={20} 
                color={item.destructive ? '#FF3B30' : Colors[colorScheme ?? 'light'].tint} 
              />
              <ThemedText style={[
                styles.itemTitle,
                item.destructive && styles.destructiveText
              ]}>
                {item.title}
              </ThemedText>
            </View>
            <IconSymbol 
              name="chevron.right" 
              size={16} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  destructiveText: {
    color: '#FF3B30',
  },
});
