# Pomodoro Timer - Debugging Guide

## Issue: Start Button Not Working

### Console Logs to Check

When you press the "Start 25 min" button, you should see these logs in order:

```
1. 🎯 Starting Pomodoro session: {
     userId: "...",
     taskId: "...",
     taskTitle: "...",
     duration: 25
   }

2. Focus session created: sess_...

3. ✅ Session started successfully: sess_...

4. 📊 Timer State Update: {
     isRunning: true,
     timeRemaining: 1500,  // 25 minutes in seconds
     elapsedTime: 0,
     sessionStatus: "active",
     hasActiveSession: true
   }
```

### If You See ❌ Errors

#### Error: "No userId"
**Problem**: User not logged in
**Fix**: Ensure user is authenticated and `state.auth.user.uid` exists

```javascript
// Check in console or React Native Debugger:
const state = store.getState();
console.log('User:', state.auth.user);
```

#### Error: "No task provided"
**Problem**: Task object not passed correctly
**Fix**: Check that task has `id` and `title` properties

```javascript
// In TaskCard swipe handler:
console.log('Task passed to Pomodoro:', task);
```

#### Error: "You already have an active focus session"
**Problem**: User has an existing active session
**Fix**: Complete or cancel the existing session first

```javascript
// Check active session:
const activeSession = await FocusSessionService.getActiveFocusSession(userId);
console.log('Active session:', activeSession);
```

#### Error from Firebase
**Problem**: Firebase permissions or connection
**Fix**: 
1. Check internet connection
2. Verify Firebase Realtime Database rules
3. Check Firebase console for errors

### Check Redux Store State

Open React Native Debugger and inspect Redux state:

```javascript
// Expected pomodoro state:
{
  pomodoro: {
    activeSession: {
      sessionId: "sess_...",
      userId: "user_...",
      taskId: "task_...",
      taskName: "...",
      date: "2025-10-01",
      startTime: "...",
      status: "active"
    },
    timeRemaining: 1500,    // Should be defaultDuration * 60
    elapsedTime: 0,
    isRunning: true,        // Should be true after start
    sessionStatus: "active",
    defaultDuration: 25,
    isLoading: false,
    error: null
  }
}
```

### Check Timer Tick

After starting, you should see timer updates every second:

```
📊 Timer State Update: { timeRemaining: 1499, elapsedTime: 1 }
📊 Timer State Update: { timeRemaining: 1498, elapsedTime: 2 }
📊 Timer State Update: { timeRemaining: 1497, elapsedTime: 3 }
...
```

If not ticking:
1. Check `isRunning` is `true`
2. Check `useEffect` with interval is running
3. Check for JavaScript errors in console

### Check Firebase Database

After starting session, check Firebase Console:

```
focusSessionSnapshots/
  sess_abc123: {
    sessionId: "sess_abc123",
    userId: "user_456",
    taskId: "task_789",
    date: "2025-10-01",
    startTime: "2025-10-01T10:00:00Z",
    endTime: null,
    durationMinutes: 0,
    status: "active",
    createdAt: "...",
    updatedAt: "..."
  }
```

### Common Issues & Fixes

#### Issue: Button does nothing (no logs)
**Possible causes**:
1. `onPress` handler not connected
2. Button is disabled
3. JavaScript error before handler runs

**Debug**:
```javascript
// Add to button onPress:
<TouchableOpacity 
  onPress={() => {
    console.log('🔘 Start button pressed!');
    handleStart();
  }}
>
```

#### Issue: Logs show but Redux state doesn't update
**Possible causes**:
1. Redux thunk middleware not configured
2. Action not dispatching correctly
3. Reducer not handling action type

**Check store configuration**:
```javascript
// In store.js, ensure thunk middleware is applied:
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(thunk)
});
```

#### Issue: Session creates but timer doesn't start
**Possible causes**:
1. `setIsRunning(true)` not dispatched
2. `setTimeRemaining` not setting correct value
3. Selector not returning correct state

**Debug Redux actions**:
```javascript
// In startPomodoroSession action:
export const startPomodoroSession = (...) => {
  return async (dispatch) => {
    const sessionId = await dispatch(startSession(...));
    
    console.log('Setting timer state:', {
      timeRemaining: durationMinutes * 60,
      isRunning: true
    });
    
    dispatch(setTimeRemaining(durationMinutes * 60));
    dispatch(setElapsedTime(0));
    dispatch(setIsRunning(true));
    
    return sessionId;
  };
};
```

### Testing Steps

1. **Open Task Tab**
2. **Swipe left** on a task
3. **Check console** for "🎯 Starting Pomodoro session"
4. **Press "Start 25 min"**
5. **Check console logs**:
   - Should see "Focus session created"
   - Should see "✅ Session started successfully"
   - Should see "📊 Timer State Update" with isRunning: true
6. **Check UI**:
   - Timer should show "25:00"
   - Status should show "Focusing..."
   - Progress ring should start animating
   - Pause button should appear
7. **Wait 3 seconds**
8. **Check timer decrements**:
   - Should show "24:57", "24:56", etc.

### Network Debugging

If Firebase operations fail:

```javascript
// Check Firebase connection:
import { getDatabase } from 'firebase/database';
const db = getDatabase();
console.log('Firebase DB:', db);

// Test write:
const testRef = ref(db, 'test');
await set(testRef, { timestamp: Date.now() });
console.log('✅ Firebase write successful');
```

### Redux DevTools

If using Redux DevTools:

1. Watch for these actions:
   - `pomodoro/START_SESSION_REQUEST`
   - `pomodoro/START_SESSION_SUCCESS`
   - `pomodoro/SET_TIME_REMAINING`
   - `pomodoro/SET_IS_RUNNING`
   - `pomodoro/TICK_TIMER` (every second)

2. Check state diff after each action

3. Look for action errors in red

### Quick Diagnostic Script

Add this to your component for quick testing:

```typescript
// Add to PomodoroModal
const runDiagnostics = async () => {
  console.log('🔍 Running diagnostics...');
  console.log('Task:', task);
  console.log('User ID:', userId);
  console.log('Default Duration:', defaultDuration);
  console.log('Timer State:', timerState);
  console.log('Active Session:', activeSession);
  
  // Test Redux
  dispatch(setTimeRemaining(100));
  console.log('✅ Redux dispatch works');
  
  // Test Firebase
  try {
    const testSession = await FocusSessionService.getActiveFocusSession(userId);
    console.log('✅ Firebase read works:', testSession);
  } catch (error) {
    console.error('❌ Firebase error:', error);
  }
};

// Call on mount:
useEffect(() => {
  if (visible) {
    runDiagnostics();
  }
}, [visible]);
```

### Expected Behavior Summary

✅ **Working correctly if**:
- Start button triggers console logs
- Redux state updates with `isRunning: true`
- Firebase session is created
- Timer decrements every second
- UI updates show countdown
- Pause/Resume buttons work
- Complete button works
- Session saves to Firebase

❌ **Not working if**:
- No console logs on button press
- Redux state doesn't change
- Timer stays at 25:00
- No Firebase session created
- UI doesn't update
- Buttons don't respond

### Get Help

If still not working after checking above:

1. Share console logs
2. Share Redux state snapshot
3. Share Firebase Database screenshot
4. Describe exact steps taken
5. Note any error messages

