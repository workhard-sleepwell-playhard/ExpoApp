import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert, Animated, Dimensions, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

// Import Redux selectors and actions
import { 
  selectHomeState, // Consolidated selector
  selectIsLoading
} from '../../store/home/home.selector';
import { selectUserData } from '../../store/profile/profile.selector';
import { SimpleRealtimeService } from '../../src/services/simple-realtime';
import { CommentModal } from '../../components/modals/CommentModal';
import { useCentralizedListener } from '../../hooks/use-centralized-listener';
import { 
  openCreatePost, 
  setPostContent,
  setPostType,
  setIsPublic,
  setIsCreatePostOpen,
  setSelectedImages,
  setSelectedVideos,
  toggleLikePost,
  toggleDislikePost
} from '../../store/home/home.action';

// Import new components
import { HomeHeader } from '../../components/tabscomponents/home/homeHeader.component';
import { CreatePostButton } from '../../components/tabscomponents/home/homeCreatePostButton.component';
import { PostCard } from '../../components/tabscomponents/home/homePostCard.component';
import { CreatePostModal } from '@/components/modals/CreatePostModal';

// Get screen dimensions properly for Expo/React Native
const { height: screenHeight } = Dimensions.get('window');

const HomeScreen = React.memo(function HomeScreen() {
  const dispatch = useDispatch();
  // colorScheme removed - not used
  
  // Redux state - Optimized to reduce re-renders
  const homeState = useSelector(selectHomeState); // Consolidated selector
  const isLoading = useSelector(selectIsLoading);
  
  
  // Extract values from homeState to avoid multiple selectors
  const {
    posts,
    postContent,
    selectedImages,
    selectedVideos,
    postType,
    isPublic
  } = homeState;

  // Separate selector for modal state (needs its own for animation triggers)
  const isCreatePostOpen = useSelector((state: { home: { isCreatePostOpen: boolean } }) => state.home.isCreatePostOpen);

  // Comment modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // User data from single source of truth
  const userData = useSelector(selectUserData);
  
  // Initialize only home-related listeners
  useCentralizedListener({
    enablePosts: true,         // Home tab needs posts
    enableUserData: true,      // Need userData for points/stats
    enableTasks: false,        // Home tab doesn't need tasks
    enableLeaderboards: false  // Home tab doesn't need leaderboards
  });
  
  // Animation values - using modal height instead of full screen height
  const [modalHeight, setModalHeight] = React.useState(screenHeight * 0.85);
  const slideAnimation = React.useRef(new Animated.Value(modalHeight)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  // Reset animation values when component mounts to ensure proper initial state
  React.useEffect(() => {
    // Get fresh screen dimensions to ensure accuracy on mobile devices
    const { height: currentScreenHeight } = Dimensions.get('window');
    const currentModalHeight = currentScreenHeight * 0.85;
    
    // Update modal height state
    setModalHeight(currentModalHeight);
    
    // Set initial values for the animation
    slideAnimation.setValue(currentModalHeight);
    overlayOpacity.setValue(0);
    
    // Animation initialized
  }, [slideAnimation, overlayOpacity]);

  // Removed loadAllPosts - using real-time listener instead

  // Debouncing to prevent spam clicking
  const [isLiking, setIsLiking] = useState<Set<string | number>>(new Set());
  const [isDisliking, setIsDisliking] = useState<Set<string | number>>(new Set());

  const handleLike = async (postId: string | number) => {
    try {
      if (!userData?.userId) {
        Alert.alert('Please wait', 'Your profile is still loading. Please try again in a moment.');
        return;
      }

      // Prevent spam clicking
      if (isLiking.has(postId)) {
        return;
      }

      setIsLiking(prev => new Set(prev).add(postId));

      // Instant UI update (optimistic)
      dispatch(toggleLikePost(postId));

      // Sync with Firebase in background
      try {
        await SimpleRealtimeService.likePost(postId.toString(), userData.userId);
        
        // Update social stats for like
        await SimpleRealtimeService.updateSocialStats(userData.userId, 'like');
        
        // Add points activity
        await SimpleRealtimeService.addPointsActivity(userData.userId, {
          activity: 'Liked a post',
          activityType: 'social',
          points: 2,
          postId: postId.toString()
        });
      } catch (error) {
        console.error('Error syncing like with Firebase:', error);
        // Revert UI change on error
        dispatch(toggleLikePost(postId));
        Alert.alert('Error', 'Failed to sync like with server. Please try again.');
      } finally {
        // Remove from processing set
        setIsLiking(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  const handleDislike = async (postId: string | number) => {
    try {
      if (!userData?.userId) {
        Alert.alert('Please wait', 'Your profile is still loading. Please try again in a moment.');
        return;
      }

      // Prevent spam clicking
      if (isDisliking.has(postId)) {
        return;
      }

      setIsDisliking(prev => new Set(prev).add(postId));

      // Instant UI update (optimistic)
      dispatch(toggleDislikePost(postId));

      // Sync with Firebase in background
      try {
        await SimpleRealtimeService.dislikePost(postId.toString(), userData.userId);
        
        // Update social stats for dislike
        await SimpleRealtimeService.updateSocialStats(userData.userId, 'dislike');
        
        // Add points activity (smaller points for disliking)
        await SimpleRealtimeService.addPointsActivity(userData.userId, {
          activity: 'Disliked a post',
          activityType: 'social',
          points: 1,
          postId: postId.toString()
        });
      } catch (error) {
        console.error('Error syncing dislike with Firebase:', error);
        // Revert UI change on error
        dispatch(toggleDislikePost(postId));
        Alert.alert('Error', 'Failed to sync dislike with server. Please try again.');
      } finally {
        // Remove from processing set
        setIsDisliking(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error disliking post:', error);
      Alert.alert('Error', 'Failed to dislike post. Please try again.');
    }
  };

  const handleComment = (postId: string | number) => {
    setSelectedPostId(postId.toString());
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPostId(null);
  };

  const handleShare = (postId: string | number) => {
    Alert.alert('Share', `Share post ${postId}`);
  };

  const handleOpenCreatePost = () => {
    dispatch(openCreatePost());
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseCreatePost = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: modalHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dispatch(setIsCreatePostOpen(false));
      dispatch(setPostContent(''));
      dispatch(setSelectedImages([]));
      dispatch(setSelectedVideos([]));
      dispatch(setPostType('general'));
    });
  };

  const handlePost = async () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please write something to share!');
      return;
    }

    if (!userData?.userId) {
      Alert.alert('Please wait', 'Your profile is still loading. Please try again in a moment.');
      return;
    }

    try {
      // Use single source of truth for user data
      const displayName = userData.displayName || userData.name || 'User';
      const avatar = userData.avatar || '👤';
      const username = userData.username || `@${userData.email?.split('@')[0] || 'user'}`;
      
      const postData = {
        userId: userData.userId,
        userDisplayName: displayName,
        userAvatar: avatar,
        userUsername: username,
        content: postContent,
        image: selectedImages.length > 0 ? selectedImages[0] : null,
        video: selectedVideos.length > 0 ? selectedVideos[0] : null,
        type: postType,
        isPublic,
        likes: {},
        comments: 0,
        shares: 0,
      };
      
      // Close the modal IMMEDIATELY for better UX
      handleCloseCreatePost();
      
      // Show success message immediately
      Alert.alert('Success', 'Your post has been shared to the community!');
      
      // Do database operations in background (non-blocking)
      SimpleRealtimeService.createPost(postData).then(postId => {
        // After post is created, update stats with the actual post ID
        return Promise.all([
          SimpleRealtimeService.updateSocialStats(userData.userId, 'post'),
          SimpleRealtimeService.addPointsActivity(userData.userId, {
            activity: 'Created a post',
            activityType: 'social',
            points: 10,
            postId: postId
          })
        ]);
      }).catch(error => {
        console.error('Background post creation error:', error);
        // Could show a subtle error notification here if needed
      });
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to create post: ${errorMessage}`);
    }
  };

  // Media functions removed - not used in current UI

  // Show loading state if userData is not loaded yet
  if (!userData?.userId) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <HomeHeader />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <HomeHeader />
        <CreatePostButton onPress={handleOpenCreatePost} />
        
        {/* Social Posts Feed */}
        {posts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onDislike={handleDislike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))}
      </ScrollView>

      {/* Create Post Modal - Outside ScrollView for independent positioning */}
      <CreatePostModal
        visible={isCreatePostOpen}
        onClose={handleCloseCreatePost}
        postContent={postContent}
        setPostContent={(content) => dispatch(setPostContent(content))}
        selectedImages={selectedImages}
        setSelectedImages={(images) => dispatch(setSelectedImages(images))}
        selectedVideos={selectedVideos}
        setSelectedVideos={(videos) => dispatch(setSelectedVideos(videos))}
        postType={postType}
        setPostType={(type) => dispatch(setPostType(type))}
        isPublic={isPublic}
        setIsPublic={(isPublic) => dispatch(setIsPublic(isPublic))}
        onPost={handlePost}
        slideAnimation={slideAnimation}
        overlayOpacity={overlayOpacity}
        isLoading={isLoading}
      />
      
      {/* Comment Modal */}
      <CommentModal
        visible={showCommentModal}
        postId={selectedPostId || ''}
        currentUserId={userData?.userId}
        currentUserDisplayName={userData?.displayName || userData?.name || 'User'}
        currentUserAvatar={userData?.avatar || '👤'}
        onClose={handleCloseCommentModal}
      />
    </View>
  );
});

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
