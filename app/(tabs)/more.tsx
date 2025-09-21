import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Dummy data for more options
const moreSections = [
  {
    title: 'Productivity',
    items: [
      { id: 1, title: 'Pomodoro Timer', icon: 'timer', action: 'navigate' },
      { id: 2, title: 'Focus Mode', icon: 'eye.fill', action: 'navigate' },
      { id: 3, title: 'Habit Tracker', icon: 'calendar', action: 'navigate' },
      { id: 4, title: 'Goal Setting', icon: 'target', action: 'navigate' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 5, title: 'Notes & Journal', icon: 'note.text', action: 'navigate' },
      { id: 6, title: 'Calendar Integration', icon: 'calendar.badge.plus', action: 'navigate' },
      { id: 7, title: 'File Manager', icon: 'folder.fill', action: 'navigate' },
      { id: 8, title: 'Backup & Sync', icon: 'icloud.fill', action: 'navigate' },
    ]
  },
  {
    title: 'Community',
    items: [
      { id: 9, title: 'Team Chat', icon: 'message.fill', action: 'navigate' },
      { id: 10, title: 'Share Progress', icon: 'square.and.arrow.up', action: 'navigate' },
      { id: 11, title: 'Feedback', icon: 'star.fill', action: 'navigate' },
      { id: 12, title: 'Report Bug', icon: 'ant.fill', action: 'navigate' },
    ]
  },
  {
    title: 'App Info',
    items: [
      { id: 13, title: 'Version 1.0.0', icon: 'info.circle.fill', action: 'info' },
      { id: 14, title: 'Privacy Policy', icon: 'hand.raised.fill', action: 'web', url: 'https://example.com/privacy' },
      { id: 15, title: 'Terms of Service', icon: 'doc.text.fill', action: 'web', url: 'https://example.com/terms' },
      { id: 16, title: 'Contact Support', icon: 'envelope.fill', action: 'email' },
    ]
  }
];

const quickActions = [
  { id: 1, title: 'Quick Add Task', icon: 'plus.circle.fill', color: '#34C759' },
  { id: 2, title: 'Start Timer', icon: 'play.circle.fill', color: '#007AFF' },
  { id: 3, title: 'View Stats', icon: 'chart.bar.fill', color: '#FF9500' },
  { id: 4, title: 'Export Data', icon: 'square.and.arrow.up.fill', color: '#5856D6' },
];

export default function MoreScreen() {
  const colorScheme = useColorScheme();

  const handleItemPress = (item: any) => {
    switch (item.action) {
      case 'navigate':
        Alert.alert('Navigation', `Navigate to ${item.title}`);
        break;
      case 'info':
        Alert.alert('App Info', 'FinishIt v1.0.0\nBuilt with React Native & Expo');
        break;
      case 'web':
        if (item.url) {
          Linking.openURL(item.url);
        }
        break;
      case 'email':
        Linking.openURL('mailto:support@finishit.app?subject=Support Request');
        break;
      default:
        Alert.alert('Action', `${item.title} pressed`);
    }
  };

  const handleQuickAction = (action: any) => {
    Alert.alert('Quick Action', `${action.title} activated!`);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">More</ThemedText>
        <ThemedText style={styles.subtitle}>Explore additional features</ThemedText>
      </ThemedView>

      <ThemedView style={styles.quickActionsCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Quick Actions</ThemedText>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.quickActionItem}
              onPress={() => handleQuickAction(action)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <IconSymbol name={action.icon as any} size={24} color="white" />
              </View>
              <ThemedText style={styles.quickActionTitle}>{action.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      {moreSections.map((section, sectionIndex) => (
        <ThemedView key={sectionIndex} style={styles.sectionCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{section.title}</ThemedText>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.optionItem,
                itemIndex === section.items.length - 1 && styles.lastOptionItem
              ]}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIconContainer}>
                  <IconSymbol 
                    name={item.icon as any} 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].tint} 
                  />
                </View>
                <ThemedText style={styles.optionTitle}>{item.title}</ThemedText>
              </View>
              
              <IconSymbol 
                name="chevron.right" 
                size={16} 
                color={Colors[colorScheme ?? 'light'].text} 
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}

      <ThemedView style={styles.footerCard}>
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <ThemedText style={styles.appIconText}>🎯</ThemedText>
          </View>
          <View style={styles.appDetails}>
            <ThemedText style={styles.appName}>FinishIt</ThemedText>
            <ThemedText style={styles.appDescription}>
              Your personal productivity companion
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.socialLinks}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://twitter.com/finishit')}
          >
            <IconSymbol name="bird.fill" size={20} color="#1DA1F2" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://instagram.com/finishit')}
          >
            <IconSymbol name="camera.fill" size={20} color="#E4405F" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://github.com/finishit')}
          >
            <IconSymbol name="hammer.fill" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  quickActionsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    opacity: 0.5,
  },
  footerCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appIconText: {
    fontSize: 28,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
