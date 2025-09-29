// This file has been deprecated in favor of SimpleRealtimeService
// All database operations now use Firebase Realtime Database via SimpleRealtimeService
// This file is kept for reference but should not be used for new development

import { Timestamp, FieldValue } from 'firebase/firestore';

// Re-export SimpleRealtimeService for backward compatibility
export { SimpleRealtimeService } from './simple-realtime';

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

// Task interface removed - using simple object structure in Realtime Database

// Subtask interface removed - using simple object structure in Realtime Database

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

// Comment interface removed - using simple object structure in Realtime Database

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
  // NEW: Detailed source tracking
  sourceData: {
    tasks: {
      taskId: string;
      taskName: string;
      completedAt: string; // ISO timestamp
      points: number;
      category: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    }[];
    sessions: {
      sessionId: string;
      duration: number; // minutes
      category: string;
      startTime: string; // ISO timestamp
      endTime: string; // ISO timestamp
      description?: string;
    }[];
  };
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

// PointsActivity interface removed - using simple object structure in Realtime Database

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

// All UserService methods have been moved to SimpleRealtimeService
// Use SimpleRealtimeService for all user operations

// All service classes have been moved to SimpleRealtimeService
// Use SimpleRealtimeService for all database operations

// Utility functions moved to SimpleRealtimeService
// Use SimpleRealtimeService utility methods for date/time operations

