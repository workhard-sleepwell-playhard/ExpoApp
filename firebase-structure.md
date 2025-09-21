# FinishIt Firebase Data Structure

## Collections and Documents

### 1. Users Collection (`/users/{userId}`)
```javascript
{
  userId: string,
  email: string,
  displayName: string,
  avatar: string, // emoji or URL
  username: string, // @username
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,
  preferences: {
    theme: 'light' | 'dark',
    notifications: boolean,
    privacy: 'public' | 'private',
    language: string
  },
  stats: {
    totalTasks: number,
    completedTasks: number,
    currentStreak: number,
    totalPoints: number,
    level: number,
    experience: number
  },
  settings: {
    pomodoroLength: number, // minutes
    shortBreak: number, // minutes
    longBreak: number, // minutes
    dailyGoal: number, // points
    workHours: {
      start: string, // "09:00"
      end: string // "17:00"
    }
  }
}
```

### 2. Tasks Collection (`/tasks/{taskId}`)
```javascript
{
  taskId: string,
  userId: string,
  title: string,
  description: string,
  completed: boolean,
  priority: 'low' | 'medium' | 'high',
  category: string, // categoryId reference
  dueDate: timestamp | null,
  dueTime: string | null, // "17:00"
  tags: string[], // array of tagIds
  subtasks: [{
    id: string,
    title: string,
    completed: boolean,
    createdAt: timestamp
  }],
  timeSpent: number, // minutes
  estimatedTime: number, // minutes
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp | null,
  isSelected: boolean, // for current focus
  points: number, // points awarded when completed
  difficulty: 'easy' | 'medium' | 'hard'
}
```

### 3. Posts Collection (`/posts/{postId}`)
```javascript
{
  postId: string,
  userId: string,
  content: string,
  type: 'general' | 'achievement' | 'task' | 'question',
  images: string[], // URLs or base64
  videos: string[], // URLs
  isPublic: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  engagement: {
    likes: number,
    comments: number,
    shares: number,
    views: number
  },
  hashtags: string[],
  mentions: string[], // userIds
  relatedTaskId: string | null, // if post is about a task
  achievementId: string | null // if post is about an achievement
}
```

### 4. Comments Collection (`/comments/{commentId}`)
```javascript
{
  commentId: string,
  postId: string,
  userId: string,
  content: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  likes: number,
  parentCommentId: string | null, // for replies
  isEdited: boolean
}
```

### 5. Achievements Collection (`/achievements/{achievementId}`)
```javascript
{
  achievementId: string,
  userId: string,
  title: string,
  description: string,
  icon: string, // emoji or icon name
  category: 'streak' | 'task' | 'points' | 'social' | 'productivity',
  earnedAt: timestamp,
  points: number,
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  badge: string, // URL to badge image
  progress: {
    current: number,
    target: number
  }
}
```

### 6. Time Tracking Collection (`/timeTracking/{trackingId}`)
```javascript
{
  trackingId: string,
  userId: string,
  taskId: string | null,
  category: string,
  startTime: timestamp,
  endTime: timestamp | null,
  duration: number, // minutes
  description: string,
  type: 'work' | 'break' | 'focus' | 'other',
  points: number,
  createdAt: timestamp
}
```

### 7. Leaderboards Collection (`/leaderboards/{leaderboardId}`)
```javascript
{
  leaderboardId: string,
  type: 'overall' | 'weekly' | 'monthly' | 'streaks',
  period: string, // "2024-01" for monthly
  rankings: [{
    userId: string,
    score: number,
    rank: number,
    displayName: string,
    avatar: string
  }],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 8. Notifications Collection (`/notifications/{notificationId}`)
```javascript
{
  notificationId: string,
  userId: string,
  type: 'task_due' | 'achievement' | 'social' | 'reminder' | 'system',
  title: string,
  message: string,
  isRead: boolean,
  createdAt: timestamp,
  readAt: timestamp | null,
  actionUrl: string | null,
  data: object // additional data specific to notification type
}
```

### 9. Categories Collection (`/categories/{categoryId}`)
```javascript
{
  categoryId: string,
  name: string,
  icon: string, // emoji
  color: string, // hex color
  description: string,
  isDefault: boolean,
  userId: string | null, // null for global categories
  createdAt: timestamp
}
```

### 10. Tags Collection (`/tags/{tagId}`)
```javascript
{
  tagId: string,
  name: string,
  color: string, // hex color
  userId: string | null, // null for global tags
  usageCount: number,
  createdAt: timestamp
}
```

### 11. User Likes Collection (`/userLikes/{likeId}`)
```javascript
{
  likeId: string,
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  createdAt: timestamp
}
```

### 12. User Follows Collection (`/userFollows/{followId}`)
```javascript
{
  followId: string,
  followerId: string,
  followingId: string,
  createdAt: timestamp
}
```

## Firebase Security Rules

### Users Collection Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for social features
    }
  }
}
```

### Tasks Collection Rules
```javascript
    // Tasks - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
```

### Posts Collection Rules
```javascript
    // Posts - public read, owner write
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
```

### Comments Collection Rules
```javascript
    // Comments - public read, authenticated write
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
```

### Time Tracking Rules
```javascript
    // Time tracking - user can only access their own data
    match /timeTracking/{trackingId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
```

### Leaderboards Rules
```javascript
    // Leaderboards - public read only
    match /leaderboards/{leaderboardId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can update leaderboards
    }
```

### Notifications Rules
```javascript
    // Notifications - user can only access their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
```

### Categories and Tags Rules
```javascript
    // Categories - read public, write own custom ones
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.isDefault == true || 
         resource.data.userId == request.auth.uid);
    }
    
    // Tags - read public, write own custom ones
    match /tags/{tagId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.userId == null || 
         resource.data.userId == request.auth.uid);
    }
```

### User Likes Rules
```javascript
    // User likes - authenticated users can manage their own likes
    match /userLikes/{likeId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
```

### User Follows Rules
```javascript
    // User follows - authenticated users can manage their own follows
    match /userFollows/{followId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.followerId || 
         request.auth.uid == resource.data.followingId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.followerId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.followerId;
    }
```

## Indexes Required

### Composite Indexes for Firestore
```javascript
// Tasks indexes
collection: tasks
fields: userId, completed, createdAt (desc)
fields: userId, dueDate, createdAt (desc)
fields: userId, category, completed (desc)

// Posts indexes
collection: posts
fields: userId, createdAt (desc)
fields: type, createdAt (desc)
fields: isPublic, createdAt (desc)

// Comments indexes
collection: comments
fields: postId, createdAt (desc)

// Time tracking indexes
collection: timeTracking
fields: userId, createdAt (desc)
fields: userId, category, createdAt (desc)

// Leaderboards indexes
collection: leaderboards
fields: type, period (desc)
```

## Data Relationships

### User Relationships
- User → Tasks (1:many)
- User → Posts (1:many)
- User → Comments (1:many)
- User → Achievements (1:many)
- User → Time Tracking (1:many)
- User → Notifications (1:many)
- User → User Likes (1:many)
- User → User Follows (1:many, self-referential)

### Task Relationships
- Task → Category (many:1)
- Task → Tags (many:many via array)
- Task → Subtasks (1:many embedded)
- Task → Time Tracking (1:many)

### Post Relationships
- Post → User (many:1)
- Post → Comments (1:many)
- Post → User Likes (1:many)
- Post → Task (many:1, optional)
- Post → Achievement (many:1, optional)

### Social Relationships
- User → User Follows (many:many self-referential)
- Post → User Likes (many:many)
- Comment → User Likes (many:many)
