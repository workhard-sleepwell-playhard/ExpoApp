import { POMODORO_ACTION_TYPES } from './pomodoro.types.js'
import { FocusSessionService } from '../../src/services/focus-session-service'

// ============================================================================
// Session State Actions
// ============================================================================

export const setActiveSession = (session) => ({
  type: POMODORO_ACTION_TYPES.SET_ACTIVE_SESSION,
  payload: session
})

export const setSessionStatus = (status) => ({
  type: POMODORO_ACTION_TYPES.SET_SESSION_STATUS,
  payload: status
})

export const setTimeRemaining = (time) => ({
  type: POMODORO_ACTION_TYPES.SET_TIME_REMAINING,
  payload: time
})

export const setElapsedTime = (time) => ({
  type: POMODORO_ACTION_TYPES.SET_ELAPSED_TIME,
  payload: time
})

export const setIsRunning = (isRunning) => ({
  type: POMODORO_ACTION_TYPES.SET_IS_RUNNING,
  payload: isRunning
})

export const setSessionDuration = (duration) => ({
  type: POMODORO_ACTION_TYPES.SET_SESSION_DURATION,
  payload: duration
})

// ============================================================================
// Configuration Actions
// ============================================================================

export const setDefaultDuration = (duration) => ({
  type: POMODORO_ACTION_TYPES.SET_DEFAULT_DURATION,
  payload: duration
})

export const setSelectedTask = (task) => ({
  type: POMODORO_ACTION_TYPES.SET_SELECTED_TASK,
  payload: task
})

export const setAutoStartBreak = (autoStart) => ({
  type: POMODORO_ACTION_TYPES.SET_AUTO_START_BREAK,
  payload: autoStart
})

export const setAutoStartPomodoro = (autoStart) => ({
  type: POMODORO_ACTION_TYPES.SET_AUTO_START_POMODORO,
  payload: autoStart
})

// ============================================================================
// Session History Actions
// ============================================================================

export const setUserSessions = (sessions) => ({
  type: POMODORO_ACTION_TYPES.SET_USER_SESSIONS,
  payload: sessions
})

export const setTaskSessions = (sessions) => ({
  type: POMODORO_ACTION_TYPES.SET_TASK_SESSIONS,
  payload: sessions
})

export const setSessionStats = (stats) => ({
  type: POMODORO_ACTION_TYPES.SET_SESSION_STATS,
  payload: stats
})

// ============================================================================
// Timer Actions
// ============================================================================

export const startTimer = () => ({
  type: POMODORO_ACTION_TYPES.START_TIMER
})

export const pauseTimer = () => ({
  type: POMODORO_ACTION_TYPES.PAUSE_TIMER
})

export const resumeTimer = () => ({
  type: POMODORO_ACTION_TYPES.RESUME_TIMER
})

export const stopTimer = () => ({
  type: POMODORO_ACTION_TYPES.STOP_TIMER
})

export const resetTimer = () => ({
  type: POMODORO_ACTION_TYPES.RESET_TIMER
})

export const tickTimer = () => ({
  type: POMODORO_ACTION_TYPES.TICK_TIMER
})

// ============================================================================
// UI Actions
// ============================================================================

export const setShowTimerModal = (show) => ({
  type: POMODORO_ACTION_TYPES.SET_SHOW_TIMER_MODAL,
  payload: show
})

export const setShowHistoryModal = (show) => ({
  type: POMODORO_ACTION_TYPES.SET_SHOW_HISTORY_MODAL,
  payload: show
})

export const setShowStatsModal = (show) => ({
  type: POMODORO_ACTION_TYPES.SET_SHOW_STATS_MODAL,
  payload: show
})

// ============================================================================
// Loading and Error Actions
// ============================================================================

export const setLoading = (isLoading) => ({
  type: POMODORO_ACTION_TYPES.SET_LOADING,
  payload: isLoading
})

export const setError = (error) => ({
  type: POMODORO_ACTION_TYPES.SET_ERROR,
  payload: error
})

export const clearError = () => ({
  type: POMODORO_ACTION_TYPES.CLEAR_ERROR
})

// ============================================================================
// Async Actions - Start Session
// ============================================================================

export const startSession = (userId, taskId, taskName) => {
  return async (dispatch) => {
    dispatch({ type: POMODORO_ACTION_TYPES.START_SESSION_REQUEST })
    
    try {
      // Check for existing active session
      const activeSession = await FocusSessionService.getActiveFocusSession(userId)
      if (activeSession) {
        throw new Error('You already have an active focus session. Please complete it first.')
      }

      const today = new Date().toISOString().split('T')[0]
      const sessionId = await FocusSessionService.createFocusSession(userId, taskId, today)
      
      const session = {
        sessionId,
        userId,
        taskId,
        taskName,
        date: today,
        startTime: new Date().toISOString(),
        status: 'active'
      }

      dispatch({
        type: POMODORO_ACTION_TYPES.START_SESSION_SUCCESS,
        payload: session
      })

      return sessionId
    } catch (error) {
      console.error('Error starting session:', error)
      dispatch({
        type: POMODORO_ACTION_TYPES.START_SESSION_ERROR,
        payload: error.message
      })
      throw error
    }
  }
}

// ============================================================================
// Async Actions - Complete Session
// ============================================================================

export const completeSession = (sessionId, status = 'completed') => {
  return async (dispatch) => {
    dispatch({ type: POMODORO_ACTION_TYPES.COMPLETE_SESSION_REQUEST })
    
    try {
      const updatedSession = await FocusSessionService.completeFocusSession(sessionId, status)
      
      dispatch({
        type: POMODORO_ACTION_TYPES.COMPLETE_SESSION_SUCCESS,
        payload: updatedSession
      })

      return updatedSession
    } catch (error) {
      console.error('Error completing session:', error)
      dispatch({
        type: POMODORO_ACTION_TYPES.COMPLETE_SESSION_ERROR,
        payload: error.message
      })
      throw error
    }
  }
}

// ============================================================================
// Async Actions - Delete Session
// ============================================================================

export const deleteSession = (sessionId) => {
  return async (dispatch) => {
    dispatch({ type: POMODORO_ACTION_TYPES.DELETE_SESSION_REQUEST })
    
    try {
      await FocusSessionService.deleteFocusSession(sessionId)
      
      dispatch({
        type: POMODORO_ACTION_TYPES.DELETE_SESSION_SUCCESS,
        payload: sessionId
      })
    } catch (error) {
      console.error('Error deleting session:', error)
      dispatch({
        type: POMODORO_ACTION_TYPES.DELETE_SESSION_ERROR,
        payload: error.message
      })
      throw error
    }
  }
}

// ============================================================================
// Async Actions - Load User Sessions
// ============================================================================

export const loadUserSessions = (userId, startDate = null, endDate = null) => {
  return async (dispatch) => {
    dispatch({ type: POMODORO_ACTION_TYPES.LOAD_USER_SESSIONS_REQUEST })
    
    try {
      const sessions = await FocusSessionService.getUserFocusSessions(userId, startDate, endDate)
      
      dispatch({
        type: POMODORO_ACTION_TYPES.LOAD_USER_SESSIONS_SUCCESS,
        payload: sessions
      })

      return sessions
    } catch (error) {
      console.error('Error loading user sessions:', error)
      dispatch({
        type: POMODORO_ACTION_TYPES.LOAD_USER_SESSIONS_ERROR,
        payload: error.message
      })
      throw error
    }
  }
}

// ============================================================================
// Async Actions - Load Task Sessions
// ============================================================================

export const loadTaskSessions = (taskId, userId) => {
  return async (dispatch) => {
    dispatch({ type: POMODORO_ACTION_TYPES.LOAD_TASK_SESSIONS_REQUEST })
    
    try {
      const sessions = await FocusSessionService.getTaskFocusSessions(taskId, userId)
      
      dispatch({
        type: POMODORO_ACTION_TYPES.LOAD_TASK_SESSIONS_SUCCESS,
        payload: sessions
      })

      return sessions
    } catch (error) {
      console.error('Error loading task sessions:', error)
      dispatch({
        type: POMODORO_ACTION_TYPES.LOAD_TASK_SESSIONS_ERROR,
        payload: error.message
      })
      throw error
    }
  }
}

// ============================================================================
// Async Actions - Load Session Stats
// ============================================================================

export const loadSessionStats = (userId, startDate = null, endDate = null) => {
  return async (dispatch) => {
    dispatch({ type: POMODORO_ACTION_TYPES.LOAD_SESSION_STATS_REQUEST })
    
    try {
      const stats = await FocusSessionService.getFocusSessionStats(userId, startDate, endDate)
      
      // Convert Maps to Objects for Redux
      const statsForRedux = {
        totalSessions: stats.totalSessions,
        totalMinutes: stats.totalMinutes,
        completedSessions: stats.completedSessions,
        interruptedSessions: stats.interruptedSessions,
        cancelledSessions: stats.cancelledSessions,
        averageSessionMinutes: stats.averageSessionMinutes,
        sessionsByTask: Object.fromEntries(stats.sessionsByTask),
        sessionsByDate: Object.fromEntries(stats.sessionsByDate)
      }
      
      dispatch({
        type: POMODORO_ACTION_TYPES.LOAD_SESSION_STATS_SUCCESS,
        payload: statsForRedux
      })

      return statsForRedux
    } catch (error) {
      console.error('Error loading session stats:', error)
      dispatch({
        type: POMODORO_ACTION_TYPES.LOAD_SESSION_STATS_ERROR,
        payload: error.message
      })
      throw error
    }
  }
}

// ============================================================================
// Async Actions - Get Active Session
// ============================================================================

export const loadActiveSession = (userId) => {
  return async (dispatch) => {
    try {
      const activeSession = await FocusSessionService.getActiveFocusSession(userId)
      
      if (activeSession) {
        dispatch(setActiveSession(activeSession))
        dispatch(setSessionStatus('active'))
        
        // Calculate elapsed time
        const startTime = new Date(activeSession.startTime)
        const now = new Date()
        const elapsedSeconds = Math.floor((now - startTime) / 1000)
        dispatch(setElapsedTime(elapsedSeconds))
      } else {
        dispatch(setActiveSession(null))
        dispatch(setSessionStatus('idle'))
      }

      return activeSession
    } catch (error) {
      console.error('Error loading active session:', error)
      dispatch(setError(error.message))
      throw error
    }
  }
}

// ============================================================================
// Combined Actions
// ============================================================================

/**
 * Start a new Pomodoro session with timer initialization
 */
export const startPomodoroSession = (userId, taskId, taskName, durationMinutes = 25) => {
  return async (dispatch) => {
    try {
      // Start the focus session in Firebase
      const sessionId = await dispatch(startSession(userId, taskId, taskName))
      
      // Initialize timer state
      dispatch(setSessionDuration(durationMinutes)) // Store session duration
      dispatch(setTimeRemaining(durationMinutes * 60))
      dispatch(setElapsedTime(0))
      dispatch(setIsRunning(true))
      
      return sessionId
    } catch (error) {
      throw error
    }
  }
}

/**
 * Complete current session and reset timer
 */
export const completePomodoroSession = (sessionId, status = 'completed') => {
  return async (dispatch) => {
    try {
      await dispatch(completeSession(sessionId, status))
      
      // Reset timer state
      dispatch(setActiveSession(null))
      dispatch(setSessionStatus('idle'))
      dispatch(setIsRunning(false))
      dispatch(setTimeRemaining(0))
      dispatch(setElapsedTime(0))
      dispatch(setSessionDuration(0)) // Reset session duration
      
      return true
    } catch (error) {
      throw error
    }
  }
}

