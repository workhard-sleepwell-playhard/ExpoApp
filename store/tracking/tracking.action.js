import { TRACKING_ACTION_TYPES } from './tracking.types.js'
import { SimpleRealtimeService } from '../../src/services/simple-realtime'

// UI State Actions (for charts and navigation)
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

// Chart Navigation Actions
export const nextSlide = () => ({
  type: TRACKING_ACTION_TYPES.NEXT_SLIDE
})

export const prevSlide = () => ({
  type: TRACKING_ACTION_TYPES.PREV_SLIDE
})

export const navigateTimePeriodUI = (direction) => ({
  type: TRACKING_ACTION_TYPES.NAVIGATE_TIME_PERIOD,
  payload: direction
})


export const applyCustomDateRange = (fromDate, toDate) => ({
  type: TRACKING_ACTION_TYPES.APPLY_CUSTOM_DATE_RANGE,
  payload: { fromDate, toDate }
})

// Firebase Data Actions (new pattern)
export const setTrackingSessions = (sessions) => ({
  type: TRACKING_ACTION_TYPES.SET_TRACKING_SESSIONS,
  payload: sessions
})

export const setTrackingAnalytics = (analytics) => ({
  type: TRACKING_ACTION_TYPES.SET_TRACKING_ANALYTICS,
  payload: analytics
})

export const setWeeklyProgressData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_WEEKLY_PROGRESS_DATA,
  payload: data
})

export const setTaskCompletionData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_TASK_COMPLETION_DATA,
  payload: data
})

export const setDailyPointsData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_DAILY_POINTS_DATA,
  payload: data
})

export const setCategoriesData = (data) => ({
  type: TRACKING_ACTION_TYPES.SET_CATEGORIES_DATA,
  payload: data
})

// Async action to create a time tracking session
export const createTimeTrackingSession = (sessionData) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: TRACKING_ACTION_TYPES.CREATE_SESSION_REQUEST })
      
      const { auth } = getState()
      const currentUser = auth.currentUser
      
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found')
      }

      const firebaseSessionData = {
        userId: currentUser.uid,
        categoryId: sessionData.categoryId || 'work',
        categoryName: sessionData.categoryName || 'Work',
        categoryColor: sessionData.categoryColor || '#2196F3',
        categoryIcon: sessionData.categoryIcon || 'briefcase',
        startTime: sessionData.startTime || Date.now(),
        endTime: sessionData.endTime || null,
        duration: sessionData.duration || 0, // in minutes
        description: sessionData.description || '',
        tags: sessionData.tags || [],
        productivityRating: sessionData.productivityRating || 0,
        breakTaken: sessionData.breakTaken || false,
        breakDuration: sessionData.breakDuration || 0
      }

      const sessionId = await SimpleRealtimeService.createTimeTrackingSession(firebaseSessionData)
      
      const newSession = {
        id: sessionId,
        sessionId: sessionId,
        ...firebaseSessionData,
        createdAt: new Date().toISOString()
      }
      
      dispatch({ type: TRACKING_ACTION_TYPES.CREATE_SESSION_SUCCESS, payload: newSession })
      
      return newSession
    } catch (error) {
      console.error('Error creating time tracking session:', error)
      dispatch({ 
        type: TRACKING_ACTION_TYPES.CREATE_SESSION_ERROR, 
        payload: error.message 
      })
      throw error
    }
  }
}

// Async action to create daily analytics
export const createDailyAnalytics = (analyticsData) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: TRACKING_ACTION_TYPES.CREATE_ANALYTICS_REQUEST })
      
      const { auth } = getState()
      const currentUser = auth.currentUser
      
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found')
      }

      const firebaseAnalyticsData = {
        userId: currentUser.uid,
        date: analyticsData.date || new Date().toISOString().split('T')[0],
        totalHoursTracked: analyticsData.totalHoursTracked || 0,
        totalSessions: analyticsData.totalSessions || 0,
        categories: analyticsData.categories || [],
        tasksCompleted: analyticsData.tasksCompleted || 0,
        tasksPending: analyticsData.tasksPending || 0,
        tasksOverdue: analyticsData.tasksOverdue || 0,
        pointsEarned: analyticsData.pointsEarned || 0,
        productivityScore: analyticsData.productivityScore || 0,
        goals: analyticsData.goals || {
          dailyTaskGoal: 5,
          dailyTimeGoal: 480,
          tasksCompleted: 0,
          timeTracked: 0,
          tasksGoalMet: false,
          timeGoalMet: false
        },
        insights: analyticsData.insights || {
          mostProductiveHour: 9,
          mostProductiveCategory: 'Work',
          averageSessionLength: 0,
          longestBreak: 0,
          focusScore: 0
        }
      }

      const analyticsId = await SimpleRealtimeService.createDailyAnalytics(firebaseAnalyticsData)
      
      const newAnalytics = {
        id: analyticsId,
        analyticsId: analyticsId,
        ...firebaseAnalyticsData,
        createdAt: new Date().toISOString()
      }
      
      dispatch({ type: TRACKING_ACTION_TYPES.CREATE_ANALYTICS_SUCCESS, payload: newAnalytics })
      
      return newAnalytics
    } catch (error) {
      console.error('Error creating daily analytics:', error)
      dispatch({ 
        type: TRACKING_ACTION_TYPES.CREATE_ANALYTICS_ERROR, 
        payload: error.message 
      })
      throw error
    }
  }
}

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
    dispatch(navigateTimePeriodUI(direction))
    console.log(`Time period changed to: ${direction}`)
  }
}

// Updated action that only navigates time period UI (userData pattern)
export const navigateTimePeriodWithData = (direction) => {
  return (dispatch) => {
    // Only update the time period UI state
    // The centralized listener will handle data generation from userData
    dispatch(navigateTimePeriodUI(direction))
    console.log(`🔄 Time period changed to: ${direction}`)
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

export const setTimePeriodDirectly = (period) => {
  return (dispatch) => {
    dispatch(setTimePeriod(period))
    console.log(`Time period changed to: ${period}`)
  }
}

// Action to load tracking data (called by centralized listener)
export const loadTrackingData = (trackingData) => {
  return (dispatch) => {
    dispatch(setTrackingSessions(trackingData.sessions || []))
    dispatch(setTrackingAnalytics(trackingData.analytics || []))
    dispatch(setWeeklyProgressData(trackingData.weeklyProgress || []))
    dispatch(setTaskCompletionData(trackingData.taskCompletionData || []))
    dispatch(setDailyPointsData(trackingData.dailyPointsData || []))
    dispatch(setCategoriesData(trackingData.categories || []))
  }
}

// Action to load custom date range data
export const loadCustomDateRangeData = (analyticsData) => {
  return (dispatch) => {
    // Process analytics data into chart-ready format
    const processedData = SimpleRealtimeService.processAnalyticsForCharts(analyticsData)
    
    // Update Redux state with processed data
    dispatch(setTrackingAnalytics(analyticsData))
    dispatch(setWeeklyProgressData(processedData.weeklyProgress || []))
    dispatch(setTaskCompletionData(processedData.taskCompletionData || []))
    dispatch(setDailyPointsData(processedData.dailyPointsData || []))
    dispatch(setCategoriesData(processedData.categories || []))
  }
}

// Action to load snapshot data for different time periods
export const loadSnapshotDataForTimePeriod = (userId, timePeriod) => {
  return async (dispatch) => {
    try {
      const now = new Date();
      let startDate, endDate;
      
      // Calculate date range based on time period
      switch (timePeriod) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          endDate = now;
          break;
        case 'all-time':
          startDate = new Date('2020-01-01'); // Far back date
          endDate = now;
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = now;
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log(`📊 Loading task snapshots for ${timePeriod} period: ${startDateStr} to ${endDateStr}`);
      
      // Fetch task snapshots for all data
      const taskSnapshotsData = await SimpleRealtimeService.getTaskDailySnapshots(userId, startDateStr, endDateStr);
      
      console.log(`📊 Fetched ${taskSnapshotsData.length} task snapshots`);
      if (taskSnapshotsData.length > 0) {
        console.log('📊 Sample task snapshot:', taskSnapshotsData[0]);
      }
      
      // Generate all chart data from task snapshots
      const categoriesData = SimpleRealtimeService.generateCategoriesFromTaskSnapshots(taskSnapshotsData);
      const weeklyProgressData = SimpleRealtimeService.generateWeeklyProgressFromTaskSnapshots(taskSnapshotsData, timePeriod);
      const taskCompletionData = SimpleRealtimeService.generateTaskCompletionFromTaskSnapshots(taskSnapshotsData);
      const dailyPointsData = SimpleRealtimeService.generateDailyPointsFromTaskSnapshots(taskSnapshotsData);
      
      console.log('📊 Generated chart data:', {
        categories: categoriesData?.length || 0,
        weeklyProgress: weeklyProgressData?.length || 0,
        taskCompletion: taskCompletionData?.length || 0,
        dailyPoints: dailyPointsData?.length || 0
      });
      
      // Update Redux state with processed data
      dispatch(setCategoriesData(categoriesData || []));
      dispatch(setWeeklyProgressData(weeklyProgressData || []));
      dispatch(setTaskCompletionData(taskCompletionData || []));
      dispatch(setDailyPointsData(dailyPointsData || []));
      
      console.log(`📊 Loaded ${taskSnapshotsData.length} task snapshots for ${timePeriod} period`);
    } catch (error) {
      console.error('Error loading snapshot data for time period:', error);
    }
  }
}

// Action to load custom date range task snapshot data
export const loadCustomDateRangeTaskSnapshotData = (userId, fromDate, toDate) => {
  return async (dispatch) => {
    try {
      // Fetch task snapshot data for the custom date range
      const taskSnapshotsData = await SimpleRealtimeService.getTaskDailySnapshots(userId, fromDate, toDate);
      
      // Generate all chart data from task snapshots
      const categoriesData = SimpleRealtimeService.generateCategoriesFromTaskSnapshots(taskSnapshotsData);
      const weeklyProgressData = SimpleRealtimeService.generateWeeklyProgressFromTaskSnapshots(taskSnapshotsData, 'custom');
      const taskCompletionData = SimpleRealtimeService.generateTaskCompletionFromTaskSnapshots(taskSnapshotsData);
      const dailyPointsData = SimpleRealtimeService.generateDailyPointsFromTaskSnapshots(taskSnapshotsData);
      
      // Update Redux state with processed data
      dispatch(setCategoriesData(categoriesData || []));
      dispatch(setWeeklyProgressData(weeklyProgressData || []));
      dispatch(setTaskCompletionData(taskCompletionData || []));
      dispatch(setDailyPointsData(dailyPointsData || []));
      
      console.log(`📊 Loaded ${taskSnapshotsData.length} task snapshots for custom date range`);
    } catch (error) {
      console.error('Error loading custom date range task snapshot data:', error);
    }
  }
}

// Action to create sample data for testing
export const createSampleData = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: TRACKING_ACTION_TYPES.CREATE_SESSION_REQUEST })
      
      const { auth } = getState()
      const currentUser = auth.currentUser
      
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found')
      }

      await SimpleRealtimeService.createSampleTrackingData(currentUser.uid)
      
      dispatch({ type: TRACKING_ACTION_TYPES.CREATE_SESSION_SUCCESS })
      console.log('Sample data created successfully')
    } catch (error) {
      console.error('Error creating sample data:', error)
      dispatch({ 
        type: TRACKING_ACTION_TYPES.CREATE_SESSION_ERROR, 
        payload: error.message 
      })
      throw error
    }
  }
}


