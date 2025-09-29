import { ref, onValue, push, set, get, query, orderByKey, limitToLast, startAt, endAt } from 'firebase/database';
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

  /**
   * Create a time tracking session
   * @param sessionData Session data to create
   * @returns Promise with session ID
   */
  static async createTimeTrackingSession(sessionData: any): Promise<string> {
    try {
      const sessionsRef = ref(realtimeDb, 'timeTrackingSessions');
      const newSessionRef = push(sessionsRef);
      
      await set(newSessionRef, {
        ...sessionData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      return newSessionRef.key!;
    } catch (error) {
      console.error('Error creating time tracking session:', error);
      throw new Error('Failed to create time tracking session');
    }
  }

  /**
   * Get time tracking sessions for a user
   * @param userId User ID to get sessions for
   * @param startDate Start date filter (optional)
   * @param endDate End date filter (optional)
   * @returns Promise with sessions array
   */
  static async getTimeTrackingSessions(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const sessionsRef = ref(realtimeDb, 'timeTrackingSessions');
      const snapshot = await get(sessionsRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      // Filter sessions by userId and date range
      let sessions = Object.keys(data)
        .map(key => ({ id: key, sessionId: key, ...data[key] }))
        .filter(session => session.userId === userId);
      
      // Apply date filters if provided
      if (startDate && endDate) {
        sessions = sessions.filter(session => {
          const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
          return sessionDate >= startDate && sessionDate <= endDate;
        });
      }
      
      // Sort by start time (newest first)
      return sessions.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
    } catch (error) {
      console.error('Error getting time tracking sessions:', error);
      throw new Error('Failed to get time tracking sessions');
    }
  }

  /**
   * Listen to time tracking sessions for a user in real-time
   * @param userId User ID to listen to sessions for
   * @param callback Function to call when sessions are updated
   * @returns Unsubscribe function
   */
  static listenToTimeTrackingSessions(userId: string, callback: (sessions: any[]) => void): () => void {
    const sessionsRef = ref(realtimeDb, 'timeTrackingSessions');
    
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        // Filter sessions by userId and sort by start time
        const sessions = Object.keys(data)
          .map(key => ({ id: key, sessionId: key, ...data[key] }))
          .filter(session => session.userId === userId)
          .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
        
        callback(sessions);
      } catch (error) {
        console.error('Error processing time tracking sessions data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToTimeTrackingSessions');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Create daily analytics data
   * @param analyticsData Analytics data to create
   * @returns Promise with analytics ID
   */
  static async createDailyAnalytics(analyticsData: any): Promise<string> {
    try {
      const { userId, date } = analyticsData;
      const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}/${date}`);
      
      // Validate and ensure sourceData structure
      const validatedData = {
        ...analyticsData,
        sourceData: analyticsData.sourceData || {
          tasks: [],
          sessions: []
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Validate sourceData structure
      if (validatedData.sourceData.tasks && !Array.isArray(validatedData.sourceData.tasks)) {
        validatedData.sourceData.tasks = [];
      }
      if (validatedData.sourceData.sessions && !Array.isArray(validatedData.sourceData.sessions)) {
        validatedData.sourceData.sessions = [];
      }
      
      await set(analyticsRef, validatedData);
      
      return `${userId}/${date}`;
    } catch (error) {
      console.error('Error creating daily analytics:', error);
      throw new Error('Failed to create daily analytics');
    }
  }

  /**
   * Create daily analytics with source tracking from actual sessions and tasks
   * @param userId User ID
   * @param date Date (YYYY-MM-DD format)
   * @param sessions Array of time tracking sessions for the day
   * @param tasks Array of completed tasks for the day
   * @returns Promise with analytics ID
   */
  static async createDailyAnalyticsWithSourceTracking(
    userId: string, 
    date: string, 
    sessions: any[] = [], 
    tasks: any[] = []
  ): Promise<string> {
    try {
      // Calculate totals from source data
      const totalHoursTracked = sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60; // Convert minutes to hours
      const totalSessions = sessions.length;
      const tasksCompleted = tasks.length;
      
      // Generate categories from sessions
      const categoryMap = new Map();
      sessions.forEach(session => {
        const category = session.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { hours: 0, sessions: 0 });
        }
        const categoryData = categoryMap.get(category);
        categoryData.hours += (session.duration || 0) / 60; // Convert to hours
        categoryData.sessions += 1;
      });
      
      const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        hours: Math.round(data.hours * 100) / 100, // 2 decimal places
        sessions: data.sessions
      }));
      
      // Calculate points from tasks
      const pointsEarned = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
      
      // Create source data arrays
      const sourceTasks = tasks.map(task => ({
        taskId: task.id || task.taskId || `task_${Date.now()}_${Math.random()}`,
        taskName: task.name || task.taskName || 'Unnamed Task',
        completedAt: task.completedAt || task.completedAt || new Date().toISOString(),
        points: task.points || 0,
        category: task.category || 'Other',
        priority: task.priority || 'medium'
      }));
      
      const sourceSessions = sessions.map(session => ({
        sessionId: session.id || session.sessionId || `session_${Date.now()}_${Math.random()}`,
        duration: session.duration || 0,
        category: session.category || 'Other',
        startTime: session.startTime || session.startTime || new Date().toISOString(),
        endTime: session.endTime || session.endTime || new Date().toISOString(),
        description: session.description || session.description || 'Time tracking session'
      }));
      
      const analyticsData = {
        userId,
        date,
        totalHoursTracked: Math.round(totalHoursTracked * 100) / 100, // 2 decimal places
        totalSessions,
        categories,
        tasksCompleted,
        tasksPending: 0, // Would need to be calculated from task management system
        tasksOverdue: 0, // Would need to be calculated from task management system
        pointsEarned,
        productivityScore: Math.min(100, Math.floor((totalHoursTracked * 10 + tasksCompleted * 5) / 2)), // Simple calculation
        sourceData: {
          tasks: sourceTasks,
          sessions: sourceSessions
        }
      };
      
      return await this.createDailyAnalytics(analyticsData);
    } catch (error) {
      console.error('Error creating daily analytics with source tracking:', error);
      throw new Error('Failed to create daily analytics with source tracking');
    }
  }

  /**
   * Get source tracking data for a specific day
   * @param userId User ID
   * @param date Date (YYYY-MM-DD format)
   * @returns Promise with source tracking data
   */
  static async getSourceTrackingData(userId: string, date: string): Promise<any | null> {
    try {
      const analytics = await this.getDailyAnalytics(userId, date);
      if (!analytics) return null;
      
      return {
        date: analytics.date,
        totalTasks: analytics.sourceData?.tasks?.length || 0,
        totalSessions: analytics.sourceData?.sessions?.length || 0,
        tasks: analytics.sourceData?.tasks || [],
        sessions: analytics.sourceData?.sessions || [],
        summary: {
          totalHours: analytics.totalHoursTracked,
          totalPoints: analytics.pointsEarned,
          productivityScore: analytics.productivityScore
        }
      };
    } catch (error) {
      console.error('Error getting source tracking data:', error);
      throw new Error('Failed to get source tracking data');
    }
  }

  /**
   * Process analytics data for charts (used by custom date range)
   * @param analyticsData - Array of analytics data
   * @returns Processed data for all chart types
   */
  static processAnalyticsForCharts(analyticsData: any[]): any {
    // For custom date range, we only have analytics data, no sessions
    // So we'll generate empty sessions array and use analytics for other data
    const emptySessions: any[] = [];
    
    return {
      weeklyProgress: this.generateWeeklyProgressData(emptySessions),
      taskCompletionData: this.generateTaskCompletionData(analyticsData),
      dailyPointsData: this.generateDailyPointsData(analyticsData),
      categories: SimpleRealtimeService.generateCategoriesFromAnalytics(analyticsData)
    };
  }

  /**
   * Generate categories data from analytics (for custom date range)
   * @param analytics - Analytics data
   * @returns Categories data for summary
   */
  private static generateCategoriesFromAnalytics(analytics: any[]): any[] {
    const categoryMap = new Map();
    
    analytics.forEach(day => {
      if (day.sourceData?.tasks && day.sourceData.tasks.length > 0) {
        // Use detailed source data if available
        day.sourceData.tasks.forEach((task: any) => {
          const category = task.categoryName || 'Work';
          const hours = Math.round((task.duration || 0) * 100) / 100; // Store 2 decimal places
          
          if (categoryMap.has(category)) {
            const existing = categoryMap.get(category);
            existing.hours += hours;
            existing.sessions += 1;
          } else {
            categoryMap.set(category, {
              name: category,
              hours: hours,
              sessions: 1,
              color: this.getCategoryColor(category),
              icon: this.getCategoryIcon(category)
            });
          }
        });
      }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.hours - a.hours);
  }

  /**
   * Get recent daily analytics with limit (for dashboard summaries)
   * @param userId User ID
   * @param limit Number of recent days to fetch (default: 7)
   * @returns Promise with recent analytics data
   */
  static async getRecentDailyAnalytics(userId: string, limit: number = 7): Promise<any[]> {
    try {
      const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}`);
      const queryRef = query(analyticsRef, orderByKey(), limitToLast(limit));
      
      const snapshot = await get(queryRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      return Object.keys(data)
        .map(date => ({
          id: `${userId}/${date}`,
          analyticsId: `${userId}/${date}`,
          userId,
          date,
          ...data[date]
        }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } catch (error) {
      console.error('Error getting recent daily analytics:', error);
      throw new Error('Failed to get recent daily analytics');
    }
  }

  /**
   * Get daily analytics within a date range
   * @param userId User ID
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @returns Promise with analytics data in range
   */
  static async getDailyAnalyticsInRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<any[]> {
    try {
      const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}`);
      const queryRef = query(
        analyticsRef, 
        orderByKey(), 
        startAt(startDate), 
        endAt(endDate)
      );
      
      const snapshot = await get(queryRef);
      const data = snapshot.val();
      
      if (!data) return [];
      
      return Object.keys(data)
        .map(date => ({
          id: `${userId}/${date}`,
          analyticsId: `${userId}/${date}`,
          userId,
          date,
          ...data[date]
        }))
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } catch (error) {
      console.error('Error getting daily analytics in range:', error);
      throw new Error('Failed to get daily analytics in range');
    }
  }

  /**
   * Get weekly analytics summary (last 4 weeks)
   * @param userId User ID
   * @param weeks Number of weeks to fetch (default: 4)
   * @returns Promise with weekly analytics data
   */
  static async getWeeklyAnalyticsSummary(userId: string, weeks: number = 4): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      return await this.getDailyAnalyticsInRange(userId, startDateStr, endDateStr);
    } catch (error) {
      console.error('Error getting weekly analytics summary:', error);
      throw new Error('Failed to get weekly analytics summary');
    }
  }

  /**
   * Get monthly analytics summary (last 3 months)
   * @param userId User ID
   * @param months Number of months to fetch (default: 3)
   * @returns Promise with monthly analytics data
   */
  static async getMonthlyAnalyticsSummary(userId: string, months: number = 3): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      return await this.getDailyAnalyticsInRange(userId, startDateStr, endDateStr);
    } catch (error) {
      console.error('Error getting monthly analytics summary:', error);
      throw new Error('Failed to get monthly analytics summary');
    }
  }

  /**
   * Get daily analytics for a user
   * @param userId User ID to get analytics for
   * @param date Date to get analytics for (YYYY-MM-DD format)
   * @returns Promise with analytics data
   */
  static async getDailyAnalytics(userId: string, date: string): Promise<any | null> {
    try {
      const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}/${date}`);
      const snapshot = await get(analyticsRef);
      const data = snapshot.val();
      
      if (!data) return null;
      
      return {
        id: `${userId}/${date}`,
        analyticsId: `${userId}/${date}`,
        ...data
      };
    } catch (error) {
      console.error('Error getting daily analytics:', error);
      throw new Error('Failed to get daily analytics');
    }
  }

  /**
   * Listen to recent daily analytics with limit (optimized for dashboard)
   * @param userId User ID
   * @param limit Number of recent days to listen to (default: 7)
   * @param callback Function to call when analytics are updated
   * @returns Unsubscribe function
   */
  static listenToRecentDailyAnalytics(
    userId: string, 
    limit: number = 7, 
    callback: (analytics: any[]) => void
  ): () => void {
    const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}`);
    const queryRef = query(analyticsRef, orderByKey(), limitToLast(limit));
    
    const unsubscribe = onValue(queryRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        const analytics = Object.keys(data)
          .map(date => ({ 
            id: `${userId}/${date}`, 
            analyticsId: `${userId}/${date}`, 
            userId,
            date,
            ...data[date] 
          }))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        
        callback(analytics);
      } catch (error) {
        console.error('Error processing recent daily analytics data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToRecentDailyAnalytics');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Listen to daily analytics within a date range (optimized for charts)
   * @param userId User ID
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @param callback Function to call when analytics are updated
   * @returns Unsubscribe function
   */
  static listenToDailyAnalyticsInRange(
    userId: string,
    startDate: string,
    endDate: string,
    callback: (analytics: any[]) => void
  ): () => void {
    const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}`);
    const queryRef = query(
      analyticsRef, 
      orderByKey(), 
      startAt(startDate), 
      endAt(endDate)
    );
    
    const unsubscribe = onValue(queryRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        const analytics = Object.keys(data)
          .map(date => ({ 
            id: `${userId}/${date}`, 
            analyticsId: `${userId}/${date}`, 
            userId,
            date,
            ...data[date] 
          }))
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        
        callback(analytics);
      } catch (error) {
        console.error('Error processing daily analytics range data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToDailyAnalyticsInRange');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Listen to daily analytics for a user in real-time
   * @param userId User ID to listen to analytics for
   * @param callback Function to call when analytics are updated
   * @returns Unsubscribe function
   */
  static listenToDailyAnalytics(userId: string, callback: (analytics: any[]) => void): () => void {
    const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}`);
    
    const unsubscribe = onValue(analyticsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        // Convert the nested structure to array and sort by date
        const analytics = Object.keys(data)
          .map(date => ({ 
            id: `${userId}/${date}`, 
            analyticsId: `${userId}/${date}`, 
            userId,
            date,
            ...data[date] 
          }))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        
        callback(analytics);
      } catch (error) {
        console.error('Error processing daily analytics data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToDailyAnalytics');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Listen to optimized tracking data with query strategies
   * @param userId User ID to listen to tracking data for
   * @param options Query options for optimization
   * @param callback Function to call when tracking data is updated
   * @returns Unsubscribe function
   */
  static listenToOptimizedTrackingData(
    userId: string, 
    options: {
      recentDays?: number; // For recent analytics (default: 7)
      dateRange?: { startDate: string; endDate: string }; // For specific range
      sessionLimit?: number; // For recent sessions (default: 50)
    } = {},
    callback: (trackingData: any) => void
  ): () => void {
    const { recentDays = 7, dateRange, sessionLimit = 50 } = options;
    
    // Listen to sessions with limit for performance
    const sessionsRef = ref(realtimeDb, 'timeTrackingSessions');
    const sessionsQueryRef = query(sessionsRef, orderByKey(), limitToLast(sessionLimit));
    
    let sessionsData: any[] = [];
    let analyticsData: any[] = [];
    
    const processData = () => {
      // Filter sessions by userId
      const userSessions = sessionsData.filter((session: any) => session.userId === userId);
      
      // Generate chart data from the raw data
      const trackingData = {
        sessions: userSessions,
        analytics: analyticsData,
        weeklyProgress: this.generateWeeklyProgressData(userSessions),
        taskCompletionData: this.generateTaskCompletionData(analyticsData),
        dailyPointsData: this.generateDailyPointsData(analyticsData),
        categoriesData: this.generateCategoriesData(userSessions)
      };
      
      callback(trackingData);
    };
    
    // Listen to sessions with limit
    const unsubscribeSessions = onValue(sessionsQueryRef, (snapshot) => {
      const data = snapshot.val();
      sessionsData = data ? Object.values(data) : [];
      processData();
    });
    
    // Listen to analytics with appropriate query strategy
    let unsubscribeAnalytics: () => void;
    
    if (dateRange) {
      // Use range query for specific date range
      unsubscribeAnalytics = this.listenToDailyAnalyticsInRange(
        userId,
        dateRange.startDate,
        dateRange.endDate,
        (analytics) => {
          analyticsData = analytics;
          processData();
        }
      );
    } else {
      // Use recent analytics query for dashboard
      unsubscribeAnalytics = this.listenToRecentDailyAnalytics(
        userId,
        recentDays,
        (analytics) => {
          analyticsData = analytics;
          processData();
        }
      );
    }
    
    return () => {
      unsubscribeSessions();
      unsubscribeAnalytics();
    };
  }

  /**
   * Listen to tracking data (sessions + analytics) for a user
   * @param userId User ID to listen to tracking data for
   * @param callback Function to call when tracking data is updated
   * @returns Unsubscribe function
   */
  static listenToTrackingData(userId: string, callback: (trackingData: any) => void): () => void {
    // Listen to both sessions and analytics data
    const sessionsRef = ref(realtimeDb, 'timeTrackingSessions');
    const analyticsRef = ref(realtimeDb, `dailyAnalytics/${userId}`);
    
    let sessionsData: any[] = [];
    let analyticsData: any[] = [];
    
    const processData = () => {
      // Generate chart data from the raw data
      const trackingData = {
        sessions: sessionsData,
        analytics: analyticsData,
        weeklyProgress: this.generateWeeklyProgressData(sessionsData),
        taskCompletionData: this.generateTaskCompletionData(analyticsData),
        dailyPointsData: this.generateDailyPointsData(analyticsData),
        categoriesData: this.generateCategoriesData(sessionsData)
      };
      
      callback(trackingData);
    };
    
    // Listen to sessions
    const unsubscribeSessions = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      sessionsData = data ? Object.values(data).filter((session: any) => session.userId === userId) : [];
      processData();
    });
    
    // Listen to analytics
    const unsubscribeAnalytics = onValue(analyticsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        analyticsData = [];
      } else {
        // Convert the nested structure to array
        analyticsData = Object.keys(data).map(date => ({
          id: `${userId}/${date}`,
          analyticsId: `${userId}/${date}`,
          userId,
          date,
          ...data[date]
        }));
      }
      processData();
    });
    
    // Return cleanup function
    return () => {
      unsubscribeSessions();
      unsubscribeAnalytics();
    };
  }

  /**
   * Generate weekly progress data from sessions
   * @param sessions Array of time tracking sessions
   * @returns Weekly progress data for charts
   */
  private static generateWeeklyProgressData(sessions: any[]): any[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = days.map(day => ({ 
      day, 
      hours: 0, 
      sessions: 0,
      points: 0 
    }));
    
    // Group sessions by day of week
    sessions.forEach(session => {
      if (session.startTime) {
        const date = new Date(session.startTime);
        const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        const hours = Math.round(((session.duration || 0) / 60) * 100) / 100; // Store 2 decimal places
        weeklyData[dayIndex].hours += hours;
        weeklyData[dayIndex].sessions += 1;
        weeklyData[dayIndex].points += Math.floor(hours * 10); // 10 points per hour
      }
    });
    
    // Round final hours to 2 decimal places for storage
    weeklyData.forEach(day => {
      day.hours = Math.round(day.hours * 100) / 100;
    });
    
    return weeklyData;
  }

  /**
   * Generate task completion data from analytics
   * @param analytics Array of daily analytics
   * @returns Task completion data for pie chart
   */
  private static generateTaskCompletionData(analytics: any[]): any[] {
    const totalCompleted = analytics.reduce((sum, day) => sum + (day.tasksCompleted || 0), 0);
    const totalPending = analytics.reduce((sum, day) => sum + (day.tasksPending || 0), 0);
    const totalOverdue = analytics.reduce((sum, day) => sum + (day.tasksOverdue || 0), 0);
    const totalTasks = totalCompleted + totalPending + totalOverdue;
    
    if (totalTasks === 0) {
      return [
        { id: 1, category: 'Completed', count: 0, color: '#4CAF50', percentage: 0 },
        { id: 2, category: 'Pending', count: 0, color: '#FF5722', percentage: 0 }
      ];
    }
    
    return [
      {
        id: 1,
        category: 'Completed',
        count: totalCompleted,
        color: '#4CAF50',
        percentage: Math.round((totalCompleted / totalTasks) * 100)
      },
      {
        id: 2,
        category: 'Pending',
        count: totalPending,
        color: '#FF5722',
        percentage: Math.round((totalPending / totalTasks) * 100)
      }
    ];
  }

  /**
   * Generate daily points data from analytics
   * @param analytics Array of daily analytics
   * @returns Daily points data for line chart
   */
  private static generateDailyPointsData(analytics: any[]): any[] {
    return analytics
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map(day => {
        const hoursTracked = Math.round((day.totalHoursTracked || 0) * 100) / 100; // Store 2 decimal places
        return {
          time: day.date || '',
          points: day.pointsEarned || 0,
          tasksCompleted: day.tasksCompleted || 0,
          hoursTracked,
          productivityScore: day.productivityScore || 0,
          activity: `${day.tasksCompleted || 0} tasks • ${hoursTracked.toFixed(1)}h` // Display 1 decimal place
        };
      });
  }

  /**
   * Filter data by time period
   * @param data Array of data with date/timestamp fields
   * @param timePeriod Time period filter ('week', 'month', 'year', 'all-time')
   * @returns Filtered data array
   */
  private static filterByTimePeriod(data: any[], timePeriod: string): any[] {
    if (timePeriod === 'all-time') return data;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timePeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date || item.startTime || item.createdAt);
      return itemDate >= cutoffDate;
    });
  }

  /**
   * Generate categories data from sessions
   * @param sessions Array of time tracking sessions
   * @returns Categories data for summary
   */
  private static generateCategoriesData(sessions: any[]): any[] {
    const categoryMap = new Map();
    
    sessions.forEach(session => {
      const category = session.categoryName || 'Work';
      const hours = Math.round(((session.duration || 0) / 60) * 100) / 100; // Store 2 decimal places
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.hours += hours;
      } else {
        categoryMap.set(category, {
          id: category.toLowerCase().replace(/\s+/g, '-'),
          category,
          hours,
          color: this.getCategoryColor(category),
          icon: this.getCategoryIcon(category)
        });
      }
    });
    
    // Round final hours to 2 decimal places for storage
    const result = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      hours: Math.round(cat.hours * 100) / 100
    }));
    
    return result;
  }

  /**
   * Get color for category
   * @param category Category name
   * @returns Color hex code
   */
  private static getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Work': '#2196F3',
      'Study': '#4CAF50',
      'Exercise': '#FF9800',
      'Personal': '#9C27B0',
      'Other': '#607D8B'
    };
    return colors[category] || '#607D8B';
  }

  /**
   * Get icon for category
   * @param category Category name
   * @returns Icon name
   */
  private static getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Work': 'briefcase',
      'Study': 'book',
      'Exercise': 'dumbbell',
      'Personal': 'user',
      'Other': 'circle'
    };
    return icons[category] || 'circle';
  }

  /**
   * Create sample tracking data for testing
   * @param userId User ID
   * @returns Promise<void>
   */
  static async createSampleTrackingData(userId: string): Promise<void> {
    try {
      const categories = ['Work', 'Study', 'Exercise', 'Personal'];
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const sessionCount = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < sessionCount; j++) {
          const category = categories[Math.floor(Math.random() * categories.length)];
          const duration = Math.floor(Math.random() * 180) + 30;
          const startTime = new Date(date);
          startTime.setHours(9 + j * 3, Math.floor(Math.random() * 60), 0, 0);
          
          await this.createTimeTrackingSession({
            userId,
            categoryId: category.toLowerCase(),
            categoryName: category,
            categoryColor: this.getCategoryColor(category),
            categoryIcon: this.getCategoryIcon(category),
            startTime: startTime.getTime(),
            endTime: startTime.getTime() + (duration * 60000),
            duration,
            description: `Sample ${category} session`,
            tags: [category.toLowerCase()],
            productivityRating: Math.floor(Math.random() * 5) + 1,
            breakTaken: Math.random() > 0.7,
            breakDuration: Math.floor(Math.random() * 30)
          });
        }
        
        const totalHours = Math.round((Math.random() * 8 + 1) * 100) / 100; // 2 decimal places
        const tasksCompleted = Math.floor(Math.random() * 10) + 1;
        
        // Generate source data for tasks and sessions
        const sourceTasks = [];
        const sourceSessions = [];
        
        // Generate completed tasks with source tracking
        for (let i = 0; i < tasksCompleted; i++) {
          const taskId = `task_${userId}_${date.toISOString().split('T')[0]}_${i}`;
          const completedAt = new Date(date);
          completedAt.setHours(9 + Math.floor(Math.random() * 8)); // Random hour between 9-17
          completedAt.setMinutes(Math.floor(Math.random() * 60));
          
          sourceTasks.push({
            taskId,
            taskName: `Sample Task ${i + 1}`,
            completedAt: completedAt.toISOString(),
            points: Math.floor(Math.random() * 20) + 5, // 5-25 points
            category: categories[Math.floor(Math.random() * categories.length)],
            priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)]
          });
        }
        
        // Generate sessions with source tracking
        let remainingHours = totalHours;
        for (let i = 0; i < sessionCount; i++) {
          const sessionId = `session_${userId}_${date.toISOString().split('T')[0]}_${i}`;
          const sessionDuration = Math.min(
            Math.round((Math.random() * remainingHours + 0.5) * 100) / 100, // 0.5-remaining hours
            remainingHours
          );
          remainingHours = Math.max(0, remainingHours - sessionDuration);
          
          const startTime = new Date(date);
          startTime.setHours(8 + Math.floor(Math.random() * 10)); // Random hour between 8-18
          startTime.setMinutes(Math.floor(Math.random() * 60));
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + Math.round(sessionDuration * 60));
          
          sourceSessions.push({
            sessionId,
            duration: Math.round(sessionDuration * 60), // Convert to minutes
            category: categories[Math.floor(Math.random() * categories.length)],
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            description: `Work session ${i + 1}`
          });
        }

        const analyticsId = await this.createDailyAnalytics({
          userId,
          date: date.toISOString().split('T')[0],
          totalHoursTracked: totalHours,
          totalSessions: sessionCount,
          categories: categories.map(cat => ({
            name: cat,
            hours: Math.round((Math.random() * totalHours) * 100) / 100, // 2 decimal places
            sessions: Math.floor(Math.random() * sessionCount)
          })),
          tasksCompleted,
          tasksPending: Math.floor(Math.random() * 5),
          tasksOverdue: Math.floor(Math.random() * 3),
          pointsEarned: Math.floor(totalHours * 10 + tasksCompleted * 5),
          productivityScore: Math.floor(Math.random() * 40) + 60,
          // NEW: Detailed source tracking
          sourceData: {
            tasks: sourceTasks,
            sessions: sourceSessions
          }
        });
        
        // Log source tracking data for verification
        console.log(`📊 Created analytics for ${date.toISOString().split('T')[0]} with source tracking:`, {
          analyticsId,
          tasks: sourceTasks.length,
          sessions: sourceSessions.length,
          totalHours: totalHours,
          sampleTask: sourceTasks[0],
          sampleSession: sourceSessions[0]
        });
      }
      
      console.log('Sample tracking data created successfully');
    } catch (error) {
      console.error('Error creating sample tracking data:', error);
      throw error;
    }
  }
}
