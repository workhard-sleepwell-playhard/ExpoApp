import { PROFILE_ACTION_TYPES } from './profile.types.js'

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