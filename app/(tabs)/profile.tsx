import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Switch, Animated, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { height: screenHeight } = Dimensions.get('window');

// Dummy user data
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  joinDate: 'January 2023',
  avatar: '😊',
  stats: {
    totalTasks: 156,
    completedTasks: 142,
    currentStreak: 15,
    totalPoints: 8750,
  }
};

const profileOptions = [
  { id: 1, title: 'Edit Profile', icon: 'person.circle.fill', action: 'navigate' },
  { id: 2, title: 'Notifications', icon: 'bell.fill', action: 'toggle', enabled: true },
  { id: 3, title: 'Privacy Settings', icon: 'lock.fill', action: 'navigate' },
  { id: 4, title: 'Help & Support', icon: 'questionmark.circle.fill', action: 'navigate' },
  { id: 5, title: 'About', icon: 'info.circle.fill', action: 'navigate' },
  { id: 6, title: 'Logout', icon: 'power', action: 'logout', destructive: true },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  
  // Animation values
  const slideAnimation = React.useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const openSettings = () => {
    setShowSettings(true);
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

  const closeSettings = () => {
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
      setShowSettings(false);
    });
  };

  const handleOptionPress = (option: typeof profileOptions[0]) => {
    if (option.action === 'toggle') {
      setNotificationsEnabled(!notificationsEnabled);
    } else if (option.title === 'Edit Profile') {
      setShowEditProfile(true);
    } else {
      console.log(`${option.title} pressed`);
    }
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
  };

  return (
    <ScrollView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
            <TouchableOpacity style={styles.editProfileHeaderButton}>
              <ThemedText style={styles.editProfileHeaderText}>Edit Profile</ThemedText>
            </TouchableOpacity>
          </ThemedView>

      <ThemedView style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{userData.avatar}</ThemedText>
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <IconSymbol name="camera.fill" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <ThemedText type="subtitle" style={styles.userName}>{userData.name}</ThemedText>
        
        <TouchableOpacity style={styles.collectionButton}>
          <IconSymbol name="folder.fill" size={16} color="white" />
          <ThemedText style={styles.collectionButtonText}>Collection</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.statsCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Your Stats</ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {userData.stats.totalTasks}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Tasks</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {userData.stats.completedTasks}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Completed</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {userData.stats.currentStreak}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {userData.stats.totalPoints.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Points</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.achievementsCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Recent Achievements</ThemedText>
        <View style={styles.achievementsList}>
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: '#FFD700' }]}>
              <IconSymbol name="trophy.fill" size={20} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <ThemedText style={styles.achievementTitle}>Streak Master</ThemedText>
              <ThemedText style={styles.achievementDescription}>
                15-day streak achieved!
              </ThemedText>
            </View>
            <ThemedText style={styles.achievementDate}>2 days ago</ThemedText>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: '#34C759' }]}>
              <IconSymbol name="checkmark.seal.fill" size={20} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <ThemedText style={styles.achievementTitle}>Task Master</ThemedText>
              <ThemedText style={styles.achievementDescription}>
                100 tasks completed!
              </ThemedText>
            </View>
            <ThemedText style={styles.achievementDate}>1 week ago</ThemedText>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: '#007AFF' }]}>
              <IconSymbol name="sunrise.fill" size={20} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <ThemedText style={styles.achievementTitle}>Early Bird</ThemedText>
              <ThemedText style={styles.achievementDescription}>
                5 tasks before 9 AM
              </ThemedText>
            </View>
            <ThemedText style={styles.achievementDate}>2 weeks ago</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Settings Gear Button */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={openSettings}
        >
          <ThemedText style={styles.settingsGear}>⚙️</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Animated Settings Modal */}
      {showSettings && (
        <Animated.View style={[styles.settingsOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            onPress={closeSettings}
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
                <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </View>


              <ScrollView style={styles.settingsContent}>
                {profileOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.id} 
                    style={styles.optionItem}
                    onPress={() => handleOptionPress(option)}
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
                        onValueChange={() => handleOptionPress(option)}
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
            onPress={closeEditProfile}
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
                <TouchableOpacity onPress={closeEditProfile} style={styles.closeButton}>
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              {/* User Info Section */}
              <View style={styles.userInfoSection}>
                <View style={styles.userInfoItem}>
                  <IconSymbol name="envelope.fill" size={20} color="#007AFF" />
                  <View style={styles.userInfoText}>
                    <ThemedText style={styles.userInfoLabel}>Email</ThemedText>
                    <ThemedText style={styles.userInfoValue}>{userData.email}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.userInfoItem}>
                  <IconSymbol name="clock.fill" size={20} color="#007AFF" />
                  <View style={styles.userInfoText}>
                    <ThemedText style={styles.userInfoLabel}>Member Since</ThemedText>
                    <ThemedText style={styles.userInfoValue}>{userData.joinDate}</ThemedText>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.settingsContent}>
                <View style={styles.editProfileSection}>
                  <ThemedText style={styles.editProfileTitle}>Profile Information</ThemedText>
                  
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Display Name</ThemedText>
                    <View style={styles.inputField}>
                      <ThemedText style={styles.inputText}>{userData.name}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Avatar</ThemedText>
                    <View style={styles.avatarEditContainer}>
                      <View style={styles.avatarEdit}>
                        <ThemedText style={styles.avatarEditText}>{userData.avatar}</ThemedText>
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
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
      },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
      userName: {
        marginBottom: 16,
      },
      collectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 8,
      },
      collectionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
      },
      // Header edit profile button styles
      editProfileHeaderButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
      },
      editProfileHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
      },
  statsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  achievementsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
