# FinishIt Data Relationships & Flow Documentation

## Entity Relationship Diagram

```
Users (1) ──── (M) Tasks
Users (1) ──── (M) Posts  
Users (1) ──── (M) Comments
Users (1) ──── (M) Achievements
Users (1) ──── (M) Time Tracking
Users (1) ──── (M) Notifications
Users (M) ──── (M) User Follows (Self-referential)
Users (M) ──── (M) User Likes

Tasks (M) ──── (1) Categories
Tasks (M) ──── (M) Tags (via task_tags)
Tasks (1) ──── (M) Subtasks
Tasks (1) ──── (M) Time Tracking

Posts (1) ──── (M) Comments
Posts (M) ──── (M) User Likes
Posts (1) ──── (M) Post Media
Posts (M) ──── (1) Tasks (optional)
Posts (M) ──── (1) Achievements (optional)

Comments (M) ──── (M) User Likes
Comments (1) ──── (M) Comments (Self-referential for replies)

Leaderboards (1) ──── (M) Leaderboard Rankings
```

## Data Flow Patterns

### 1. Task Management Flow
```
User creates Task → Task stored in tasks collection
Task assigned Category → Reference to categories collection
Task tagged → References stored in task_tags junction table
Task has Subtasks → Stored as embedded array (Firebase) or separate table (SQL)
Task completed → Triggers user stats update, achievement check
```

### 2. Social Interaction Flow
```
User creates Post → Post stored in posts collection
Post gets Likes → User likes tracked in user_likes collection
Post gets Comments → Comments stored in comments collection
Post shared → Share count incremented
Post engagement calculated → Real-time updates to engagement metrics
```

### 3. Achievement System Flow
```
User completes Task → Achievement criteria checked
Achievement earned → Achievement document created
Achievement posted → Post created with achievement reference
User stats updated → Points and level calculations
```

### 4. Time Tracking Flow
```
User starts Timer → Time tracking session created
Timer ends → Duration calculated, points awarded
Session linked to Task → Task time_spent updated
Daily/Weekly reports → Aggregated from time_tracking collection
```

### 5. Leaderboard Flow
```
User activities → Points accumulated in user stats
Periodic calculation → Leaderboard rankings updated
Rankings displayed → Cached for performance
Real-time updates → When user completes significant actions
```

## Key Relationships

### User-Centric Relationships
- **User → Tasks**: One user can have many tasks
- **User → Posts**: One user can create many posts
- **User → Follows**: Many-to-many self-referential relationship
- **User → Likes**: One user can like many posts/comments
- **User → Time Tracking**: One user can have many time tracking sessions

### Content Relationships
- **Task → Category**: Many tasks belong to one category
- **Task → Tags**: Many-to-many relationship via junction table
- **Task → Subtasks**: One task can have many subtasks
- **Post → Comments**: One post can have many comments
- **Post → Likes**: One post can be liked by many users

### Cross-Feature Relationships
- **Task → Post**: Task completion can generate achievement posts
- **Time Tracking → Task**: Time sessions can be linked to specific tasks
- **Achievement → Post**: Achievements can be shared as posts

## Data Consistency Patterns

### 1. Counter Maintenance
- **Post Likes**: Maintained via user_likes collection + triggers
- **Comment Counts**: Updated when comments are added/removed
- **Task Completion**: User stats updated via triggers
- **Tag Usage**: Incremented/decremented when tasks are tagged/untagged

### 2. Real-time Updates
- **User Stats**: Updated immediately when tasks are completed
- **Engagement Metrics**: Updated when likes/comments are added
- **Leaderboards**: Updated periodically or on significant actions
- **Notifications**: Created immediately when events occur

### 3. Data Validation
- **User References**: All foreign keys validated at database level
- **Unique Constraints**: Usernames, emails, follow relationships
- **Business Rules**: Users can't follow themselves, tasks must have valid categories

## Performance Considerations

### 1. Indexing Strategy
- **User Queries**: Indexed on user_id, created_at
- **Task Queries**: Composite indexes on user_id + completed + created_at
- **Social Queries**: Indexed on post_id, created_at for chronological feeds
- **Leaderboard Queries**: Indexed on type + period for fast lookups

### 2. Caching Strategy
- **User Stats**: Cached in user document for fast access
- **Leaderboards**: Cached and updated periodically
- **Popular Posts**: Cached for trending/hot feeds
- **User Profiles**: Cached for social features

### 3. Query Optimization
- **Task Lists**: Use composite indexes for filtering
- **Social Feeds**: Paginate using created_at timestamps
- **Search**: Use full-text indexes for content search
- **Analytics**: Pre-aggregate common statistics

## Security Considerations

### 1. Data Access Control
- **User Data**: Users can only access their own data
- **Social Data**: Public posts readable by all authenticated users
- **Private Data**: Tasks, time tracking private to user
- **Admin Data**: Leaderboards, categories managed by system

### 2. Data Validation
- **Input Validation**: All user inputs validated and sanitized
- **Business Rules**: Enforced at both application and database level
- **Rate Limiting**: Prevent spam and abuse
- **Data Integrity**: Foreign key constraints and triggers

### 3. Privacy Controls
- **User Preferences**: Privacy settings respected in all queries
- **Data Retention**: Configurable retention policies
- **Anonymization**: Option to anonymize data for analytics
- **GDPR Compliance**: Data export and deletion capabilities
