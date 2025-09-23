import { createSelector } from 'reselect'

const selectLeaderboardsReducer = state => state.leaderboards

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

// Derived selectors
export const selectCurrentRankings = createSelector(
  [selectRankings, selectSelectedTab],
  (rankings, selectedTab) => rankings[selectedTab] || []
)

export const selectUserGlobalRank = createSelector(
  [selectUserStats],
  (userStats) => userStats.globalRank
)

export const selectUserTotalPoints = createSelector(
  [selectUserStats],
  (userStats) => userStats.totalPoints
)

export const selectUserTimeRemaining = createSelector(
  [selectUserStats],
  (userStats) => userStats.timeRemainingToClimb
)

export const selectUserWeeklyRank = createSelector(
  [selectUserStats],
  (userStats) => userStats.weeklyRank
)

export const selectUserStreakRank = createSelector(
  [selectUserStats],
  (userStats) => userStats.streakRank
)

export const selectUserCurrentStreak = createSelector(
  [selectUserStats],
  (userStats) => userStats.currentStreak
)

export const selectUserBestStreak = createSelector(
  [selectUserStats],
  (userStats) => userStats.bestStreak
)

export const selectUserWeeklyPoints = createSelector(
  [selectUserStats],
  (userStats) => userStats.weeklyPoints
)

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

export const selectLeaderboardStats = createSelector(
  [selectUserStats, selectCurrentRankings],
  (userStats, currentRankings) => ({
    userRank: userStats.globalRank,
    totalPoints: userStats.totalPoints,
    timeToClimb: userStats.timeRemainingToClimb,
    totalUsers: currentRankings.length,
    topUser: currentRankings[0] || null,
    userPosition: currentRankings.findIndex(user => user.isCurrentUser) + 1
  })
)

export const selectRankingSummary = createSelector(
  [selectCurrentRankings, selectUserStats, selectSelectedTab],
  (rankings, userStats, selectedTab) => {
    const totalUsers = rankings.length
    const userRank = userStats[`${selectedTab}Rank`] || userStats.globalRank
    
    return {
      totalUsers,
      userRank,
      rankPercentage: totalUsers > 0 ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100) : 0,
      usersAbove: userRank - 1,
      usersBelow: totalUsers - userRank
    }
  }
)
