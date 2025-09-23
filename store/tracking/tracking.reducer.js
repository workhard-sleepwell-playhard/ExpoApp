import { TRACKING_ACTION_TYPES } from './tracking.types.js'

export const TRACKING_INITIAL_STATE = {
  trackingData: [],
  weeklyProgress: [],
  taskCompletionData: [],
  dailyPointsData: [],
  currentSlide: 0,
  timePeriod: 'week',
  showCustomDatePicker: false,
  customDateFrom: '',
  customDateTo: '',
  isLoading: false,
  error: null
}

export const trackingReducer = (state = TRACKING_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case TRACKING_ACTION_TYPES.SET_TRACKING_DATA:
      return {
        ...state,
        trackingData: payload,
      }
    
    case TRACKING_ACTION_TYPES.SET_WEEKLY_PROGRESS:
      return {
        ...state,
        weeklyProgress: payload,
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
    
    case TRACKING_ACTION_TYPES.ADD_TRACKING_ENTRY:
      return {
        ...state,
        trackingData: [payload, ...state.trackingData],
      }
    
    case TRACKING_ACTION_TYPES.UPDATE_TRACKING_ENTRY:
      return {
        ...state,
        trackingData: state.trackingData.map(entry => 
          entry.id === payload.id ? { ...entry, ...payload } : entry
        ),
      }
    
    case TRACKING_ACTION_TYPES.DELETE_TRACKING_ENTRY:
      return {
        ...state,
        trackingData: state.trackingData.filter(entry => entry.id !== payload),
      }
    
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
    
    default:
      return state
  }
}
