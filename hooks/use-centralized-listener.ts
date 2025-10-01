/**
 * Centralized Listener Hook
 * Provides a single hook for all Firebase listeners
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { centralizedListener } from '../src/services/centralized-listener';
import { useAuth } from '../components/auth/AuthProvider';
import { setPosts } from '../store/home/home.action';
import { setUserData } from '../store/profile/profile.action';
import { setTasks } from '../store/task/task.action';
import { setRankings } from '../store/leaderboards/leaderboards.action';
import { loadTrackingData, setWeeklyProgressData, setTaskCompletionData, setDailyPointsData, setCategoriesData, loadCustomDateRangeTaskSnapshotData } from '../store/tracking/tracking.action';
import { SimpleRealtimeService } from '../src/services/simple-realtime';

/**
 * Generate tracking data from user data changes (updates Redux tracking state)
 * This follows the single source of truth principle
 * Only shows data that actually exists, no fake data generation
 */
function generateTrackingDataFromUserData(userData: any, dispatch: any) {
  try {
    // Only generate tracking data if we have actual task data
    const hasTaskData = (userData.completedTasks || 0) > 0 || (userData.pendingTasks || 0) > 0 || (userData.overdueTasks || 0) > 0;
    
    if (!hasTaskData) {
      // No task data, show empty state
      const trackingData = {
        sessions: [],
        weeklyProgress: [],
        taskCompletionData: [],
        dailyPointsData: [],
        categories: []
      };
      dispatch(loadTrackingData(trackingData));
      return;
    }

    // Generate chart data from actual user data only
    const trackingData = {
      sessions: [], // Empty - only from time tracking
      weeklyProgress: generateWeeklyProgressFromUserData(userData),
      taskCompletionData: generateTaskCompletionFromUserData(userData),
      dailyPointsData: generateDailyPointsFromUserData(userData),
      categories: generateCategoriesFromUserData(userData)
    };

    // Dispatch the generated tracking data
    dispatch(loadTrackingData(trackingData));
    
    console.log('📊 Generated tracking data from actual user data changes');
  } catch (error) {
    console.error('Error generating tracking data from user data:', error);
  }
}

/**
 * Generate weekly progress data from user data
 * Only shows actual data, no fake hours generation
 */
function generateWeeklyProgressFromUserData(userData: any) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Only show data if we have actual completed tasks
  const completedTasks = userData.completedTasks || 0;
  
  if (completedTasks === 0) {
    // No completed tasks, return empty data
    return days.map(day => ({
      day,
      hours: 0,
      sessions: 0
    }));
  }
  
  // Show completed tasks count for today only (no fake hours)
  const today = new Date().getDay();
  const startOfWeek = today === 0 ? 6 : today - 1; // Monday = 0
  
  return days.map((day, index) => {
    const isToday = index === startOfWeek;
    
    return {
      day,
      hours: isToday ? completedTasks : 0, // Only show actual task count for today
      sessions: isToday ? completedTasks : 0 // Only show actual task count for today
    };
  });
}

/**
 * Generate task completion data from user data
 */
function generateTaskCompletionFromUserData(userData: any) {
  const completed = userData.completedTasks || 0;
  const pending = userData.pendingTasks || 0;
  const overdue = userData.overdueTasks || 0;
  const total = completed + pending + overdue;
  
  if (total === 0) return [];
  
  return [
    { label: 'Completed', value: completed, color: '#4CAF50' },
    { label: 'Pending', value: pending, color: '#FF9800' },
    { label: 'Overdue', value: overdue, color: '#F44336' }
  ];
}

/**
 * Generate daily points data from user data
 * Only shows actual points for today, no fake distribution
 */
function generateDailyPointsFromUserData(userData: any) {
  const today = new Date();
  const points = userData.totalPoints || 0;
  
  // Only show points for today if we have actual points
  if (points === 0) {
    return [];
  }
  
  // Show actual total points for today only
  const todayStr = today.toISOString().split('T')[0];
  
  return [{
    date: todayStr,
    points: points, // Show actual total points
    label: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }];
}

/**
 * Generate categories data from user data
 * Only shows actual data, no fake hours distribution
 */
function generateCategoriesFromUserData(userData: any) {
  const completedTasks = userData.completedTasks || 0;
  
  // Only show categories if we have actual completed tasks
  if (completedTasks === 0) {
    return [];
  }
  
  // Show only one category with actual task count (no fake hours)
  // Since we don't have category breakdown from user data, show a general "Tasks" category
  return [{
    id: 'tasks',
    category: 'Tasks',
    hours: completedTasks, // Show actual task count, not fake hours
    color: '#2196F3',
    icon: 'checkmark.circle'
  }];
}

export function useCentralizedListener(options?: {
  enablePosts?: boolean;
  enableUserData?: boolean;
  enableTasks?: boolean;
  enableLeaderboards?: boolean;
  enableTrackingData?: boolean;
  enableSnapshots?: boolean;
  enableTaskSnapshots?: boolean;
}) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const isInitialized = useRef(false);
  
  // Get current time period for snapshot processing
  const currentTimePeriod = useSelector((state: any) => state.tracking?.timePeriod || 'week');

  // Default to all listeners if no options provided (backward compatibility)
  const {
    enablePosts = true,
    enableUserData = true,
    enableTasks = true,
    enableLeaderboards = true,
    enableTrackingData = false,
    enableSnapshots = false,
    enableTaskSnapshots = false
  } = options || {};

  useEffect(() => {
    if (!currentUser?.uid || isInitialized.current) return;

    // Initialize only requested listeners
    centralizedListener.initializeListeners(currentUser.uid, {
      onPostsUpdate: enablePosts ? async (posts) => {
        // Transform posts to match our UI format and check user interactions
        const transformedPosts = await Promise.all(posts.map(async (post) => {
          let isLiked = false;
          let isDisliked = false;
          
          // Check user's interaction with this post
          if (currentUser?.uid) {
            try {
              const interaction = await SimpleRealtimeService.getUserPostInteraction(post.id, currentUser.uid);
              isLiked = interaction === 'like';
              isDisliked = interaction === 'dislike';
            } catch (error) {
              console.error('Error checking user post interaction:', error);
            }
          }
          
          return {
            id: post.id,
            postId: post.id,
            userId: post.userId,
            user: {
              name: post.userDisplayName || 'User',
              avatar: post.userAvatar || '👤',
              username: post.userUsername || '@user'
            },
            content: post.content,
            media: post.media || undefined,
            type: post.type || 'general',
            isPublic: post.isPublic !== false,
            timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'now',
            likes: post.likes || 0,
            dislikes: post.dislikes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            isLiked,
            isDisliked,
          };
        }));
        
        dispatch(setPosts(transformedPosts));
      } : undefined,

      onUserProfileUpdate: enableUserData ? (userData) => {
        if (userData) {
          // Single user data object with all profile and points data
          const completeUserData = {
            // Profile data
            userId: currentUser.uid, // Always use the auth UID for consistency
            name: userData.displayName || '',
            email: userData.email || '',
            displayName: userData.displayName || '',
            username: userData.username || '',
            avatar: userData.avatar || '👤',
            bio: userData.bio || '',
            joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown',
            
            // Settings
            notificationsEnabled: userData.notificationsEnabled ?? true,
            theme: userData.theme ?? 'auto',
            privacy: userData.privacy ?? 'public',
            language: userData.language ?? 'en',
            timezone: userData.timezone ?? 'UTC',
            
            // Points & stats
            totalPoints: userData.totalPoints || 0,
            level: userData.level || 1,
            experience: userData.experience || 0,
            experienceToNextLevel: userData.experienceToNextLevel || 100,
            
            // Task stats
            totalTasks: userData.totalTasks || 0,
            completedTasks: userData.completedTasks || 0,
            pendingTasks: userData.pendingTasks || 0,
            overdueTasks: userData.overdueTasks || 0,
            currentStreak: userData.currentStreak || 0,
            
            // Social stats
            postsCreated: userData.postsCreated || 0,
            postsLiked: userData.postsLiked || 0,
            postsShared: userData.postsShared || 0,
            commentsMade: userData.commentsMade || 0,
            socialEngagement: userData.socialEngagement || 0,
            
            // Goals
            dailyTaskGoal: userData.dailyTaskGoal || 5,
            dailyTimeGoal: userData.dailyTimeGoal || 480,
            
            // Timestamps
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLoginAt: userData.lastLoginAt,
            lastActivityAt: userData.lastActivityAt
          };
          
          dispatch(setUserData(completeUserData));
          
          // Note: We don't generate tracking data from user data anymore
          // Tracking tab uses snapshot data, other tabs don't need tracking state
        }
      } : undefined,

      onUserTasksUpdate: enableTasks ? (tasks) => {
        dispatch(setTasks(tasks));
      } : undefined,

      onLeaderboardsUpdate: enableLeaderboards ? (users) => {
        // Transform users data to rankings format with proper defaults
        if (users && Array.isArray(users)) {
          // Ensure all users have required properties with defaults
          const normalizedUsers = users.map(user => ({
            userId: user.userId || user.id || '',
            name: user.displayName || user.name || 'User',
            email: user.email || '',
            avatar: user.avatar || '👤',
            totalPoints: user.totalPoints || 0,
            weeklyPoints: user.weeklyPoints || 0,
            currentStreak: user.currentStreak || 0,
            bestStreak: user.bestStreak || 0,
            isCurrentUser: false, // Will be set by component logic
            ...user // Keep any other properties
          }));

          const rankings = {
            overall: normalizedUsers.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).map((user, index) => ({ ...user, rank: index + 1 })),
            weekly: normalizedUsers.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0)).map((user, index) => ({ ...user, rank: index + 1 })),
            streaks: normalizedUsers.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0)).map((user, index) => ({ ...user, rank: index + 1 }))
          };
          dispatch(setRankings(rankings));
        }
      } : undefined,

      onTrackingDataUpdate: enableTrackingData ? (trackingData) => {
        // Transform tracking data to match our UI format
        if (trackingData) {
          dispatch(loadTrackingData(trackingData));
        }
      } : undefined,

      onUserSnapshotsUpdate: enableSnapshots ? (snapshots) => {
        // Process snapshots for charts and update Redux state
        if (snapshots && snapshots.length > 0) {
          // Process snapshots for the current time period
          const processedData = SimpleRealtimeService.processSnapshotsForCharts(snapshots, currentTimePeriod);
          
          // Update Redux state with processed data (categories handled by task snapshots)
          dispatch(setWeeklyProgressData(processedData.weeklyProgress || []));
          dispatch(setTaskCompletionData(processedData.taskCompletionData || []));
          dispatch(setDailyPointsData(processedData.dailyPointsData || []));
        }
      } : undefined,

      onTaskSnapshotsUpdate: enableTaskSnapshots ? (taskSnapshots) => {
        // Process task snapshots for all chart data
        console.log('📊 Task snapshots callback triggered:', taskSnapshots?.length || 0, 'snapshots');
        if (taskSnapshots && taskSnapshots.length > 0) {
          console.log('📊 Task snapshots received:', taskSnapshots.length);
          console.log('📊 Current time period:', currentTimePeriod);
          console.log('📊 Sample task snapshot:', taskSnapshots[0]);
          
          // Generate all chart data from task snapshots
          const categoriesData = SimpleRealtimeService.generateCategoriesFromTaskSnapshots(taskSnapshots);
          const weeklyProgressData = SimpleRealtimeService.generateWeeklyProgressFromTaskSnapshots(taskSnapshots, currentTimePeriod);
          const taskCompletionData = SimpleRealtimeService.generateTaskCompletionFromTaskSnapshots(taskSnapshots);
          const dailyPointsData = SimpleRealtimeService.generateDailyPointsFromTaskSnapshots(taskSnapshots);
          
          console.log('📊 Generated data:', {
            categories: categoriesData?.length || 0,
            weeklyProgress: weeklyProgressData?.length || 0,
            taskCompletion: taskCompletionData?.length || 0,
            dailyPoints: dailyPointsData?.length || 0
          });
          
          // Update all Redux state
          dispatch(setCategoriesData(categoriesData || []));
          dispatch(setWeeklyProgressData(weeklyProgressData || []));
          dispatch(setTaskCompletionData(taskCompletionData || []));
          dispatch(setDailyPointsData(dailyPointsData || []));
        } else {
          console.log('📊 No task snapshots data received');
        }
      } : undefined
    });

    isInitialized.current = true;

    // Cleanup on unmount
    return () => {
      centralizedListener.cleanup();
      isInitialized.current = false;
    };
  }, [currentUser?.uid, dispatch, currentTimePeriod]);

  return {
    isReady: centralizedListener.isReady,
    activeListenerCount: centralizedListener.activeListenerCount
  };
}
