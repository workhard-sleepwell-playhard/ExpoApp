import { POMODORO_ACTION_TYPES } from './pomodoro.types.js'

export const POMODORO_INITIAL_STATE = {
  // Session State
  activeSession: null,
  sessionStatus: 'idle', // idle, active, paused, completed, interrupted, cancelled
  timeRemaining: 0, // in seconds
  elapsedTime: 0, // in seconds
  isRunning: false,
  
  // Configuration
  defaultDuration: 25, // in minutes (Pomodoro standard)
  selectedTask: null,
  autoStartBreak: false,
  autoStartPomodoro: false,
  
  // Session History
  userSessions: [],
  taskSessions: [],
  sessionStats: {
    totalSessions: 0,
    totalMinutes: 0,
    completedSessions: 0,
    interruptedSessions: 0,
    cancelledSessions: 0,
    averageSessionMinutes: 0,
    sessionsByTask: {},
    sessionsByDate: {}
  },
  
  // UI State
  showTimerModal: false,
  showHistoryModal: false,
  showStatsModal: false,
  
  // Loading and Error States
  isLoading: false,
  error: null,
}

export const pomodoroReducer = (state = POMODORO_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    // ========================================================================
    // Session State Actions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.SET_ACTIVE_SESSION:
      return {
        ...state,
        activeSession: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_SESSION_STATUS:
      return {
        ...state,
        sessionStatus: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_TIME_REMAINING:
      return {
        ...state,
        timeRemaining: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_ELAPSED_TIME:
      return {
        ...state,
        elapsedTime: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_IS_RUNNING:
      return {
        ...state,
        isRunning: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_SESSION_DURATION:
      return {
        ...state,
        sessionDuration: payload,
      }
    
    // ========================================================================
    // Configuration Actions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.SET_DEFAULT_DURATION:
      return {
        ...state,
        defaultDuration: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_SELECTED_TASK:
      return {
        ...state,
        selectedTask: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_AUTO_START_BREAK:
      return {
        ...state,
        autoStartBreak: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_AUTO_START_POMODORO:
      return {
        ...state,
        autoStartPomodoro: payload,
      }
    
    // ========================================================================
    // Session History Actions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.SET_USER_SESSIONS:
      return {
        ...state,
        userSessions: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_TASK_SESSIONS:
      return {
        ...state,
        taskSessions: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_SESSION_STATS:
      return {
        ...state,
        sessionStats: payload,
      }
    
    // ========================================================================
    // Timer Actions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.START_TIMER:
      return {
        ...state,
        isRunning: true,
        sessionStatus: 'active',
      }
    
    case POMODORO_ACTION_TYPES.PAUSE_TIMER:
      return {
        ...state,
        isRunning: false,
        sessionStatus: 'paused',
      }
    
    case POMODORO_ACTION_TYPES.RESUME_TIMER:
      return {
        ...state,
        isRunning: true,
        sessionStatus: 'active',
      }
    
    case POMODORO_ACTION_TYPES.STOP_TIMER:
      return {
        ...state,
        isRunning: false,
        sessionStatus: 'idle',
        timeRemaining: 0,
        elapsedTime: 0,
        activeSession: null,
      }
    
    case POMODORO_ACTION_TYPES.RESET_TIMER:
      return {
        ...state,
        timeRemaining: state.defaultDuration * 60,
        elapsedTime: 0,
        isRunning: false,
      }
    
    case POMODORO_ACTION_TYPES.TICK_TIMER:
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
        elapsedTime: state.elapsedTime + 1,
      }
    
    // ========================================================================
    // UI Actions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.SET_SHOW_TIMER_MODAL:
      return {
        ...state,
        showTimerModal: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_SHOW_HISTORY_MODAL:
      return {
        ...state,
        showHistoryModal: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_SHOW_STATS_MODAL:
      return {
        ...state,
        showStatsModal: payload,
      }
    
    // ========================================================================
    // Loading and Error Actions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: payload,
      }
    
    case POMODORO_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: payload,
      }
    
    case POMODORO_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    
    // ========================================================================
    // Async Actions - Start Session
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.START_SESSION_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.START_SESSION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        activeSession: payload,
        sessionStatus: 'active',
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.START_SESSION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // ========================================================================
    // Async Actions - Complete Session
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.COMPLETE_SESSION_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.COMPLETE_SESSION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        activeSession: null,
        sessionStatus: 'idle',
        isRunning: false,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.COMPLETE_SESSION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // ========================================================================
    // Async Actions - Delete Session
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.DELETE_SESSION_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.DELETE_SESSION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        userSessions: state.userSessions.filter(s => s.sessionId !== payload),
        taskSessions: state.taskSessions.filter(s => s.sessionId !== payload),
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.DELETE_SESSION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // ========================================================================
    // Async Actions - Load User Sessions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.LOAD_USER_SESSIONS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.LOAD_USER_SESSIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        userSessions: payload,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.LOAD_USER_SESSIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // ========================================================================
    // Async Actions - Load Task Sessions
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.LOAD_TASK_SESSIONS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.LOAD_TASK_SESSIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        taskSessions: payload,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.LOAD_TASK_SESSIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    // ========================================================================
    // Async Actions - Load Session Stats
    // ========================================================================
    
    case POMODORO_ACTION_TYPES.LOAD_SESSION_STATS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.LOAD_SESSION_STATS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        sessionStats: payload,
        error: null,
      }
    
    case POMODORO_ACTION_TYPES.LOAD_SESSION_STATS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: payload,
      }
    
    default:
      return state
  }
}

