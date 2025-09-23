import React from 'react';
import { StyleSheet, ScrollView, Alert, Animated, Dimensions } from 'react-native';
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
  selectIsPublic 
} from '../../store/home/home.selector';
import { 
  openCreatePost, 
  likePost,
  addPost,
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
  
  // Animation values
  const slideAnimation = React.useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const handleLike = (postId: number) => {
    dispatch(likePost(postId));
  };

  const handleComment = (postId: number) => {
    Alert.alert('Comments', `View comments for post ${postId}`);
  };

  const handleShare = (postId: number) => {
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
        toValue: screenHeight,
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

  const handlePost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        user: {
          name: 'You',
          avatar: '👤',
          username: '@you',
        },
        content: postContent,
        image: selectedImages.length > 0 ? selectedImages[0] : null,
        video: selectedVideos.length > 0 ? selectedVideos[0] : null,
        timestamp: 'now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        type: postType,
        isPublic,
      };
      
      dispatch(addPost(newPost));
      handleCloseCreatePost();
      Alert.alert('Success', 'Your post has been shared!');
    } else {
      Alert.alert('Error', 'Please write something to share!');
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
    <ScrollView style={styles.container}>
      <HomeHeader />
      <CreatePostButton onPress={handleOpenCreatePost} />
      
      {/* Social Posts Feed */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      ))}

      {/* Create Post Modal */}
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
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
