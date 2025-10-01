import { createSelector } from 'reselect'

const selectPomodoroReducer = state => state.pomodoro

// ============================================================================
// Session State Selectors
// ============================================================================

export const selectActiveSession = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.activeSession
)

export const selectSessionStatus = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.sessionStatus
)

export const selectTimeRemaining = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.timeRemaining
)

export const selectElapsedTime = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.elapsedTime
)

export const selectIsRunning = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.isRunning
)

// ============================================================================
// Configuration Selectors
// ============================================================================

export const selectDefaultDuration = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.defaultDuration
)

export const selectSelectedTask = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.selectedTask
)

export const selectAutoStartBreak = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.autoStartBreak
)

export const selectAutoStartPomodoro = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.autoStartPomodoro
)

// ============================================================================
// Session History Selectors
// ============================================================================

export const selectUserSessions = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.userSessions
)

export const selectTaskSessions = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.taskSessions
)

export const selectSessionStats = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.sessionStats
)

// ============================================================================
// UI State Selectors
// ============================================================================

export const selectShowTimerModal = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.showTimerModal
)

export const selectShowHistoryModal = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.showHistoryModal
)

export const selectShowStatsModal = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.showStatsModal
)

// ============================================================================
// Loading and Error Selectors
// ============================================================================

export const selectIsLoading = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.isLoading
)

export const selectError = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => pomodoro.error
)

// ============================================================================
// Derived/Computed Selectors
// ============================================================================

/**
 * Format time in MM:SS format
 */
export const selectFormattedTimeRemaining = createSelector(
  [selectTimeRemaining],
  (timeRemaining) => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
)

/**
 * Format elapsed time in MM:SS format
 */
export const selectFormattedElapsedTime = createSelector(
  [selectElapsedTime],
  (elapsedTime) => {
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
)

/**
 * Calculate progress percentage (0-100)
 */
export const selectProgress = createSelector(
  [selectElapsedTime, selectDefaultDuration],
  (elapsedTime, defaultDuration) => {
    const totalSeconds = defaultDuration * 60
    if (totalSeconds === 0) return 0
    return Math.min(100, (elapsedTime / totalSeconds) * 100)
  }
)

/**
 * Check if session is active
 */
export const selectIsSessionActive = createSelector(
  [selectActiveSession, selectSessionStatus],
  (activeSession, status) => activeSession !== null && status === 'active'
)

/**
 * Check if timer has finished
 */
export const selectIsTimerFinished = createSelector(
  [selectTimeRemaining],
  (timeRemaining) => timeRemaining === 0
)

/**
 * Get today's sessions
 */
export const selectTodaySessions = createSelector(
  [selectUserSessions],
  (sessions) => {
    const today = new Date().toISOString().split('T')[0]
    return sessions.filter(session => session.date === today)
  }
)

/**
 * Get completed sessions count for today
 */
export const selectTodayCompletedCount = createSelector(
  [selectTodaySessions],
  (todaySessions) => todaySessions.filter(s => s.status === 'completed').length
)

/**
 * Get total focus minutes for today
 */
export const selectTodayFocusMinutes = createSelector(
  [selectTodaySessions],
  (todaySessions) => {
    return todaySessions
      .filter(s => s.status === 'completed' || s.status === 'interrupted')
      .reduce((total, session) => total + (session.durationMinutes || 0), 0)
  }
)

/**
 * Get sessions grouped by date
 */
export const selectSessionsByDate = createSelector(
  [selectUserSessions],
  (sessions) => {
    const grouped = {}
    sessions.forEach(session => {
      const date = session.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(session)
    })
    return grouped
  }
)

/**
 * Get sessions grouped by task
 */
export const selectSessionsByTask = createSelector(
  [selectUserSessions],
  (sessions) => {
    const grouped = {}
    sessions.forEach(session => {
      const taskId = session.taskId
      if (!grouped[taskId]) {
        grouped[taskId] = []
      }
      grouped[taskId].push(session)
    })
    return grouped
  }
)

/**
 * Get completion rate (completed vs interrupted)
 */
export const selectCompletionRate = createSelector(
  [selectSessionStats],
  (stats) => {
    const total = stats.completedSessions + stats.interruptedSessions
    if (total === 0) return 0
    return Math.round((stats.completedSessions / total) * 100)
  }
)

/**
 * Get total focus hours
 */
export const selectTotalFocusHours = createSelector(
  [selectSessionStats],
  (stats) => {
    return Math.round((stats.totalMinutes / 60) * 10) / 10
  }
)

/**
 * Get most focused task
 */
export const selectMostFocusedTask = createSelector(
  [selectSessionStats],
  (stats) => {
    const tasks = stats.sessionsByTask
    if (!tasks || Object.keys(tasks).length === 0) return null
    
    const taskEntries = Object.entries(tasks)
    const [taskId, count] = taskEntries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    
    return { taskId, sessionCount: count }
  }
)

/**
 * Get session streak (consecutive days with at least 1 session)
 */
export const selectSessionStreak = createSelector(
  [selectSessionsByDate],
  (sessionsByDate) => {
    const dates = Object.keys(sessionsByDate).sort().reverse()
    if (dates.length === 0) return 0
    
    const today = new Date().toISOString().split('T')[0]
    let streak = 0
    let currentDate = new Date(today)
    
    for (let i = 0; i < 365; i++) { // Check up to 1 year
      const dateStr = currentDate.toISOString().split('T')[0]
      if (sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }
)

/**
 * Get average session duration
 */
export const selectAverageSessionDuration = createSelector(
  [selectSessionStats],
  (stats) => stats.averageSessionMinutes
)

/**
 * Get weekly summary
 */
export const selectWeeklySummary = createSelector(
  [selectUserSessions],
  (sessions) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    
    const weeklySessions = sessions.filter(s => s.date >= weekAgoStr)
    
    return {
      totalSessions: weeklySessions.length,
      completedSessions: weeklySessions.filter(s => s.status === 'completed').length,
      interruptedSessions: weeklySessions.filter(s => s.status === 'interrupted').length,
      totalMinutes: weeklySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
    }
  }
)

// ============================================================================
// Consolidated State Selector
// ============================================================================

/**
 * Get entire pomodoro state (use sparingly to avoid re-renders)
 */
export const selectPomodoroState = createSelector(
  [selectPomodoroReducer],
  (pomodoro) => ({
    // Session State
    activeSession: pomodoro.activeSession,
    sessionStatus: pomodoro.sessionStatus,
    timeRemaining: pomodoro.timeRemaining,
    elapsedTime: pomodoro.elapsedTime,
    isRunning: pomodoro.isRunning,
    
    // Configuration
    defaultDuration: pomodoro.defaultDuration,
    selectedTask: pomodoro.selectedTask,
    autoStartBreak: pomodoro.autoStartBreak,
    autoStartPomodoro: pomodoro.autoStartPomodoro,
    
    // Session History
    userSessions: pomodoro.userSessions,
    taskSessions: pomodoro.taskSessions,
    sessionStats: pomodoro.sessionStats,
    
    // UI State
    showTimerModal: pomodoro.showTimerModal,
    showHistoryModal: pomodoro.showHistoryModal,
    showStatsModal: pomodoro.showStatsModal,
    
    // Loading and Error
    isLoading: pomodoro.isLoading,
    error: pomodoro.error,
  })
)

/**
 * Get timer state only (optimized for timer component)
 */
export const selectTimerState = createSelector(
  [selectTimeRemaining, selectElapsedTime, selectIsRunning, selectSessionStatus, selectActiveSession],
  (timeRemaining, elapsedTime, isRunning, sessionStatus, activeSession) => ({
    timeRemaining,
    elapsedTime,
    isRunning,
    sessionStatus,
    activeSession,
  })
)

