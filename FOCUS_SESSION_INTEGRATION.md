# Focus Session & Task Snapshot Integration

## Overview
Focus sessions are now automatically integrated with `taskDailySnapshots`. When a focus session is completed, interrupted, or deleted, the corresponding task's daily snapshot is updated with session statistics.

## Changes Made

### 1. **Task Daily Snapshot Structure Update**

Added three new fields to each task snapshot:

```typescript
{
  taskId: string,
  userId: string,
  date: string,
  // ... existing fields ...
  
  // NEW: Focus session tracking
  completedSessions: number,      // Count of completed focus sessions
  interruptedSessions: number,    // Count of interrupted focus sessions
  totalSessionMinutes: number     // Total minutes from all sessions (completed + interrupted)
}
```

**Note:** Cancelled sessions are NOT counted in the statistics.

### 2. **New Function: `updateTaskSnapshotWithSessions`**

Location: `simple-realtime.ts`

```typescript
static async updateTaskSnapshotWithSessions(
  userId: string, 
  taskId: string, 
  date: string
): Promise<void>
```

**What it does:**
1. Fetches all focus sessions for the specified task on the specified date
2. Calculates:
   - Number of completed sessions
   - Number of interrupted sessions  
   - Total session minutes (completed + interrupted only)
3. Updates the task daily snapshot with these statistics

**When it's called:**
- After a focus session is completed
- After a focus session is deleted

### 3. **Focus Session Service Integration**

#### `completeFocusSession()` - Updated
After completing a session, it now automatically:
1. Updates the session status in `focusSessionSnapshots`
2. Calls `updateTaskSnapshotWithSessions()` to update the task snapshot

#### `deleteFocusSession()` - Updated
After deleting a session, it now:
1. Retrieves session data before deletion
2. Deletes the session
3. Calls `updateTaskSnapshotWithSessions()` to recalculate statistics without the deleted session

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User completes/interrupts/cancels a focus session          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  FocusSessionService.completeFocusSession()                 │
│  - Updates focusSessionSnapshots/{sessionId}                │
│  - Sets endTime, durationMinutes, status                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  SimpleRealtimeService.updateTaskSnapshotWithSessions()     │
│  - Fetches all sessions for task on that date               │
│  - Calculates: completedSessions, interruptedSessions       │
│  - Calculates: totalSessionMinutes                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Updates taskDailySnapshots/{userId}/{date}/{taskId}        │
│  - completedSessions: N                                     │
│  - interruptedSessions: N                                   │
│  - totalSessionMinutes: N                                   │
│  - updatedAt: timestamp                                     │
└─────────────────────────────────────────────────────────────┘
```

## Example Usage

### Scenario: User completes a 25-minute Pomodoro session

```typescript
// 1. Start session
const sessionId = await FocusSessionService.createFocusSession(
  'user_123',
  'task_456',
  '2025-10-01'
);

// 2. After 25 minutes, complete session
await FocusSessionService.completeFocusSession(sessionId, 'completed');

// What happens automatically:
// - focusSessionSnapshots/sess_789 is updated with:
//   - endTime: "2025-10-01T08:25:00Z"
//   - durationMinutes: 25
//   - status: "completed"
//
// - taskDailySnapshots/user_123/2025-10-01/task_456 is updated with:
//   - completedSessions: 1 (or incremented)
//   - totalSessionMinutes: 25 (or added to existing)
```

### Scenario: User deletes an old session

```typescript
await FocusSessionService.deleteFocusSession('sess_789');

// What happens automatically:
// - Session is removed from focusSessionSnapshots
// - Task snapshot is recalculated WITHOUT that session
// - Statistics are decremented accordingly
```

## Database Structure Example

### Before Focus Session:
```javascript
taskDailySnapshots: {
  "user_123": {
    "2025-10-01": {
      "task_456": {
        taskId: "task_456",
        title: "Write documentation",
        category: "work",
        completed: false,
        points: 0,
        hoursTracked: 0,
        completedSessions: 0,
        interruptedSessions: 0,
        totalSessionMinutes: 0
      }
    }
  }
}
```

### After 2 Completed + 1 Interrupted Session:
```javascript
taskDailySnapshots: {
  "user_123": {
    "2025-10-01": {
      "task_456": {
        taskId: "task_456",
        title: "Write documentation",
        category: "work",
        completed: false,
        points: 0,
        hoursTracked: 0,
        completedSessions: 2,      // ← Updated
        interruptedSessions: 1,     // ← Updated
        totalSessionMinutes: 60     // ← Updated (25 + 25 + 10)
      }
    }
  }
}
```

## Session Status Handling

| Session Status | Counted in completedSessions? | Counted in interruptedSessions? | Minutes Added to totalSessionMinutes? |
|---------------|------------------------------|--------------------------------|--------------------------------------|
| `completed`   | ✅ Yes                        | ❌ No                           | ✅ Yes                                |
| `interrupted` | ❌ No                         | ✅ Yes                          | ✅ Yes                                |
| `cancelled`   | ❌ No                         | ❌ No                           | ❌ No                                 |
| `active`      | ❌ No (not finished yet)      | ❌ No                           | ❌ No                                 |

## Benefits

1. **Automatic Sync**: Task snapshots stay in sync with focus sessions without manual intervention
2. **Accurate Tracking**: Session statistics are always recalculated from source data
3. **Historical Data**: Can see how many focus sessions were used for each task
4. **Analytics Ready**: Data is structured for reporting and insights
5. **Clean Architecture**: Clear separation between session tracking and snapshot aggregation

## UI Integration Ideas

### 1. Task Card Enhancement
```typescript
<TaskCard task={task}>
  <Text>Completed: {task.completed ? 'Yes' : 'No'}</Text>
  <Text>Focus Sessions: {task.completedSessions} completed, {task.interruptedSessions} interrupted</Text>
  <Text>Total Focus Time: {Math.round(task.totalSessionMinutes / 60)} hours</Text>
</TaskCard>
```

### 2. Daily Summary
```typescript
const dailyStats = taskSnapshots.reduce((acc, task) => ({
  totalSessions: acc.totalSessions + task.completedSessions + task.interruptedSessions,
  totalMinutes: acc.totalMinutes + task.totalSessionMinutes,
  completionRate: (task.completedSessions / (task.completedSessions + task.interruptedSessions)) * 100
}), { totalSessions: 0, totalMinutes: 0, completionRate: 0 });
```

### 3. Task Performance Metrics
```typescript
// Show which tasks get the most focus
const topFocusedTasks = taskSnapshots
  .sort((a, b) => b.totalSessionMinutes - a.totalSessionMinutes)
  .slice(0, 5);
```

## Important Notes

1. **Snapshot Must Exist First**: The task snapshot must exist before sessions can update it. This happens when:
   - A task is created/updated
   - Daily snapshot is generated
   
2. **Real-time Updates**: If you're using listeners for task snapshots, they'll automatically receive updates when sessions are completed

3. **Date Matching**: Sessions are only counted for the exact date specified in the session. Cross-day sessions are not supported.

4. **Performance**: The `updateTaskSnapshotWithSessions` function fetches all sessions to ensure accuracy. For high-volume scenarios, consider optimization.

## Next Steps

1. ✅ Task snapshot structure updated with session fields
2. ✅ Auto-update on session completion
3. ✅ Auto-update on session deletion
4. 🔲 Add to centralized listener (optional - for real-time UI updates)
5. 🔲 Build UI components to display session statistics
6. 🔲 Add session analytics dashboard
7. 🔲 Create session-based achievements/badges

