import { HOME_ACTION_TYPES } from './home.types.js'

export const HOME_INITIAL_STATE = {
  posts: [],
  isCreatePostOpen: false,
  postContent: '',
  selectedImages: [],
  selectedVideos: [],
  postType: 'general',
  isPublic: true,
  isLoading: false,
  error: null
}

export const homeReducer = (state = HOME_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case HOME_ACTION_TYPES.SET_POSTS:
      return {
        ...state,
        posts: payload,
      }
    
    case HOME_ACTION_TYPES.SET_IS_CREATE_POST_OPEN:
      return {
        ...state,
        isCreatePostOpen: payload,
      }
    
    case HOME_ACTION_TYPES.SET_POST_CONTENT:
      return {
        ...state,
        postContent: payload,
      }
    
    case HOME_ACTION_TYPES.SET_SELECTED_IMAGES:
      return {
        ...state,
        selectedImages: payload,
      }
    
    case HOME_ACTION_TYPES.SET_SELECTED_VIDEOS:
      return {
        ...state,
        selectedVideos: payload,
      }
    
    case HOME_ACTION_TYPES.SET_POST_TYPE:
      return {
        ...state,
        postType: payload,
      }
    
    case HOME_ACTION_TYPES.SET_IS_PUBLIC:
      return {
        ...state,
        isPublic: payload,
      }
    
    case HOME_ACTION_TYPES.ADD_POST:
      return {
        ...state,
        posts: [payload, ...state.posts],
      }
    
    case HOME_ACTION_TYPES.UPDATE_POST:
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === payload.id ? { ...post, ...payload } : post
        ),
      }
    
    case HOME_ACTION_TYPES.DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== payload),
      }
    
    case HOME_ACTION_TYPES.LIKE_POST:
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === payload 
            ? { 
                ...post, 
                isLiked: !post.isLiked, 
                likes: post.isLiked ? post.likes - 1 : post.likes + 1 
              }
            : post
        ),
      }
    
    case HOME_ACTION_TYPES.RESET_POST_FORM:
      return {
        ...state,
        postContent: '',
        selectedImages: [],
        selectedVideos: [],
        postType: 'general',
        isPublic: true,
      }
    
    // Async action handlers for create post
    case HOME_ACTION_TYPES.CREATE_POST_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case HOME_ACTION_TYPES.CREATE_POST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    
    case HOME_ACTION_TYPES.CREATE_POST_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // Async action handlers for fetch posts
    case HOME_ACTION_TYPES.FETCH_POSTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case HOME_ACTION_TYPES.FETCH_POSTS_SUCCESS:
      return {
        ...state,
        posts: payload, // Set the fetched posts
        isLoading: false,
        error: null,
      }
    
    case HOME_ACTION_TYPES.FETCH_POSTS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // Async action handlers for delete post
    case HOME_ACTION_TYPES.DELETE_POST_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case HOME_ACTION_TYPES.DELETE_POST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    
    case HOME_ACTION_TYPES.DELETE_POST_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    default:
      return state
  }
}
