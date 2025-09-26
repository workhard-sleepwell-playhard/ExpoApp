import { LEADERBOARDS_ACTION_TYPES } from './leaderboards.types.js'
import { UserService } from '../../src/services/firebase-service'

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

// Simple action creators
export const handleTabChange = (tab) => setSelectedTab(tab)

// Firebase Integration Actions
export const fetchLeaderboardData = (currentUserId, limit = 50) => {
  return async (dispatch) => {
    try {
      dispatch({ type: LEADERBOARDS_ACTION_TYPES.SET_IS_LOADING, payload: true });
      
      console.log('Fetching leaderboard data for user:', currentUserId);
      
      // Get all users from existing profile system (no duplication!)
      const allUsers = await UserService.getAllUsers(limit);
      
      console.log('Firebase data received:', {
        totalUsers: allUsers.length,
        currentUserId
      });
      
      // Transform existing user data into leaderboard format
      const transformedData = transformExistingUsersToLeaderboard(allUsers, currentUserId);
      
      console.log('Transformed data:', {
        overall: transformedData.overall.length,
        weekly: transformedData.weekly.length,
        streaks: transformedData.streaks.length
      });
      
      // If no data, create a fallback with current user
      if (transformedData.overall.length === 0) {
        console.log('No leaderboard data found, creating fallback with current user');
        const fallbackData = createFallbackLeaderboardData(currentUserId);
        transformedData.overall = fallbackData.overall;
        transformedData.weekly = fallbackData.weekly;
        transformedData.streaks = fallbackData.streaks;
      }
      
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

export const calculateUserStatsFromProfile = (userProfile, rankings, userId) => {
  return (dispatch) => {
    try {
      if (userProfile && rankings && userId) {
        const userStats = calculateUserStats(userProfile, rankings, userId);
        
        dispatch({ 
          type: LEADERBOARDS_ACTION_TYPES.SET_USER_STATS,
          payload: userStats
        });
      } else {
        console.warn('Missing required data for user stats calculation:', {
          userProfile: !!userProfile,
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

// Transform existing user data to leaderboard format (no duplication!)
const transformExistingUsersToLeaderboard = (allUsers, currentUserId) => {
  // Sort users by different criteria for different leaderboards
  const overall = [...allUsers]
    .sort((a, b) => (b.achievements?.totalPoints || 0) - (a.achievements?.totalPoints || 0))
    .map((user, index) => transformUserToRanking(user, index + 1, currentUserId));
  
  const weekly = [...allUsers]
    .sort((a, b) => (b.taskStats?.tasksCompletedThisWeek || 0) - (a.taskStats?.tasksCompletedThisWeek || 0))
    .map((user, index) => transformUserToRanking(user, index + 1, currentUserId, 'weekly'));
  
  const streaks = [...allUsers]
    .sort((a, b) => (b.taskStats?.currentStreak || 0) - (a.taskStats?.currentStreak || 0))
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
    totalPoints: user.achievements?.totalPoints || 0,
    weeklyPoints,
    currentStreak: user.taskStats?.currentStreak || 0,
    bestStreak: user.taskStats?.longestStreak || 0,
    rank,
    isCurrentUser,
    // Add type-specific data for efficient filtering
    _type: type
  };
};

const calculateWeeklyPoints = (user) => {
  // Calculate weekly points from task completion and analytics
  const tasksCompleted = user.taskStats?.tasksCompletedThisWeek || 0;
  const basePoints = tasksCompleted * 10; // 10 points per task
  const streakBonus = (user.taskStats?.currentStreak || 0) * 2; // 2 bonus points per streak day
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

const calculateUserStats = (userProfile, rankings, userId) => {
  const totalPoints = userProfile.achievements?.totalPoints || 0;
  const currentStreak = userProfile.taskStats?.currentStreak || 0;
  const bestStreak = userProfile.taskStats?.longestStreak || 0;
  const weeklyPoints = calculateWeeklyPoints(userProfile);
  
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

const createFallbackLeaderboardData = (currentUserId) => {
  // Create a fallback user entry for the current user
  const fallbackUser = {
    id: currentUserId,
    name: 'You',
    initials: 'YO',
    avatar: '👤',
    totalPoints: 0,
    weeklyPoints: 0,
    currentStreak: 0,
    bestStreak: 0,
    rank: 1,
    isCurrentUser: true
  };
  
  return {
    overall: [fallbackUser],
    weekly: [fallbackUser],
    streaks: [fallbackUser]
  };
};

// Optimized refresh action
export const refreshLeaderboardData = (currentUserId) => {
  return async (dispatch) => {
    dispatch({ type: LEADERBOARDS_ACTION_TYPES.REFRESH_RANKINGS });
    await dispatch(fetchLeaderboardData(currentUserId));
  };
};
