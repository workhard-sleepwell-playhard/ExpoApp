import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Import Redux selectors and actions
import { 
  selectPosts,
  selectIsLoading,
  selectError
} from '../store/home/home.selector';
import { fetchPosts, deletePostAsync } from '../store/home/home.action';

// Import PostCard component
import { PostCard } from '../components/tabscomponents/home/homePostCard.component';

export default function MyPostsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state
  const posts = useSelector(selectPosts);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Load user posts when component mounts
  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = async () => {
    try {
      // TODO: Get actual current user ID from auth context
      const currentUserId = 'current-user-id';
      
      console.log('Loading user posts for:', currentUserId);
      await dispatch(fetchPosts(currentUserId) as any);
    } catch (error) {
      console.error('Error loading user posts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to load posts: ${errorMessage}`);
    }
  };

  const handleLike = (postId: string | number) => {
    // TODO: Implement like functionality
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string | number) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string | number) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const handleDelete = async (postId: string | number) => {
    try {
      await dispatch(deletePostAsync(postId.toString()) as any);
      
      // Show success message
      Alert.alert('Success', 'Post deleted successfully!');
      
      // Refresh the posts list
      await loadUserPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to delete post: ${errorMessage}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>My Posts</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading your posts...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
            <TouchableOpacity onPress={loadUserPosts} style={styles.retryButton}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📝</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Posts Yet</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              You haven't created any posts yet. Start sharing your thoughts and achievements!
            </ThemedText>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/home')} 
              style={styles.createPostButton}
            >
              <ThemedText style={styles.createPostButtonText}>Create Your First Post</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            <ThemedText style={styles.postsCount}>
              {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
            </ThemedText>
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1B',
  },
  placeholder: {
    width: 60, // Same width as back button to center the title
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1B',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createPostButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  postsContainer: {
    padding: 20,
  },
  postsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
