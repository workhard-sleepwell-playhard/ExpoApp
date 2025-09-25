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
        // Transform Firebase user data to match Redux profile structure
        const profileData = {
          name: userProfile.displayName || '',
          email: userProfile.email || '',
          avatar: userProfile.avatar || '👤',
          joinDate: userProfile.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '',
          stats: {
            totalTasks: userProfile.taskStats?.totalTasks || 0,
            completedTasks: userProfile.taskStats?.completedTasks || 0,
            currentStreak: userProfile.taskStats?.currentStreak || 0,
            totalPoints: userProfile.achievements?.totalPoints || 0,
          }
        };
        
        dispatch({ 
          type: PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_SUCCESS,
          payload: profileData
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
          }
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