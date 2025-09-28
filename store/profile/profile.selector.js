import { createSelector } from 'reselect'

const selectProfileReducer = state => state.profile

export const selectUserData = createSelector(
  [selectProfileReducer],
  (profile) => profile.userData
)

// Essential selectors only - individual selectors removed for performance
export const selectAchievements = createSelector(
  [selectProfileReducer],
  (profile) => profile.achievements
)

export const selectShowSettings = createSelector(
  [selectProfileReducer],
  (profile) => profile.showSettings
)

export const selectShowEditProfile = createSelector(
  [selectProfileReducer],
  (profile) => profile.showEditProfile
)

export const selectIsLoading = createSelector(
  [selectProfileReducer],
  (profile) => profile.isLoading
)

export const selectError = createSelector(
  [selectProfileReducer],
  (profile) => profile.error
)

export const selectProfileOptions = createSelector(
  [],
  () => [
    { id: 1, title: 'Edit Profile', icon: 'person.circle.fill', action: 'navigate' },
    { id: 2, title: 'Notifications', icon: 'bell.fill', action: 'toggle', enabled: true },
    { id: 3, title: 'Privacy Settings', icon: 'lock.fill', action: 'navigate' },
    { id: 4, title: 'Help & Support', icon: 'questionmark.circle.fill', action: 'navigate' },
    { id: 5, title: 'About', icon: 'info.circle.fill', action: 'navigate' },
    { id: 6, title: 'Logout', icon: 'power', action: 'logout', destructive: true },
  ]
)

export const selectProfileStats = createSelector(
  [selectUserData],
  (userData) => ({
    totalTasks: userData.totalTasks || 0,
    completedTasks: userData.completedTasks || 0,
    currentStreak: userData.currentStreak || 0,
    totalPoints: userData.totalPoints || 0,
    completionRate: (userData.totalTasks || 0) > 0 ? Math.round(((userData.completedTasks || 0) / (userData.totalTasks || 0)) * 100) : 0
  })
)

export const selectRecentAchievements = createSelector(
  [selectAchievements],
  (achievements) => achievements.slice(0, 3) // Show only recent 3 achievements
)

// User Settings Selectors
export const selectUserTheme = createSelector(
  [selectUserData],
  (userData) => userData.theme
)

export const selectUserPrivacy = createSelector(
  [selectUserData],
  (userData) => userData.privacy
)

export const selectUserLanguage = createSelector(
  [selectUserData],
  (userData) => userData.language
)

export const selectUserTimezone = createSelector(
  [selectUserData],
  (userData) => userData.timezone
)
