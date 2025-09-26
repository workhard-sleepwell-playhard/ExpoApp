import { PROFILE_ACTION_TYPES } from './profile.types.js'
import { UserService } from '../../src/services/firebase-service'

export const setUserData = (data) => ({
  type: PROFILE_ACTION_TYPES.SET_USER_DATA,
  payload: data
})

export const setUserStats = (stats) => ({
  type: PROFILE_ACTION_TYPES.SET_USER_STATS,
  payload: stats
})

export const setAchievements = (achievements) => ({
  type: PROFILE_ACTION_TYPES.SET_ACHIEVEMENTS,
  payload: achievements
})

export const setNotificationsEnabled = (enabled) => ({
  type: PROFILE_ACTION_TYPES.SET_NOTIFICATIONS_ENABLED,
  payload: enabled
})

export const setShowSettings = (show) => ({
  type: PROFILE_ACTION_TYPES.SET_SHOW_SETTINGS,
  payload: show
})

export const setShowEditProfile = (show) => ({
  type: PROFILE_ACTION_TYPES.SET_SHOW_EDIT_PROFILE,
  payload: show
})

export const updateUserName = (name) => ({
  type: PROFILE_ACTION_TYPES.SET_USER_NAME,
  payload: name
})

export const updateUserEmail = (email) => ({
  type: PROFILE_ACTION_TYPES.SET_USER_EMAIL,
  payload: email
})

export const updateUserAvatar = (avatar) => ({
  type: PROFILE_ACTION_TYPES.SET_USER_AVATAR,
  payload: avatar
})

export const toggleNotifications = () => ({
  type: PROFILE_ACTION_TYPES.TOGGLE_NOTIFICATIONS
})

export const openSettings = () => ({
  type: PROFILE_ACTION_TYPES.OPEN_SETTINGS
})

export const closeSettings = () => ({
  type: PROFILE_ACTION_TYPES.CLOSE_SETTINGS
})

export const openEditProfile = () => ({
  type: PROFILE_ACTION_TYPES.OPEN_EDIT_PROFILE
})

export const closeEditProfile = () => ({
  type: PROFILE_ACTION_TYPES.CLOSE_EDIT_PROFILE
})

// Simple action creators
export const loadUserProfile = (profileData) => setUserData(profileData.userData || profileData)

export const handleOptionPress = (option) => {
  if (option.action === 'toggle') {
    return toggleNotifications()
  } else if (option.title === 'Edit Profile') {
    return openEditProfile()
  } else if (option.title === 'Logout') {
    // This will be handled by the component to dispatch auth actions
    return { type: 'LOGOUT_REQUESTED' }
  } else {
    console.log(`${option.title} pressed`)
    return { type: 'NO_OP' }
  }
}

export const saveProfileChanges = (changes) => {
  console.log('Profile changes saved:', changes)
  return closeEditProfile()
}

export const handleCollectionPress = () => {
  console.log('Collection pressed')
  return { type: 'NO_OP' }
}

export const handleEditAvatar = () => {
  console.log('Edit avatar pressed')
  return { type: 'NO_OP' }
}

// Firebase Profile Actions
export const fetchUserProfile = (uid) => {
  return async (dispatch) => {
    try {
      dispatch({ type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_START });
      
      const userProfile = await UserService.getUser(uid);
      
      if (userProfile) {
        // Validate and transform Firebase user data
        const validatedData = validateUserData(userProfile);
        
        const profileData = {
          name: validatedData.name,
          email: validatedData.email,
          avatar: validatedData.avatar,
          joinDate: validatedData.joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          stats: validatedData.stats,
          // Include validated user settings
          notificationsEnabled: validatedData.preferences.notificationsEnabled,
          theme: validatedData.preferences.theme,
          privacy: validatedData.preferences.privacy,
          language: validatedData.preferences.language,
          timezone: validatedData.preferences.timezone
        };

        // Transform Firebase achievements to match Redux structure
        const achievements = transformFirebaseAchievements(userProfile);
        
        dispatch({ 
          type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_SUCCESS,
          payload: { ...profileData, achievements }
        });
      } else {
        // Create a default profile if user document doesn't exist
        const defaultProfileData = {
          name: '',
          email: '',
          avatar: '👤',
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            currentStreak: 0,
            totalPoints: 0,
          },
          achievements: []
        };
        
        dispatch({ 
          type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_SUCCESS,
          payload: defaultProfileData
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      dispatch({ 
        type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_FAILED,
        payload: error.message
      });
    }
  };
};

// Data validation and fallback functions
const validateUserData = (userData) => {
  return {
    name: validateString(userData?.displayName, ''),
    email: validateEmail(userData?.email, ''),
    avatar: validateString(userData?.avatar, '👤'),
    joinDate: validateDate(userData?.createdAt, new Date()),
    stats: validateStats(userData?.taskStats),
    preferences: validatePreferences(userData?.preferences),
    achievements: validateAchievements(userData?.achievements)
  };
};

const validateString = (value, fallback = '') => {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const validateEmail = (email, fallback = '') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : fallback;
};

const validateDate = (date, fallback = new Date()) => {
  try {
    if (date && date.toDate) {
      return new Date(date.toDate());
    } else if (date instanceof Date) {
      return date;
    } else if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? fallback : parsedDate;
    }
    return fallback;
  } catch (error) {
    return fallback;
  }
};

const validateStats = (stats) => {
  return {
    totalTasks: validateNumber(stats?.totalTasks, 0),
    completedTasks: validateNumber(stats?.completedTasks, 0),
    currentStreak: validateNumber(stats?.currentStreak, 0),
    totalPoints: validateNumber(stats?.achievements?.totalPoints || stats?.totalPoints, 0),
    pendingTasks: validateNumber(stats?.pendingTasks, 0),
    overdueTasks: validateNumber(stats?.overdueTasks, 0),
    tasksCompletedToday: validateNumber(stats?.tasksCompletedToday, 0),
    tasksCompletedThisWeek: validateNumber(stats?.tasksCompletedThisWeek, 0),
    tasksCompletedThisMonth: validateNumber(stats?.tasksCompletedThisMonth, 0),
    averageCompletionTime: validateNumber(stats?.averageCompletionTime, 0),
    productivityScore: validateNumber(stats?.productivityScore, 0)
  };
};

const validatePreferences = (preferences) => {
  return {
    notificationsEnabled: validateBoolean(preferences?.notifications?.push, true),
    theme: validateTheme(preferences?.theme, 'auto'),
    privacy: validatePrivacy(preferences?.privacy, 'public'),
    language: validateString(preferences?.language, 'en'),
    timezone: validateString(preferences?.timezone, 'UTC')
  };
};

const validateAchievements = (achievements) => {
  return {
    totalPoints: validateNumber(achievements?.totalPoints, 0),
    level: validateNumber(achievements?.level, 1),
    experience: validateNumber(achievements?.experience, 0),
    badgesEarned: Array.isArray(achievements?.badgesEarned) ? achievements.badgesEarned : [],
    badgesProgress: achievements?.badgesProgress || {}
  };
};

const validateNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) || num < 0 ? fallback : num;
};

const validateBoolean = (value, fallback = false) => {
  return typeof value === 'boolean' ? value : fallback;
};

const validateTheme = (theme, fallback = 'auto') => {
  const validThemes = ['light', 'dark', 'auto'];
  return validThemes.includes(theme) ? theme : fallback;
};

const validatePrivacy = (privacy, fallback = 'public') => {
  const validPrivacy = ['public', 'private', 'friends-only'];
  return validPrivacy.includes(privacy) ? privacy : fallback;
};

// Helper function to transform Firebase achievements to Redux format
const transformFirebaseAchievements = (userProfile) => {
  const achievements = [];
  
  // Check if user has earned badges
  if (userProfile.achievements?.badgesEarned && userProfile.achievements.badgesEarned.length > 0) {
    userProfile.achievements.badgesEarned.forEach((badgeId, index) => {
      achievements.push({
        id: badgeId,
        title: getBadgeTitle(badgeId),
        description: getBadgeDescription(badgeId),
        icon: getBadgeIcon(badgeId),
        color: getBadgeColor(badgeId),
        date: getBadgeDate(userProfile.achievements.badgesProgress?.[badgeId]?.completedAt)
      });
    });
  }
  
  // If no achievements, return empty array
  return achievements;
};

// Helper functions for badge data (these would ideally come from a badges service)
const getBadgeTitle = (badgeId) => {
  const badgeTitles = {
    'streak-master': 'Streak Master',
    'task-master': 'Task Master',
    'early-bird': 'Early Bird',
    'social-butterfly': 'Social Butterfly',
    'productivity-guru': 'Productivity Guru'
  };
  return badgeTitles[badgeId] || 'Achievement Unlocked';
};

const getBadgeDescription = (badgeId) => {
  const badgeDescriptions = {
    'streak-master': '15-day streak achieved!',
    'task-master': '100 tasks completed!',
    'early-bird': '5 tasks before 9 AM',
    'social-butterfly': '10 posts shared!',
    'productivity-guru': 'Perfect productivity day!'
  };
  return badgeDescriptions[badgeId] || 'Great job on this achievement!';
};

const getBadgeIcon = (badgeId) => {
  const badgeIcons = {
    'streak-master': 'trophy.fill',
    'task-master': 'checkmark.seal.fill',
    'early-bird': 'sunrise.fill',
    'social-butterfly': 'heart.fill',
    'productivity-guru': 'star.fill'
  };
  return badgeIcons[badgeId] || 'star.fill';
};

const getBadgeColor = (badgeId) => {
  const badgeColors = {
    'streak-master': '#FFD700',
    'task-master': '#34C759',
    'early-bird': '#007AFF',
    'social-butterfly': '#FF69B4',
    'productivity-guru': '#FF8C00'
  };
  return badgeColors[badgeId] || '#007AFF';
};

const getBadgeDate = (completedAt) => {
  if (!completedAt) return 'Recently';
  
  try {
    const date = completedAt.toDate ? completedAt.toDate() : new Date(completedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  } catch (error) {
    return 'Recently';
  }
};

export const updateUserProfile = (uid, profileData) => {
  return async (dispatch) => {
    try {
      dispatch({ type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_START });
      
      // Update Firebase
      await UserService.updateUser(uid, {
        displayName: profileData.name,
        avatar: profileData.avatar,
        updatedAt: new Date()
      });
      
      // Update Redux
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS,
        payload: profileData
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED,
        payload: error.message
      });
    }
  };
};

// New action to update user profile with Firebase sync
export const updateProfileField = (uid, field, value) => {
  return async (dispatch) => {
    try {
      dispatch({ type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_START });
      
      // Map Redux field names to Firebase field names
      const firebaseFieldMap = {
        name: 'displayName',
        avatar: 'avatar',
        email: 'email' // Note: email updates might need special handling
      };
      
      const firebaseField = firebaseFieldMap[field] || field;
      
      // Update Firebase
      await UserService.updateUser(uid, {
        [firebaseField]: value,
        updatedAt: new Date()
      });
      
      // Update Redux
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS,
        payload: { [field]: value }
      });
    } catch (error) {
      console.error(`Error updating user ${field}:`, error);
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED,
        payload: error.message
      });
    }
  };
};

// Action to update user settings with Firebase sync
export const updateUserSettings = (uid, settings) => {
  return async (dispatch) => {
    try {
      dispatch({ type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_START });
      
      // Build Firebase update object
      const firebaseUpdates = {};
      
      if (settings.notificationsEnabled !== undefined) {
        firebaseUpdates['preferences.notifications.push'] = settings.notificationsEnabled;
      }
      if (settings.theme !== undefined) {
        firebaseUpdates['preferences.theme'] = settings.theme;
      }
      if (settings.privacy !== undefined) {
        firebaseUpdates['preferences.privacy'] = settings.privacy;
      }
      if (settings.language !== undefined) {
        firebaseUpdates['preferences.language'] = settings.language;
      }
      if (settings.timezone !== undefined) {
        firebaseUpdates['preferences.timezone'] = settings.timezone;
      }
      
      firebaseUpdates.updatedAt = new Date();
      
      // Update Firebase preferences
      await UserService.updateUser(uid, firebaseUpdates);
      
      // Update Redux
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS,
        payload: settings
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED,
        payload: error.message
      });
    }
  };
};

// Enhanced action creators that sync to Firebase
export const updateUserNameWithSync = (uid, name) => {
  return updateProfileField(uid, 'name', name);
};

export const updateUserAvatarWithSync = (uid, avatar) => {
  return updateProfileField(uid, 'avatar', avatar);
};

export const updateUserEmailWithSync = (uid, email) => {
  return updateProfileField(uid, 'email', email);
};

export const toggleNotificationsWithSync = (uid, enabled) => {
  return updateUserSettings(uid, { notificationsEnabled: enabled });
};

export const updateUserThemeWithSync = (uid, theme) => {
  return updateUserSettings(uid, { theme });
};

export const updateUserPrivacyWithSync = (uid, privacy) => {
  return updateUserSettings(uid, { privacy });
};

export const updateUserLanguageWithSync = (uid, language) => {
  return updateUserSettings(uid, { language });
};

export const updateUserTimezoneWithSync = (uid, timezone) => {
  return updateUserSettings(uid, { timezone });
};

// User Stats Update Actions
export const updateUserStats = (uid, stats) => {
  return async (dispatch) => {
    try {
      dispatch({ type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_START });
      
      // Update Firebase task stats
      await UserService.updateTaskStats(uid, stats);
      
      // Update Redux
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS,
        payload: { stats }
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      dispatch({ 
        type: PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED,
        payload: error.message
      });
    }
  };
};

// Specific stat update actions
export const incrementTaskCompleted = (uid, taskPoints = 10) => {
  return async (dispatch, getState) => {
    try {
      const currentStats = getState().profile.userData.stats;
      const newStats = {
        totalTasks: currentStats.totalTasks + 1,
        completedTasks: currentStats.completedTasks + 1,
        currentStreak: currentStats.currentStreak + 1,
        totalPoints: currentStats.totalPoints + taskPoints,
        tasksCompletedToday: (currentStats.tasksCompletedToday || 0) + 1,
        tasksCompletedThisWeek: (currentStats.tasksCompletedThisWeek || 0) + 1,
        tasksCompletedThisMonth: (currentStats.tasksCompletedThisMonth || 0) + 1,
      };
      
      await dispatch(updateUserStats(uid, newStats));
    } catch (error) {
      console.error('Error incrementing task completed:', error);
    }
  };
};

export const incrementTaskCreated = (uid) => {
  return async (dispatch, getState) => {
    try {
      const currentStats = getState().profile.userData.stats;
      const newStats = {
        totalTasks: currentStats.totalTasks + 1,
        pendingTasks: (currentStats.pendingTasks || 0) + 1,
      };
      
      await dispatch(updateUserStats(uid, newStats));
    } catch (error) {
      console.error('Error incrementing task created:', error);
    }
  };
};

export const resetStreak = (uid) => {
  return async (dispatch, getState) => {
    try {
      const currentStats = getState().profile.userData.stats;
      const newStats = {
        currentStreak: 0,
      };
      
      await dispatch(updateUserStats(uid, newStats));
    } catch (error) {
      console.error('Error resetting streak:', error);
    }
  };
};

// Real-time listener for user stats
export const listenToUserStats = (uid) => {
  return async (dispatch) => {
    try {
      const unsubscribe = await UserService.listenToUser(uid, (userData) => {
        if (userData) {
          const profileData = {
            stats: {
              totalTasks: userData.taskStats?.totalTasks || 0,
              completedTasks: userData.taskStats?.completedTasks || 0,
              currentStreak: userData.taskStats?.currentStreak || 0,
              totalPoints: userData.achievements?.totalPoints || 0,
            }
          };
          
          dispatch({ 
            type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_SUCCESS,
            payload: profileData
          });
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up user stats listener:', error);
      dispatch({ 
        type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_FAILED,
        payload: error.message
      });
    }
  };
};