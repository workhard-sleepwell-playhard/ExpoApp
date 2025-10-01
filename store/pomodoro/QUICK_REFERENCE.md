# Pomodoro Redux - Quick Reference

## Import Statements

```javascript
// Actions
import {
  startPomodoroSession,
  completePomodoroSession,
  pauseTimer,
  resumeTimer,
  tickTimer,
  loadUserSessions,
  loadSessionStats,
  setDefaultDuration
} from '@/store/pomodoro/pomodoro.action';

// Selectors
import {
  selectTimerState,
  selectFormattedTimeRemaining,
  selectProgress,
  selectTodaySessions,
  selectSessionStats,
  selectCompletionRate
} from '@/store/pomodoro/pomodoro.selector';
```

## Common Patterns

### Start a Pomodoro Session
```javascript
const handleStart = async () => {
  try {
    await dispatch(startPomodoroSession(userId, taskId, taskName, 25));
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Timer Tick (in useEffect)
```javascript
useEffect(() => {
  let interval;
  if (isRunning && timeRemaining > 0) {
    interval = setInterval(() => dispatch(tickTimer()), 1000);
  }
  return () => clearInterval(interval);
}, [isRunning, timeRemaining]);
```

### Complete Session
```javascript
await dispatch(completePomodoroSession(sessionId, 'completed'));
// or
await dispatch(completePomodoroSession(sessionId, 'interrupted'));
```

### Load Data
```javascript
// On mount
useEffect(() => {
  if (userId) {
    dispatch(loadUserSessions(userId));
    dispatch(loadSessionStats(userId));
  }
}, [userId]);
```

### Access State
```javascript
const timerState = useSelector(selectTimerState);
const formattedTime = useSelector(selectFormattedTimeRemaining);
const stats = useSelector(selectSessionStats);
```

## State Structure (Quick Look)

```
pomodoro: {
  activeSession: {...},        // Current session
  timeRemaining: 1500,         // 25 min in seconds
  isRunning: true,             // Timer active
  userSessions: [...],         // Session history
  sessionStats: {...},         // Statistics
  defaultDuration: 25          // Minutes
}
```

## Key Selectors

| Selector | Returns | Use Case |
|----------|---------|----------|
| `selectTimerState` | Timer state object | Timer component |
| `selectFormattedTimeRemaining` | "25:00" | Display time |
| `selectProgress` | 0-100 | Progress bar |
| `selectTodaySessions` | Array | Today's history |
| `selectSessionStats` | Stats object | Dashboard |
| `selectCompletionRate` | Percentage | Success rate |
| `selectSessionStreak` | Number | Daily streak |

## Session Status Values

- `'idle'` - No active session
- `'active'` - Session running
- `'paused'` - Session paused
- `'completed'` - Successfully finished
- `'interrupted'` - Stopped early
- `'cancelled'` - Cancelled

## Quick Tips

✅ **DO:**
- Use `selectTimerState` for timer components
- Handle async action errors with try/catch
- Check for active session before starting
- Clean up intervals in useEffect

❌ **DON'T:**
- Use `selectPomodoroState` (causes re-renders)
- Forget to check `userId` before actions
- Start multiple timers simultaneously
- Forget interval cleanup

