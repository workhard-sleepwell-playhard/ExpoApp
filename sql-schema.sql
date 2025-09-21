-- FinishIt Database Schema
-- SQL equivalent of Firebase structure

-- Enable UUID extension for PostgreSQL (if using PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255), -- emoji or URL
    username VARCHAR(50) UNIQUE, -- @username
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    theme ENUM('light', 'dark') DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    privacy ENUM('public', 'private') DEFAULT 'public',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Stats
    total_tasks INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    total_points INT DEFAULT 0,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    
    -- Settings
    pomodoro_length INT DEFAULT 25, -- minutes
    short_break INT DEFAULT 5, -- minutes
    long_break INT DEFAULT 15, -- minutes
    daily_goal INT DEFAULT 100, -- points
    work_start_time TIME DEFAULT '09:00:00',
    work_end_time TIME DEFAULT '17:00:00'
);

-- Categories Table
CREATE TABLE categories (
    category_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255), -- emoji
    color VARCHAR(7), -- hex color
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(36), -- NULL for global categories
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tags Table
CREATE TABLE tags (
    tag_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- hex color
    user_id VARCHAR(36), -- NULL for global tags
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE tasks (
    task_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    category_id VARCHAR(36),
    due_date DATE,
    due_time TIME,
    time_spent INT DEFAULT 0, -- minutes
    estimated_time INT, -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    is_selected BOOLEAN DEFAULT FALSE,
    points INT DEFAULT 0,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Task Tags Junction Table (Many-to-Many)
CREATE TABLE task_tags (
    task_id VARCHAR(36),
    tag_id VARCHAR(36),
    PRIMARY KEY (task_id, tag_id),
    
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Subtasks Table
CREATE TABLE subtasks (
    subtask_id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Posts Table
CREATE TABLE posts (
    post_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general', 'achievement', 'task', 'question') DEFAULT 'general',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    hashtags JSON, -- array of hashtags
    mentions JSON, -- array of user IDs
    related_task_id VARCHAR(36),
    achievement_id VARCHAR(36),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL
);

-- Post Media Table
CREATE TABLE post_media (
    media_id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE comments (
    comment_id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes_count INT DEFAULT 0,
    parent_comment_id VARCHAR(36),
    is_edited BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- Achievements Table
CREATE TABLE achievements (
    achievement_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255), -- emoji or icon name
    category ENUM('streak', 'task', 'points', 'social', 'productivity') NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points INT DEFAULT 0,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    badge VARCHAR(500), -- URL to badge image
    progress_current INT DEFAULT 0,
    progress_target INT DEFAULT 0,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Time Tracking Table
CREATE TABLE time_tracking (
    tracking_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    category VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INT, -- minutes
    description TEXT,
    type ENUM('work', 'break', 'focus', 'other') DEFAULT 'work',
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL
);

-- Leaderboards Table
CREATE TABLE leaderboards (
    leaderboard_id VARCHAR(36) PRIMARY KEY,
    type ENUM('overall', 'weekly', 'monthly', 'streaks') NOT NULL,
    period VARCHAR(20) NOT NULL, -- "2024-01" for monthly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Leaderboard Rankings Table
CREATE TABLE leaderboard_rankings (
    ranking_id VARCHAR(36) PRIMARY KEY,
    leaderboard_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    score INT NOT NULL,
    rank INT NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    
    FOREIGN KEY (leaderboard_id) REFERENCES leaderboards(leaderboard_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_leaderboard_user (leaderboard_id, user_id)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('task_due', 'achievement', 'social', 'reminder', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    action_url VARCHAR(500),
    data JSON, -- additional data specific to notification type
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Likes Table (for posts and comments)
CREATE TABLE user_likes (
    like_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    target_type ENUM('post', 'comment') NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_target (user_id, target_type, target_id)
);

-- User Follows Table
CREATE TABLE user_follows (
    follow_id VARCHAR(36) PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    CHECK (follower_id != following_id) -- Users can't follow themselves
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_user_completed_created ON tasks(user_id, completed, created_at DESC);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date, created_at DESC);
CREATE INDEX idx_tasks_user_category ON tasks(user_id, category_id, completed DESC);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_is_public ON posts(is_public);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_type_created ON posts(type, created_at DESC);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at);

CREATE INDEX idx_time_tracking_user_id ON time_tracking(user_id);
CREATE INDEX idx_time_tracking_task_id ON time_tracking(task_id);
CREATE INDEX idx_time_tracking_start_time ON time_tracking(start_time);
CREATE INDEX idx_time_tracking_user_created ON time_tracking(user_id, created_at DESC);

CREATE INDEX idx_leaderboards_type_period ON leaderboards(type, period DESC);
CREATE INDEX idx_leaderboard_rankings_leaderboard ON leaderboard_rankings(leaderboard_id);
CREATE INDEX idx_leaderboard_rankings_user ON leaderboard_rankings(user_id);
CREATE INDEX idx_leaderboard_rankings_score ON leaderboard_rankings(score DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_target ON user_likes(target_type, target_id);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- Triggers for maintaining counters

-- Update task completion counter when task is completed/uncompleted
DELIMITER //
CREATE TRIGGER update_user_completed_tasks_after_task_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.completed != NEW.completed THEN
        IF NEW.completed = TRUE THEN
            UPDATE users 
            SET completed_tasks = completed_tasks + 1,
                total_points = total_points + NEW.points
            WHERE user_id = NEW.user_id;
        ELSE
            UPDATE users 
            SET completed_tasks = completed_tasks - 1,
                total_points = total_points - OLD.points
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
END//

-- Update task completion counter when task is created
CREATE TRIGGER update_user_total_tasks_after_task_insert
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    UPDATE users 
    SET total_tasks = total_tasks + 1
    WHERE user_id = NEW.user_id;
END//

-- Update task completion counter when task is deleted
CREATE TRIGGER update_user_total_tasks_after_task_delete
AFTER DELETE ON tasks
FOR EACH ROW
BEGIN
    UPDATE users 
    SET total_tasks = total_tasks - 1,
        completed_tasks = completed_tasks - (OLD.completed = TRUE),
        total_points = total_points - (CASE WHEN OLD.completed = TRUE THEN OLD.points ELSE 0 END)
    WHERE user_id = OLD.user_id;
END//

-- Update post engagement counters
CREATE TRIGGER update_post_likes_count_after_like_insert
AFTER INSERT ON user_likes
FOR EACH ROW
BEGIN
    IF NEW.target_type = 'post' THEN
        UPDATE posts 
        SET likes_count = likes_count + 1
        WHERE post_id = NEW.target_id;
    ELSEIF NEW.target_type = 'comment' THEN
        UPDATE comments 
        SET likes_count = likes_count + 1
        WHERE comment_id = NEW.target_id;
    END IF;
END//

CREATE TRIGGER update_post_likes_count_after_like_delete
AFTER DELETE ON user_likes
FOR EACH ROW
BEGIN
    IF OLD.target_type = 'post' THEN
        UPDATE posts 
        SET likes_count = likes_count - 1
        WHERE post_id = OLD.target_id;
    ELSEIF OLD.target_type = 'comment' THEN
        UPDATE comments 
        SET likes_count = likes_count - 1
        WHERE comment_id = OLD.target_id;
    END IF;
END//

CREATE TRIGGER update_post_comments_count_after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET comments_count = comments_count + 1
    WHERE post_id = NEW.post_id;
END//

CREATE TRIGGER update_post_comments_count_after_comment_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET comments_count = comments_count - 1
    WHERE post_id = OLD.post_id;
END//

-- Update tag usage count
CREATE TRIGGER update_tag_usage_after_task_tag_insert
AFTER INSERT ON task_tags
FOR EACH ROW
BEGIN
    UPDATE tags 
    SET usage_count = usage_count + 1
    WHERE tag_id = NEW.tag_id;
END//

CREATE TRIGGER update_tag_usage_after_task_tag_delete
AFTER DELETE ON task_tags
FOR EACH ROW
BEGIN
    UPDATE tags 
    SET usage_count = usage_count - 1
    WHERE tag_id = OLD.tag_id;
END//

DELIMITER ;

-- Sample Data Insertion (Optional)

-- Insert default categories
INSERT INTO categories (category_id, name, icon, color, description, is_default) VALUES
('cat_work', 'Work', '💼', '#FF3B30', 'Professional tasks and work-related activities', TRUE),
('cat_personal', 'Personal', '🏠', '#34C759', 'Personal tasks and home activities', TRUE),
('cat_health', 'Health', '💪', '#FF9500', 'Health and fitness related tasks', TRUE),
('cat_learning', 'Learning', '📚', '#007AFF', 'Educational and skill development tasks', TRUE),
('cat_finance', 'Finance', '💰', '#5856D6', 'Financial tasks and money management', TRUE),
('cat_other', 'Other', '📝', '#8E8E93', 'Miscellaneous tasks', TRUE);

-- Insert default tags
INSERT INTO tags (tag_id, name, color, usage_count) VALUES
('tag_urgent', 'urgent', '#FF3B30', 0),
('tag_important', 'important', '#FF9500', 0),
('tag_review', 'review', '#007AFF', 0),
('tag_documentation', 'documentation', '#34C759', 0),
('tag_meeting', 'meeting', '#5856D6', 0),
('tag_presentation', 'presentation', '#FF69B4', 0);

-- Views for Common Queries

-- User Dashboard View
CREATE VIEW user_dashboard AS
SELECT 
    u.user_id,
    u.display_name,
    u.avatar,
    u.total_tasks,
    u.completed_tasks,
    u.current_streak,
    u.total_points,
    u.level,
    u.experience,
    (u.completed_tasks / NULLIF(u.total_tasks, 0)) * 100 as completion_rate,
    COUNT(CASE WHEN t.completed = FALSE AND t.due_date <= CURDATE() THEN 1 END) as overdue_tasks,
    COUNT(CASE WHEN t.completed = FALSE AND t.due_date = CURDATE() THEN 1 END) as due_today
FROM users u
LEFT JOIN tasks t ON u.user_id = t.user_id
GROUP BY u.user_id;

-- Task Statistics View
CREATE VIEW task_statistics AS
SELECT 
    t.user_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN t.completed = TRUE THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.completed = FALSE THEN 1 END) as pending_tasks,
    AVG(t.time_spent) as avg_time_spent,
    SUM(t.points) as total_points_earned,
    COUNT(CASE WHEN t.due_date < CURDATE() AND t.completed = FALSE THEN 1 END) as overdue_tasks
FROM tasks t
GROUP BY t.user_id;

-- Post Engagement View
CREATE VIEW post_engagement AS
SELECT 
    p.post_id,
    p.user_id,
    p.content,
    p.type,
    p.created_at,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.views_count,
    (p.likes_count + p.comments_count + p.shares_count) as total_engagement
FROM posts p
ORDER BY p.created_at DESC;
