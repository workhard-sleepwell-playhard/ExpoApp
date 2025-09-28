import { LEADERBOARDS_ACTION_TYPES } from './leaderboards.types.js'
import { SimpleRealtimeService } from '../../src/services/simple-realtime'

export const setUserStats = (stats) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_USER_STATS,
  payload: stats
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

export const setRankings = (rankings) => ({
  type: LEADERBOARDS_ACTION_TYPES.SET_RANKINGS,
  payload: rankings
})

// Simple action creators
export const handleTabChange = (tab) => setSelectedTab(tab)

// Firebase Integration Actions
export const fetchLeaderboardData = (currentUserId, limit = 50) => {
  return async (dispatch) => {
    try {
      dispatch({ type: LEADERBOARDS_ACTION_TYPES.SET_IS_LOADING, payload: true });
      
      console.log('Fetching leaderboard data for user:', currentUserId);
      
      // Get all users from Realtime Database
      const allUsers = await SimpleRealtimeService.getAllUsersForLeaderboards(limit);
      
      console.log('Realtime Database data received:', {
        totalUsers: allUsers.length,
        currentUserId
      });
      
      // Transform user data into leaderboard format
      const transformedData = transformUsersToLeaderboard(allUsers, currentUserId);
      
      console.log('Transformed data:', {
        overall: transformedData.overall.length,
        weekly: transformedData.weekly.length,
        streaks: transformedData.streaks.length
      });
      
      // No fallback needed - real-time data will populate when users exist
      
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_OVERALL_RANKINGS,
        payload: transformedData.overall
      });
      
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_WEEKLY_RANKINGS,
        payload: transformedData.weekly
      });
      
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_STREAKS_RANKINGS,
        payload: transformedData.streaks
      });
      
      // Calculate and set user stats
      const userStats = calculateUserStats(transformedData, currentUserId);
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_USER_STATS, 
        payload: userStats 
      });
      
      dispatch({ type: LEADERBOARDS_ACTION_TYPES.SET_IS_LOADING, payload: false });
      
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
    }
  };
};

export const calculateUserStatsFromLeaderboard = (rankings, userId) => {
  return (dispatch) => {
    try {
      if (rankings && userId) {
        const userStats = calculateUserStats(rankings, userId);
        
        dispatch({ 
          type: LEADERBOARDS_ACTION_TYPES.SET_USER_STATS,
          payload: userStats
        });
      } else {
        console.warn('Missing required data for user stats calculation:', {
          rankings: !!rankings,
          userId: !!userId
        });
      }
    } catch (error) {
      console.error('Error calculating user stats:', error);
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
    }
  };
};

// Transform user data to leaderboard format
const transformUsersToLeaderboard = (allUsers, currentUserId) => {
  // Sort users by different criteria for different leaderboards
  const overall = [...allUsers]
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .map((user, index) => transformUserToRanking(user, index + 1, currentUserId));
  
  const weekly = [...allUsers]
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .map((user, index) => transformUserToRanking(user, index + 1, currentUserId, 'weekly'));
  
  const streaks = [...allUsers]
    .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
    .map((user, index) => transformUserToRanking(user, index + 1, currentUserId, 'streak'));
  
  return { overall, weekly, streaks };
};

const transformUserToRanking = (user, rank, currentUserId, type = 'overall') => {
  const isCurrentUser = user.userId === currentUserId;
  const displayName = user.displayName || 'Anonymous User';
  const initials = getInitials(displayName);
  
  // Calculate weekly points from analytics
  const weeklyPoints = calculateWeeklyPoints(user);
  
  return {
    id: user.userId,
    name: displayName,
    initials,
    avatar: user.avatar || initials,
    totalPoints: user.totalPoints || 0,
    weeklyPoints,
    currentStreak: user.currentStreak || 0,
    bestStreak: user.currentStreak || 0, // Use currentStreak as bestStreak for now
    rank,
    isCurrentUser,
    // Add type-specific data for efficient filtering
    _type: type
  };
};

const calculateWeeklyPoints = (user) => {
  // Calculate weekly points from task completion
  const tasksCompleted = user.completedTasks || 0;
  const basePoints = tasksCompleted * 10; // 10 points per task
  const streakBonus = (user.currentStreak || 0) * 2; // 2 bonus points per streak day
  return basePoints + streakBonus;
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const calculateUserStats = (rankings, userId) => {
  // Find current user in rankings to get their stats
  const currentUser = rankings?.overall?.find(user => user.id === userId) || {};
  const totalPoints = currentUser.totalPoints || 0;
  const currentStreak = currentUser.currentStreak || 0;
  const bestStreak = currentUser.bestStreak || 0;
  const weeklyPoints = currentUser.weeklyPoints || 0;
  
  // Find user's rank in each category efficiently with null checks
  const overallRank = rankings?.overall ? findUserRank(rankings.overall, userId) : 1;
  const weeklyRank = rankings?.weekly ? findUserRank(rankings.weekly, userId) : 1;
  const streakRank = rankings?.streaks ? findUserRank(rankings.streaks, userId) : 1;
  
  // Calculate time remaining to climb (mock calculation for now)
  const timeRemainingToClimb = calculateTimeToNextRank(overallRank, totalPoints);
  
  return {
    globalRank: overallRank,
    totalPoints,
    timeRemainingToClimb,
    weeklyRank,
    streakRank,
    currentStreak,
    bestStreak,
    weeklyPoints
  };
};

const findUserRank = (rankings, userId) => {
  if (!rankings || !Array.isArray(rankings)) {
    return 1; // Default rank if rankings is not available
  }
  const userIndex = rankings.findIndex(user => user.id === userId);
  return userIndex >= 0 ? userIndex + 1 : rankings.length + 1;
};

const calculateTimeToNextRank = (currentRank, currentPoints) => {
  // Mock calculation - in real app, this would calculate based on points needed
  const pointsToNextRank = (currentRank - 1) * 50;
  const hoursNeeded = Math.ceil(pointsToNextRank / 10); // Assume 10 points per hour
  const days = Math.floor(hoursNeeded / 8); // 8 hours per day
  const hours = hoursNeeded % 8;
  
  return `${days}d ${hours}h`;
};

// createFallbackLeaderboardData removed - using real-time data

// Optimized refresh action
export const refreshLeaderboardData = (currentUserId) => {
  return async (dispatch) => {
    dispatch({ type: LEADERBOARDS_ACTION_TYPES.REFRESH_RANKINGS });
    await dispatch(fetchLeaderboardData(currentUserId));
  };
};

// Real-time leaderboard listener
export const listenToLeaderboards = (currentUserId) => {
  return (dispatch) => {
    const unsubscribe = SimpleRealtimeService.listenToLeaderboards((users) => {
      
      // Transform user data into leaderboard format
      const transformedData = transformUsersToLeaderboard(users, currentUserId);
      
      // Update Redux state with transformed data
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_OVERALL_RANKINGS,
        payload: transformedData.overall
      });
      
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_WEEKLY_RANKINGS,
        payload: transformedData.weekly
      });
      
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_STREAKS_RANKINGS,
        payload: transformedData.streaks
      });
      
      // Calculate and set user stats
      const userStats = calculateUserStats(transformedData, currentUserId);
      dispatch({ 
        type: LEADERBOARDS_ACTION_TYPES.SET_USER_STATS, 
        payload: userStats 
      });
    });
    
    return unsubscribe;
  };
};
