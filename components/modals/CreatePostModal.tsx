import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const { height: screenHeight } = Dimensions.get('screen');

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  postContent: string;
  setPostContent: (content: string) => void;
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  selectedVideos: string[];
  setSelectedVideos: (videos: string[]) => void;
  postType: 'general' | 'achievement' | 'task' | 'question';
  setPostType: (type: 'general' | 'achievement' | 'task' | 'question') => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  onPost: () => void;
  slideAnimation: Animated.Value;
  overlayOpacity: Animated.Value;
  isLoading?: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  postContent,
  setPostContent,
  selectedImages,
  setSelectedImages,
  selectedVideos,
  setSelectedVideos,
  postType,
  setPostType,
  isPublic,
  setIsPublic,
  onPost,
  slideAnimation,
  overlayOpacity,
  isLoading = false,
}) => {
  const addImage = () => {
    const dummyImages = ['📸', '🖼️', '📷', '🎨'];
    const randomImage = dummyImages[Math.floor(Math.random() * dummyImages.length)];
    setSelectedImages([...selectedImages, randomImage]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    const dummyVideos = ['🎬', '📹', '🎥', '📱'];
    const randomVideo = dummyVideos[Math.floor(Math.random() * dummyVideos.length)];
    setSelectedVideos([...selectedVideos, randomVideo]);
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.postModalOverlay, { opacity: overlayOpacity }]}>
      <View 
        style={styles.modalBackground}
      >
        <Animated.View 
          style={[
            styles.createPostModal,
            { transform: [{ translateY: slideAnimation }] }
          ]}
        >
          {/* Modal Header - Fixed */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Create Post</ThemedText>
            <TouchableOpacity 
              onPress={onPost}
              style={[styles.postButton, { opacity: postContent.trim() && !isLoading ? 1 : 0.5 }]}
              disabled={!postContent.trim() || isLoading}
            >
              <ThemedText style={styles.postButtonText}>
                {isLoading ? 'Posting...' : 'Post'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
          </ScrollView>
        </Animated.View>
      </View>
    </Animated.View>

  );
};

const styles = StyleSheet.create({
  postModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Much higher z-index to ensure it appears above all content
    elevation: 9999, // For Android elevation
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 10000, // Even higher z-index for the background
    elevation: 10000, // For Android elevation
  },
  createPostModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.85, // Fixed height - 85% of screen height
    zIndex: 10001, // Highest z-index for the modal content
    elevation: 10001, // For Android elevation
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
  scrollableContent: {
    flex: 1,
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
