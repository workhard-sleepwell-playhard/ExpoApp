import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  image: string | null;
  video: string | null;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  type: 'general' | 'achievement' | 'task' | 'question';
  isPublic: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare }) => {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <ThemedText style={styles.avatar}>{post.user.avatar}</ThemedText>
            </View>
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>{post.user.name}</ThemedText>
              <ThemedText style={styles.username}>{post.user.username}</ThemedText>
            </View>
          </View>
          <View style={styles.postMeta}>
            <ThemedText style={styles.timestamp}>{post.timestamp}</ThemedText>
            <TouchableOpacity style={styles.moreButton}>
              <ThemedText style={styles.moreIcon}>⋯</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContentContainer}>
          <ThemedText style={styles.postContent}>{post.content}</ThemedText>
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.upvoteButton]}
            onPress={() => onLike(post.id)}
          >
            <ThemedText style={styles.upvoteIcon}>
              {post.isLiked ? '⬆️' : '⬆️'}
            </ThemedText>
            <ThemedText style={[
              styles.upvoteText,
              post.isLiked && styles.likedText
            ]}>
              {post.likes}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.downvoteButton]}
            onPress={() => onLike(post.id)}
          >
            <ThemedText style={styles.downvoteIcon}>⬇️</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onComment(post.id)}
          >
            <ThemedText style={styles.actionIcon}>💬</ThemedText>
            <ThemedText style={styles.actionText}>{post.comments}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>🔖</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare(post.id)}
          >
            <ThemedText style={styles.actionIcon}>📤</ThemedText>
            <ThemedText style={styles.actionText}>Share</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatar: {
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1B',
  },
  username: {
    fontSize: 12,
    color: '#878A8C',
    marginTop: 1,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#878A8C',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  moreIcon: {
    fontSize: 16,
    color: '#878A8C',
  },
  postContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A1A1B',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDEFF1',
    backgroundColor: '#FAFAFA',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 16,
  },
  upvoteButton: {
    backgroundColor: 'transparent',
  },
  downvoteButton: {
    backgroundColor: 'transparent',
  },
  upvoteIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  downvoteIcon: {
    fontSize: 16,
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#878A8C',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#878A8C',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#878A8C',
  },
  likedText: {
    color: '#FF4500',
  },
});
