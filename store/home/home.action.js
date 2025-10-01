import { HOME_ACTION_TYPES } from './home.types.js'
import { SimpleRealtimeService } from '../../src/services/simple-realtime'
import { MediaUploadService } from '../../src/services/media-upload-service'

// Helper functions for content parsing
const extractHashtags = (content) => {
  if (!content) return [];
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return content.match(hashtagRegex) || [];
};

const extractMentions = (content) => {
  if (!content) return [];
  const mentionRegex = /@[\w\u0590-\u05ff]+/g;
  return content.match(mentionRegex) || [];
};

export const setPosts = (posts) => ({
  type: HOME_ACTION_TYPES.SET_POSTS,
  payload: posts
})

// Removed complex real-time actions - keeping it simple

export const setIsCreatePostOpen = (isOpen) => ({
  type: HOME_ACTION_TYPES.SET_IS_CREATE_POST_OPEN,
  payload: isOpen
})

export const setPostContent = (content) => ({
  type: HOME_ACTION_TYPES.SET_POST_CONTENT,
  payload: content
})

export const setSelectedImages = (images) => ({
  type: HOME_ACTION_TYPES.SET_SELECTED_IMAGES,
  payload: images
})

export const setSelectedVideos = (videos) => ({
  type: HOME_ACTION_TYPES.SET_SELECTED_VIDEOS,
  payload: videos
})

export const setPostType = (postType) => ({
  type: HOME_ACTION_TYPES.SET_POST_TYPE,
  payload: postType
})

export const setIsPublic = (isPublic) => ({
  type: HOME_ACTION_TYPES.SET_IS_PUBLIC,
  payload: isPublic
})

export const addPost = (post) => ({
  type: HOME_ACTION_TYPES.ADD_POST,
  payload: post
})

export const updatePost = (post) => ({
  type: HOME_ACTION_TYPES.UPDATE_POST,
  payload: post
})

export const deletePost = (postId) => ({
  type: HOME_ACTION_TYPES.DELETE_POST,
  payload: postId
})

// Removed likePost - handling likes directly in Realtime Database

export const resetPostForm = () => ({
  type: HOME_ACTION_TYPES.RESET_POST_FORM
})

// Helper action creators
export const openCreatePost = () => setIsCreatePostOpen(true)

export const closeCreatePost = () => setIsCreatePostOpen(false)

// Async thunk function for creating posts with Firebase integration
export const createPost = (postData) => {
  return async (dispatch, getState) => {
    try {
      // Dispatch REQUEST action to show loading state
      dispatch({ 
        type: HOME_ACTION_TYPES.CREATE_POST_REQUEST 
      })

      // Get current user from auth state
      const currentUser = getState().auth.currentUser;
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found');
      }

      // Generate post ID first (needed for storage path)
      const tempPostId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Upload media files if present
      const mediaUrls = await MediaUploadService.uploadPostMedia(
        postData.selectedImages || [],
        postData.selectedVideos || [],
        currentUser.uid,
        tempPostId
      );

      // Prepare media data for Firebase
      const mediaData = {};
      if (mediaUrls.imageUrls.length > 0) {
        mediaData.images = mediaUrls.imageUrls;
      }
      if (mediaUrls.videoUrls.length > 0) {
        mediaData.videos = mediaUrls.videoUrls;
      }

      // Use the user data that's already passed from the component
      // This ensures we use the same data that's displayed in the UI
      const userDisplayName = postData.user.name;
      const userAvatar = postData.user.avatar;
      const userUsername = postData.user.username;

      // Prepare Firebase post data, filtering out undefined values
      const firebasePostData = {
        userId: currentUser.uid, // Use actual user UID
        userDisplayName: userDisplayName,
        userAvatar: userAvatar,
        userUsername: userUsername,
        content: postData.content,
        type: postData.type,
        visibility: postData.isPublic ? 'public' : 'private',
        hashtags: extractHashtags(postData.content),
        mentions: extractMentions(postData.content)
      };

      // Only add media if it has content
      if (Object.keys(mediaData).length > 0) {
        firebasePostData.media = mediaData;
      }

      const postId = await SimpleRealtimeService.createPost(firebasePostData)

      // Initialize user points if not exists
      await SimpleRealtimeService.initializeUserPoints(currentUser.uid)
      
      // Update social stats for post creation
      await SimpleRealtimeService.updateSocialStats(currentUser.uid, 'post')
      
      // Add points activity
      await SimpleRealtimeService.addPointsActivity(currentUser.uid, {
        activity: 'Created a new post',
        activityType: 'social',
        points: 10,
        postId: postId
      })

      // Create local post object for immediate UI update
      const { posts } = getState().home
      const newPost = {
        id: postId, // Use Firebase-generated ID
        postId: postId, // Also store as postId for compatibility
        ...postData,
        timestamp: 'now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
      }

      // Dispatch SUCCESS action
      dispatch({ 
        type: HOME_ACTION_TYPES.CREATE_POST_SUCCESS, 
        payload: newPost 
      })

      // Also add to local state for immediate UI update (hybrid approach)
      dispatch(addPost(newPost))
      
      // Close modal and reset form
      dispatch(closeCreatePost())
      dispatch(resetPostForm())

      return postId
    } catch (error) {
      // Dispatch ERROR action
      dispatch({ 
        type: HOME_ACTION_TYPES.CREATE_POST_ERROR, 
        payload: error.message 
      })
      
      // Re-throw error so calling code can handle it
      throw error
    }
  }
}

// Removed handleLikePost - handling likes directly in Realtime Database

export const addImageToPost = (image) => setSelectedImages([image])

export const removeImageFromPost = (index) => setSelectedImages([])

export const addVideoToPost = (video) => setSelectedVideos([video])

export const removeVideoFromPost = (index) => setSelectedVideos([])

// Async thunk function for deleting posts with Firebase integration
export const deletePostAsync = (postId) => {
  return async (dispatch, getState) => {
    try {
      // Dispatch REQUEST action to show loading state
      dispatch({ 
        type: HOME_ACTION_TYPES.DELETE_POST_REQUEST 
      })

      // Delete post from Firebase (postId should be the Firebase document ID)
      await SimpleRealtimeService.deletePost(postId.toString())

      // Dispatch SUCCESS action
      dispatch({ 
        type: HOME_ACTION_TYPES.DELETE_POST_SUCCESS, 
        payload: postId 
      })

      // Also remove from local state for immediate UI update
      dispatch(deletePost(postId))

      return postId
    } catch (error) {
      // Dispatch ERROR action
      dispatch({ 
        type: HOME_ACTION_TYPES.DELETE_POST_ERROR, 
        payload: error.message 
      })
      
      // Re-throw error so calling code can handle it
      throw error
    }
  }
}

// Simple fetch posts function using Realtime Database
export const fetchPosts = async () => {
  try {
    const posts = await SimpleRealtimeService.getPosts();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Instant UI toggle actions (optimistic updates)
export const toggleLikePost = (postId) => ({
  type: HOME_ACTION_TYPES.LIKE_POST,
  payload: postId
})

export const toggleDislikePost = (postId) => ({
  type: HOME_ACTION_TYPES.DISLIKE_POST,
  payload: postId
})
