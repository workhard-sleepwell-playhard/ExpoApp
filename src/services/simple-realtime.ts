import { ref, onValue, push, set, get, query, orderByKey, limitToLast, startAt, endAt, runTransaction } from 'firebase/database';
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
      likes: 0,
      dislikes: 0,
      comments: 0,
      shares: 0,
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
   * Toggle like on a post
   * @param postId Post ID to like/unlike
   * @param userId User ID who is liking/unliking
   */
  static async likePost(postId: string, userId: string): Promise<void> {
    try {
      const likeKey = `${postId}_${userId}`;
      const likeRef = ref(realtimeDb, `postLikes/${likeKey}`);
      const dislikeKey = `${postId}_${userId}`;
      const dislikeRef = ref(realtimeDb, `postDislikes/${dislikeKey}`);
      const postRef = ref(realtimeDb, `posts/${postId}`);
      
      const likeSnapshot = await get(likeRef);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        throw new Error('Post not found');
      }
      
      const postData = postSnapshot.val();
      const currentLikes = typeof postData.likes === 'number' ? postData.likes : 0;
      const currentDislikes = typeof postData.dislikes === 'number' ? postData.dislikes : 0;
      
      if (likeSnapshot.exists()) {
        // Remove like
        await set(likeRef, null);
        await set(postRef, {
          ...postData,
          likes: Math.max(currentLikes - 1, 0),
          updatedAt: Date.now()
        });
      } else {
        // Add like and remove dislike if exists
        await set(likeRef, { postId, userId, likedAt: Date.now() });
        await set(dislikeRef, null); // Simple one-liner: if dislike exists, remove it
        await set(postRef, {
          ...postData,
          likes: currentLikes + 1,
          dislikes: Math.max(currentDislikes - 1, 0),
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error toggling like on post:', error);
      throw new Error('Failed to toggle like on post');
    }
  }


  /**
   * Toggle dislike on a post
   * @param postId Post ID to dislike/undislike
   * @param userId User ID who is disliking/undisliking
   */
  static async dislikePost(postId: string, userId: string): Promise<void> {
    try {
      const dislikeKey = `${postId}_${userId}`;
      const dislikeRef = ref(realtimeDb, `postDislikes/${dislikeKey}`);
      const likeKey = `${postId}_${userId}`;
      const likeRef = ref(realtimeDb, `postLikes/${likeKey}`);
      const postRef = ref(realtimeDb, `posts/${postId}`);
      
      const dislikeSnapshot = await get(dislikeRef);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        throw new Error('Post not found');
      }
      
      const postData = postSnapshot.val();
      const currentLikes = typeof postData.likes === 'number' ? postData.likes : 0;
      const currentDislikes = typeof postData.dislikes === 'number' ? postData.dislikes : 0;
      
      if (dislikeSnapshot.exists()) {
        // Remove dislike
        await set(dislikeRef, null);
        await set(postRef, {
          ...postData,
          dislikes: Math.max(currentDislikes - 1, 0),
          updatedAt: Date.now()
        });
      } else {
        // Add dislike and remove like if exists
        await set(dislikeRef, { postId, userId, dislikedAt: Date.now() });
        await set(likeRef, null); // Simple one-liner: if like exists, remove it
        await set(postRef, {
          ...postData,
          dislikes: currentDislikes + 1,
          likes: Math.max(currentLikes - 1, 0),
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error toggling dislike on post:', error);
      throw new Error('Failed to toggle dislike on post');
    }
  }


  /**
   * Check if a user has liked a post
   * @param postId Post ID to check
   * @param userId User ID to check
   * @returns Promise with boolean indicating if user liked the post
   */
  static async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    try {
      const likeKey = `${postId}_${userId}`;
      const likeRef = ref(realtimeDb, `postLikes/${likeKey}`);
      const snapshot = await get(likeRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking if user liked post:', error);
      return false;
    }
  }

  /**
   * Check if a user has disliked a post
   * @param postId Post ID to check
   * @param userId User ID to check
   * @returns Promise with boolean indicating if user disliked the post
   */
  static async hasUserDislikedPost(postId: string, userId: string): Promise<boolean> {
    try {
      const dislikeKey = `${postId}_${userId}`;
      const dislikeRef = ref(realtimeDb, `postDislikes/${dislikeKey}`);
      const snapshot = await get(dislikeRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking if user disliked post:', error);
      return false;
    }
  }

  /**
   * Get all likes for a specific post
   * @param postId Post ID to get likes for
   * @returns Promise with array of like records
   */
  static async getPostLikes(postId: string): Promise<any[]> {
    try {
      const postLikesRef = ref(realtimeDb, 'postLikes');
      const snapshot = await get(postLikesRef);
      const allLikes = snapshot.val() || {};
      
      // Filter likes for this specific post
      return Object.entries(allLikes)
        .filter(([key, likeData]: [string, any]) => likeData.postId === postId)
        .map(([key, likeData]) => likeData);
    } catch (error) {
      console.error('Error getting post likes:', error);
      return [];
    }
  }

  /**
   * Get all dislikes for a specific post
   * @param postId Post ID to get dislikes for
   * @returns Promise with array of dislike records
   */
  static async getPostDislikes(postId: string): Promise<any[]> {
    try {
      const postDislikesRef = ref(realtimeDb, 'postDislikes');
      const snapshot = await get(postDislikesRef);
      const allDislikes = snapshot.val() || {};
      
      // Filter dislikes for this specific post
      return Object.entries(allDislikes)
        .filter(([key, dislikeData]: [string, any]) => dislikeData.postId === postId)
        .map(([key, dislikeData]) => dislikeData);
    } catch (error) {
      console.error('Error getting post dislikes:', error);
      return [];
    }
  }

  /**
   * Get user's interaction with a post (like, dislike, or none)
   * @param postId Post ID to check
   * @param userId User ID to check
   * @returns Promise with interaction type: 'like', 'dislike', or 'none'
   */
  static async getUserPostInteraction(postId: string, userId: string): Promise<'like' | 'dislike' | 'none'> {
    try {
      const hasLiked = await this.hasUserLikedPost(postId, userId);
      if (hasLiked) return 'like';
      
      const hasDisliked = await this.hasUserDislikedPost(postId, userId);
      if (hasDisliked) return 'dislike';
      
      return 'none';
    } catch (error) {
      console.error('Error getting user post interaction:', error);
      return 'none';
    }
  }

  /**
   * Delete a post
   * @param postId Post ID to delete
   */
  static async deletePost(postId: string): Promise<void> {
    try {
      // Delete the post
    const postRef = ref(realtimeDb, `posts/${postId}`);
    await set(postRef, null);
      
      // Delete all likes for this post
      const postLikesRef = ref(realtimeDb, 'postLikes');
      const likesSnapshot = await get(postLikesRef);
      const allLikes = likesSnapshot.val() || {};
      
      const deleteLikesPromises = Object.entries(allLikes)
        .filter(([key, likeData]: [string, any]) => likeData.postId === postId)
        .map(([key, likeData]) => {
          const likeRef = ref(realtimeDb, `postLikes/${key}`);
          return set(likeRef, null);
        });
      
      // Delete all dislikes for this post
      const postDislikesRef = ref(realtimeDb, 'postDislikes');
      const dislikesSnapshot = await get(postDislikesRef);
      const allDislikes = dislikesSnapshot.val() || {};
      
      const deleteDislikesPromises = Object.entries(allDislikes)
        .filter(([key, dislikeData]: [string, any]) => dislikeData.postId === postId)
        .map(([key, dislikeData]) => {
          const dislikeRef = ref(realtimeDb, `postDislikes/${key}`);
          return set(dislikeRef, null);
        });
      
      await Promise.all([...deleteLikesPromises, ...deleteDislikesPromises]);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
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
      
      if (!userId || userId.trim() === '') {
        console.error('Invalid userId in updateUserPoints:', userId);
        throw new Error('Invalid userId provided');
      }
      
      const userRef = ref(realtimeDb, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      
      const updatedData = {
        ...currentData,
        ...pointsData,
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      };
      
      // Update current user data
      await set(userRef, updatedData);
      
      // Note: Daily snapshot will be created automatically by the real-time listener
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
      
      const updatedData = {
        ...currentData,
        totalPoints: newTotalPoints,
        lastActivityAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Update current user data
      await set(userRef, updatedData);
      
      // Note: Daily snapshot will be created automatically by the real-time listener
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
      
      // Update current user data
      await set(userRef, updates);
      
      // Note: Daily snapshot will be created automatically by the real-time listener
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
  static async updateSocialStats(userId: string, activityType: 'post' | 'like' | 'dislike' | 'comment' | 'share'): Promise<void> {
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
        case 'dislike':
          updates.postsDisliked = (currentData.postsDisliked || 0) + 1;
          break;
        case 'comment':
          updates.commentsMade = (currentData.commentsMade || 0) + 1;
          break;
        case 'share':
          updates.postsShared = (currentData.postsShared || 0) + 1;
          break;
      }

      updates.socialEngagement = (currentData.socialEngagement || 0) + 1;
      
      // Update current user data
      await set(userRef, updates);
      
      // Note: Daily snapshot will be created automatically by the real-time listener
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
      
      const updatedData = {
        ...currentData,
        ...profileData,
        updatedAt: Date.now()
      };
      
      // Update current user data
      await set(userRef, updatedData);
      
      // Note: Daily snapshot will be created automatically by the real-time listener
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
        
        // Automatically create/update daily snapshot when user data changes
        if (data && Object.keys(data).length > 0) {
          this.createDailyUserSnapshot(userId, data);
        }
        
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
      'work': '#FF3B30',
      'personal': '#34C759', 
      'health': '#FF9500',
      'learning': '#007AFF',
      'finance': '#5856D6',
      'other': '#8E8E93'
    };
    return colors[category] || '#2196F3';
  }

  /**
   * Get icon for category
   * @param category Category name
   * @returns Icon name
   */
  private static getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'work': 'briefcase',
      'personal': 'house',
      'health': 'heart',
      'learning': 'book',
      'finance': 'dollarsign',
      'other': 'circle'
    };
    return icons[category] || 'circle';
  }

  /**
   * Start automatic daily snapshot listener for a user
   * This will automatically create/update snapshots whenever user data changes
   * @param userId User ID to start listening for
   * @returns Unsubscribe function
   */
  static startAutomaticSnapshotListener(userId: string): () => void {
    const userRef = ref(realtimeDb, `users/${userId}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      try {
      const data = snapshot.val();
      
        // Automatically create/update daily snapshot when user data changes
        if (data && Object.keys(data).length > 0) {
          this.createDailyUserSnapshot(userId, data);
        }
    } catch (error) {
        console.error('Error in automatic snapshot listener:', error);
      }
    }, (error: any) => {
      console.error('Error in automatic snapshot listener:', error);
    });
    
    return unsubscribe;
  }

  /**
   * Create or update daily user snapshot
   * @param userId User ID to create/update snapshot for
   * @param userData Current user data to snapshot
   */
  static async createDailyUserSnapshot(userId: string, userData: any): Promise<void> {
    try {
      // Validate inputs
      if (!userId || userId.trim() === '') {
        return;
      }
      
      if (!userData || typeof userData !== 'object') {
        return;
      }
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const snapshotRef = ref(realtimeDb, `userDailySnapshots/${userId}/${today}`);
      
      // Check if snapshot already exists for today
      const existingSnapshot = await get(snapshotRef);
      const isUpdate = existingSnapshot.exists();
      
      // Get user's tasks for separate task snapshots
      const userTasks = await this.getUserTasks(userId);
      
      // Create/update snapshot without nested tasks
      const snapshotData = {
        // Basic user data
        ...userData,
        snapshotDate: today,
        snapshotTimestamp: Date.now(),
        updatedAt: Date.now(),
        // Only set createdAt if this is a new snapshot
        ...(isUpdate ? {} : { createdAt: Date.now() })
      };
      
      await set(snapshotRef, snapshotData);
      
      // Create separate task daily snapshots
      await this.createTaskDailySnapshots(userId, today, userTasks);
      
    } catch (error: any) {
      console.error('Error creating/updating daily user snapshot:', error);
      // Don't throw error - snapshot creation shouldn't break main functionality
    }
  }

  /**
   * Create task daily snapshots for a user
   * @param userId User ID
   * @param date Date string (YYYY-MM-DD)
   * @param userTasks User's tasks data
   */
  static async createTaskDailySnapshots(userId: string, date: string, userTasks: any): Promise<void> {
    try {
      const taskSnapshotsRef = ref(realtimeDb, `taskDailySnapshots/${userId}/${date}`);
      
      // Get points from pointsActivity for this date
      const pointsForDate = await this.getPointsForDate(userId, date);
      
      // Count completed tasks for this date
      const completedTasks = Object.values(userTasks).filter((task: any) => task.completed);
      const completedCount = completedTasks.length;
      
      // Calculate points per completed task
      const pointsPerTask = completedCount > 0 ? Math.floor(pointsForDate / completedCount) : 0;
      const remainingPoints = pointsForDate - (pointsPerTask * completedCount);
      
      // Create snapshot for each task
      const taskSnapshots: any = {};
      let taskIndex = 0;
      
      Object.entries(userTasks).forEach(([taskId, taskData]: [string, any]) => {
        let taskPoints = 0;
        
        // Give points to completed tasks
        if (taskData.completed) {
          taskPoints = pointsPerTask;
          // Give remaining points to the first completed task
          if (taskIndex === 0 && remainingPoints > 0) {
            taskPoints += remainingPoints;
          }
          taskIndex++;
        }
        
        taskSnapshots[taskId] = {
          taskId,
          userId,
          date,
          title: taskData.title || 'Untitled Task',
          category: taskData.category || 'other',
          priority: taskData.priority || 'medium',
          completed: taskData.completed || false,
          points: taskPoints, // Use calculated points from pointsActivity
          hoursTracked: taskData.hoursTracked || 0,
          completedAt: taskData.completedAt || null,
          createdAt: taskData.createdAt,
          updatedAt: taskData.updatedAt,
          snapshotTimestamp: Date.now()
        };
      });

      await set(taskSnapshotsRef, taskSnapshots);
    } catch (error) {
      console.error('Error creating task daily snapshots:', error);
    }
  }

  /**
   * Get points earned for a specific date from pointsActivity
   * @param userId User ID
   * @param date Date string (YYYY-MM-DD)
   * @returns Promise with total points for the date
   */
  static async getPointsForDate(userId: string, date: string): Promise<number> {
    try {
      const activitiesRef = ref(realtimeDb, 'pointsActivity');
      const snapshot = await get(activitiesRef);
      const data = snapshot.val();
      
      if (!data) return 0;
      
      let totalPoints = 0;
      const targetDate = new Date(date).toISOString().split('T')[0];
      
      Object.values(data).forEach((activity: any) => {
        if (activity.userId === userId) {
          const activityDate = new Date(activity.timestamp || activity.createdAt).toISOString().split('T')[0];
          if (activityDate === targetDate) {
            totalPoints += activity.points || 0;
          }
        }
      });
      
      return totalPoints;
    } catch (error) {
      console.error('Error getting points for date:', error);
      return 0;
    }
  }

  /**
   * Get user's tasks for snapshot
   * @param userId User ID to get tasks for
   * @returns Promise with user's tasks organized by category
   */
  static async getUserTasks(userId: string): Promise<any> {
    try {
      const tasksRef = ref(realtimeDb, 'tasks');
      const snapshot = await get(tasksRef);
      const allTasks = snapshot.val() || {};
      
      // Filter tasks for this user
      const userTasks: any = {};
      Object.entries(allTasks).forEach(([taskId, taskData]: [string, any]) => {
        if (taskData.userId === userId) {
          userTasks[taskId] = {
            id: taskId,
            title: taskData.title || 'Untitled Task',
            category: taskData.category || 'other',
            priority: taskData.priority || 'medium',
            completed: taskData.completed || false,
            points: taskData.points || 0,
            hoursTracked: taskData.hoursTracked || 0,
            completedAt: taskData.completedAt || null,
            createdAt: taskData.createdAt,
            updatedAt: taskData.updatedAt
          };
        }
      });
      
      return userTasks;
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return {};
    }
  }

  /**
   * Get task daily snapshots for a user
   * @param userId User ID
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Promise with task snapshots
   */
  static async getTaskDailySnapshots(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      console.log(`📊 Getting task snapshots for user ${userId}, date range: ${startDate} to ${endDate}`);
      const taskSnapshotsRef = ref(realtimeDb, `taskDailySnapshots/${userId}`);
      
      let snapshot;
      if (startDate && endDate) {
        const queryRef = query(
          taskSnapshotsRef,
          orderByKey(),
          startAt(startDate),
          endAt(endDate)
        );
        snapshot = await get(queryRef);
      } else {
        snapshot = await get(taskSnapshotsRef);
      }
      const data = snapshot.val();
      
      console.log(`📊 Raw task snapshots data:`, data);
      
      if (!data) {
        console.log('📊 No task snapshots data found');
        return [];
      }

      const snapshots: any[] = [];
      Object.entries(data).forEach(([date, dayData]: [string, any]) => {
        console.log(`📊 Processing date ${date}:`, dayData);
        Object.entries(dayData).forEach(([taskId, taskSnapshot]: [string, any]) => {
          snapshots.push({
            id: `${userId}/${date}/${taskId}`,
            userId,
            date,
            taskId,
            ...taskSnapshot
          });
        });
      });

      console.log(`📊 Processed ${snapshots.length} task snapshots`);
      return snapshots.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } catch (error) {
      console.error('Error getting task daily snapshots:', error);
      return [];
    }
  }

  /**
   * Listen to task daily snapshots for a user
   * @param userId User ID to listen for
   * @param callback Callback function to handle updates
   * @returns Unsubscribe function
   */
  static listenToTaskDailySnapshots(userId: string, callback: (snapshots: any[]) => void): () => void {
    const taskSnapshotsRef = ref(realtimeDb, `taskDailySnapshots/${userId}`);
    
    return onValue(taskSnapshotsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        const snapshots: any[] = [];
        Object.entries(data).forEach(([date, dayData]: [string, any]) => {
          Object.entries(dayData).forEach(([taskId, taskSnapshot]: [string, any]) => {
            snapshots.push({
              id: `${userId}/${date}/${taskId}`,
            userId,
            date,
              taskId,
              ...taskSnapshot
            });
          });
        });

        callback(snapshots.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
      } catch (error) {
        console.error('Error processing task daily snapshots:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to task daily snapshots:', error);
      callback([]);
    });
  }

  /**
   * Get daily snapshots for a user
   * @param userId User ID to get snapshots for
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @returns Promise with snapshots array
   */
  static async getUserDailySnapshots(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const snapshotsRef = ref(realtimeDb, `userDailySnapshots/${userId}`);
      const snapshot = await get(snapshotsRef);
        const data = snapshot.val();
        
      if (!data) return [];
      
      let snapshots = Object.keys(data).map(date => ({
            date,
            ...data[date] 
      }));
      
      // Filter by date range if provided
      if (startDate && endDate) {
        snapshots = snapshots.filter(snapshot => 
          snapshot.date >= startDate && snapshot.date <= endDate
        );
      }
      
      // Sort by date (newest first)
      return snapshots.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error getting user daily snapshots:', error);
      throw new Error('Failed to get user daily snapshots');
    }
  }

  /**
   * Listen to user daily snapshots in real-time
   * @param userId User ID to listen to snapshots for
   * @param callback Function to call when snapshots are updated
   * @returns Unsubscribe function
   */
  static listenToUserDailySnapshots(userId: string, callback: (snapshots: any[]) => void): () => void {
    const snapshotsRef = ref(realtimeDb, `userDailySnapshots/${userId}`);
    
    const unsubscribe = onValue(snapshotsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }
        
        // Convert to array and sort by date
        const snapshots = Object.keys(data)
          .map(date => ({ date, ...data[date] }))
          .sort((a, b) => b.date.localeCompare(a.date));
        
        callback(snapshots);
      } catch (error) {
        console.error('Error processing user daily snapshots data:', error);
        callback([]);
      }
    }, (error) => {
      this.handleConnectionError(error, 'listenToUserDailySnapshots');
      callback([]);
    });
    
    return unsubscribe;
  }

  /**
   * Get daily snapshots within a date range for tracking
   * @param userId User ID to get snapshots for
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @returns Promise with snapshots data in range
   */
  static async getDailySnapshotsInRange(
    userId: string, 
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      const snapshotsRef = ref(realtimeDb, `userDailySnapshots/${userId}`);
    const queryRef = query(
        snapshotsRef, 
      orderByKey(), 
      startAt(startDate), 
      endAt(endDate)
    );
    
      const snapshot = await get(queryRef);
      const data = snapshot.val();
        
      return data ? Object.entries(data)
        .map(([date, snapshotData]) => ({
            id: `${userId}/${date}`, 
        userId,
            date,
          ...(snapshotData as any)
          }))
        .sort((a, b) => (a.date || '').localeCompare(b.date || '')) : [];
      } catch (error) {
      console.error('Error getting daily snapshots in range:', error);
      throw new Error('Failed to get daily snapshots in range');
    }
  }

  /**
   * Process snapshots data for charts (simple version)
   * @param snapshotsData - Array of daily snapshot data
   * @param timePeriod - The time period for data aggregation
   * @returns Processed data for all chart types
   */
  static processSnapshotsForCharts(snapshotsData: any[], timePeriod: string = 'week'): any {
    return {
      weeklyProgress: this.generateProgressDataFromSnapshots(snapshotsData, timePeriod),
      taskCompletionData: this.generateTaskCompletionFromSnapshots(snapshotsData),
      dailyPointsData: this.generateDailyPointsFromSnapshots(snapshotsData)
      // Categories data is now handled separately by task snapshots
    };
  }

  /**
   * Generate complete progress data from snapshots with all time periods filled
   * @param snapshots - Array of daily snapshot data
   * @param timePeriod - Time period for aggregation
   * @returns Complete progress data for charts with all days/months/years
   */
  private static generateProgressDataFromSnapshots(snapshots: any[], timePeriod: string): any[] {
    const dataMap = new Map();
    
    // First, populate with actual data
    snapshots.forEach(snapshot => {
      const date = new Date(snapshot.date);
      let groupKey: string;
      let displayLabel: string;
      
      switch (timePeriod) {
        case 'week':
          // Group by day of week
          groupKey = date.toISOString().split('T')[0];
          displayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'month':
          // Group by day of month (last 30 days)
          groupKey = date.toISOString().split('T')[0];
          displayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'year':
          // Group by month of the year
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          displayLabel = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        case 'all-time':
          // Group by quarter
          const year = date.getFullYear();
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          groupKey = `${year}-Q${quarter}`;
          displayLabel = `Q${quarter} ${year.toString().slice(-2)}`;
          break;
        default:
          groupKey = date.toISOString().split('T')[0];
          displayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      
      if (!dataMap.has(groupKey)) {
        dataMap.set(groupKey, {
          week: groupKey,
          day: displayLabel,
          hours: 0, 
          totalHours: 0,
          totalPoints: 0,
          completedTasks: 0,
          days: 0
        });
      }
      
      const data = dataMap.get(groupKey);
      const hoursToAdd = snapshot.totalHoursTracked || 0;
      data.hours += hoursToAdd;
      data.totalHours += hoursToAdd;
      data.totalPoints += (snapshot.totalPoints || 0);
      data.completedTasks += (snapshot.completedTasks || 0);
      data.days += 1;
    });
    
    // Now fill in missing time periods with zero data
    const now = new Date();
    const completeData = this.generateCompleteTimePeriodData(timePeriod, now, dataMap);
    
    return completeData.sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Generate complete time period data with all days/months/years filled
   * @param timePeriod - Time period type
   * @param now - Current date
   * @param dataMap - Map of existing data
   * @returns Complete array with all time periods
   */
  private static generateCompleteTimePeriodData(timePeriod: string, now: Date, dataMap: Map<string, any>): any[] {
    const completeData: any[] = [];
    
    switch (timePeriod) {
      case 'week':
        // Generate all 7 days of the current week starting from Monday
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6
        startOfWeek.setDate(now.getDate() - daysFromMonday); // Start from Monday
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          completeData.push(dataMap.get(dateStr) || {
            week: dateStr,
            day: dayName,
      hours: 0, 
            totalHours: 0,
            totalPoints: 0,
            completedTasks: 0,
            days: 0
          });
        }
        break;
        
      case 'month':
        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          completeData.push(dataMap.get(dateStr) || {
            week: dateStr,
            day: dayLabel,
            hours: 0,
            totalHours: 0,
            totalPoints: 0,
            completedTasks: 0,
            days: 0
          });
        }
        break;
        
      case 'year':
        // Generate current year starting from January
        const currentYear = now.getFullYear();
        for (let month = 0; month < 12; month++) {
          const date = new Date(currentYear, month, 1); // January = 0, February = 1, etc.
          const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
          
          completeData.push(dataMap.get(monthKey) || {
            week: monthKey,
            day: monthLabel,
            hours: 0,
            totalHours: 0,
            totalPoints: 0,
            completedTasks: 0,
            days: 0
          });
        }
        break;
        
      case 'all-time':
        // Generate last 8 quarters (2 years)
        const allTimeYear = now.getFullYear();
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1; // Q1=1, Q2=2, Q3=3, Q4=4
        
        // Generate quarters starting from 2 years ago
        for (let i = 7; i >= 0; i--) {
          const quartersBack = i;
          const totalMonthsBack = quartersBack * 3;
          
          const quarterDate = new Date(now);
          quarterDate.setMonth(now.getMonth() - totalMonthsBack);
          
          const year = quarterDate.getFullYear();
          const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
          const quarterKey = `${year}-Q${quarter}`;
          const quarterLabel = `Q${quarter} ${year.toString().slice(-2)}`;
          
          completeData.push(dataMap.get(quarterKey) || {
            week: quarterKey,
            day: quarterLabel,
            hours: 0,
            totalHours: 0,
            totalPoints: 0,
            completedTasks: 0,
            days: 0
          });
        }
        break;
        
      default:
        // Fallback to existing data
        return Array.from(dataMap.values());
    }
    
    return completeData;
  }

  /**
   * Generate task completion data from snapshots
   * @param snapshots - Array of daily snapshot data
   * @returns Task completion data for charts
   */
  private static generateTaskCompletionFromSnapshots(snapshots: any[]): any[] {
    // Group by date and create summary data
    const dailyData = snapshots.map(snapshot => ({
      date: snapshot.date,
      completed: snapshot.completedTasks || 0,
      total: snapshot.totalTasks || 0,
      count: snapshot.completedTasks || 0, // Add count property for selectors
      percentage: (snapshot.totalTasks && snapshot.totalTasks > 0) ? 
        Math.round((snapshot.completedTasks || 0) / snapshot.totalTasks * 100) : 0
    }));
    
    // Create summary entries for the selector
    const totalCompleted = dailyData.reduce((sum, day) => sum + day.completed, 0);
    const totalTasks = dailyData.reduce((sum, day) => sum + day.total, 0);
    
    return [
      {
        id: 'completed',
        count: totalCompleted,
        label: 'Completed',
        category: 'Completed',
        color: '#4CAF50',
        percentage: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
      },
      { 
        id: 'remaining',
        count: totalTasks - totalCompleted, 
        label: 'Remaining',
        category: 'Remaining',
        color: '#FF5722',
        percentage: totalTasks > 0 ? Math.round(((totalTasks - totalCompleted) / totalTasks) * 100) : 0
      }
    ];
  }

  /**
   * Generate daily points data from snapshots
   * @param snapshots - Array of daily snapshot data
   * @returns Daily points data for charts
   */
  private static generateDailyPointsFromSnapshots(snapshots: any[]): any[] {
    return snapshots.map(snapshot => ({
      date: snapshot.date,
      points: snapshot.totalPoints || 0,
      level: snapshot.level || 1
    }));
  }

  /**
   * Generate categories data from task snapshots
   * @param taskSnapshots - Array of task snapshot data
   * @returns Categories data for summary
   */
  static generateCategoriesFromTaskSnapshots(taskSnapshots: any[]): any[] {
    const categoryMap = new Map();
    
    taskSnapshots.forEach(taskSnapshot => {
      const category = taskSnapshot.category || 'other';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          id: category,
          category: category,
          name: category,
          hours: 0,
          totalHours: 0,
          totalPoints: 0,
          completedTasks: 0,
          color: this.getCategoryColor(category),
          icon: this.getCategoryIcon(category)
        });
      }
      
      const categoryData = categoryMap.get(category);
      if (categoryData) {
        categoryData.hours += (taskSnapshot.hoursTracked || 0);
        categoryData.totalHours += (taskSnapshot.hoursTracked || 0);
        categoryData.totalPoints += (taskSnapshot.points || 0);
        if (taskSnapshot.completed) {
          categoryData.completedTasks += 1;
        }
      }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  }

  /**
   * Generate weekly progress data from task snapshots
   * @param taskSnapshots - Array of task snapshot data
   * @param timePeriod - Time period for aggregation
   * @returns Weekly progress data for bar charts
   */
  static generateWeeklyProgressFromTaskSnapshots(taskSnapshots: any[], timePeriod: string): any[] {
    const dataMap = new Map();
    
    // First, populate with actual data
    taskSnapshots.forEach(taskSnapshot => {
      const date = new Date(taskSnapshot.date);
      let groupKey: string;
      let displayLabel: string;
    
    switch (timePeriod) {
      case 'week':
          groupKey = date.toISOString().split('T')[0];
          displayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
          groupKey = date.toISOString().split('T')[0];
          displayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case 'year':
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          displayLabel = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        case 'all-time':
          const year = date.getFullYear();
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          groupKey = `${year}-Q${quarter}`;
          displayLabel = `Q${quarter} ${year.toString().slice(-2)}`;
        break;
      default:
          groupKey = date.toISOString().split('T')[0];
          displayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      
      if (!dataMap.has(groupKey)) {
        dataMap.set(groupKey, {
          week: groupKey,
          day: displayLabel,
          hours: 0,
          totalHours: 0,
          totalPoints: 0,
          completedTasks: 0,
          days: 0
        });
      }
      
      const data = dataMap.get(groupKey);
      data.hours += (taskSnapshot.hoursTracked || 0);
      data.totalHours += (taskSnapshot.hoursTracked || 0);
      data.totalPoints += (taskSnapshot.points || 0);
      if (taskSnapshot.completed) {
        data.completedTasks += 1;
      }
      data.days += 1;
    });
    
    // Fill in missing time periods with zero data
    const now = new Date();
    const completeData = this.generateCompleteTimePeriodData(timePeriod, now, dataMap);
    
    return completeData.sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Generate task completion data from task snapshots
   * @param taskSnapshots - Array of task snapshot data
   * @returns Task completion data for pie charts
   */
  static generateTaskCompletionFromTaskSnapshots(taskSnapshots: any[]): any[] {
    // Aggregate all task completion data across all dates
    let totalCompleted = 0;
    let totalTasks = 0;
    
    taskSnapshots.forEach(taskSnapshot => {
      totalTasks += 1;
      if (taskSnapshot.completed) {
        totalCompleted += 1;
      }
    });
    
    const totalPending = totalTasks - totalCompleted;
    const completedPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    const pendingPercentage = 100 - completedPercentage;
    
    // Return data in the format expected by the UI
    return [
      {
        id: 'completed',
        category: 'Completed',
        count: totalCompleted,
        percentage: completedPercentage,
        color: '#4CAF50'
      },
      {
        id: 'pending',
        category: 'Pending',
        count: totalPending,
        percentage: pendingPercentage,
        color: '#FF5722'
      }
    ];
  }

  /**
   * Generate daily points data from task snapshots
   * @param taskSnapshots - Array of task snapshot data
   * @returns Daily points data for line charts
   */
  static generateDailyPointsFromTaskSnapshots(taskSnapshots: any[]): any[] {
    const dailyData = new Map();
    
    taskSnapshots.forEach(taskSnapshot => {
      const date = taskSnapshot.date;
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          points: 0,
          level: 1,
          activity: 'Task completed' // Default activity
        });
      }
      
      const dayData = dailyData.get(date);
      dayData.points += (taskSnapshot.points || 0);
      // Simple level calculation based on points
      dayData.level = Math.floor(dayData.points / 100) + 1;
      
      // Update activity based on task completion
      if (taskSnapshot.completed) {
        dayData.activity = `Completed: ${taskSnapshot.title}`;
      }
    });
    
    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate categories data from snapshots (legacy - uses nested tasks)
   * @param snapshots - Array of daily snapshot data
   * @returns Categories data for summary
   */
  private static generateCategoriesFromSnapshots(snapshots: any[]): any[] {
    const categoryMap = new Map();
    
    snapshots.forEach(snapshot => {
      // Extract category data from snapshot tasks
      const tasks = snapshot.tasks || {};
      
      Object.entries(tasks).forEach(([taskId, taskData]: [string, any]) => {
        const category = taskData.category || 'other';
        
        if (!categoryMap.has(category)) {
        categoryMap.set(category, {
            id: category,
            category: category,
            name: category,
            hours: 0,
            totalHours: 0,
            totalPoints: 0,
            completedTasks: 0,
          color: this.getCategoryColor(category),
          icon: this.getCategoryIcon(category)
        });
      }
        
        const categoryData = categoryMap.get(category);
        if (categoryData) {
          categoryData.hours += (taskData.hoursTracked || 0);
          categoryData.totalHours += (taskData.hoursTracked || 0);
          categoryData.totalPoints += (taskData.points || 0);
          if (taskData.completed) {
            categoryData.completedTasks += 1;
          }
        }
      });
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  }


}
