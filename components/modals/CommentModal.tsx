import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  Dimensions 
} from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';
import { SimpleRealtimeService } from '../../src/services/simple-realtime';

interface Comment {
  id: string;
  commentId: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  userUsername?: string;
  content: string;
  createdAt: number;
  likes: Record<string, boolean>;
  replies: number;
}

interface CommentModalProps {
  visible: boolean;
  postId: string;
  currentUserId?: string;
  currentUserDisplayName?: string;
  currentUserAvatar?: string;
  onClose: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  postId,
  currentUserId,
  currentUserDisplayName,
  currentUserAvatar,
  onClose
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible || !postId) return;

    // Set up real-time comments listener
    const unsubscribe = SimpleRealtimeService.listenToComments(postId, (comments) => {
      setComments(comments);
    });

    return () => {
      unsubscribe();
    };
  }, [visible, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || !currentUserDisplayName) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setIsLoading(true);
      
      const commentData = {
        postId,
        userId: currentUserId,
        userDisplayName: currentUserDisplayName,
        userAvatar: currentUserAvatar || '👤',
        userUsername: `@${currentUserDisplayName.toLowerCase().replace(/\s+/g, '')}`,
        content: newComment.trim(),
      };

      // Clear input immediately for better UX
      setNewComment('');
      
      // Do database operations in background (non-blocking)
      Promise.all([
        SimpleRealtimeService.createComment(commentData),
        SimpleRealtimeService.updateSocialStats(currentUserId, 'comment'),
        SimpleRealtimeService.addPointsActivity(currentUserId, {
          activity: 'Added a comment',
          activityType: 'social',
          points: 5,
          postId: postId
        })
      ]).catch(error => {
        console.error('Background comment creation error:', error);
        // Could show a subtle error notification here if needed
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      const comment = comments.find(c => c.commentId === commentId);
      if (!comment) return;

      const isLiked = comment.likes[currentUserId];
      
      if (isLiked) {
        await SimpleRealtimeService.unlikeComment(commentId, currentUserId);
      } else {
        await SimpleRealtimeService.likeComment(commentId, currentUserId);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getLikeCount = (likes: Record<string, boolean>) => {
    return Object.keys(likes).length;
  };

  const isCommentLiked = (likes: Record<string, boolean>) => {
    return currentUserId ? !!likes[currentUserId] : false;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Comments</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAvatar}>
                  {comment.userAvatar || '👤'}
                </Text>
                <View style={styles.commentInfo}>
                  <Text style={styles.commentAuthor}>
                    {comment.userDisplayName}
                  </Text>
                  <Text style={styles.commentTime}>
                    {formatTime(comment.createdAt)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.commentContent}>
                {comment.content}
              </Text>
              
              <View style={styles.commentActions}>
                <TouchableOpacity
                  style={styles.commentAction}
                  onPress={() => handleLikeComment(comment.commentId)}
                >
                  <Text style={[
                    styles.commentActionIcon,
                    isCommentLiked(comment.likes) && styles.likedIcon
                  ]}>
                    {isCommentLiked(comment.likes) ? '❤️' : '🤍'}
                  </Text>
                  <Text style={styles.commentActionText}>
                    {getLikeCount(comment.likes)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {comments.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newComment.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  comment: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    fontSize: 20,
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  commentContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  commentActionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  likedIcon: {
    // Already styled with emoji
  },
  commentActionText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
