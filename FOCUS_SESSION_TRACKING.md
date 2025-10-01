# Focus Session Tracking System

## Overview
The Focus Session Tracking system allows users to track focused work sessions for their tasks with precise time tracking and session management.

## Database Structure

### `focusSessionSnapshots` Collection
```javascript
{
  "sess_abc123": {
    sessionId: "sess_abc123",
    userId: "user_456",
    taskId: "task_789",
    date: "2025-10-01",
    startTime: "2025-10-01T08:00:00Z",
    endTime: "2025-10-01T08:25:00Z",
    durationMinutes: 25,
    status: "completed", // active | completed | interrupted | cancelled
    createdAt: "2025-10-01T08:00:00Z",
    updatedAt: "2025-10-01T08:25:00Z"
  }
}
```

## Session States

- **`active`**: Session is currently in progress
- **`completed`**: Session finished normally (user completed the focus period)
- **`interrupted`**: Session was interrupted before completion
- **`cancelled`**: Session was cancelled by user

## API Reference

### Core Operations

#### Create Session
```typescript
const sessionId = await FocusSessionService.createFocusSession(
  userId: string,
  taskId: string,
  date: string // YYYY-MM-DD
);
```

#### Complete Session
```typescript
const updatedSession = await FocusSessionService.completeFocusSession(
  sessionId: string,
  status: 'completed' | 'interrupted' | 'cancelled' = 'completed'
);
```

#### Update Session
```typescript
await FocusSessionService.updateFocusSession(
  sessionId: string,
  {
    status: 'paused',
    durationMinutes: 15
  }
);
```

### Query Operations

#### Get Specific Session
```typescript
const session = await FocusSessionService.getFocusSession(sessionId);
```

#### Get User Sessions
```typescript
// All sessions
const sessions = await FocusSessionService.getUserFocusSessions(userId);

// Filtered by date range
const sessions = await FocusSessionService.getUserFocusSessions(
  userId,
  '2025-10-01', // startDate
  '2025-10-31'  // endDate
);
```

#### Get Task Sessions
```typescript
const sessions = await FocusSessionService.getTaskFocusSessions(
  taskId,
  userId
);
```

#### Get Active Session
```typescript
const activeSession = await FocusSessionService.getActiveFocusSession(userId);
```

### Real-time Listeners

#### Listen to User Sessions
```typescript
const unsubscribe = FocusSessionService.listenToUserFocusSessions(
  userId,
  (sessions) => {
    console.log('User sessions updated:', sessions);
  }
);

// Cleanup
unsubscribe();
```

#### Listen to Active Session
```typescript
const unsubscribe = FocusSessionService.listenToActiveFocusSession(
  userId,
  (activeSession) => {
    if (activeSession) {
      console.log('Active session:', activeSession);
    } else {
      console.log('No active session');
    }
  }
);
```

### Statistics

#### Get Session Stats
```typescript
const stats = await FocusSessionService.getFocusSessionStats(
  userId,
  '2025-10-01', // optional startDate
  '2025-10-31'  // optional endDate
);

// Returns:
{
  totalSessions: 42,
  totalMinutes: 1050,
  completedSessions: 35,
  interruptedSessions: 5,
  cancelledSessions: 2,
  averageSessionMinutes: 25,
  sessionsByTask: Map<string, number>,
  sessionsByDate: Map<string, number>
}
```

### Cleanup

#### Delete Session
```typescript
await FocusSessionService.deleteFocusSession(sessionId);
```

#### Cleanup All Listeners
```typescript
FocusSessionService.cleanupAllListeners();
```

## Usage Example: Pomodoro Timer

```typescript
import { FocusSessionService } from '@/src/services/focus-session-service';

class PomodoroTimer {
  private sessionId: string | null = null;
  private timerId: NodeJS.Timeout | null = null;
  
  async startSession(userId: string, taskId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // Create new session
    this.sessionId = await FocusSessionService.createFocusSession(
      userId,
      taskId,
      today
    );
    
    // Start 25-minute timer
    this.timerId = setTimeout(() => {
      this.completeSession('completed');
    }, 25 * 60 * 1000);
    
    console.log('Pomodoro session started:', this.sessionId);
  }
  
  async completeSession(status: 'completed' | 'interrupted' | 'cancelled') {
    if (!this.sessionId) return;
    
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    
    await FocusSessionService.completeFocusSession(this.sessionId, status);
    console.log('Pomodoro session completed:', status);
    
    this.sessionId = null;
  }
  
  async interruptSession() {
    await this.completeSession('interrupted');
  }
  
  async cancelSession() {
    await this.completeSession('cancelled');
  }
}
```

## Integration with Task Snapshots

Focus sessions can be used to update `taskDailySnapshots`:

```typescript
// After completing a focus session, update task snapshot
const session = await FocusSessionService.completeFocusSession(sessionId, 'completed');

// Get all sessions for this task on this date
const taskSessions = await FocusSessionService.getTaskFocusSessions(
  session.taskId,
  session.userId
);

// Calculate total hours for the day
const totalMinutes = taskSessions
  .filter(s => s.date === session.date && s.status === 'completed')
  .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

const totalHours = totalMinutes / 60;

// Update task snapshot with actual tracked hours
// (This would be integrated into your existing snapshot logic)
```

## UI Components to Build

### 1. Focus Timer Component
- Start/pause/stop controls
- Visual countdown timer
- Current task display
- Session status indicator

### 2. Session History View
- List of past sessions
- Filter by date range
- Group by task
- Show session durations and statuses

### 3. Session Statistics Dashboard
- Total focus time
- Session completion rate
- Most focused tasks
- Daily/weekly/monthly trends
- Average session duration

### 4. Active Session Indicator
- Shows current active session
- Elapsed time counter
- Quick complete/interrupt buttons

## Best Practices

1. **Always check for active sessions** before starting a new one
2. **Handle interruptions gracefully** - save partial progress
3. **Cleanup listeners** when components unmount
4. **Use real-time listeners** for active session updates
5. **Store session stats** for analytics and insights

## Next Steps

1. Create Redux actions/reducers for focus sessions
2. Build UI components for timer and session management
3. Add to `useCentralizedListener` hook for real-time updates
4. Integrate with notification system for session reminders
5. Add session goals and achievements

