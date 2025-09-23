import { TRACKING_ACTION_TYPES } from './tracking.types.js'

export const setTrackingData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_TRACKING_DATA,
  payload: data
})

export const setWeeklyProgress = (progress) => ({
  type: TRACKING_ACTION_TYPES.SET_WEEKLY_PROGRESS,
  payload: progress
})

export const setTaskCompletionData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_TASK_COMPLETION_DATA,
  payload: data
})

export const setDailyPointsData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_DAILY_POINTS_DATA,
  payload: data
})

export const setCurrentSlide = (slide) => ({
  type: TRACKING_ACTION_TYPES.SET_CURRENT_SLIDE,
  payload: slide
})

export const setTimePeriod = (period) => ({
  type: TRACKING_ACTION_TYPES.SET_TIME_PERIOD,
  payload: period
})

export const setShowCustomDatePicker = (show) => ({
  type: TRACKING_ACTION_TYPES.SET_SHOW_CUSTOM_DATE_PICKER,
  payload: show
})

export const setCustomDateFrom = (date) => ({
  type: TRACKING_ACTION_TYPES.SET_CUSTOM_DATE_FROM,
  payload: date
})

export const setCustomDateTo = (date) => ({
  type: TRACKING_ACTION_TYPES.SET_CUSTOM_DATE_TO,
  payload: date
})

export const addTrackingEntry = (entry) => ({
  type: TRACKING_ACTION_TYPES.ADD_TRACKING_ENTRY,
  payload: entry
})

export const updateTrackingEntry = (entry) => ({
  type: TRACKING_ACTION_TYPES.UPDATE_TRACKING_ENTRY,
  payload: entry
})

export const deleteTrackingEntry = (entryId) => ({
  type: TRACKING_ACTION_TYPES.DELETE_TRACKING_ENTRY,
  payload: entryId
})

export const nextSlide = () => ({
  type: TRACKING_ACTION_TYPES.NEXT_SLIDE
})

export const prevSlide = () => ({
  type: TRACKING_ACTION_TYPES.PREV_SLIDE
})

export const navigateTimePeriod = (direction) => ({
  type: TRACKING_ACTION_TYPES.NAVIGATE_TIME_PERIOD,
  payload: direction
})

export const applyCustomDateRange = (fromDate, toDate) => ({
  type: TRACKING_ACTION_TYPES.APPLY_CUSTOM_DATE_RANGE,
  payload: { fromDate, toDate }
})

// Helper action creators
export const handleNextSlide = () => {
  return (dispatch) => {
    dispatch(nextSlide())
  }
}

export const handlePrevSlide = () => {
  return (dispatch) => {
    dispatch(prevSlide())
  }
}

export const handleNavigateTimePeriod = (direction) => {
  return (dispatch) => {
    dispatch(navigateTimePeriod(direction))
    console.log(`Time period changed to: ${direction}`)
  }
}

export const handleCustomDateClick = () => {
  return (dispatch) => {
    dispatch(setShowCustomDatePicker(true))
  }
}

export const handleCloseCustomDatePicker = () => {
  return (dispatch) => {
    dispatch(setShowCustomDatePicker(false))
  }
}

export const handleApplyCustomDateRange = (fromDate, toDate) => {
  return (dispatch) => {
    dispatch(setCustomDateFrom(fromDate))
    dispatch(setCustomDateTo(toDate))
    dispatch(applyCustomDateRange(fromDate, toDate))
  }
}

export const createTrackingEntry = (entryData) => {
  return (dispatch, getState) => {
    const { trackingData } = getState().tracking
    const newEntry = {
      id: trackingData.length + 1,
      ...entryData,
      createdAt: new Date().toISOString(),
    }
    
    dispatch(addTrackingEntry(newEntry))
  }
}

export const updateTrackingEntryData = (entryId, updates) => {
  return (dispatch, getState) => {
    const { trackingData } = getState().tracking
    const entry = trackingData.find(e => e.id === entryId)
    
    if (entry) {
      dispatch(updateTrackingEntry({
        ...entry,
        ...updates,
        updatedAt: new Date().toISOString()
      }))
    }
  }
}

export const removeTrackingEntry = (entryId) => {
  return (dispatch) => {
    dispatch(deleteTrackingEntry(entryId))
  }
}

export const loadTrackingData = (data) => {
  return (dispatch) => {
    dispatch(setTrackingData(data.trackingData || []))
    dispatch(setWeeklyProgress(data.weeklyProgress || []))
    dispatch(setTaskCompletionData(data.taskCompletionData || []))
    dispatch(setDailyPointsData(data.dailyPointsData || []))
  }
}

export const setTimePeriodDirectly = (period) => {
  return (dispatch) => {
    dispatch(setTimePeriod(period))
    console.log(`Time period changed to: ${period}`)
  }
}
