import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  FieldValue,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../utils/firebase/config';

// Types
export interface User {
  userId: string;
  email: string;
  displayName: string;
  avatar?: string;
  username?: string;
  bio?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastActiveAt: Timestamp | FieldValue;
  isActive: boolean;
  
  // Profile & Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      push: boolean;
      email: boolean;
      likes: boolean;
      comments: boolean;
      follows: boolean;
      achievements: boolean;
    };
    privacy: 'public' | 'private' | 'friends-only';
    language: string;
    timezone: string;
  };
  
  // Task Management Stats
  taskStats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    currentStreak: number;
    longestStreak: number;
    streakStartDate?: Timestamp;
    tasksCompletedToday: number;
    tasksCompletedThisWeek: number;
    tasksCompletedThisMonth: number;
    averageCompletionTime: number; // in minutes
    productivityScore: number; // 0-100
  };
  
  // Time Tracking Stats
  timeTracking: {
    totalTimeTracked: number; // in minutes
    totalSessions: number;
    averageSessionLength: number; // in minutes
    timeTrackedToday: number;
    timeTrackedThisWeek: number;
    timeTrackedThisMonth: number;
    mostProductiveHour: number; // 0-23
    mostProductiveDay: string; // 'Monday', 'Tuesday', etc.
    pomodoroSessionsCompleted: number;
    breakTimeTotal: number; // in minutes
  };
  
  // Achievement & Gamification
  achievements: {
    totalPoints: number;
    level: number;
    experience: number;
    experienceToNextLevel: number;
    badgesEarned: string[]; // Array of badge IDs
    badgesProgress: {
      [badgeId: string]: {
        currentProgress: number;
        targetProgress: number;
        isCompleted: boolean;
        completedAt?: Timestamp;
      };
    };
    achievementsUnlocked: number;
    totalAchievements: number;
    completionPercentage: number;
  };
  
  // Social Media Stats
  socialStats: {
    postsCreated: number;
    postsLiked: number;
    postsShared: number;
    postsSaved: number;
    commentsMade: number;
    followersCount: number;
    followingCount: number;
    totalLikesReceived: number;
    totalCommentsReceived: number;
    totalSharesReceived: number;
    totalViewsReceived: number;
    engagementRate: number; // (likes + comments + shares) / views
    socialScore: number; // 0-100
  };
  
  // Productivity Analytics
  analytics: {
    dailyGoalCompletion: {
      [date: string]: {
        tasksCompleted: number;
        goal: number;
        completed: boolean;
      };
    };
    weeklyProductivity: {
      [week: string]: {
        tasksCompleted: number;
        timeTracked: number;
        productivityScore: number;
      };
    };
    monthlyInsights: {
      [month: string]: {
        tasksCompleted: number;
        timeTracked: number;
        achievementsEarned: number;
        socialEngagement: number;
        productivityTrend: 'up' | 'down' | 'stable';
      };
    };
    bestPerformingCategories: {
      categoryId: string;
      tasksCompleted: number;
      averageRating: number;
    }[];
    peakProductivityTimes: {
      hour: number;
      productivityScore: number;
    }[];
  };
  
  // Goals & Targets
  goals: {
    dailyTaskGoal: number;
    weeklyTaskGoal: number;
    monthlyTaskGoal: number;
    dailyTimeGoal: number; // in minutes
    weeklyTimeGoal: number; // in minutes
    socialEngagementGoal: number; // posts per week
    streakGoal: number; // days
    achievementGoal: number; // badges per month
  };
  
  // Settings & Configuration
  settings: {
    pomodoroLength: number;
    shortBreak: number;
    longBreak: number;
    workHours: {
      start: string;
      end: string;
    };
    reminderSettings: {
      taskReminders: boolean;
      breakReminders: boolean;
      goalReminders: boolean;
      achievementNotifications: boolean;
    };
    dataExport: {
      lastExportDate?: Timestamp;
      exportFrequency: 'weekly' | 'monthly' | 'quarterly';
    };
  };
  
  // User Status & Activity
  status: {
    isOnline: boolean;
    currentActivity?: 'working' | 'break' | 'social' | 'offline';
    currentTaskId?: string;
    sessionStartTime?: Timestamp;
    breakStartTime?: Timestamp;
    lastLoginAt: Timestamp | FieldValue;
    loginStreak: number;
    totalLoginDays: number;
  };
  
  // Verification & Security
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastPasswordChange: Timestamp | FieldValue;
    securityScore: number; // 0-100
  };
  
  // Subscription & Premium Features
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    startDate: Timestamp | FieldValue;
    endDate?: Timestamp;
    features: string[];
    usageLimits: {
      maxTasksPerDay: number;
      maxProjects: number;
      maxTeamMembers: number;
      advancedAnalytics: boolean;
      customThemes: boolean;
      prioritySupport: boolean;
    };
  };
}

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: Timestamp;
  dueTime?: string;
  tags?: string[];
  subtasks?: Subtask[];
  timeSpent: number;
  estimatedTime?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  isSelected: boolean;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
}

export interface Post {
  postId: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  userUsername?: string;
  
  // Content
  content: string;
  type: 'general' | 'achievement' | 'task' | 'question' | 'motivation' | 'progress' | 'milestone' | 'tip' | 'challenge';
  
  // Media
  media?: {
    images?: string[];
    videos?: string[];
    gifs?: string[];
    audio?: string[];
  };
  
  // Location & Context
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    address?: string;
  };
  
  // Engagement Metrics (real-time)
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    saves: number; // Bookmark/save functionality
    reactions: {
      like: number;
      love: number;
      laugh: number;
      wow: number;
      sad: number;
      angry: number;
    };
  };
  
  // Social Features
  hashtags?: string[];
  mentions?: string[];
  taggedUsers?: string[]; // Array of user IDs
  
  // Content Relationships
  relatedTaskId?: string;
  achievementId?: string;
  parentPostId?: string; // For replies/threads
  threadPosts?: string[]; // Array of post IDs in the thread
  
  // Visibility & Privacy
  visibility: 'public' | 'followers' | 'private' | 'close-friends';
  isPinned?: boolean; // User can pin posts to their profile
  
  // Moderation & Safety
  isReported?: boolean;
  reportCount?: number;
  isHidden?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'flagged';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  scheduledAt?: Timestamp; // For scheduled posts
  publishedAt?: Timestamp; // When actually published
  
  // Analytics & Performance
  analytics?: {
    reach: number; // How many unique users saw the post
    impressions: number; // Total number of times post was displayed
    engagementRate: number; // (likes + comments + shares) / views
    clickThroughRate?: number;
    shareRate?: number;
  };
  
  // User Interactions (for current user)
  userInteractions?: {
    hasLiked?: boolean;
    hasShared?: boolean;
  };
}

export interface Category {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isDefault: boolean;
  userId?: string;
  createdAt: Timestamp;
}

export interface Tag {
  tagId: string;
  name: string;
  color: string;
  userId?: string;
  usageCount: number;
  createdAt: Timestamp;
}

export interface AchievementBadge {
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  category: 'task' | 'streak' | 'productivity' | 'social' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  badgeType: 'completion' | 'milestone' | 'streak' | 'time-based' | 'social';
  badgeProgressTarget: number;
  createdAt: Timestamp;
}

export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  userUsername?: string;
  content: string;
  parentCommentId?: string; // For nested replies
  replies?: string[]; // Array of comment IDs
  engagement: {
    likes: number;
    replies: number;
  };
  isEdited?: boolean;
  editedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostReaction {
  reactionId: string;
  postId: string;
  userId: string;
  reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  createdAt: Timestamp;
}

export interface PostLike {
  likeId: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface PostShare {
  shareId: string;
  postId: string;
  userId: string;
  shareType: 'native' | 'copy-link' | 'embed';
  sharedTo?: string; // Platform or method
  createdAt: Timestamp;
}

export interface PostView {
  viewId: string;
  postId: string;
  userId?: string; // Anonymous views allowed
  viewDuration?: number; // Time spent viewing in seconds
  viewSource: 'feed' | 'profile' | 'hashtag' | 'search' | 'direct';
  createdAt: Timestamp;
}

export interface PostSave {
  saveId: string;
  postId: string;
  userId: string;
  folderId?: string; // Optional folder organization
  createdAt: Timestamp;
}


export interface UserFollow {
  followId: string;
  followerId: string; // User who is following
  followingId: string; // User being followed
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  notificationId: string;
  userId: string; // Recipient
  fromUserId?: string; // Who triggered the notification
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'achievement' | 'system';
  title: string;
  message: string;
  data?: {
    postId?: string;
    commentId?: string;
    achievementId?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: Timestamp;
}

// Analytics Data Structures for Tracking UI

export interface TimeTrackingSession {
  sessionId: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // in minutes
  description?: string;
  tags?: string[];
  productivityRating?: number; // 1-5
  breakTaken: boolean;
  breakDuration?: number; // in minutes
  createdAt: Timestamp;
}

export interface DailyAnalytics {
  analyticsId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  totalHoursTracked: number;
  totalSessions: number;
  categories: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    hours: number;
    sessions: number;
    productivityScore: number; // 0-100
  }[];
  tasksCompleted: number;
  tasksPending: number;
  tasksOverdue: number;
  pointsEarned: number;
  productivityScore: number; // 0-100
  goals: {
    dailyTaskGoal: number;
    dailyTimeGoal: number; // in minutes
    tasksCompleted: number;
    timeTracked: number; // in minutes
    tasksGoalMet: boolean;
    timeGoalMet: boolean;
  };
  insights: {
    mostProductiveHour: number;
    mostProductiveCategory: string;
    averageSessionLength: number;
    longestBreak: number;
    focusScore: number; // 0-100
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeeklyAnalytics {
  analyticsId: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD format
  weekEnd: string; // YYYY-MM-DD format
  weeklyData: {
    day: string; // 'Mon', 'Tue', etc.
    date: string; // YYYY-MM-DD
    hours: number;
    tasksCompleted: number;
    pointsEarned: number;
    productivityScore: number;
    categories: {
      categoryId: string;
      hours: number;
    }[];
  }[];
  totals: {
    totalHours: number;
    totalTasksCompleted: number;
    totalPointsEarned: number;
    averageProductivityScore: number;
    totalSessions: number;
  };
  goals: {
    weeklyTaskGoal: number;
    weeklyTimeGoal: number; // in minutes
    tasksCompleted: number;
    timeTracked: number; // in minutes
    tasksGoalMet: boolean;
    timeGoalMet: boolean;
  };
  trends: {
    productivityTrend: 'up' | 'down' | 'stable';
    timeTrackingTrend: 'up' | 'down' | 'stable';
    taskCompletionTrend: 'up' | 'down' | 'stable';
    bestDay: string;
    worstDay: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MonthlyAnalytics {
  analyticsId: string;
  userId: string;
  month: string; // YYYY-MM format
  monthlyData: {
    week: string; // 'Week 1', 'Week 2', etc.
    weekStart: string;
    weekEnd: string;
    tasksCompleted: number;
    timeTracked: number;
    productivityScore: number;
    achievementsEarned: number;
    socialEngagement: number;
  }[];
  totals: {
    totalHoursTracked: number;
    totalTasksCompleted: number;
    totalPointsEarned: number;
    averageProductivityScore: number;
    totalSessions: number;
    achievementsEarned: number;
    socialPostsCreated: number;
    socialEngagement: number;
  };
  categories: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalHours: number;
    averageSessionLength: number;
    productivityScore: number;
    sessionsCount: number;
  }[];
  goals: {
    monthlyTaskGoal: number;
    monthlyTimeGoal: number; // in minutes
    monthlyAchievementGoal: number;
    tasksCompleted: number;
    timeTracked: number; // in minutes
    achievementsEarned: number;
    allGoalsMet: boolean;
  };
  insights: {
    mostProductiveCategory: string;
    mostProductiveWeek: string;
    averageDailyHours: number;
    consistencyScore: number; // 0-100
    improvementAreas: string[];
    strengths: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PointsActivity {
  activityId: string;
  userId: string;
  timestamp: Timestamp;
  time: string; // 'HH:MM AM/PM' format
  points: number;
  totalPoints: number; // cumulative points for the day
  activity: string;
  activityType: 'task' | 'achievement' | 'social' | 'streak' | 'bonus';
  categoryId?: string;
  taskId?: string;
  achievementId?: string;
  postId?: string;
  pointsBreakdown: {
    basePoints: number;
    bonusPoints: number;
    streakBonus: number;
    categoryBonus: number;
  };
  createdAt: Timestamp;
}

export interface TaskCompletionAnalytics {
  analyticsId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalTasks: number;
  completionRate: number; // percentage
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    completed: number;
    pending: number;
    overdue: number;
    total: number;
    completionRate: number;
  }[];
  priorityBreakdown: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    completed: number;
    pending: number;
    overdue: number;
    total: number;
  }[];
  timeBreakdown: {
    completedOnTime: number;
    completedLate: number;
    averageCompletionTime: number; // in minutes
    fastestCompletion: number; // in minutes
    slowestCompletion: number; // in minutes
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Service
export class UserService {
  // Create a new user with default values
  static async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const defaultUser: Partial<User> = {
      userId,
      email: userData.email || '',
      displayName: userData.displayName || '',
      avatar: userData.avatar,
      username: userData.username,
      bio: userData.bio,
      isActive: true,
      preferences: {
        theme: 'auto',
        notifications: {
          push: true,
          email: true,
          likes: true,
          comments: true,
          follows: true,
          achievements: true
        },
        privacy: 'public',
        language: 'en',
        timezone: 'UTC'
      },
      taskStats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompletedToday: 0,
        tasksCompletedThisWeek: 0,
        tasksCompletedThisMonth: 0,
        averageCompletionTime: 0,
        productivityScore: 0
      },
      timeTracking: {
        totalTimeTracked: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        timeTrackedToday: 0,
        timeTrackedThisWeek: 0,
        timeTrackedThisMonth: 0,
        mostProductiveHour: 9,
        mostProductiveDay: 'Monday',
        pomodoroSessionsCompleted: 0,
        breakTimeTotal: 0
      },
      achievements: {
        totalPoints: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        badgesEarned: [],
        badgesProgress: {},
        achievementsUnlocked: 0,
        totalAchievements: 5, // Based on our achievement badges
        completionPercentage: 0
      },
      socialStats: {
        postsCreated: 0,
        postsLiked: 0,
        postsShared: 0,
        postsSaved: 0,
        commentsMade: 0,
        followersCount: 0,
        followingCount: 0,
        totalLikesReceived: 0,
        totalCommentsReceived: 0,
        totalSharesReceived: 0,
        totalViewsReceived: 0,
        engagementRate: 0,
        socialScore: 0
      },
      analytics: {
        dailyGoalCompletion: {},
        weeklyProductivity: {},
        monthlyInsights: {},
        bestPerformingCategories: [],
        peakProductivityTimes: []
      },
      goals: {
        dailyTaskGoal: 5,
        weeklyTaskGoal: 25,
        monthlyTaskGoal: 100,
        dailyTimeGoal: 240, // 4 hours
        weeklyTimeGoal: 1200, // 20 hours
        socialEngagementGoal: 3, // posts per week
        streakGoal: 7, // days
        achievementGoal: 2 // badges per month
      },
      settings: {
        pomodoroLength: 25,
        shortBreak: 5,
        longBreak: 15,
        workHours: {
          start: '09:00',
          end: '17:00'
        },
        reminderSettings: {
          taskReminders: true,
          breakReminders: true,
          goalReminders: true,
          achievementNotifications: true
        },
        dataExport: {
          exportFrequency: 'monthly'
        }
      },
      status: {
        isOnline: false,
        currentActivity: 'offline',
        lastLoginAt: serverTimestamp(),
        loginStreak: 0,
        totalLoginDays: 0
      },
      verification: {
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastPasswordChange: serverTimestamp(),
        securityScore: 0
      },
      subscription: {
        plan: 'free',
        startDate: serverTimestamp(),
        features: ['basic-tasks', 'basic-analytics'],
        usageLimits: {
          maxTasksPerDay: 50,
          maxProjects: 5,
          maxTeamMembers: 0,
          advancedAnalytics: false,
          customThemes: false,
          prioritySupport: false
        }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    };

    await setDoc(userRef, {
      ...defaultUser,
      ...userData
    });
  }

  // Get user data
  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as User) : null;
  }

  // Update user data
  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // Update user activity status
  static async updateUserStatus(userId: string, status: Partial<User['status']>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'status': status,
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // Update task statistics
  static async updateTaskStats(userId: string, taskStats: Partial<User['taskStats']>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'taskStats': taskStats,
      updatedAt: serverTimestamp()
    });
  }

  // Update time tracking stats
  static async updateTimeTracking(userId: string, timeTracking: Partial<User['timeTracking']>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'timeTracking': timeTracking,
      updatedAt: serverTimestamp()
    });
  }

  // Update achievement progress
  static async updateAchievementProgress(userId: string, badgeId: string, progress: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`achievements.badgesProgress.${badgeId}.currentProgress`]: progress,
      updatedAt: serverTimestamp()
    });
  }

  // Award achievement badge
  static async awardBadge(userId: string, badgeId: string, points: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'achievements.badgesEarned': serverTimestamp(), // This will be handled by Cloud Function
      'achievements.totalPoints': serverTimestamp(), // This will be handled by Cloud Function
      [`achievements.badgesProgress.${badgeId}.isCompleted`]: true,
      [`achievements.badgesProgress.${badgeId}.completedAt`]: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // Update social media stats
  static async updateSocialStats(userId: string, socialStats: Partial<User['socialStats']>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'socialStats': socialStats,
      updatedAt: serverTimestamp()
    });
  }

  // Update daily goals
  static async updateDailyGoals(userId: string, date: string, tasksCompleted: number, goal: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`analytics.dailyGoalCompletion.${date}`]: {
        tasksCompleted,
        goal,
        completed: tasksCompleted >= goal
      },
      updatedAt: serverTimestamp()
    });
  }

  // Get user leaderboard data
  static async getLeaderboardData(limitCount: number = 50): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('achievements.totalPoints', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as User));
  }

  // Get users by activity level
  static async getMostActiveUsers(limitCount: number = 50): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('taskStats.productivityScore', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as User));
  }

  // Listen to user changes in real-time
  static async listenToUser(userId: string, callback: (user: User | null) => void): Promise<() => void> {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      callback(doc.exists() ? (doc.data() as User) : null);
    });
  }

  // Search users
  static async searchUsers(searchTerm: string, limitCount: number = 20): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as User));
  }

  // Get user analytics summary
  static async getUserAnalytics(userId: string): Promise<User['analytics'] | null> {
    const user = await this.getUser(userId);
    return user ? user.analytics : null;
  }
}

// Task Service
export class TaskService {
  static async createTask(taskData: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getTask(taskId: string): Promise<Task | null> {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    return taskSnap.exists() ? { taskId, ...taskSnap.data() } as Task : null;
  }

  static async getTasksByUser(userId: string, limitCount: number = 50): Promise<Task[]> {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() } as Task));
  }

  static async getTasksByCategory(userId: string, category: string): Promise<Task[]> {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() } as Task));
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  }

  static listenToUserTasks(userId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() } as Task));
      callback(tasks);
    });
  }
}

// Post Service
export class PostService {
  static async createPost(postData: Omit<Post, 'postId' | 'createdAt' | 'updatedAt' | 'engagement'>): Promise<string> {
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      ...postData,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        saves: 0,
        reactions: {
          like: 0,
          love: 0,
          laugh: 0,
          wow: 0,
          sad: 0,
          angry: 0
        }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getPosts(limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  static async getPostsByUser(userId: string, limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  static listenToPosts(callback: (posts: Post[]) => void): () => void {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
      callback(posts);
    });
  }

  // Like a post
  static async likePost(postId: string, userId: string): Promise<void> {
    const likeRef = doc(collection(db, 'postLikes'));
    await setDoc(likeRef, {
      postId,
      userId,
      createdAt: serverTimestamp()
    });
  }

  // Unlike a post
  static async unlikePost(postId: string, userId: string): Promise<void> {
    const postLikesRef = collection(db, 'postLikes');
    const q = query(
      postLikesRef,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // Share a post
  static async sharePost(postId: string, userId: string, shareType: 'native' | 'copy-link' | 'embed' = 'native'): Promise<void> {
    const shareRef = doc(collection(db, 'postShares'));
    await setDoc(shareRef, {
      postId,
      userId,
      shareType,
      createdAt: serverTimestamp()
    });
  }

  // Get posts by hashtag
  static async getPostsByHashtag(hashtag: string, limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('hashtags', 'array-contains', hashtag),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  // Get posts by type
  static async getPostsByType(type: string, limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('type', '==', type),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  // Track post view (for admin analytics)
  static async trackPostView(postId: string, userId: string | null, viewDuration?: number, viewSource: 'feed' | 'profile' | 'hashtag' | 'search' | 'direct' = 'feed'): Promise<void> {
    const viewRef = doc(collection(db, 'postViews'));
    await setDoc(viewRef, {
      postId,
      userId: userId || null, // Allow anonymous views
      viewDuration,
      viewSource,
      createdAt: serverTimestamp()
    });
  }

  // Save a post (bookmark functionality)
  static async savePost(postId: string, userId: string, folderId?: string): Promise<void> {
    const saveRef = doc(collection(db, 'postSaves'));
    await setDoc(saveRef, {
      postId,
      userId,
      folderId,
      createdAt: serverTimestamp()
    });
  }

  // Remove saved post
  static async unsavePost(postId: string, userId: string): Promise<void> {
    const postSavesRef = collection(db, 'postSaves');
    const q = query(
      postSavesRef,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // Get view analytics for admin (posts with highest engagement)
  static async getMostViewedPosts(limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('analytics.impressions', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  // Get posts with highest engagement rate (for admin)
  static async getHighestEngagementPosts(limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('analytics.engagementRate', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  // Delete a post
  static async deletePost(postId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  }
}

// Comment Service
export class CommentService {
  static async createComment(commentData: Omit<Comment, 'commentId' | 'createdAt' | 'updatedAt' | 'engagement'>): Promise<string> {
    const commentsRef = collection(db, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...commentData,
      engagement: {
        likes: 0,
        replies: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getCommentsByPost(postId: string, limitCount: number = 50): Promise<Comment[]> {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      where('parentCommentId', '==', null), // Top-level comments only
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ commentId: doc.id, ...doc.data() } as Comment));
  }

  static async getCommentReplies(parentCommentId: string): Promise<Comment[]> {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('parentCommentId', '==', parentCommentId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ commentId: doc.id, ...doc.data() } as Comment));
  }

  static async likeComment(commentId: string, userId: string): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    const likeRef = doc(collection(db, 'commentLikes'));
    
    await setDoc(likeRef, {
      commentId,
      userId,
      createdAt: serverTimestamp()
    });
    
    await updateDoc(commentRef, {
      updatedAt: serverTimestamp()
    });
  }
}

// User Follow Service
export class UserFollowService {
  static async followUser(followerId: string, followingId: string): Promise<string> {
    const followRef = doc(collection(db, 'userFollows'));
    await setDoc(followRef, {
      followerId,
      followingId,
      status: 'accepted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return followRef.id;
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const followsRef = collection(db, 'userFollows');
    const q = query(
      followsRef,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  static async getFollowers(userId: string): Promise<UserFollow[]> {
    const followsRef = collection(db, 'userFollows');
    const q = query(
      followsRef,
      where('followingId', '==', userId),
      where('status', '==', 'accepted'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ followId: doc.id, ...doc.data() } as UserFollow));
  }

  static async getFollowing(userId: string): Promise<UserFollow[]> {
    const followsRef = collection(db, 'userFollows');
    const q = query(
      followsRef,
      where('followerId', '==', userId),
      where('status', '==', 'accepted'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ followId: doc.id, ...doc.data() } as UserFollow));
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const followsRef = collection(db, 'userFollows');
    const q = query(
      followsRef,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId),
      where('status', '==', 'accepted')
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}

// Notification Service
export class NotificationService {
  static async createNotification(notificationData: Omit<Notification, 'notificationId' | 'createdAt'>): Promise<string> {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ notificationId: doc.id, ...doc.data() } as Notification));
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);
  }
}

// Category Service
export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const q = query(
      categoriesRef,
      orderBy('isDefault', 'desc'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ categoryId: doc.id, ...doc.data() } as Category));
  }

  static async getDefaultCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const q = query(
      categoriesRef,
      where('isDefault', '==', true),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ categoryId: doc.id, ...doc.data() } as Category));
  }
}

// Tag Service
export class TagService {
  static async getTags(): Promise<Tag[]> {
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, orderBy('usageCount', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ tagId: doc.id, ...doc.data() } as Tag));
  }

  static async getPopularTags(limitCount: number = 20): Promise<Tag[]> {
    const tagsRef = collection(db, 'tags');
    const q = query(
      tagsRef,
      orderBy('usageCount', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ tagId: doc.id, ...doc.data() } as Tag));
  }
}

// Achievement Badge Service
export class AchievementBadgeService {
  static async getAchievementBadges(): Promise<AchievementBadge[]> {
    const badgesRef = collection(db, 'achievementBadges');
    const q = query(badgesRef, orderBy('points', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ badgeId: doc.id, ...doc.data() } as AchievementBadge));
  }

  static async getBadgesByCategory(category: string): Promise<AchievementBadge[]> {
    const badgesRef = collection(db, 'achievementBadges');
    const q = query(
      badgesRef,
      where('category', '==', category),
      orderBy('points', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ badgeId: doc.id, ...doc.data() } as AchievementBadge));
  }

  static async getBadgesByRarity(rarity: string): Promise<AchievementBadge[]> {
    const badgesRef = collection(db, 'achievementBadges');
    const q = query(
      badgesRef,
      where('rarity', '==', rarity),
      orderBy('points', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ badgeId: doc.id, ...doc.data() } as AchievementBadge));
  }

  static async getBadgesByType(badgeType: string): Promise<AchievementBadge[]> {
    const badgesRef = collection(db, 'achievementBadges');
    const q = query(
      badgesRef,
      where('badgeType', '==', badgeType),
      orderBy('points', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ badgeId: doc.id, ...doc.data() } as AchievementBadge));
  }
}

// Analytics Service
export class AnalyticsService {
  // Time Tracking Session Management
  static async createTimeTrackingSession(sessionData: Omit<TimeTrackingSession, 'sessionId' | 'createdAt'>): Promise<string> {
    const sessionsRef = collection(db, 'timeTrackingSessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getTimeTrackingSessions(userId: string, startDate: string, endDate: string): Promise<TimeTrackingSession[]> {
    const sessionsRef = collection(db, 'timeTrackingSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({ sessionId: doc.id, ...doc.data() } as TimeTrackingSession))
      .filter(session => {
        const sessionDate = session.startTime.toDate().toISOString().split('T')[0];
        return sessionDate >= startDate && sessionDate <= endDate;
      });
  }

  // Daily Analytics
  static async getDailyAnalytics(userId: string, date: string): Promise<DailyAnalytics | null> {
    const analyticsRef = collection(db, 'dailyAnalytics');
    const q = query(
      analyticsRef,
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? 
      ({ analyticsId: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as DailyAnalytics) : null;
  }

  static async getWeeklyAnalytics(userId: string, weekStart: string): Promise<WeeklyAnalytics | null> {
    const analyticsRef = collection(db, 'weeklyAnalytics');
    const q = query(
      analyticsRef,
      where('userId', '==', userId),
      where('weekStart', '==', weekStart)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? 
      ({ analyticsId: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as WeeklyAnalytics) : null;
  }

  // Points Activity Tracking
  static async getDailyPointsActivity(userId: string, date: string): Promise<PointsActivity[]> {
    const activitiesRef = collection(db, 'pointsActivity');
    const q = query(
      activitiesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({ activityId: doc.id, ...doc.data() } as PointsActivity))
      .filter(activity => {
        const activityDate = activity.timestamp.toDate().toISOString().split('T')[0];
        return activityDate === date;
      });
  }

  // Task Completion Analytics
  static async getTaskCompletionAnalytics(userId: string, date: string): Promise<TaskCompletionAnalytics | null> {
    const analyticsRef = collection(db, 'taskCompletionAnalytics');
    const q = query(
      analyticsRef,
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? 
      ({ analyticsId: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as TaskCompletionAnalytics) : null;
  }

  // Chart Data Generation Methods
  static async getBarChartData(userId: string, period: 'week' | 'month' | 'year', startDate: string, endDate: string): Promise<any[]> {
    if (period === 'week') {
      const weeklyData = await this.getWeeklyAnalytics(userId, startDate);
      return weeklyData ? weeklyData.weeklyData.map(day => ({
        day: day.day,
        hours: day.hours,
        tasksCompleted: day.tasksCompleted,
        pointsEarned: day.pointsEarned,
        productivityScore: day.productivityScore
      })) : [];
    }
    
    // For month/year, aggregate daily data
    const sessions = await this.getTimeTrackingSessions(userId, startDate, endDate);
    const dailyHours: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const date = session.startTime.toDate().toISOString().split('T')[0];
      dailyHours[date] = (dailyHours[date] || 0) + session.duration / 60;
    });
    
    return Object.entries(dailyHours).map(([date, hours]) => ({
      date,
      hours,
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    }));
  }

  static async getPieChartData(userId: string, date: string): Promise<any[]> {
    const taskAnalytics = await this.getTaskCompletionAnalytics(userId, date);
    if (!taskAnalytics) return [];

    return [
      {
        id: 1,
        category: 'Completed',
        count: taskAnalytics.completedTasks,
        color: '#4CAF50',
        percentage: Math.round((taskAnalytics.completedTasks / taskAnalytics.totalTasks) * 100)
      },
      {
        id: 2,
        category: 'Pending',
        count: taskAnalytics.pendingTasks,
        color: '#FF5722',
        percentage: Math.round((taskAnalytics.pendingTasks / taskAnalytics.totalTasks) * 100)
      },
      {
        id: 3,
        category: 'Overdue',
        count: taskAnalytics.overdueTasks,
        color: '#F44336',
        percentage: Math.round((taskAnalytics.overdueTasks / taskAnalytics.totalTasks) * 100)
      }
    ];
  }

  static async getLineChartData(userId: string, date: string): Promise<any[]> {
    const pointsActivity = await this.getDailyPointsActivity(userId, date);
    return pointsActivity.map(activity => ({
      time: activity.time,
      points: activity.totalPoints,
      activity: activity.activity,
      activityType: activity.activityType
    }));
  }

  // Category Breakdown for Summary
  static async getCategoryBreakdown(userId: string, date: string): Promise<any[]> {
    const dailyAnalytics = await this.getDailyAnalytics(userId, date);
    if (!dailyAnalytics) return [];

    return dailyAnalytics.categories.map(category => ({
      id: category.categoryId,
      category: category.categoryName,
      hours: category.hours,
      color: category.categoryColor,
      icon: category.categoryIcon,
      sessions: category.sessions,
      productivityScore: category.productivityScore
    }));
  }

  // Summary Statistics
  static async getSummaryStats(userId: string, date: string): Promise<any> {
    const dailyAnalytics = await this.getDailyAnalytics(userId, date);
    const taskAnalytics = await this.getTaskCompletionAnalytics(userId, date);
    
    return {
      totalHours: dailyAnalytics?.totalHoursTracked || 0,
      categories: dailyAnalytics?.categories.length || 0,
      productivity: dailyAnalytics?.productivityScore || 0,
      tasksCompleted: taskAnalytics?.completedTasks || 0,
      totalTasks: taskAnalytics?.totalTasks || 0,
      completionRate: taskAnalytics?.completionRate || 0
    };
  }
}

// Utility functions
export const FirebaseUtils = {
  // Convert Firestore timestamp to JavaScript Date
  timestampToDate: (timestamp: Timestamp): Date => timestamp.toDate(),
  
  // Convert JavaScript Date to Firestore timestamp
  dateToTimestamp: (date: Date): Timestamp => Timestamp.fromDate(date),
  
  // Get current timestamp
  getCurrentTimestamp: (): Timestamp => Timestamp.now(),
  
  // Format timestamp for display
  formatTimestamp: (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleDateString();
  },

  // Format time for display
  formatTime: (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  },

  // Get date string in YYYY-MM-DD format
  getDateString: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Get week start date
  getWeekStart: (date: Date): string => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  },

  // Get month string in YYYY-MM format
  getMonthString: (date: Date): string => {
    return date.toISOString().slice(0, 7);
  }
};

