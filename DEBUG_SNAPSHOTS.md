# Debug Guide: Daily Snapshots Not Appearing

## Quick Check Steps

### 1. Verify Snapshot Creation is Being Called
Add this to your app and check the console:

```javascript
// Add this to any component where user data is updated
console.log('🔍 Testing snapshot creation...');

// Test with a real user ID
const testUserId = 'your-actual-user-id';
await SimpleRealtimeService.updateUserPoints(testUserId, {
  totalPoints: 100,
  level: 2
});

console.log('✅ updateUserPoints completed - check console for snapshot logs');
```

### 2. Check Console Logs
Look for these messages in your browser console:
- `🔍 Creating/updating snapshot for user {userId} on {date}`
- `📊 User data keys: [...]`
- `📸 Snapshot exists: false/true`
- `💾 Saving snapshot to: /userDailySnapshots/{userId}/{date}`
- `✅ Daily snapshot created/updated for user {userId} on {date}`

### 3. Check Firebase Console
1. Open Firebase Console
2. Go to Realtime Database
3. Look for: `/userDailySnapshots/{userId}/{today}`
4. Check if the snapshot exists

### 4. Verify User Data is Being Updated
Check if the main user data is being updated:
1. Go to `/users/{userId}` in Firebase Console
2. Verify the data is being updated when you perform actions
3. If user data isn't updating, the snapshot won't be created

## Common Issues

### Issue 1: User Data Not Updating
**Symptom:** No user data changes in Firebase
**Solution:** Check if the user update functions are being called correctly

### Issue 2: Snapshot Function Not Called
**Symptom:** User data updates but no snapshot logs in console
**Solution:** Check if `createDailyUserSnapshot` is being called

### Issue 3: Firebase Permission Error
**Symptom:** Error in console about permissions
**Solution:** Check Firebase Realtime Database rules

### Issue 4: User ID Issue
**Symptom:** Snapshot path is wrong
**Solution:** Verify the userId being passed is correct

## Test Commands

Run these in your app console to test:

```javascript
// Test 1: Check if user exists
const userProfile = await SimpleRealtimeService.getUserProfile('your-user-id');
console.log('User exists:', !!userProfile);

// Test 2: Update user data
await SimpleRealtimeService.updateUserPoints('your-user-id', {
  totalPoints: 100,
  level: 2
});

// Test 3: Check snapshots
const snapshots = await SimpleRealtimeService.getUserDailySnapshots('your-user-id');
console.log('Snapshots found:', snapshots.length);
console.log('Latest snapshot:', snapshots[0]);
```

## Expected Behavior

1. **First update of the day:** Creates new snapshot
2. **Subsequent updates:** Updates existing snapshot
3. **One snapshot per day:** No duplicates
4. **Console logs:** Should show snapshot creation/update messages

## If Still Not Working

1. Check Firebase Realtime Database rules
2. Verify Firebase connection is working
3. Check for JavaScript errors in console
4. Ensure user is authenticated
5. Verify the user ID is correct

The snapshot creation should work automatically whenever user data is updated through any of these functions:
- `updateUserPoints()`
- `addPointsActivity()`
- `updateTaskCompletionStats()`
- `updateSocialStats()`
- `updateUserProfile()`

