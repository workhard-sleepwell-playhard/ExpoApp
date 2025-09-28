import { createSelector } from 'reselect'

const selectLeaderboardsReducer = state => state.leaderboards
const selectProfileReducer = state => state.profile

// Consolidated selector for leaderboards state
export const selectLeaderboardsState = createSelector(
  [selectLeaderboardsReducer, selectProfileReducer],
  (leaderboards, profile) => ({
    rankings: leaderboards.rankings,
    selectedTab: leaderboards.selectedTab,
    isLoading: leaderboards.isLoading,
    error: leaderboards.error,
    userGlobalRank: profile.userData.globalRank || 0,
    userTotalPoints: profile.userData.totalPoints || 0,
    userTimeRemaining: profile.userData.timeRemainingToClimb || 0
  })
)

export const selectUserStats = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.userStats
)

export const selectRankings = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.rankings
)

export const selectSelectedTab = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.selectedTab
)

export const selectOverallRankings = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.rankings.overall
)

export const selectWeeklyRankings = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.rankings.weekly
)

export const selectStreaksRankings = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.rankings.streaks
)

export const selectIsLoading = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.isLoading
)

export const selectError = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.error
)

export const selectLastUpdated = createSelector(
  [selectLeaderboardsReducer],
  (leaderboards) => leaderboards.lastUpdated
)

// Individual selectors removed - use selectLeaderboardsState for better performance

export const selectTabOptions = createSelector(
  [],
  () => [
    { id: 'overall', label: 'Overall', icon: '🏆' },
    { id: 'weekly', label: 'Weekly', icon: '📅' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' }
  ]
)

export const selectCurrentTabOption = createSelector(
  [selectSelectedTab, selectTabOptions],
  (selectedTab, options) => options.find(option => option.id === selectedTab) || options[0]
)

// Complex selectors removed - calculate in components using selectLeaderboardsState
