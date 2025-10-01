# Pomodoro Redux Module - Usage Guide

## Overview
Complete Redux module for Pomodoro timer with focus session tracking integration.

## Module Structure

```
store/pomodoro/
├── pomodoro.types.js      # Action type constants
├── pomodoro.action.js     # Action creators & async actions
├── pomodoro.reducer.js    # State management & reducers
└── pomodoro.selector.js   # Selectors & computed values
```

## State Shape

```javascript
{
  // Session State
  activeSession: {
    sessionId: string,
    userId: string,
    taskId: string,
    taskName: string,
    date: string,
    startTime: string,
    status: 'active' | 'paused' | 'completed' | 'interrupted' | 'cancelled'
  } | null,
  sessionStatus: 'idle' | 'active' | 'paused' | 'completed' | 'interrupted' | 'cancelled',
  timeRemaining: number,  // seconds
  elapsedTime: number,    // seconds
  isRunning: boolean,
  
  // Configuration
  defaultDuration: 25,    // minutes
  selectedTask: object | null,
  autoStartBreak: boolean,
  autoStartPomodoro: boolean,
  
  // Session History
  userSessions: [],
  taskSessions: [],
  sessionStats: {
    totalSessions: number,
    totalMinutes: number,
    completedSessions: number,
    interruptedSessions: number,
    cancelledSessions: number,
    averageSessionMinutes: number,
    sessionsByTask: {},
    sessionsByDate: {}
  },
  
  // UI State
  showTimerModal: boolean,
  showHistoryModal: boolean,
  showStatsModal: boolean,
  
  // Loading/Error
  isLoading: boolean,
  error: string | null
}
```

## Usage Examples

### 1. Basic Pomodoro Timer Component

```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startPomodoroSession,
  completePomodoroSession,
  pauseTimer,
  resumeTimer,
  tickTimer
} from '@/store/pomodoro/pomodoro.action';
import {
  selectTimerState,
  selectFormattedTimeRemaining,
  selectProgress
} from '@/store/pomodoro/pomodoro.selector';

const PomodoroTimer = ({ task }) => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user?.uid);
  const timerState = useSelector(selectTimerState);
  const formattedTime = useSelector(selectFormattedTimeRemaining);
  const progress = useSelector(selectProgress);
  
  // Timer tick effect
  useEffect(() => {
    let interval;
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      interval = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    
    // Auto-complete when timer reaches 0
    if (timerState.isRunning && timerState.timeRemaining === 0) {
      handleComplete();
    }
    
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.timeRemaining]);
  
  const handleStart = async () => {
    try {
      await dispatch(startPomodoroSession(
        userId,
        task.taskId,
        task.title,
        25 // duration in minutes
      ));
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handlePause = () => {
    dispatch(pauseTimer());
  };
  
  const handleResume = () => {
    dispatch(resumeTimer());
  };
  
  const handleComplete = async () => {
    if (timerState.activeSession) {
      await dispatch(completePomodoroSession(
        timerState.activeSession.sessionId,
        'completed'
      ));
      alert('Great work! Session completed! 🎉');
    }
  };
  
  const handleInterrupt = async () => {
    if (timerState.activeSession) {
      await dispatch(completePomodoroSession(
        timerState.activeSession.sessionId,
        'interrupted'
      ));
    }
  };
  
  return (
    <View>
      <Text style={styles.timer}>{formattedTime}</Text>
      <ProgressBar progress={progress} />
      
      {!timerState.activeSession ? (
        <Button title="Start Focus" onPress={handleStart} />
      ) : (
        <>
          {timerState.isRunning ? (
            <Button title="Pause" onPress={handlePause} />
          ) : (
            <Button title="Resume" onPress={handleResume} />
          )}
          <Button title="Complete" onPress={handleComplete} />
          <Button title="Stop" onPress={handleInterrupt} />
        </>
      )}
    </View>
  );
};
```

### 2. Load Session History

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserSessions } from '@/store/pomodoro/pomodoro.action';
import { selectUserSessions, selectTodaySessions } from '@/store/pomodoro/pomodoro.selector';

const SessionHistory = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user?.uid);
  const userSessions = useSelector(selectUserSessions);
  const todaySessions = useSelector(selectTodaySessions);
  
  useEffect(() => {
    if (userId) {
      // Load all sessions
      dispatch(loadUserSessions(userId));
      
      // Or load sessions for a specific date range
      // dispatch(loadUserSessions(userId, '2025-10-01', '2025-10-31'));
    }
  }, [userId]);
  
  return (
    <View>
      <Text>Today's Sessions: {todaySessions.length}</Text>
      <FlatList
        data={userSessions}
        renderItem={({ item }) => (
          <SessionCard session={item} />
        )}
      />
    </View>
  );
};
```

### 3. Display Session Statistics

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadSessionStats } from '@/store/pomodoro/pomodoro.action';
import {
  selectSessionStats,
  selectCompletionRate,
  selectTotalFocusHours,
  selectSessionStreak
} from '@/store/pomodoro/pomodoro.selector';

const SessionStats = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user?.uid);
  const stats = useSelector(selectSessionStats);
  const completionRate = useSelector(selectCompletionRate);
  const totalHours = useSelector(selectTotalFocusHours);
  const streak = useSelector(selectSessionStreak);
  
  useEffect(() => {
    if (userId) {
      dispatch(loadSessionStats(userId));
    }
  }, [userId]);
  
  return (
    <View>
      <StatCard title="Total Sessions" value={stats.totalSessions} />
      <StatCard title="Focus Hours" value={`${totalHours}h`} />
      <StatCard title="Completion Rate" value={`${completionRate}%`} />
      <StatCard title="Streak" value={`${streak} days`} />
      <StatCard title="Avg Duration" value={`${stats.averageSessionMinutes} min`} />
    </View>
  );
};
```

### 4. Task-Specific Sessions

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadTaskSessions } from '@/store/pomodoro/pomodoro.action';
import { selectTaskSessions } from '@/store/pomodoro/pomodoro.selector';

const TaskFocusHistory = ({ taskId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user?.uid);
  const taskSessions = useSelector(selectTaskSessions);
  
  useEffect(() => {
    if (userId && taskId) {
      dispatch(loadTaskSessions(taskId, userId));
    }
  }, [userId, taskId]);
  
  const totalMinutes = taskSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  
  return (
    <View>
      <Text>Focus Sessions: {taskSessions.length}</Text>
      <Text>Total Time: {Math.round(totalMinutes / 60 * 10) / 10} hours</Text>
      <SessionList sessions={taskSessions} />
    </View>
  );
};
```

### 5. Check for Active Session on Mount

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadActiveSession } from '@/store/pomodoro/pomodoro.action';
import { selectActiveSession } from '@/store/pomodoro/pomodoro.selector';

const App = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user?.uid);
  const activeSession = useSelector(selectActiveSession);
  
  useEffect(() => {
    if (userId) {
      // Check if user has an active session on app start
      dispatch(loadActiveSession(userId));
    }
  }, [userId]);
  
  return (
    <View>
      {activeSession && (
        <ActiveSessionBanner session={activeSession} />
      )}
      {/* Rest of app */}
    </View>
  );
};
```

### 6. Configuration Management

```typescript
import { useDispatch, useSelector } from 'react-redux';
import {
  setDefaultDuration,
  setAutoStartBreak,
  setAutoStartPomodoro
} from '@/store/pomodoro/pomodoro.action';
import {
  selectDefaultDuration,
  selectAutoStartBreak,
  selectAutoStartPomodoro
} from '@/store/pomodoro/pomodoro.selector';

const PomodoroSettings = () => {
  const dispatch = useDispatch();
  const duration = useSelector(selectDefaultDuration);
  const autoBreak = useSelector(selectAutoStartBreak);
  const autoPomodoro = useSelector(selectAutoStartPomodoro);
  
  return (
    <View>
      <Slider
        value={duration}
        min={5}
        max={60}
        step={5}
        onValueChange={(value) => dispatch(setDefaultDuration(value))}
        label={`Duration: ${duration} min`}
      />
      
      <Switch
        value={autoBreak}
        onValueChange={(value) => dispatch(setAutoStartBreak(value))}
        label="Auto-start break"
      />
      
      <Switch
        value={autoPomodoro}
        onValueChange={(value) => dispatch(setAutoStartPomodoro(value))}
        label="Auto-start next Pomodoro"
      />
    </View>
  );
};
```

## Available Actions

### Session Management
- `startPomodoroSession(userId, taskId, taskName, duration)` - Start new session with timer
- `completePomodoroSession(sessionId, status)` - Complete and cleanup
- `startSession(userId, taskId, taskName)` - Start session without timer setup
- `completeSession(sessionId, status)` - Complete session only
- `deleteSession(sessionId)` - Delete a session

### Timer Controls
- `startTimer()` - Start the countdown
- `pauseTimer()` - Pause the countdown
- `resumeTimer()` - Resume the countdown
- `stopTimer()` - Stop and reset
- `resetTimer()` - Reset to default duration
- `tickTimer()` - Decrement timer by 1 second

### Data Loading
- `loadUserSessions(userId, startDate?, endDate?)` - Load user's sessions
- `loadTaskSessions(taskId, userId)` - Load task-specific sessions
- `loadSessionStats(userId, startDate?, endDate?)` - Load statistics
- `loadActiveSession(userId)` - Check for active session

### Configuration
- `setDefaultDuration(minutes)` - Set timer duration
- `setSelectedTask(task)` - Set current task
- `setAutoStartBreak(boolean)` - Auto-start break after session
- `setAutoStartPomodoro(boolean)` - Auto-start next Pomodoro

### UI State
- `setShowTimerModal(boolean)`
- `setShowHistoryModal(boolean)`
- `setShowStatsModal(boolean)`

## Available Selectors

### Session State
- `selectActiveSession` - Current active session
- `selectSessionStatus` - Current status
- `selectTimeRemaining` - Seconds remaining
- `selectElapsedTime` - Seconds elapsed
- `selectIsRunning` - Is timer running
- `selectFormattedTimeRemaining` - Time as "MM:SS"
- `selectFormattedElapsedTime` - Elapsed as "MM:SS"
- `selectProgress` - Progress percentage (0-100)

### Session History
- `selectUserSessions` - All user sessions
- `selectTaskSessions` - Sessions for specific task
- `selectTodaySessions` - Today's sessions only
- `selectSessionsByDate` - Grouped by date
- `selectSessionsByTask` - Grouped by task

### Statistics
- `selectSessionStats` - All statistics
- `selectCompletionRate` - Completion percentage
- `selectTotalFocusHours` - Total hours focused
- `selectTodayCompletedCount` - Completed today
- `selectTodayFocusMinutes` - Minutes focused today
- `selectSessionStreak` - Consecutive days streak
- `selectAverageSessionDuration` - Average minutes per session
- `selectMostFocusedTask` - Task with most sessions
- `selectWeeklySummary` - Last 7 days summary

### Configuration
- `selectDefaultDuration`
- `selectSelectedTask`
- `selectAutoStartBreak`
- `selectAutoStartPomodoro`

### UI State
- `selectShowTimerModal`
- `selectShowHistoryModal`
- `selectShowStatsModal`
- `selectIsLoading`
- `selectError`

### Optimized Selectors
- `selectPomodoroState` - Entire state (use sparingly)
- `selectTimerState` - Timer state only (optimized for timer)

## Best Practices

1. **Use specific selectors** instead of `selectPomodoroState` to avoid unnecessary re-renders
2. **Cleanup intervals** in useEffect cleanup functions
3. **Handle errors** from async actions with try/catch
4. **Check for active sessions** before starting new ones
5. **Load session data** on component mount
6. **Use `selectTimerState`** for timer components (optimized)

## Integration with Focus Session Service

The Redux module wraps the `FocusSessionService`:
- Actions handle Redux state updates
- Service handles Firebase operations
- Automatic task snapshot updates on session complete/delete
- Real-time listeners can be added separately

## Next Steps

1. Add real-time listeners to centralized listener service
2. Create timer notification system
3. Build achievement/badge system based on stats
4. Add session goals and reminders
5. Create session analytics dashboard

