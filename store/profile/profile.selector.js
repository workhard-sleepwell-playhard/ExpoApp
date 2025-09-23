import { createSelector } from 'reselect'

const selectProfileReducer = state => state.profile

export const selectUserData = createSelector(
  [selectProfileReducer],
  (profile) => profile.userData
)

export const selectUserStats = createSelector(
  [selectProfileReducer],
  (profile) => profile.userData.stats
)

export const selectAchievements = createSelector(
  [selectProfileReducer],
  (profile) => profile.achievements
)

export const selectNotificationsEnabled = createSelector(
  [selectProfileReducer],
  (profile) => profile.notificationsEnabled
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

// Derived selectors
export const selectUserName = createSelector(
  [selectUserData],
  (userData) => userData.name
)

export const selectUserEmail = createSelector(
  [selectUserData],
  (userData) => userData.email
)

export const selectUserAvatar = createSelector(
  [selectUserData],
  (userData) => userData.avatar
)

export const selectUserJoinDate = createSelector(
  [selectUserData],
  (userData) => userData.joinDate
)

export const selectTotalTasks = createSelector(
  [selectUserStats],
  (stats) => stats.totalTasks
)

export const selectCompletedTasks = createSelector(
  [selectUserStats],
  (stats) => stats.completedTasks
)

export const selectCurrentStreak = createSelector(
  [selectUserStats],
  (stats) => stats.currentStreak
)

export const selectTotalPoints = createSelector(
  [selectUserStats],
  (stats) => stats.totalPoints
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
  [selectUserStats],
  (stats) => ({
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks,
    currentStreak: stats.currentStreak,
    totalPoints: stats.totalPoints,
    completionRate: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
  })
)

export const selectRecentAchievements = createSelector(
  [selectAchievements],
  (achievements) => achievements.slice(0, 3) // Show only recent 3 achievements
)
