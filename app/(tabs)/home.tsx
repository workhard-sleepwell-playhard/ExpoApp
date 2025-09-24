import React from 'react';
import { StyleSheet, ScrollView, View, Alert, Animated, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Import Redux selectors and actions
import { 
  selectPosts, 
  selectIsCreatePostOpen, 
  selectPostContent, 
  selectSelectedImages, 
  selectSelectedVideos, 
  selectPostType, 
  selectIsPublic,
  selectIsLoading,
  selectError
} from '../../store/home/home.selector';
import { 
  openCreatePost, 
  likePost,
  addPost,
  createPost,
  addImageToPost,
  removeImageFromPost,
  addVideoToPost,
  removeVideoFromPost,
  setPostContent,
  setPostType,
  setIsPublic,
  setIsCreatePostOpen,
  setSelectedImages,
  setSelectedVideos
} from '../../store/home/home.action';

// Import new components
import { HomeHeader } from '../../components/tabscomponents/home/homeHeader.component';
import { CreatePostButton } from '../../components/tabscomponents/home/homeCreatePostButton.component';
import { PostCard } from '../../components/tabscomponents/home/homePostCard.component';
import { CreatePostModal } from '@/components/modals/CreatePostModal';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Redux state
  const posts = useSelector(selectPosts);
  const isCreatePostOpen = useSelector(selectIsCreatePostOpen);
  const postContent = useSelector(selectPostContent);
  const selectedImages = useSelector(selectSelectedImages);
  const selectedVideos = useSelector(selectSelectedVideos);
  const postType = useSelector(selectPostType);
  const isPublic = useSelector(selectIsPublic);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Animation values - using modal height instead of full screen height
  const modalHeight = screenHeight * 0.85;
  const slideAnimation = React.useRef(new Animated.Value(modalHeight)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const handleLike = (postId: string | number) => {
    dispatch(likePost(Number(postId)));
  };

  const handleComment = (postId: string | number) => {
    Alert.alert('Comments', `View comments for post ${postId}`);
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

    try {
      const newPost = {
        user: {
          name: 'You',
          avatar: '👤',
          username: '@you',
        },
        content: postContent,
        image: selectedImages.length > 0 ? selectedImages[0] : null,
        video: selectedVideos.length > 0 ? selectedVideos[0] : null,
        type: postType,
        isPublic,
      };
      
      // Use the async thunk function that sends to Firebase
      await dispatch(createPost(newPost));
      Alert.alert('Success', 'Your post has been shared to the community!');
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to create post: ${errorMessage}`);
    }
  };

  const addImage = () => {
    // Simulate image selection
    const dummyImages = ['📸', '🖼️', '📷', '🎨'];
    const randomImage = dummyImages[Math.floor(Math.random() * dummyImages.length)];
    dispatch(addImageToPost(randomImage));
  };

  const removeImage = (index: number) => {
    dispatch(removeImageFromPost(index));
  };

  const addVideo = () => {
    // Simulate video selection
    const dummyVideos = ['🎬', '📹', '🎥', '📱'];
    const randomVideo = dummyVideos[Math.floor(Math.random() * dummyVideos.length)];
    dispatch(addVideoToPost(randomVideo));
  };

  const removeVideo = (index: number) => {
    dispatch(removeVideoFromPost(index));
  };

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
});
