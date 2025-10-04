import { PROFILE_ACTION_TYPES } from './profile.types.js'

export const PROFILE_INITIAL_STATE = {
  // Single user data object with all profile and points data
  userData: {
    // Profile data
    userId: '',
    name: '',
    email: '',
    displayName: '',
    username: '',
    avatar: '👤',
    avatarId: null,
    avatarData: null,
    bio: '',
    joinDate: '',
    
    // Settings
    notificationsEnabled: true,
    theme: 'auto',
    privacy: 'public',
    language: 'en',
    timezone: 'UTC',
    
    // Points & stats
    totalPoints: 0,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    
    // Task stats
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    currentStreak: 0,
    
    // Social stats
    postsCreated: 0,
    postsLiked: 0,
    postsShared: 0,
    commentsMade: 0,
    socialEngagement: 0,
    
    // Goals
    dailyTaskGoal: 5,
    dailyTimeGoal: 480,
    
    // Timestamps
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null,
    lastActivityAt: null
  },
  achievements: [], // Will be populated from Firebase user data
  showSettings: false,
  showEditProfile: false,
  isLoading: false,
  error: null
}

export const profileReducer = (state = PROFILE_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case PROFILE_ACTION_TYPES.SET_USER_DATA:
      return {
        ...state,
        userData: { ...state.userData, ...payload },
      }
    
    case PROFILE_ACTION_TYPES.SET_NOTIFICATIONS_ENABLED:
      return {
        ...state,
        notificationsEnabled: payload,
      }
    
    case PROFILE_ACTION_TYPES.SET_SHOW_SETTINGS:
      return {
        ...state,
        showSettings: payload,
      }
    
    case PROFILE_ACTION_TYPES.SET_SHOW_EDIT_PROFILE:
      return {
        ...state,
        showEditProfile: payload,
      }
    
    case PROFILE_ACTION_TYPES.SET_USER_NAME:
      return {
        ...state,
        userData: {
          ...state.userData,
          name: payload,
        },
      }
    
    case PROFILE_ACTION_TYPES.SET_USER_EMAIL:
      return {
        ...state,
        userData: {
          ...state.userData,
          email: payload,
        },
      }
    
    case PROFILE_ACTION_TYPES.SET_USER_AVATAR:
      return {
        ...state,
        userData: {
          ...state.userData,
          avatar: payload,
        },
      }
    
    // SET_USER_STATS removed - now part of SET_USER_DATA
    
    case PROFILE_ACTION_TYPES.SET_ACHIEVEMENTS:
      return {
        ...state,
        achievements: payload,
      }
    
    case PROFILE_ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        userData: { ...state.userData, ...payload },
      }
    
    case PROFILE_ACTION_TYPES.TOGGLE_NOTIFICATIONS:
      return {
        ...state,
        notificationsEnabled: !state.notificationsEnabled,
      }
    
    case PROFILE_ACTION_TYPES.OPEN_SETTINGS:
      return {
        ...state,
        showSettings: true,
      }
    
    case PROFILE_ACTION_TYPES.CLOSE_SETTINGS:
      return {
        ...state,
        showSettings: false,
      }
    
    case PROFILE_ACTION_TYPES.OPEN_EDIT_PROFILE:
      return {
        ...state,
        showEditProfile: true,
      }
    
    case PROFILE_ACTION_TYPES.CLOSE_EDIT_PROFILE:
      return {
        ...state,
        showEditProfile: false,
      }
    
    // Firebase Profile Actions
    case PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_SUCCESS:
      return {
        ...state,
        userData: { ...state.userData, ...payload },
        achievements: payload.achievements || [],
        isLoading: false,
        error: null,
      };
    
    case PROFILE_ACTION_TYPES.FETCH_USER_PROFILE_FAILED:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    case PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS:
      return {
        ...state,
        userData: { ...state.userData, ...payload },
        isLoading: false,
        error: null,
      }
    
    case PROFILE_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    default:
      return state
  }
}
