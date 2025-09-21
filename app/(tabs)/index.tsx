import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput, Animated, Dimensions, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { height: screenHeight } = Dimensions.get('window');

// Dummy data for social feed
const socialPosts = [
  {
    id: 1,
    user: {
      name: 'Sarah Johnson',
      avatar: '👩‍💼',
      username: '@sarahj',
    },
    content: 'Just completed my 30-day productivity challenge! 🎉 The Pomodoro technique really changed my workflow. Who else is trying new productivity methods?',
    image: null as string | null,
    video: null as string | null,
    timestamp: '2h ago',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    type: 'general' as 'general' | 'achievement' | 'task' | 'question',
    isPublic: true,
  },
  {
    id: 2,
    user: {
      name: 'Mike Chen',
      avatar: '👨‍💻',
      username: '@mikechen',
    },
    content: 'Morning routine complete! ☀️ 5:30 AM wake-up, meditation, workout, and now ready to tackle the day. Consistency is key!',
    image: null as string | null,
    video: null as string | null,
    timestamp: '4h ago',
    likes: 18,
    comments: 5,
    shares: 2,
    isLiked: true,
    type: 'general' as 'general' | 'achievement' | 'task' | 'question',
    isPublic: true,
  },
  {
    id: 3,
    user: {
      name: 'Emma Davis',
      avatar: '👩‍🎨',
      username: '@emmadavis',
    },
    content: 'Finally organized my workspace! 📝 Clean desk, clear mind. Sometimes the best productivity hack is simply decluttering your environment.',
    image: null as string | null,
    video: null as string | null,
    timestamp: '6h ago',
    likes: 31,
    comments: 12,
    shares: 7,
    isLiked: false,
    type: 'general' as 'general' | 'achievement' | 'task' | 'question',
    isPublic: true,
  },
  {
    id: 4,
    user: {
      name: 'Alex Rodriguez',
      avatar: '👨‍🔬',
      username: '@alexrod',
    },
    content: 'Team collaboration session was amazing! 💡 Great ideas flowing when everyone is focused and engaged. Love working with motivated people.',
    image: null as string | null,
    video: null as string | null,
    timestamp: '8h ago',
    likes: 15,
    comments: 6,
    shares: 1,
    isLiked: false,
    type: 'general' as 'general' | 'achievement' | 'task' | 'question',
    isPublic: true,
  },
  {
    id: 5,
    user: {
      name: 'Lisa Zhang',
      avatar: '👩‍💻',
      username: '@lisazhang',
    },
    content: 'Just hit 100 completed tasks this month! 🏆 Small wins every day add up to big achievements. Keep pushing forward! 💪',
    image: null as string | null,
    video: null as string | null,
    timestamp: '1d ago',
    likes: 42,
    comments: 15,
    shares: 9,
    isLiked: true,
    type: 'achievement' as 'general' | 'achievement' | 'task' | 'question',
    isPublic: true,
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = React.useState(socialPosts);
  const [showCreatePost, setShowCreatePost] = React.useState(false);
  const [postContent, setPostContent] = React.useState('');
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = React.useState<string[]>([]);
  const [postType, setPostType] = React.useState<'general' | 'achievement' | 'task' | 'question'>('general');
  const [isPublic, setIsPublic] = React.useState(true);
  
  // Animation values
  const slideAnimation = React.useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const handleLike = (postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  const handleComment = (postId: number) => {
    Alert.alert('Comments', `View comments for post ${postId}`);
  };

  const handleShare = (postId: number) => {
    Alert.alert('Share', `Share post ${postId}`);
  };

  const openCreatePost = () => {
    setShowCreatePost(true);
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

  const closeCreatePost = () => {
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
      setShowCreatePost(false);
      setPostContent('');
      setSelectedImages([]);
      setSelectedVideos([]);
      setPostType('general');
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
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      closeCreatePost();
      Alert.alert('Success', 'Your post has been shared!');
    } else {
      Alert.alert('Error', 'Please write something to share!');
    }
  };

  const addImage = () => {
    // Simulate image selection
    const dummyImages = ['📸', '🖼️', '📷', '🎨'];
    const randomImage = dummyImages[Math.floor(Math.random() * dummyImages.length)];
    setSelectedImages([...selectedImages, randomImage]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    // Simulate video selection
    const dummyVideos = ['🎬', '📹', '🎥', '📱'];
    const randomVideo = dummyVideos[Math.floor(Math.random() * dummyVideos.length)];
    setSelectedVideos([...selectedVideos, randomVideo]);
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText type="title">Feed</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Stay connected with your productivity community</ThemedText>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <ThemedText style={styles.notificationIcon}>🔔</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Create Post Button */}
      <TouchableOpacity style={styles.createPostButton} onPress={openCreatePost}>
        <ThemedText style={styles.createPostIcon}>✏️</ThemedText>
        <ThemedText style={styles.createPostText}>What's on your mind?</ThemedText>
      </TouchableOpacity>

      {/* Social Posts Feed */}
      {posts.map((post) => (
        <View key={post.id} style={styles.postContainer}>
          {/* Reddit-style Post Card */}
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
                onPress={() => handleLike(post.id)}
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
                onPress={() => handleLike(post.id)}
              >
                <ThemedText style={styles.downvoteIcon}>⬇️</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleComment(post.id)}
              >
                <ThemedText style={styles.actionIcon}>💬</ThemedText>
                <ThemedText style={styles.actionText}>{post.comments}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <ThemedText style={styles.actionIcon}>🔖</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShare(post.id)}
              >
                <ThemedText style={styles.actionIcon}>📤</ThemedText>
                <ThemedText style={styles.actionText}>Share</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Create Post Modal */}
      {showCreatePost && (
        <Animated.View style={[styles.postModalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={closeCreatePost}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.createPostModal,
                { transform: [{ translateY: slideAnimation }] }
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeCreatePost}>
                  <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Create Post</ThemedText>
                <TouchableOpacity 
                  onPress={handlePost}
                  style={[styles.postButton, { opacity: postContent.trim() ? 1 : 0.5 }]}
                  disabled={!postContent.trim()}
                >
                  <ThemedText style={styles.postButtonText}>Post</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Post Type Selection */}
              <View style={styles.postTypeContainer}>
                <ThemedText style={styles.postTypeLabel}>Post Type:</ThemedText>
                <View style={styles.postTypeButtons}>
                  {[
                    { key: 'general', label: 'General', icon: '💭' },
                    { key: 'achievement', label: 'Achievement', icon: '🏆' },
                    { key: 'task', label: 'Task Update', icon: '✅' },
                    { key: 'question', label: 'Question', icon: '❓' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.postTypeButton,
                        postType === type.key && styles.selectedPostType
                      ]}
                      onPress={() => setPostType(type.key as any)}
                    >
                      <ThemedText style={styles.postTypeIcon}>{type.icon}</ThemedText>
                      <ThemedText style={[
                        styles.postTypeText,
                        postType === type.key && styles.selectedPostTypeText
                      ]}>
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Content Input */}
              <View style={styles.contentContainer}>
                <TextInput
                  style={styles.contentInput}
                  placeholder="Share your thoughts, achievements, or ask a question..."
                  placeholderTextColor="#999"
                  value={postContent}
                  onChangeText={setPostContent}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <ThemedText style={styles.characterCount}>
                  {postContent.length}/500
                </ThemedText>
              </View>

              {/* Media Selection */}
              <View style={styles.mediaSection}>
                <View style={styles.mediaSectionHeader}>
                  <ThemedText style={styles.mediaSectionTitle}>Media</ThemedText>
                  <View style={styles.mediaButtons}>
                    <TouchableOpacity style={styles.addMediaButton} onPress={addImage}>
                      <ThemedText style={styles.addMediaIcon}>📷</ThemedText>
                      <ThemedText style={styles.addMediaText}>Photo</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addMediaButton} onPress={addVideo}>
                      <ThemedText style={styles.addMediaIcon}>🎬</ThemedText>
                      <ThemedText style={styles.addMediaText}>Video</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Images Preview */}
                {selectedImages.length > 0 && (
                  <View style={styles.mediaPreviewSection}>
                    <ThemedText style={styles.mediaPreviewTitle}>Photos ({selectedImages.length})</ThemedText>
                    <ScrollView horizontal style={styles.mediaPreviewContainer}>
                      {selectedImages.map((image, index) => (
                        <View key={`img-${index}`} style={styles.mediaPreview}>
                          <ThemedText style={styles.mediaPreviewText}>{image}</ThemedText>
                          <TouchableOpacity 
                            style={styles.removeMediaButton}
                            onPress={() => removeImage(index)}
                          >
                            <ThemedText style={styles.removeMediaIcon}>✕</ThemedText>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Videos Preview */}
                {selectedVideos.length > 0 && (
                  <View style={styles.mediaPreviewSection}>
                    <ThemedText style={styles.mediaPreviewTitle}>Videos ({selectedVideos.length})</ThemedText>
                    <ScrollView horizontal style={styles.mediaPreviewContainer}>
                      {selectedVideos.map((video, index) => (
                        <View key={`vid-${index}`} style={[styles.mediaPreview, styles.videoPreview]}>
                          <ThemedText style={styles.mediaPreviewText}>{video}</ThemedText>
                          <View style={styles.videoPlayButton}>
                            <ThemedText style={styles.playIcon}>▶️</ThemedText>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeMediaButton}
                            onPress={() => removeVideo(index)}
                          >
                            <ThemedText style={styles.removeMediaIcon}>✕</ThemedText>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Post Options */}
              <View style={styles.postOptions}>
                <View style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <ThemedText style={styles.optionIcon}>🌍</ThemedText>
                    <View>
                      <ThemedText style={styles.optionTitle}>Public Post</ThemedText>
                      <ThemedText style={styles.optionDescription}>
                        Anyone can see this post
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.toggleButton}
                    onPress={() => setIsPublic(!isPublic)}
                  >
                    <View style={[
                      styles.toggleCircle,
                      isPublic && styles.toggleCircleActive
                    ]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <ThemedText style={styles.optionIcon}>🏷️</ThemedText>
                    <ThemedText style={styles.optionTitle}>Add Hashtags</ThemedText>
                  </View>
                  <TouchableOpacity style={styles.hashtagButton}>
                    <ThemedText style={styles.hashtagIcon}>#</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <ThemedText style={styles.optionIcon}>👥</ThemedText>
                    <ThemedText style={styles.optionTitle}>Mention People</ThemedText>
                  </View>
                  <TouchableOpacity style={styles.mentionButton}>
                    <ThemedText style={styles.mentionIcon}>@</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  createPostIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  createPostText: {
    fontSize: 16,
    opacity: 0.6,
  },
  // Reddit-style container
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
  // Create Post Modal Styles
  postModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createPostModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Post Type Selection
  postTypeContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  postTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  postTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  postTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  selectedPostType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  postTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  selectedPostTypeText: {
    color: 'white',
  },
  // Content Input
  contentContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentInput: {
    fontSize: 16,
    color: '#333333',
    minHeight: 100,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 8,
  },
  // Media Section
  mediaSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addMediaIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addMediaText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  mediaPreviewSection: {
    marginBottom: 12,
  },
  mediaPreviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
  },
  mediaPreview: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  mediaPreviewText: {
    fontSize: 24,
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaIcon: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  // Post Options
  postOptions: {
    padding: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  // Toggle Button
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  // Action Buttons
  hashtagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagIcon: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  mentionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentionIcon: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
