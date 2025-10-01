# Pomodoro Modal Component - Usage Guide

## Overview
Beautiful, fully-featured Pomodoro timer modal that integrates with the Redux Pomodoro module and Focus Session Service. Triggered by swiping left on any task.

## Features

### ✨ **UI/UX Features**
- 🎨 **Smooth animations** - Slide-up modal with fade-in backdrop
- ⭕ **Circular progress ring** - Visual countdown indicator
- 💓 **Pulse animation** - Timer pulses when active
- 📊 **Progress bar** - Linear progress at bottom
- 🎯 **Task context** - Shows task title and category
- 💡 **Focus tips** - Helpful tips when starting

### ⚙️ **Functionality**
- ✅ **Start/Pause/Resume** - Full timer controls
- ⏱️ **Auto-complete** - Automatically completes when timer reaches 0
- 🔔 **Smart alerts** - Congratulates on completion
- 🚫 **Session protection** - Prevents starting multiple sessions
- 📝 **Session types** - Completed, interrupted, or cancelled
- 💾 **Auto-save** - All sessions saved to Firebase
- 📊 **Task snapshot updates** - Automatically updates task daily snapshots

## Integration

### How It Works

1. **User swipes left** on a task in the Task tab
2. **TaskCard triggers** `onProductivity()` callback
3. **Task screen opens** Pomodoro modal with task data
4. **User starts session** → Creates focus session in Firebase
5. **Timer runs** → Redux manages timer state
6. **Session completes** → Updates task snapshots & stats
7. **Modal closes** → Returns to task list

### File Structure
```
finishit/
├── components/
│   └── modals/
│       ├── PomodoroModal.tsx          ← New component
│       └── index.ts                    ← Exports PomodoroModal
├── app/(tabs)/
│   └── task.tsx                        ← Integrated here
├── components/tabscomponents/task/
│   └── taskCard.component.tsx          ← Swipe left triggers it
└── store/pomodoro/
    ├── pomodoro.action.js              ← Actions
    ├── pomodoro.reducer.js             ← State
    └── pomodoro.selector.js            ← Selectors
```

## Usage in Task Screen

### Implementation in `task.tsx`

```typescript
// 1. Import the modal
import { PomodoroModal } from '@/components/modals/PomodoroModal';

// 2. Add state
const [showPomodoroModal, setShowPomodoroModal] = useState(false);
const [pomodoroTask, setPomodoroTask] = useState<any>(null);

// 3. Handle productivity action
const handleOpenProductivityFeatures = (task?: any) => {
  const taskToUse = task || selectedTask;
  if (taskToUse) {
    setPomodoroTask(taskToUse);
    setShowPomodoroModal(true);
  }
};

const handleClosePomodoroModal = () => {
  setShowPomodoroModal(false);
  setPomodoroTask(null);
};

// 4. Render the modal
<PomodoroModal
  task={pomodoroTask}
  visible={showPomodoroModal}
  onClose={handleClosePomodoroModal}
/>
```

## Component Props

```typescript
interface PomodoroModalProps {
  task: {
    id: string;           // Task ID
    title: string;        // Task name
    category?: string;    // Optional category
    priority?: string;    // Optional priority
  } | null;
  visible: boolean;       // Modal visibility
  onClose: () => void;    // Close handler
}
```

## Redux Integration

The modal uses the following Redux state:

```javascript
// Selectors
selectTimerState          // Timer state (time, running, status)
selectFormattedTimeRemaining    // "25:00" format
selectFormattedElapsedTime      // "05:30" format
selectProgress            // 0-100 percentage
selectActiveSession       // Current session data
selectDefaultDuration     // Timer duration (minutes)

// Actions
startPomodoroSession(userId, taskId, taskName, duration)
completePomodoroSession(sessionId, status)
pauseTimer()
resumeTimer()
tickTimer()
```

## User Flow

### Starting a Session
1. User swipes left on task → "Productivity" action appears
2. Swipe completes → Pomodoro modal opens
3. Modal shows:
   - Task name & category
   - 25:00 timer (default)
   - "Start 25 min" button
   - Focus tips
4. User taps "Start 25 min"
5. Checks for existing active session
6. Creates new session in Firebase
7. Timer starts counting down
8. Progress ring & bar animate

### During Session
- **Timer display**: Shows remaining time (MM:SS)
- **Status**: "Focusing..."
- **Elapsed time**: Shows time spent
- **Pulse animation**: Circle pulses every 2 seconds
- **Controls**:
  - **Pause button**: Pauses timer
  - **Complete button**: Finish early

### Paused State
- **Status**: "Paused"
- **Timer**: Frozen at pause time
- **Controls**:
  - **Resume button**: Continue timer
  - **Complete button**: Finish early

### Completion
1. Timer reaches 0:00
2. Auto-completes session
3. Shows success alert: "🎉 Session Complete!"
4. Updates task snapshot with session data
5. Modal can be closed

### Interruption
1. User taps X or back button (while running)
2. Shows alert: "End Session?"
3. Options:
   - **Cancel**: Continue session
   - **Interrupted**: Save as interrupted
   - **Discard**: Cancel session (not counted)
4. Updates task snapshot accordingly

## Session Status Types

| Status | When Used | Counted in Stats? | Counted in Snapshot? |
|--------|-----------|-------------------|---------------------|
| `completed` | Timer finished or user completed early | ✅ Yes | ✅ Yes (completedSessions) |
| `interrupted` | User stopped early | ✅ Yes | ✅ Yes (interruptedSessions) |
| `cancelled` | User discarded session | ❌ No | ❌ No |

## Styling

### Design System
- **Primary color**: `#007AFF` (iOS blue)
- **Success color**: `#34C759` (green)
- **Warning color**: `#FF9500` (orange)
- **Background**: `#FFFFFF` (white)
- **Text**: `#333333` (dark gray)

### Animations
- **Slide-up**: 300ms spring animation
- **Fade-in**: 300ms backdrop opacity
- **Pulse**: 2000ms loop (1s grow, 1s shrink)
- **Progress ring**: Rotates based on progress %

### Responsive
- **Max height**: 85% of screen
- **Border radius**: 24px top corners
- **Safe area**: iOS notch support
- **Platform shadows**: iOS shadow, Android elevation

## Firebase Operations

### On Start
```javascript
focusSessionSnapshots/{sessionId}: {
  sessionId: "sess_123",
  userId: "user_456",
  taskId: "task_789",
  date: "2025-10-01",
  startTime: "2025-10-01T10:00:00Z",
  endTime: null,
  durationMinutes: 0,
  status: "active"
}
```

### On Complete
```javascript
// 1. Update session
focusSessionSnapshots/{sessionId}: {
  ...existing,
  endTime: "2025-10-01T10:25:00Z",
  durationMinutes: 25,
  status: "completed"
}

// 2. Update task snapshot (automatic)
taskDailySnapshots/{userId}/{date}/{taskId}: {
  ...existing,
  completedSessions: 1,        // incremented
  totalSessionMinutes: 25      // added
}
```

## Error Handling

### Active Session Check
```typescript
// Prevents multiple active sessions
if (activeSession) {
  Alert.alert(
    'Active Session',
    'You already have an active focus session. Complete it first.'
  );
  return;
}
```

### Session Not Found
```typescript
// Handles missing session gracefully
if (!activeSession) {
  Alert.alert('Error', 'No active session found');
  return;
}
```

### Firebase Errors
```typescript
try {
  await dispatch(startPomodoroSession(...));
} catch (error) {
  Alert.alert('Error', error.message || 'Failed to start session');
}
```

## Customization

### Change Default Duration
```typescript
// In Redux state
defaultDuration: 25  // Change to 30, 45, etc.
```

### Modify Colors
```typescript
// In PomodoroModal styles
progressFill: {
  borderColor: '#007AFF',  // Change to your brand color
}
```

### Add Sound/Vibration
```typescript
// After auto-complete
if (timerState.timeRemaining === 0) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  playCompletionSound();
  handleComplete();
}
```

## Best Practices

1. **Always check for active sessions** before starting
2. **Clean up intervals** on unmount
3. **Handle all session states** (active, paused, completed)
4. **Provide user feedback** via alerts
5. **Update UI immediately** with Redux state
6. **Auto-save sessions** to Firebase
7. **Close modal** after completion

## Accessibility

- **Accessible labels**: All buttons have accessibility labels
- **Screen reader**: Works with VoiceOver/TalkBack
- **Large touch targets**: Buttons are 44x44 minimum
- **High contrast**: Text is readable
- **Status announcements**: Timer status is announced

## Performance

- **Optimized selectors**: Uses memoized selectors
- **Minimal re-renders**: Only updates on timer state change
- **Native animations**: Uses `useNativeDriver: true`
- **Cleanup**: All intervals cleared on unmount
- **Lazy loading**: Modal only renders when visible

## Troubleshooting

### Timer doesn't start
- Check if user is logged in (`userId` exists)
- Check for existing active session
- Check console for errors

### Progress ring not animating
- Verify `progress` selector returns 0-100
- Check transform calculation
- Ensure animations use native driver

### Modal doesn't close
- Verify `onClose` callback is provided
- Check if session is still active
- Ensure state is reset on close

### Sessions not saving
- Check Firebase permissions
- Verify `FocusSessionService` is imported
- Check network connection

## Future Enhancements

- ⏰ Custom durations (15, 30, 45 min)
- 🔔 Push notifications on completion
- 📊 Session history in modal
- 🎵 Background sounds/music
- 📈 Streak tracking
- 🏆 Achievements/badges
- ☕ Break timer integration
- 🌙 Dark mode support

