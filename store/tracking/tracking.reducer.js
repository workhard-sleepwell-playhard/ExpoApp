import { TRACKING_ACTION_TYPES } from './tracking.types.js'

export const TRACKING_INITIAL_STATE = {
  // UI State
  currentSlide: 0,
  timePeriod: 'week',
  showCustomDatePicker: false,
  customDateFrom: '',
  customDateTo: '',
  isLoading: false,
  error: null,
  
  // Firebase Data (new pattern)
  trackingSessions: [],
  trackingAnalytics: [],
  weeklyProgressData: [],
  taskCompletionData: [],
  dailyPointsData: [],
  categoriesData: [],
  
  
}

export const trackingReducer = (state = TRACKING_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    // UI State Actions
    case TRACKING_ACTION_TYPES.SET_CURRENT_SLIDE:
      return {
        ...state,
        currentSlide: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_TIME_PERIOD:
      return {
        ...state,
        timePeriod: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_SHOW_CUSTOM_DATE_PICKER:
      return {
        ...state,
        showCustomDatePicker: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_CUSTOM_DATE_FROM:
      return {
        ...state,
        customDateFrom: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_CUSTOM_DATE_TO:
      return {
        ...state,
        customDateTo: payload,
      }
    
    // Chart Navigation Actions
    case TRACKING_ACTION_TYPES.NEXT_SLIDE:
      return {
        ...state,
        currentSlide: (state.currentSlide + 1) % 3, // Assuming 3 slides
      }
    
    case TRACKING_ACTION_TYPES.PREV_SLIDE:
      return {
        ...state,
        currentSlide: (state.currentSlide - 1 + 3) % 3, // Assuming 3 slides
      }
    
    case TRACKING_ACTION_TYPES.NAVIGATE_TIME_PERIOD:
      const timePeriods = ['week', 'month', 'year', 'all-time']
      const currentIndex = timePeriods.indexOf(state.timePeriod)
      let newIndex
      
      if (payload === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : timePeriods.length - 1
      } else {
        newIndex = currentIndex < timePeriods.length - 1 ? currentIndex + 1 : 0
      }
      
      return {
        ...state,
        timePeriod: timePeriods[newIndex],
      }
    
    case TRACKING_ACTION_TYPES.APPLY_CUSTOM_DATE_RANGE:
      return {
        ...state,
        timePeriod: 'custom',
        showCustomDatePicker: false,
      }
    
    // Firebase Data Actions
    case TRACKING_ACTION_TYPES.SET_TRACKING_SESSIONS:
      return {
        ...state,
        trackingSessions: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_TRACKING_ANALYTICS:
      return {
        ...state,
        trackingAnalytics: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_WEEKLY_PROGRESS_DATA:
      return {
        ...state,
        weeklyProgressData: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_TASK_COMPLETION_DATA:
      return {
        ...state,
        taskCompletionData: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_DAILY_POINTS_DATA:
      return {
        ...state,
        dailyPointsData: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_CATEGORIES_DATA:
      return {
        ...state,
        categoriesData: payload,
      }
    
    // Async action handlers for create session
    case TRACKING_ACTION_TYPES.CREATE_SESSION_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case TRACKING_ACTION_TYPES.CREATE_SESSION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    
    case TRACKING_ACTION_TYPES.CREATE_SESSION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // Async action handlers for create analytics
    case TRACKING_ACTION_TYPES.CREATE_ANALYTICS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case TRACKING_ACTION_TYPES.CREATE_ANALYTICS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    
    case TRACKING_ACTION_TYPES.CREATE_ANALYTICS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    
    default:
      return state
  }
}
