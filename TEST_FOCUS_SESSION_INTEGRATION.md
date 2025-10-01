# Testing Focus Session Integration

## Quick Test Guide

This guide shows how to verify that focus sessions are properly updating task snapshots.

## Test Scenario 1: Complete a Focus Session

### Step 1: Create a Task Snapshot
```typescript
import { SimpleRealtimeService } from '@/src/services/simple-realtime';

// This usually happens automatically, but for testing:
const userId = 'test_user_123';
const date = '2025-10-01';

// Create initial snapshot (this sets completedSessions: 0, etc.)
await SimpleRealtimeService.createDailyUserSnapshot(userId, date);
```

### Step 2: Start and Complete a Focus Session
```typescript
import { FocusSessionService } from '@/src/services/focus-session-service';

const taskId = 'task_456'; // Use a real task ID from your tasks

// Start session
const sessionId = await FocusSessionService.createFocusSession(
  userId,
  taskId,
  date
);

console.log('Session started:', sessionId);

// Simulate work... then complete
await FocusSessionService.completeFocusSession(sessionId, 'completed');

console.log('Session completed!');
```

### Step 3: Verify Task Snapshot Updated
```typescript
// Check the task snapshot
const snapshot = await SimpleRealtimeService.getTaskDailySnapshots(
  userId,
  date,
  date
);

console.log('Task Snapshot:', snapshot);

// Should show:
// {
//   completedSessions: 1,
//   interruptedSessions: 0,
//   totalSessionMinutes: <duration>
// }
```

## Test Scenario 2: Multiple Sessions

### Complete Multiple Sessions for Same Task
```typescript
const taskId = 'task_456';
const date = '2025-10-01';

// Session 1 - Completed
const session1 = await FocusSessionService.createFocusSession(userId, taskId, date);
await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
await FocusSessionService.completeFocusSession(session1, 'completed');

// Session 2 - Completed
const session2 = await FocusSessionService.createFocusSession(userId, taskId, date);
await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
await FocusSessionService.completeFocusSession(session2, 'completed');

// Session 3 - Interrupted
const session3 = await FocusSessionService.createFocusSession(userId, taskId, date);
await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
await FocusSessionService.completeFocusSession(session3, 'interrupted');

// Check snapshot
const snapshot = await SimpleRealtimeService.getTaskDailySnapshots(userId, date, date);
const taskSnapshot = snapshot.find(s => s.taskId === taskId);

console.log('After 3 sessions:', taskSnapshot);
// Expected:
// completedSessions: 2
// interruptedSessions: 1
// totalSessionMinutes: ~6 (varies based on actual time)
```

## Test Scenario 3: Delete a Session

### Delete a Session and Verify Recalculation
```typescript
// Start with 2 sessions
const session1 = await FocusSessionService.createFocusSession(userId, taskId, date);
await FocusSessionService.completeFocusSession(session1, 'completed');

const session2 = await FocusSessionService.createFocusSession(userId, taskId, date);
await FocusSessionService.completeFocusSession(session2, 'completed');

// Check count (should be 2)
let snapshot = await SimpleRealtimeService.getTaskDailySnapshots(userId, date, date);
console.log('Before delete:', snapshot);

// Delete one session
await FocusSessionService.deleteFocusSession(session1);

// Check count (should be 1)
snapshot = await SimpleRealtimeService.getTaskDailySnapshots(userId, date, date);
console.log('After delete:', snapshot);
// Expected: completedSessions: 1
```

## Test Scenario 4: Cancelled Sessions Don't Count

### Cancelled Sessions Should Not Update Snapshot
```typescript
const session = await FocusSessionService.createFocusSession(userId, taskId, date);
await FocusSessionService.completeFocusSession(session, 'cancelled');

const snapshot = await SimpleRealtimeService.getTaskDailySnapshots(userId, date, date);
const taskSnapshot = snapshot.find(s => s.taskId === taskId);

console.log('After cancelled session:', taskSnapshot);
// Expected:
// completedSessions: 0
// interruptedSessions: 0
// totalSessionMinutes: 0
```

## Manual Database Check

You can also verify directly in Firebase Console:

### 1. Check Focus Sessions
```
focusSessionSnapshots/
  sess_abc123/
    userId: "test_user_123"
    taskId: "task_456"
    date: "2025-10-01"
    status: "completed"
    durationMinutes: 25
```

### 2. Check Task Snapshot
```
taskDailySnapshots/
  test_user_123/
    2025-10-01/
      task_456/
        completedSessions: 1      ← Should match session count
        interruptedSessions: 0
        totalSessionMinutes: 25   ← Should match session duration
```

## Expected Console Logs

When everything works correctly, you should see:

```
Focus session created: sess_abc123
Focus session completed: sess_abc123 completed
Updated task snapshot task_456 for 2025-10-01 - Sessions: 1 completed, 0 interrupted, 25 minutes
```

## Troubleshooting

### Issue: Task snapshot shows 0 sessions after completion

**Check:**
1. Does the task snapshot exist? (`taskDailySnapshots/{userId}/{date}/{taskId}`)
2. Is the date format correct? (YYYY-MM-DD)
3. Check console logs for errors

### Issue: Sessions are counted but minutes are 0

**Possible cause:** Session duration calculation issue
**Fix:** Ensure there's time between session start and completion

### Issue: Interrupted sessions not counting

**Check:** 
- Session status is exactly 'interrupted' (not 'Interrupted' or 'INTERRUPTED')
- The `updateTaskSnapshotWithSessions` function is being called

### Issue: Deleted session still counted

**Check:**
- Session was actually deleted from `focusSessionSnapshots`
- The update function was called after deletion
- No errors in console

## Integration Test Component

Here's a complete test you can run:

```typescript
async function testFocusSessionIntegration() {
  const userId = 'test_user_123';
  const taskId = 'task_456';
  const date = new Date().toISOString().split('T')[0];
  
  console.log('=== Starting Focus Session Integration Test ===');
  
  try {
    // 1. Create snapshot
    console.log('1. Creating task snapshot...');
    await SimpleRealtimeService.createDailyUserSnapshot(userId, date);
    
    // 2. Complete session
    console.log('2. Creating and completing focus session...');
    const sessionId = await FocusSessionService.createFocusSession(userId, taskId, date);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await FocusSessionService.completeFocusSession(sessionId, 'completed');
    
    // 3. Verify
    console.log('3. Verifying snapshot update...');
    const snapshots = await SimpleRealtimeService.getTaskDailySnapshots(userId, date, date);
    const taskSnapshot = snapshots.find(s => s.taskId === taskId);
    
    console.log('Task Snapshot:', taskSnapshot);
    
    if (taskSnapshot.completedSessions === 1) {
      console.log('✅ TEST PASSED: Session counted correctly');
    } else {
      console.log('❌ TEST FAILED: Expected 1 session, got', taskSnapshot.completedSessions);
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
  
  console.log('=== Test Complete ===');
}

// Run the test
testFocusSessionIntegration();
```

## Success Criteria

✅ **Integration is working if:**
1. `completedSessions` increments when session completed
2. `interruptedSessions` increments when session interrupted
3. `totalSessionMinutes` adds up session durations
4. Cancelled sessions don't affect any counters
5. Deleting a session recalculates all counters
6. Console shows successful update logs

❌ **Something is wrong if:**
1. Counters stay at 0 after completing sessions
2. Error messages in console
3. Snapshot doesn't update at all
4. Cancelled sessions increment counters

