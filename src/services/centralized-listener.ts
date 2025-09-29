/**
 * Centralized Firebase Listener Service
 * Manages all Firebase listeners in one place to prevent duplicate listeners
 * and improve performance
 */

import { SimpleRealtimeService } from './simple-realtime';

class CentralizedListenerService {
  private listeners: Map<string, () => void> = new Map();
  private isInitialized = false;

  /**
   * Initialize listeners for the app (supports multiple configurations)
   * @param userId Current user ID
   * @param callbacks Object containing callback functions for each data type
   */
  initializeListeners(
    userId: string,
    callbacks: {
      onPostsUpdate?: (posts: any[]) => void;
      onUserProfileUpdate?: (userData: any) => void;
      onUserTasksUpdate?: (tasks: any[]) => void;
      onLeaderboardsUpdate?: (leaderboards: any) => void;
      onTrackingDataUpdate?: (trackingData: any) => void;
    }
  ) {
    // Allow multiple initializations - just add new listeners if they don't exist
    // This prevents the "already initialized" error when switching tabs

    // Posts listener (global) - only set up if not already exists
    if (callbacks.onPostsUpdate && !this.listeners.has('posts')) {
      const unsubscribePosts = SimpleRealtimeService.listenToPosts(callbacks.onPostsUpdate);
      this.listeners.set('posts', unsubscribePosts);
    }

    // User profile listener - only set up if not already exists
    if (callbacks.onUserProfileUpdate && userId && !this.listeners.has('userProfile')) {
      const unsubscribeProfile = SimpleRealtimeService.listenToUserProfile(
        userId, 
        callbacks.onUserProfileUpdate
      );
      this.listeners.set('userProfile', unsubscribeProfile);
    }

    // User tasks listener - only set up if not already exists
    if (callbacks.onUserTasksUpdate && userId && !this.listeners.has('userTasks')) {
      const unsubscribeTasks = SimpleRealtimeService.listenToUserTasks(
        userId, 
        callbacks.onUserTasksUpdate
      );
      this.listeners.set('userTasks', unsubscribeTasks);
    }

    // Leaderboards listener - only set up if not already exists
    if (callbacks.onLeaderboardsUpdate && !this.listeners.has('leaderboards')) {
      const unsubscribeLeaderboards = SimpleRealtimeService.listenToLeaderboards(
        callbacks.onLeaderboardsUpdate
      );
      this.listeners.set('leaderboards', unsubscribeLeaderboards);
    }

    // Tracking data listener - only set up if not already exists
    if (callbacks.onTrackingDataUpdate && userId && !this.listeners.has('trackingData')) {
      const unsubscribeTrackingData = SimpleRealtimeService.listenToOptimizedTrackingData(
        userId,
        {
          recentDays: 7, // Optimize for dashboard view
          sessionLimit: 50 // Limit recent sessions for performance
        },
        callbacks.onTrackingDataUpdate
      );
      this.listeners.set('trackingData', unsubscribeTrackingData);
    }

    this.isInitialized = true;
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error(`Error cleaning up listener ${key}:`, error);
      }
    });
    this.listeners.clear();
    this.isInitialized = false;
  }

  /**
   * Clean up specific listener
   * @param listenerKey Key of the listener to clean up
   */
  cleanupListener(listenerKey: string) {
    const unsubscribe = this.listeners.get(listenerKey);
    if (unsubscribe) {
      try {
        unsubscribe();
        this.listeners.delete(listenerKey);
      } catch (error) {
        console.error(`Error cleaning up listener ${listenerKey}:`, error);
      }
    }
  }

  /**
   * Check if listeners are initialized
   */
  get isReady() {
    return this.isInitialized;
  }

  /**
   * Get active listener count
   */
  get activeListenerCount() {
    return this.listeners.size;
  }
}

// Export singleton instance
export const centralizedListener = new CentralizedListenerService();
export default centralizedListener;
