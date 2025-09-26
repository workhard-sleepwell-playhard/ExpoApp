import { LEADERBOARDS_ACTION_TYPES } from './leaderboards.types.js'

export const LEADERBOARDS_INITIAL_STATE = {
  userStats: {
    globalRank: 0,
    totalPoints: 0,
    timeRemainingToClimb: '0d 0h',
    weeklyRank: 0,
    streakRank: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyPoints: 0
  },
  rankings: {
    overall: [],
    weekly: [],
    streaks: []
  },
  selectedTab: 'overall',
  isLoading: false,
  error: null,
  lastUpdated: null
}

export const leaderboardsReducer = (state = LEADERBOARDS_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case LEADERBOARDS_ACTION_TYPES.SET_USER_STATS:
      return {
        ...state,
        userStats: { ...state.userStats, ...payload },
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_RANKINGS:
      return {
        ...state,
        rankings: { ...state.rankings, ...payload },
        lastUpdated: new Date().toISOString(),
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_SELECTED_TAB:
      return {
        ...state,
        selectedTab: payload,
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_OVERALL_RANKINGS:
      return {
        ...state,
        rankings: {
          ...state.rankings,
          overall: payload,
        },
        lastUpdated: new Date().toISOString(),
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_WEEKLY_RANKINGS:
      return {
        ...state,
        rankings: {
          ...state.rankings,
          weekly: payload,
        },
        lastUpdated: new Date().toISOString(),
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_STREAKS_RANKINGS:
      return {
        ...state,
        rankings: {
          ...state.rankings,
          streaks: payload,
        },
        lastUpdated: new Date().toISOString(),
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_IS_LOADING:
      return {
        ...state,
        isLoading: payload,
      }
    
    case LEADERBOARDS_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: payload,
        isLoading: false,
      }
    
    case LEADERBOARDS_ACTION_TYPES.UPDATE_USER_RANK:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          [payload.rankType]: payload.newRank,
        },
      }
    
    case LEADERBOARDS_ACTION_TYPES.UPDATE_USER_POINTS:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          [payload.pointType]: payload.newPoints,
        },
      }
    
    case LEADERBOARDS_ACTION_TYPES.REFRESH_RANKINGS:
      return {
        ...state,
        lastUpdated: new Date().toISOString(),
        isLoading: true,
        error: null,
      }
    
    default:
      return state
  }
}
