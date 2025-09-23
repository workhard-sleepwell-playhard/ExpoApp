import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface MoreHeaderProps {
  onSearchPress: () => void;
  onNotificationPress: () => void;
}

export function MoreHeader({ onSearchPress, onNotificationPress }: MoreHeaderProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <ThemedText type="title" style={styles.title}>More</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
            <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={onNotificationPress}>
            <IconSymbol name="bell" size={20} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
