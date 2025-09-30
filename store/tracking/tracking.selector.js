import { createSelector } from 'reselect'

const selectTrackingReducer = state => state.tracking

// Utility function to format hours for display (1 decimal place)
const formatHours = (hours) => {
  return Math.round(hours * 10) / 10;
}

// Individual selectors for specific data
export const selectCurrentSlide = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.currentSlide
)

export const selectTimePeriod = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.timePeriod
)

export const selectShowCustomDatePicker = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.showCustomDatePicker
)

export const selectCustomDateFrom = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.customDateFrom
)

export const selectCustomDateTo = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.customDateTo
)

export const selectIsLoading = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.isLoading
)

export const selectError = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.error
)

// Firebase Data Selectors
export const selectTrackingSessions = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.trackingSessions
)

export const selectTrackingAnalytics = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.trackingAnalytics
)

export const selectWeeklyProgressData = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.weeklyProgressData
)

// Alias for backward compatibility
export const selectWeeklyProgress = selectWeeklyProgressData

export const selectTaskCompletionData = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.taskCompletionData
)

export const selectDailyPointsData = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.dailyPointsData
)

export const selectCategoriesData = createSelector(
  [selectTrackingReducer],
  (tracking) => tracking.categoriesData
)

// Alias for backward compatibility - maps to categoriesData
export const selectTrackingData = selectCategoriesData

// Derived selectors
export const selectTimePeriodOptions = createSelector(
  [],
  () => [
    { label: 'Week', value: 'week', icon: '📅' },
    { label: 'Month', value: 'month', icon: '🗓️' },
    { label: 'Year', value: 'year', icon: '📆' },
    { label: 'All Time', value: 'all-time', icon: '∞' },
    { label: 'Custom', value: 'custom', icon: '⚙️' },
  ]
)

export const selectTimePeriods = createSelector(
  [],
  () => ['week', 'month', 'year', 'all-time']
)

export const selectCurrentTimePeriodOption = createSelector(
  [selectTimePeriod, selectTimePeriodOptions],
  (timePeriod, options) => options.find(option => option.value === timePeriod) || options[0]
)

export const selectTimePeriodLabel = createSelector(
  [selectCurrentTimePeriodOption],
  (option) => option.label
)

export const selectTimePeriodIcon = createSelector(
  [selectCurrentTimePeriodOption],
  (option) => option.icon
)

export const selectSlides = createSelector(
  [selectCurrentSlide, selectTimePeriod, selectWeeklyProgress, selectTaskCompletionData, selectDailyPointsData],
  (currentSlide, timePeriod, weeklyProgress, taskCompletionData, dailyPointsData) => {
    const baseTitles = ['Progress', 'Task Completion', 'Points']
    const timeLabels = {
      'week': 'Weekly',
      'month': 'Monthly', 
      'year': 'Yearly',
      'all-time': 'All-Time',
      'custom': 'Custom'
    }
    
    const getChartTitle = (slideIndex) => `${timeLabels[timePeriod]} ${baseTitles[slideIndex]}`
    
    return [
      {
        id: 0,
        title: getChartTitle(0),
        type: 'bar',
        data: weeklyProgress
      },
      {
        id: 1,
        title: getChartTitle(1),
        type: 'pie',
        data: taskCompletionData
      },
      {
        id: 2,
        title: getChartTitle(2),
        type: 'line',
        data: dailyPointsData
      }
    ]
  }
)

export const selectCurrentSlideData = createSelector(
  [selectSlides, selectCurrentSlide],
  (slides, currentSlide) => slides[currentSlide]
)

export const selectMaxHours = createSelector(
  [selectWeeklyProgress],
  (weeklyProgress) => formatHours(Math.max(...weeklyProgress.map(p => p.hours), 0))
)

export const selectTotalHours = createSelector(
  [selectTrackingData],
  (trackingData) => formatHours(trackingData.reduce((sum, item) => sum + (item.totalHours || item.hours || 0), 0))
)

export const selectCategories = createSelector(
  [selectTrackingData],
  (trackingData) => trackingData.length
)

export const selectProductivity = createSelector(
  [selectTrackingData],
  (trackingData) => {
    // Calculate productivity based on actual data
    // For now, return a default value
    return 85
  }
)

export const selectTrackingStats = createSelector(
  [selectTotalHours, selectCategories, selectProductivity],
  (totalHours, categories, productivity) => ({
    totalHours,
    categories,
    productivity
  })
)

export const selectTotalTasks = createSelector(
  [selectTaskCompletionData],
  (taskCompletionData) => {
    if (taskCompletionData.length >= 2) {
      return taskCompletionData[0].count + taskCompletionData[1].count
    }
    return 0
  }
)

export const selectMaxPoints = createSelector(
  [selectDailyPointsData],
  (dailyPointsData) => Math.max(...dailyPointsData.map(d => d.points), 0)
)

export const selectTotalPoints = createSelector(
  [selectDailyPointsData],
  (dailyPointsData) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's entry
    const todayEntry = dailyPointsData.find(entry => entry.date === today);
    
    // If no today's entry, get the most recent entry
    if (todayEntry) {
      return todayEntry.points || 0;
    }
    
    // Fallback to last entry if no today's data
    const lastEntry = dailyPointsData[dailyPointsData.length - 1];
    return lastEntry ? (lastEntry.points || 0) : 0;
  }
)


// Consolidated selector to reduce re-renders (following home/task pattern)
export const selectTrackingState = createSelector(
  [selectTrackingReducer],
  (tracking) => ({
    // UI State
    currentSlide: tracking.currentSlide,
    timePeriod: tracking.timePeriod,
    showCustomDatePicker: tracking.showCustomDatePicker,
    customDateFrom: tracking.customDateFrom,
    customDateTo: tracking.customDateTo,
    isLoading: tracking.isLoading,
    error: tracking.error,
    
    // Firebase Data
    trackingSessions: tracking.trackingSessions,
    trackingAnalytics: tracking.trackingAnalytics,
    weeklyProgressData: tracking.weeklyProgressData,
    taskCompletionData: tracking.taskCompletionData,
    dailyPointsData: tracking.dailyPointsData,
    categoriesData: tracking.categoriesData,
    
  })
)
