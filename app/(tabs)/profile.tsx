import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Switch, Animated, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Import Redux selectors and actions
import { 
  selectUserData, 
  selectUserStats, 
  selectAchievements, 
  selectNotificationsEnabled, 
  selectShowSettings, 
  selectShowEditProfile,
  selectUserName,
  selectUserEmail,
  selectUserAvatar,
  selectUserJoinDate,
  selectTotalTasks,
  selectCompletedTasks,
  selectCurrentStreak,
  selectTotalPoints,
  selectProfileOptions,
  selectProfileStats,
  selectRecentAchievements
} from '../../store/profile/profile.selector';
import { 
  loadUserProfile, 
  handleOptionPress, 
  saveProfileChanges, 
  updateUserAvatar, 
  updateUserName, 
  updateUserEmail, 
  handleCollectionPress, 
  handleEditAvatar, 
  openSettings,
  closeSettings,
  openEditProfile,
  closeEditProfile,
  toggleNotifications
} from '../../store/profile/profile.action';

// Import new components
import { ProfileHeader } from '../../components/tabscomponents/profile/profileHeader.component';
import { ProfileCard } from '../../components/tabscomponents/profile/profileCard.component';
import { StatsCard } from '../../components/tabscomponents/profile/profileStatsCard.component';

const { height: screenHeight } = Dimensions.get('window');

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Redux state
  const userData = useSelector(selectUserData);
  const userStats = useSelector(selectUserStats);
  const achievements = useSelector(selectAchievements);
  const notificationsEnabled = useSelector(selectNotificationsEnabled);
  const showSettings = useSelector(selectShowSettings);
  const showEditProfile = useSelector(selectShowEditProfile);
  const userName = useSelector(selectUserName);
  const userEmail = useSelector(selectUserEmail);
  const userAvatar = useSelector(selectUserAvatar);
  const userJoinDate = useSelector(selectUserJoinDate);
  const totalTasks = useSelector(selectTotalTasks);
  const completedTasks = useSelector(selectCompletedTasks);
  const currentStreak = useSelector(selectCurrentStreak);
  const totalPoints = useSelector(selectTotalPoints);
  const profileOptions = useSelector(selectProfileOptions);
  const profileStats = useSelector(selectProfileStats);
  const recentAchievements = useSelector(selectRecentAchievements);
  
  // Load initial data when component mounts
  React.useEffect(() => {
    // Load user profile data
    dispatch(loadUserProfile({
      name: 'John Doe',
      email: 'john.doe@example.com',
      joinDate: 'January 2024',
      avatar: '👨‍💻',
      stats: {
        totalTasks: 127,
        completedTasks: 89,
        currentStreak: 12,
        totalPoints: 2847,
      }
    }) as any);
  }, [dispatch]);
  
  // Animation values
  const slideAnimation = React.useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const handleOpenSettings = () => {
    dispatch(openSettings());
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseSettings = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dispatch(closeSettings() as any);
    });
  };

  const onOptionPress = (option: typeof profileOptions[0]) => {
    dispatch(handleOptionPress(option) as any);
  };

  const onCloseEditProfile = () => {
    dispatch(closeEditProfile() as any);
  };

  const onCollectionPress = () => {
    dispatch(handleCollectionPress() as any);
  };

  const onEditAvatar = () => {
    dispatch(handleEditAvatar() as any);
  };

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader onEditProfile={() => dispatch(openEditProfile() as any)} />
      <ProfileCard 
        name={userName}
        avatar={userAvatar}
        onCollectionPress={onCollectionPress}
        onEditAvatar={onEditAvatar}
      />
      <StatsCard 
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        currentStreak={currentStreak}
        totalPoints={totalPoints}
      />

      <ThemedView style={styles.achievementsCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Recent Achievements</ThemedText>
        <View style={styles.achievementsList}>
          {recentAchievements.map((achievement: any) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                <IconSymbol name={achievement.icon as any} size={20} color="white" />
              </View>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>{achievement.title}</ThemedText>
                <ThemedText style={styles.achievementDescription}>
                  {achievement.description}
                </ThemedText>
              </View>
              <ThemedText style={styles.achievementDate}>{achievement.date}</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Settings Gear Button */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={handleOpenSettings}
        >
          <ThemedText style={styles.settingsGear}>⚙️</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Animated Settings Modal */}
      {showSettings && (
        <Animated.View style={[styles.settingsOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            onPress={handleCloseSettings}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.settingsModal,
                { transform: [{ translateY: slideAnimation }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle" style={styles.modalTitle}>Settings</ThemedText>
                <TouchableOpacity onPress={handleCloseSettings} style={styles.closeButton}>
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.settingsContent}>
                {profileOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.id} 
                    style={styles.optionItem}
                    onPress={() => onOptionPress(option)}
                  >
                    <View style={styles.optionLeft}>
                      <IconSymbol 
                        name={option.icon as any} 
                        size={24} 
                        color={option.destructive ? '#FF3B30' : Colors[colorScheme ?? 'light'].tint} 
                      />
                      <ThemedText style={[
                        styles.optionTitle,
                        option.destructive && styles.destructiveText
                      ]}>
                        {option.title}
                      </ThemedText>
                    </View>
                    
                    {option.action === 'toggle' ? (
                      <Switch
                        value={option.id === 2 ? notificationsEnabled : false}
                        onValueChange={() => dispatch(toggleNotifications() as any)}
                        trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
                        thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
                      />
                    ) : (
                      <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].text} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <Animated.View style={[styles.settingsOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            onPress={onCloseEditProfile}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.settingsModal,
                { transform: [{ translateY: slideAnimation }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle" style={styles.modalTitle}>Edit Profile</ThemedText>
                <TouchableOpacity onPress={onCloseEditProfile} style={styles.closeButton}>
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              {/* User Info Section */}
              <View style={styles.userInfoSection}>
                <View style={styles.userInfoItem}>
                  <IconSymbol name="envelope.fill" size={20} color="#007AFF" />
                  <View style={styles.userInfoText}>
                    <ThemedText style={styles.userInfoLabel}>Email</ThemedText>
                    <ThemedText style={styles.userInfoValue}>{userEmail}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.userInfoItem}>
                  <IconSymbol name="clock.fill" size={20} color="#007AFF" />
                  <View style={styles.userInfoText}>
                    <ThemedText style={styles.userInfoLabel}>Member Since</ThemedText>
                    <ThemedText style={styles.userInfoValue}>{userJoinDate}</ThemedText>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.settingsContent}>
                <View style={styles.editProfileSection}>
                  <ThemedText style={styles.editProfileTitle}>Profile Information</ThemedText>
                  
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Display Name</ThemedText>
                    <View style={styles.inputField}>
                      <ThemedText style={styles.inputText}>{userName}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Avatar</ThemedText>
                    <View style={styles.avatarEditContainer}>
                      <View style={styles.avatarEdit}>
                        <ThemedText style={styles.avatarEditText}>{userAvatar}</ThemedText>
                      </View>
                      <TouchableOpacity style={styles.changeAvatarButton}>
                        <ThemedText style={styles.changeAvatarText}>Change Avatar</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.saveButton}>
                    <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  achievementsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    marginBottom: 20,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    width: '30%',
    minHeight: 100,
    justifyContent: 'center',
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementInfo: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 9,
    opacity: 0.5,
    textAlign: 'center',
  },
  // Settings gear button styles
  settingsContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  settingsButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsGear: {
    fontSize: 24,
  },
  // Animated settings modal styles
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  // User info section styles
  userInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  // Edit profile section styles
  editProfileSection: {
    padding: 20,
  },
  editProfileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
  },
  avatarEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarEdit: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEditText: {
    fontSize: 24,
  },
  changeAvatarButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});