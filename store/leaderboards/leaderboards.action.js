import { LEADERBOARDS_ACTION_TYPES } from './leaderboards.types.js'

export const setUserStats = (stats) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_USER_STATS,
  payload: stats
})

export const setAllRankings = (rankings) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_RANKINGS,
  payload: rankings
})

export const setSelectedTab = (tab) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_SELECTED_TAB,
  payload: tab
})

export const setIsLoading = (loading) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_IS_LOADING,
  payload: loading
})

export const setError = (error) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_ERROR,
  payload: error
})

// Simple action creators
export const handleTabChange = (tab) => setSelectedTab(tab)

export const loadUserStats = (stats) => setUserStats(stats)

export const loadAllRankings = () => {
  // Load mock rankings data
  const mockRankings = [
    { id: 'user1', name: 'Alice', avatar: '👩‍💻', totalPoints: 2500, weeklyPoints: 300, currentStreak: 15, bestStreak: 20 },
    { id: 'user2', name: 'Bob', avatar: '👨‍💻', totalPoints: 2200, weeklyPoints: 280, currentStreak: 12, bestStreak: 15 },
    { id: 'user3', name: 'Charlie', avatar: '🧑‍💻', totalPoints: 1900, weeklyPoints: 250, currentStreak: 10, bestStreak: 12 },
    { id: 'user4', name: 'David', avatar: '🧔', totalPoints: 1800, weeklyPoints: 220, currentStreak: 8, bestStreak: 10 },
    { id: 'user5', name: 'Eve', avatar: '👩‍🦰', totalPoints: 1700, weeklyPoints: 200, currentStreak: 7, bestStreak: 9 },
    { id: 'user6', name: 'Frank', avatar: '👨‍🦱', totalPoints: 1600, weeklyPoints: 180, currentStreak: 6, bestStreak: 8 },
    { id: 'user7', name: 'Grace', avatar: '👩‍🦳', totalPoints: 1500, weeklyPoints: 160, currentStreak: 5, bestStreak: 7 },
    { id: 'user8', name: 'Heidi', avatar: '👩‍🎤', totalPoints: 1400, weeklyPoints: 140, currentStreak: 4, bestStreak: 6 },
    { id: 'user9', name: 'You', avatar: '👤', totalPoints: 1987, weeklyPoints: 298, currentStreak: 4, bestStreak: 12 },
  ];
  return setAllRankings(mockRankings);
}