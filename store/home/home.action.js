import { HOME_ACTION_TYPES } from './home.types.js'

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

export const createPost = (postData) => {
  return (dispatch, getState) => {
    const { posts } = getState().home
    const newPost = {
      id: posts.length + 1,
      ...postData,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    }
    
    dispatch(addPost(newPost))
    dispatch(closeCreatePost())
    dispatch(resetPostForm())
  }
}

export const handleLikePost = (postId) => likePost(postId)

export const addImageToPost = (image) => setSelectedImages([image])

export const removeImageFromPost = (index) => setSelectedImages([])

export const addVideoToPost = (video) => setSelectedVideos([video])

export const removeVideoFromPost = (index) => setSelectedVideos([])
