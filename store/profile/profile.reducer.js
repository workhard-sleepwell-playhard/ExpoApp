import { PROFILE_ACTION_TYPES } from './profile.types.js'

export const PROFILE_INITIAL_STATE = {
  userData: {
    name: '',
    email: '',
    joinDate: '',
    avatar: '👤',
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      currentStreak: 0,
      totalPoints: 0,
    }
  },
  achievements: [
    {
      id: 1,
      title: 'Streak Master',
      description: '15-day streak achieved!',
      icon: 'trophy.fill',
      color: '#FFD700',
      date: '2 days ago'
    },
    {
      id: 2,
      title: 'Task Master',
      description: '100 tasks completed!',
      icon: 'checkmark.seal.fill',
      color: '#34C759',
      date: '1 week ago'
    },
    {
      id: 3,
      title: 'Early Bird',
      description: '5 tasks before 9 AM',
      icon: 'sunrise.fill',
      color: '#007AFF',
      date: '2 weeks ago'
    }
  ],
  notificationsEnabled: true,
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
    
    case PROFILE_ACTION_TYPES.SET_USER_STATS:
      return {
        ...state,
        userData: {
          ...state.userData,
          stats: { ...state.userData.stats, ...payload },
        },
      }
    
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
