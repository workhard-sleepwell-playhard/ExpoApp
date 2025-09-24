import { HOME_ACTION_TYPES } from './home.types.js'
import { PostService } from '../../src/services/firebase-service.ts'

export const setPosts = (posts) => ({
  type: HOME_ACTION_TYPES.SET_POSTS,
  payload: posts
})

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

export const likePost = (postId) => ({
  type: HOME_ACTION_TYPES.LIKE_POST,
  payload: postId
})

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

      // Create post in Firebase
      const mediaData = {};
      
      // Only add media fields if they have values (Firebase doesn't accept undefined)
      if (postData.image) {
        mediaData.images = [postData.image];
      }
      if (postData.video) {
        mediaData.videos = [postData.video];
      }

      // Prepare Firebase post data, filtering out undefined values
      const firebasePostData = {
        userId: 'current-user-id', // TODO: Get from auth context
        userDisplayName: postData.user.name,
        userAvatar: postData.user.avatar,
        userUsername: postData.user.username,
        content: postData.content,
        type: postData.type,
        visibility: postData.isPublic ? 'public' : 'private',
        hashtags: [], // TODO: Extract hashtags from content
        mentions: [], // TODO: Extract mentions from content
      };

      // Only add media if it has content
      if (Object.keys(mediaData).length > 0) {
        firebasePostData.media = mediaData;
      }

      const postId = await PostService.createPost(firebasePostData)

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

export const handleLikePost = (postId) => likePost(postId)

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
      await PostService.deletePost(postId.toString())

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

// Async thunk function for fetching posts with Firebase integration
export const fetchPosts = (userId) => {
  return async (dispatch, getState) => {
    try {
      // Dispatch REQUEST action to show loading state
      dispatch({ 
        type: HOME_ACTION_TYPES.FETCH_POSTS_REQUEST 
      })

      let posts;
      
      if (userId) {
        // Fetch posts by specific user
        posts = await PostService.getPostsByUser(userId, 50)
      } else {
        // Fetch all public posts
        posts = await PostService.getPosts(50)
      }

      // Transform Firebase posts to match our local post format
      const transformedPosts = posts.map(firebasePost => ({
        id: firebasePost.postId, // Use Firebase document ID as local id
        postId: firebasePost.postId, // Keep Firebase document ID for deletion
        user: {
          name: firebasePost.userDisplayName,
          avatar: firebasePost.userAvatar || '👤',
          username: firebasePost.userUsername || '@user'
        },
        content: firebasePost.content,
        image: firebasePost.media?.images?.[0] || null,
        video: firebasePost.media?.videos?.[0] || null,
        type: firebasePost.type || 'general',
        isPublic: firebasePost.visibility === 'public',
        timestamp: firebasePost.createdAt?.toDate?.() ? 
          firebasePost.createdAt.toDate().toLocaleDateString() : 'now',
        likes: firebasePost.engagement?.likes || 0,
        comments: firebasePost.engagement?.comments || 0,
        shares: firebasePost.engagement?.shares || 0,
        isLiked: false, // TODO: Check if current user has liked this post
      }))

      // Dispatch SUCCESS action
      dispatch({ 
        type: HOME_ACTION_TYPES.FETCH_POSTS_SUCCESS, 
        payload: transformedPosts 
      })

      // Also set posts in local state for immediate UI update
      dispatch(setPosts(transformedPosts))

      return transformedPosts
    } catch (error) {
      // Dispatch ERROR action
      dispatch({ 
        type: HOME_ACTION_TYPES.FETCH_POSTS_ERROR, 
        payload: error.message 
      })
      
      // Re-throw error so calling code can handle it
      throw error
    }
  }
}
