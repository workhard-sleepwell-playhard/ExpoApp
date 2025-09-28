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

export function useCentralizedListener(options?: {
  enablePosts?: boolean;
  enableUserData?: boolean;
  enableTasks?: boolean;
  enableLeaderboards?: boolean;
}) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const isInitialized = useRef(false);

  // Default to all listeners if no options provided (backward compatibility)
  const {
    enablePosts = true,
    enableUserData = true,
    enableTasks = true,
    enableLeaderboards = true
  } = options || {};

  useEffect(() => {
    if (!currentUser?.uid || isInitialized.current) return;

    // Initialize only requested listeners
    centralizedListener.initializeListeners(currentUser.uid, {
      onPostsUpdate: enablePosts ? (posts) => {
        // Transform posts to match our UI format
        const transformedPosts = posts.map(post => ({
          id: post.id,
          postId: post.id,
          userId: post.userId,
          user: {
            name: post.userDisplayName || 'User',
            avatar: post.userAvatar || '👤',
            username: post.userUsername || '@user'
          },
          content: post.content,
          image: post.image || null,
          video: post.video || null,
          type: post.type || 'general',
          isPublic: post.isPublic !== false,
          timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'now',
          likes: post.likes ? Object.keys(post.likes).length : 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          isLiked: false, // We'll implement this later
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
      } : undefined
    });

    isInitialized.current = true;

    // Cleanup on unmount
    return () => {
      centralizedListener.cleanup();
      isInitialized.current = false;
    };
  }, [currentUser?.uid, dispatch]);

  return {
    isReady: centralizedListener.isReady,
    activeListenerCount: centralizedListener.activeListenerCount
  };
}
