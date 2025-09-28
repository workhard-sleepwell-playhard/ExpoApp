import { ref, onValue, push, set, get } from 'firebase/database';
import { realtimeDb } from '../utils/firebase/config';

/**
 * Simple real-time service using Firebase Realtime Database
 * Much simpler than the complex services we had before
 */
export class SimpleRealtimeService {
  private static listeners = new Map<string, () => void>();
  private static connectionState = 'connected';
  private static retryAttempts = 0;
  private static maxRetries = 3;

  /**
   * Listen to posts in real-time
   * @param callback Function to call when posts are updated
   * @returns Unsubscribe function
   */
  static listenToPosts(callback: (posts: any[]) => void): () => void {
    const postsRef = ref(realtimeDb, 'posts');
    
    // Clean up existing listener
    this.cleanupListener('posts');
    
    const unsubscribe = onValue(postsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const posts = data ? Object.keys(data).map(key => ({
          id: key,
          postId: key,
          ...data[key]
        })) : [];
        
        callback(posts);
      } catch (error) {
        console.error('Error processing posts data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToPosts');
      callback([]);
    });
    
    this.listeners.set('posts', unsubscribe);
    return unsubscribe;
  }

  /**
   * Create a new post
   * @param postData Post data to create
   * @returns Promise with post ID
   */
  static async createPost(postData: any): Promise<string> {
    const postsRef = ref(realtimeDb, 'posts');
    const newPostRef = push(postsRef);
    
    await set(newPostRef, {
      ...postData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return newPostRef.key!;
  }

  /**
   * Update a post
   * @param postId Post ID to update
   * @param updates Updates to apply
   */
  static async updatePost(postId: string, updates: any): Promise<void> {
    const postRef = ref(realtimeDb, `posts/${postId}`);
    await set(postRef, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  /**
   * Like a post
   * @param postId Post ID to like
   * @param userId User ID who is liking
   */
  static async likePost(postId: string, userId: string): Promise<void> {
    const likeRef = ref(realtimeDb, `posts/${postId}/likes/${userId}`);
    await set(likeRef, true);
  }

  /**
   * Unlike a post
   * @param postId Post ID to unlike
   * @param userId User ID who is unliking
   */
  static async unlikePost(postId: string, userId: string): Promise<void> {
    const likeRef = ref(realtimeDb, `posts/${postId}/likes/${userId}`);
    await set(likeRef, null);
  }

  /**
   * Delete a post
   * @param postId Post ID to delete
   */
  static async deletePost(postId: string): Promise<void> {
    const postRef = ref(realtimeDb, `posts/${postId}`);
    await set(postRef, null);
  }

  /**
   * Get posts (one-time fetch)
   * @returns Promise with posts array
   */
  static async getPosts(): Promise<any[]> {
    const postsRef = ref(realtimeDb, 'posts');
    const snapshot = await get(postsRef);
    const data = snapshot.val();
    
    return data ? Object.keys(data).map(key => ({
      id: key,
      postId: key,
      ...data[key]
    })) : [];
  }

  /**
   * Create a comment
   * @param commentData Comment data to create
   * @returns Promise with comment ID
   */
  static async createComment(commentData: any): Promise<string> {
    try {
      const commentsRef = ref(realtimeDb, 'comments');
      const newCommentRef = push(commentsRef);
      
      await set(newCommentRef, {
        ...commentData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likes: {},
        replies: 0
      });
      
      // Update post comment count
      const postRef = ref(realtimeDb, `posts/${commentData.postId}`);
      const postSnapshot = await get(postRef);
      if (postSnapshot.exists()) {
        const postData = postSnapshot.val();
        await set(postRef, {
          ...postData,
          comments: (postData.comments || 0) + 1,
          updatedAt: Date.now()
        });
      }
      
      return newCommentRef.key!;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Get comments for a post
   * @param postId Post ID to get comments for
   * @returns Promise with comments array
   */
  static async getCommentsByPost(postId: string): Promise<any[]> {
    const commentsRef = ref(realtimeDb, 'comments');
    const snapshot = await get(commentsRef);
    const data = snapshot.val();
    
    if (!data) return [];
    
    // Filter comments by postId and sort by createdAt
    const comments = Object.keys(data)
      .map(key => ({ id: key, commentId: key, ...data[key] }))
      .filter(comment => comment.postId === postId)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    
    return comments;
  }

  /**
   * Listen to comments for a post in real-time
   * @param postId Post ID to listen to comments for
   * @param callback Function to call when comments are updated
   * @returns Unsubscribe function
   */
  static listenToComments(postId: string, callback: (comments: any[]) => void): () => void {
    const commentsRef = ref(realtimeDb, 'comments');
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        callback([]);
        return;
      }
      
      // Filter comments by postId and sort by createdAt
      const comments = Object.keys(data)
        .map(key => ({ id: key, commentId: key, ...data[key] }))
        .filter(comment => comment.postId === postId)
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      
      callback(comments);
    });
    
    return unsubscribe;
  }

  /**
   * Like a comment
   * @param commentId Comment ID to like
   * @param userId User ID who is liking
   */
  static async likeComment(commentId: string, userId: string): Promise<void> {
    try {
      const likeRef = ref(realtimeDb, `comments/${commentId}/likes/${userId}`);
      await set(likeRef, true);
    } catch (error) {
      console.error('Error liking comment:', error);
      throw new Error('Failed to like comment');
    }
  }

  /**
   * Unlike a comment
   * @param commentId Comment ID to unlike
   * @param userId User ID who is unliking
   */
  static async unlikeComment(commentId: string, userId: string): Promise<void> {
    try {
      const likeRef = ref(realtimeDb, `comments/${commentId}/likes/${userId}`);
      await set(likeRef, null);
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw new Error('Failed to unlike comment');
    }
  }

  /**
   * Delete a comment
   * @param commentId Comment ID to delete
   * @param postId Post ID to update comment count
   */
  static async deleteComment(commentId: string, postId: string): Promise<void> {
    const commentRef = ref(realtimeDb, `comments/${commentId}`);
    await set(commentRef, null);
    
    // Update post comment count
    const postRef = ref(realtimeDb, `posts/${postId}`);
    const postSnapshot = await get(postRef);
    if (postSnapshot.exists()) {
      const postData = postSnapshot.val();
      await set(postRef, {
        ...postData,
        comments: Math.max((postData.comments || 0) - 1, 0),
        updatedAt: Date.now()
      });
    }
  }

  /**
   * Create a task
   * @param taskData Task data to create
   * @returns Promise with task ID
   */
  static async createTask(taskData: any): Promise<string> {
    try {
      const tasksRef = ref(realtimeDb, 'tasks');
      const newTaskRef = push(tasksRef);
      
      await set(newTaskRef, {
        ...taskData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completed: false,
        completedAt: null
      });
      
      return newTaskRef.key!;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Get tasks for a user
   * @param userId User ID to get tasks for
   * @returns Promise with tasks array
   */
  static async getTasksByUser(userId: string): Promise<any[]> {
    try {
      const tasksRef = ref(realtimeDb, 'tasks');
      const snapshot = await get(tasksRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      // Filter tasks by userId and sort by createdAt
      const tasks = Object.keys(data)
        .map(key => ({ id: key, taskId: key, ...data[key] }))
        .filter(task => task.userId === userId)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw new Error('Failed to get tasks');
    }
  }

  /**
   * Listen to tasks for a user in real-time
   * @param userId User ID to listen to tasks for
   * @param callback Function to call when tasks are updated
   * @returns Unsubscribe function
   */
  static listenToUserTasks(userId: string, callback: (tasks: any[]) => void): () => void {
    const tasksRef = ref(realtimeDb, 'tasks');
    
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        // Filter tasks by userId and sort by createdAt
        const tasks = Object.keys(data)
          .map(key => ({ id: key, taskId: key, ...data[key] }))
          .filter(task => task.userId === userId)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        callback(tasks);
      } catch (error) {
        console.error('Error processing tasks data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToUserTasks');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Update a task
   * @param taskId Task ID to update
   * @param updates Updates to apply
   */
  static async updateTask(taskId: string, updates: any): Promise<void> {
    try {
      const taskRef = ref(realtimeDb, `tasks/${taskId}`);
      const snapshot = await get(taskRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        await set(taskRef, {
          ...currentData,
          ...updates,
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Toggle task completion
   * @param taskId Task ID to toggle
   * @param completed Whether task is completed
   */
  static async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    try {
      const taskRef = ref(realtimeDb, `tasks/${taskId}`);
      const snapshot = await get(taskRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const updates = {
          ...currentData,
          completed,
          updatedAt: Date.now()
        };
        
        if (completed) {
          updates.completedAt = Date.now();
        } else {
          updates.completedAt = null;
        }
        
        await set(taskRef, updates);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      throw new Error('Failed to toggle task');
    }
  }

  /**
   * Delete a task
   * @param taskId Task ID to delete
   */
  static async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = ref(realtimeDb, `tasks/${taskId}`);
      await set(taskRef, null);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Update user points and stats
   * @param userId User ID to update
   * @param pointsData Points and stats data to update
   */
  static async updateUserPoints(userId: string, pointsData: any): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      await set(userRef, {
        ...currentData,
        ...pointsData,
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating user points:', error);
      throw new Error('Failed to update user points');
    }
  }

  /**
   * Get user points and stats
   * @param userId User ID to get points for
   * @returns Promise with user points data
   */
  static async getUserPoints(userId: string): Promise<any> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const userData = snapshot.exists() ? snapshot.val() : null;
      
      if (!userData) return null;
      
      // Extract points and stats data
      return {
        totalPoints: userData.totalPoints || 0,
        level: userData.level || 1,
        experience: userData.experience || 0,
        experienceToNextLevel: userData.experienceToNextLevel || 100,
        totalTasks: userData.totalTasks || 0,
        completedTasks: userData.completedTasks || 0,
        pendingTasks: userData.pendingTasks || 0,
        overdueTasks: userData.overdueTasks || 0,
        currentStreak: userData.currentStreak || 0,
        postsCreated: userData.postsCreated || 0,
        postsLiked: userData.postsLiked || 0,
        postsShared: userData.postsShared || 0,
        commentsMade: userData.commentsMade || 0,
        socialEngagement: userData.socialEngagement || 0,
        dailyTaskGoal: userData.dailyTaskGoal || 5,
        dailyTimeGoal: userData.dailyTimeGoal || 480,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastActivityAt: userData.lastActivityAt
      };
    } catch (error) {
      console.error('Error getting user points:', error);
      throw new Error('Failed to get user points');
    }
  }

  /**
   * Listen to user points in real-time
   * @param userId User ID to listen to points for
   * @param callback Function to call when points are updated
   * @returns Unsubscribe function
   */
  static listenToUserPoints(userId: string, callback: (points: any) => void): () => void {
    const userRef = ref(realtimeDb, `users/${userId}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      try {
        const userData = snapshot.val();
        if (!userData) {
          callback({});
          return;
        }
        
        // Extract points and stats data
        const pointsData = {
          totalPoints: userData.totalPoints || 0,
          level: userData.level || 1,
          experience: userData.experience || 0,
          experienceToNextLevel: userData.experienceToNextLevel || 100,
          totalTasks: userData.totalTasks || 0,
          completedTasks: userData.completedTasks || 0,
          pendingTasks: userData.pendingTasks || 0,
          overdueTasks: userData.overdueTasks || 0,
          currentStreak: userData.currentStreak || 0,
          postsCreated: userData.postsCreated || 0,
          postsLiked: userData.postsLiked || 0,
          postsShared: userData.postsShared || 0,
          commentsMade: userData.commentsMade || 0,
          socialEngagement: userData.socialEngagement || 0,
          dailyTaskGoal: userData.dailyTaskGoal || 5,
          dailyTimeGoal: userData.dailyTimeGoal || 480,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          lastActivityAt: userData.lastActivityAt
        };
        
        callback(pointsData);
      } catch (error) {
        console.error('Error processing points data:', error);
        callback({});
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToUserPoints');
      callback({});
    });
    
    return unsubscribe;
  }

  /**
   * Add points for a specific activity
   * @param userId User ID to add points for
   * @param activityData Activity data including points
   */
  static async addPointsActivity(userId: string, activityData: any): Promise<void> {
    try {
      const activitiesRef = ref(realtimeDb, `pointsActivity`);
      const newActivityRef = push(activitiesRef);
      
      await set(newActivityRef, {
        userId,
        ...activityData,
        timestamp: Date.now(),
        createdAt: Date.now()
      });

      // Update user's total points
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      const newTotalPoints = (currentData.totalPoints || 0) + (activityData.points || 0);
      
      // Points updated successfully
      
      await set(userRef, {
        ...currentData,
        totalPoints: newTotalPoints,
        lastActivityAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error adding points activity:', error);
      throw new Error('Failed to add points activity');
    }
  }

  /**
   * Get points activities for a user
   * @param userId User ID to get activities for
   * @param limit Number of activities to return
   * @returns Promise with activities array
   */
  static async getPointsActivities(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const activitiesRef = ref(realtimeDb, 'pointsActivity');
      const snapshot = await get(activitiesRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      // Filter activities by userId and sort by timestamp
      const activities = Object.keys(data)
        .map(key => ({ id: key, activityId: key, ...data[key] }))
        .filter(activity => activity.userId === userId)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, limit);
      
      return activities;
    } catch (error) {
      console.error('Error getting points activities:', error);
      throw new Error('Failed to get points activities');
    }
  }

  /**
   * Update task completion stats
   * @param userId User ID to update stats for
   * @param taskCompleted Whether task was completed
   * @param points Points earned from task
   */
  static async updateTaskCompletionStats(userId: string, taskCompleted: boolean, points: number = 0): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      const updates = {
        ...currentData,
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      };

      if (taskCompleted) {
        updates.completedTasks = (currentData.completedTasks || 0) + 1;
        updates.totalPoints = (currentData.totalPoints || 0) + points;
        updates.currentStreak = (currentData.currentStreak || 0) + 1;
        updates.lastTaskCompletedAt = Date.now();
      } else {
        updates.completedTasks = Math.max((currentData.completedTasks || 0) - 1, 0);
        updates.totalPoints = Math.max((currentData.totalPoints || 0) - points, 0);
        updates.currentStreak = 0; // Reset streak if task is uncompleted
      }

      updates.totalTasks = (currentData.totalTasks || 0);
      updates.pendingTasks = updates.totalTasks - updates.completedTasks;
      
      await set(userRef, updates);
    } catch (error) {
      console.error('Error updating task completion stats:', error);
      throw new Error('Failed to update task completion stats');
    }
  }

  /**
   * Update social engagement stats (without points - points are handled by addPointsActivity)
   * @param userId User ID to update stats for
   * @param activityType Type of social activity
   */
  static async updateSocialStats(userId: string, activityType: 'post' | 'like' | 'comment' | 'share'): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      const updates = {
        ...currentData,
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      };

      switch (activityType) {
        case 'post':
          updates.postsCreated = (currentData.postsCreated || 0) + 1;
          break;
        case 'like':
          updates.postsLiked = (currentData.postsLiked || 0) + 1;
          break;
        case 'comment':
          updates.commentsMade = (currentData.commentsMade || 0) + 1;
          break;
        case 'share':
          updates.postsShared = (currentData.postsShared || 0) + 1;
          break;
      }

      updates.socialEngagement = (currentData.socialEngagement || 0) + 1;
      
      await set(userRef, updates);
    } catch (error) {
      console.error('Error updating social stats:', error);
      throw new Error('Failed to update social stats');
    }
  }

  /**
   * Initialize user points data
   * @param userId User ID to initialize points for
   * @param userData Initial user data
   */
  static async initializeUserPoints(userId: string, userData: any = {}): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // User doesn't exist, create complete user document
        await this.createUser(userId, userData);
      } else {
        // User exists, ensure points fields are initialized
        const currentData = snapshot.val();
        const updates = {
          ...currentData,
          totalPoints: currentData.totalPoints || 0,
          level: currentData.level || 1,
          experience: currentData.experience || 0,
          experienceToNextLevel: currentData.experienceToNextLevel || 100,
          totalTasks: currentData.totalTasks || 0,
          completedTasks: currentData.completedTasks || 0,
          pendingTasks: currentData.pendingTasks || 0,
          overdueTasks: currentData.overdueTasks || 0,
          currentStreak: currentData.currentStreak || 0,
          postsCreated: currentData.postsCreated || 0,
          postsLiked: currentData.postsLiked || 0,
          postsShared: currentData.postsShared || 0,
          commentsMade: currentData.commentsMade || 0,
          socialEngagement: currentData.socialEngagement || 0,
          dailyTaskGoal: currentData.dailyTaskGoal || 5,
          dailyTimeGoal: currentData.dailyTimeGoal || 480,
          updatedAt: Date.now(),
          lastActivityAt: Date.now()
        };
        
        await set(userRef, updates);
      }
    } catch (error) {
      console.error('Error initializing user points:', error);
      throw new Error('Failed to initialize user points');
    }
  }

  /**
   * Create a new user in Realtime Database
   * @param userId User ID
   * @param userData User data to create
   */
  static async createUser(userId: string, userData: any): Promise<void> {
    try {
      console.log('Creating user in Realtime Database:', userId);
      console.log('User data:', userData);
      
      const userRef = ref(realtimeDb, `users/${userId}`);
      
      // Check if user already exists
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        console.log('User already exists in Realtime Database');
        return;
      }

      // Create single user document with all data
      const userDocument = {
        userId,
        // Profile data
        email: userData.email || '',
        displayName: userData.displayName || '',
        username: userData.username || '',
        avatar: userData.avatar || '👤',
        bio: userData.bio || '',
        
        // Settings
        notificationsEnabled: true,
        theme: 'auto',
        privacy: 'public',
        language: 'en',
        timezone: 'UTC',
        
        // Points & stats
        totalPoints: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        
        // Task stats
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        currentStreak: 0,
        
        // Social stats
        postsCreated: 0,
        postsLiked: 0,
        postsShared: 0,
        commentsMade: 0,
        socialEngagement: 0,
        
        // Goals
        dailyTaskGoal: 5,
        dailyTimeGoal: 480,
        
        // Timestamps
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastLoginAt: Date.now(),
        lastActivityAt: Date.now()
      };

      // Save single user document
      console.log('Saving user document:', userDocument);
      await set(userRef, userDocument);
      console.log('User created successfully in Realtime Database:', userId);
    } catch (error) {
      console.error('Error creating user in Realtime Database:', error);
      throw new Error('Failed to create user in Realtime Database');
    }
  }

  /**
   * Get user profile data from Realtime Database
   * @param userId User ID to get profile for
   * @returns Promise with user profile data
   */
  static async getUserProfile(userId: string): Promise<any> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user profile data in Realtime Database
   * @param userId User ID to update
   * @param profileData Profile data to update
   */
  static async updateUserProfile(userId: string, profileData: any): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      await set(userRef, {
        ...currentData,
        ...profileData,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Listen to user profile data in real-time
   * @param userId User ID to listen to
   * @param callback Function to call when profile is updated
   * @returns Unsubscribe function
   */
  static listenToUserProfile(userId: string, callback: (profile: any) => void): () => void {
    const userRef = ref(realtimeDb, `users/${userId}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      try {
        const data = snapshot.val();
        callback(data || {});
      } catch (error) {
        console.error('Error processing user profile data:', error);
        callback({});
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToUserProfile');
      callback({});
    });
    
    return unsubscribe;
  }

  /**
   * Get all users for leaderboards
   * @param limit Number of users to return
   * @returns Promise with users array
   */
  static async getAllUsersForLeaderboards(limit: number = 50): Promise<any[]> {
    try {
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      // Transform and sort users by total points
      const users = Object.keys(data)
        .map(key => ({ 
          userId: key, 
          ...data[key] 
        }))
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, limit);
      
      return users;
    } catch (error) {
      console.error('Error getting users for leaderboards:', error);
      throw new Error('Failed to get users for leaderboards');
    }
  }

  /**
   * Listen to leaderboard data in real-time
   * @param callback Function to call when leaderboard data is updated
   * @returns Unsubscribe function
   */
  static listenToLeaderboards(callback: (users: any[]) => void): () => void {
    const usersRef = ref(realtimeDb, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        // Transform and sort users by total points
        const users = Object.keys(data)
          .map(key => ({ 
            userId: key, 
            ...data[key] 
          }))
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        
        callback(users);
      } catch (error) {
        console.error('Error processing leaderboard data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToLeaderboards');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Get leaderboard rankings by type
   * @param type Type of ranking (overall, weekly, streaks)
   * @param limit Number of users to return
   * @returns Promise with rankings array
   */
  static async getLeaderboardRankings(type: 'overall' | 'weekly' | 'streaks', limit: number = 50): Promise<any[]> {
    try {
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      let users = Object.keys(data).map(key => ({ 
        userId: key, 
        ...data[key] 
      }));
      
      // Sort by different criteria based on type
      switch (type) {
        case 'overall':
          users.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
          break;
        case 'weekly':
          // For weekly, we'll use totalPoints for now (can be enhanced later)
          users.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
          break;
        case 'streaks':
          users.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
          break;
      }
      
      return users.slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard rankings:', error);
      throw new Error('Failed to get leaderboard rankings');
    }
  }

  /**
   * Update user's leaderboard position
   * @param userId User ID to update
   * @param leaderboardData Leaderboard-specific data
   */
  static async updateUserLeaderboardPosition(userId: string, leaderboardData: any): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      await set(userRef, {
        ...currentData,
        ...leaderboardData,
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating user leaderboard position:', error);
      throw new Error('Failed to update user leaderboard position');
    }
  }

  /**
   * Clean up a specific listener
   * @param key Listener key
   */
  private static cleanupListener(key: string): void {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }

  /**
   * Clean up all listeners
   */
  static cleanup(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  /**
   * Get connection state
   */
  static getConnectionState(): string {
    return this.connectionState;
  }

  /**
   * Check if service is connected
   */
  static isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Handle connection errors with retry logic
   */
  private static handleConnectionError(error: any, operation: string): void {
    console.error(`Connection error in ${operation}:`, error);
    
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      this.connectionState = 'reconnecting';
      
      // Retry after exponential backoff
      setTimeout(() => {
        this.connectionState = 'connected';
        this.retryAttempts = 0;
      }, Math.pow(2, this.retryAttempts) * 1000);
    } else {
      this.connectionState = 'disconnected';
    }
  }

  /**
   * Get listener count
   */
  static getListenerCount(): number {
    return this.listeners.size;
  }
}
