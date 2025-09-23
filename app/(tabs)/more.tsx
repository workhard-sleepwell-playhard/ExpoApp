import React from 'react';
import { StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

// Import Redux selectors and actions
import { 
  selectMoreSections, 
  selectQuickActions, 
  selectSearchQuery, 
  selectFilteredSections, 
  selectShowSearch, 
  selectShowNotifications,
  selectDisplaySections,
  selectHasSearchResults,
  selectIsSearchActive,
  selectMoreStats
} from '../../store/more/more.selector';
import { 
  handleSearchPress, 
  handleNotificationPress, 
  handleQuickActionPress, 
  handleItemPress,
  handleSearchQuery,
  loadMoreData,
  clearSearch
} from '../../store/more/more.action';

// Import new components
import { MoreHeader } from '../../components/tabscomponents/more/moreHeader.component';
import { QuickActions } from '../../components/tabscomponents/more/moreQuickActions.component';
import { MoreSection } from '../../components/tabscomponents/more/moreSection.component';

export default function MoreScreen() {
  const dispatch = useDispatch();
  
  // Redux state
  const moreSections = useSelector(selectMoreSections);
  const quickActions = useSelector(selectQuickActions);
  const searchQuery = useSelector(selectSearchQuery);
  const filteredSections = useSelector(selectFilteredSections);
  const showSearch = useSelector(selectShowSearch);
  const showNotifications = useSelector(selectShowNotifications);
  const displaySections = useSelector(selectDisplaySections);
  const hasSearchResults = useSelector(selectHasSearchResults);
  const isSearchActive = useSelector(selectIsSearchActive);
  const moreStats = useSelector(selectMoreStats);
  
  // Load initial data when component mounts
  React.useEffect(() => {
    dispatch(loadMoreData() as any);
  }, [dispatch]);

  const onSearchPress = () => {
    dispatch(handleSearchPress() as any);
    Alert.alert('Search', 'Search functionality coming soon!');
  };

  const onNotificationPress = () => {
    dispatch(handleNotificationPress() as any);
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const onQuickActionPress = (action: typeof quickActions[0]) => {
    dispatch(handleQuickActionPress(action) as any);
    Alert.alert('Quick Action', `${action.title} pressed!`);
  };

  const onItemPress = async (item: typeof moreSections[0]['items'][0]) => {
    await dispatch(handleItemPress(item) as any);
  };

  return (
    <ScrollView style={styles.container}>
      <MoreHeader 
        onSearchPress={onSearchPress}
        onNotificationPress={onNotificationPress}
      />
      
      <QuickActions 
        actions={quickActions}
        onActionPress={onQuickActionPress}
      />

      {displaySections.map((section: any) => (
        <MoreSection
          key={section.title}
          title={section.title}
          items={section.items}
          onItemPress={onItemPress}
        />
      ))}

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Made with ❤️ for productivity
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
  },
});