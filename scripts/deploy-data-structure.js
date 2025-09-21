const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting automated data structure deployment...\n');

// Step 1: Create temporary admin-friendly rules
function createAdminRules() {
  console.log('📝 Creating temporary admin rules...');
  
  const adminRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.email == 'admin@finishit.app' ||
        request.auth.token.email == 'david@example.com' || // Add your email here
        request.auth.token.admin == true
      );
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAuthenticated();
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Achievements collection
    match /achievements/{achievementId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Time tracking collection
    match /timeTracking/{trackingId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Leaderboards collection
    match /leaderboards/{leaderboardId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Categories collection - ADMIN CAN CREATE DEFAULT CATEGORIES
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || (isAuthenticated() && 
        request.resource.data.userId == request.auth.uid);
      allow update, delete: if isAdmin() || (isAuthenticated() && 
        (resource.data.isDefault == true || 
         resource.data.userId == request.auth.uid));
    }
    
    // Tags collection - ADMIN CAN CREATE DEFAULT TAGS
    match /tags/{tagId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || (isAuthenticated() && 
        (request.resource.data.userId == request.auth.uid ||
         request.resource.data.userId == null));
      allow update, delete: if isAdmin() || (isAuthenticated() && 
        (resource.data.userId == null || 
         resource.data.userId == request.auth.uid));
    }
    
    // Achievement templates - ADMIN CAN CREATE
    match /achievementTemplates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // User likes collection
    match /userLikes/{likeId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User follows collection
    match /userFollows/{followId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.followerId || 
         request.auth.uid == resource.data.followingId);
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.followerId;
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.followerId;
    }
    
    // Post media collection
    match /postMedia/{mediaId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Subtasks collection
    match /subtasks/{subtaskId} {
      allow read, write: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(resource.data.taskId)).data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)).data.userId == request.auth.uid;
    }
    
    // Task tags junction collection
    match /taskTags/{taskTagId} {
      allow read, write: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(resource.data.taskId)).data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)).data.userId == request.auth.uid;
    }
  }
}`;

  fs.writeFileSync('firestore.rules', adminRules);
  console.log('✓ Temporary admin rules created');
}

// Step 2: Deploy admin rules
function deployAdminRules() {
  console.log('🚀 Deploying temporary admin rules...');
  try {
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✓ Admin rules deployed');
  } catch (error) {
    console.error('✗ Error deploying admin rules:', error.message);
    throw error;
  }
}

// Step 3: Initialize data with admin privileges
function initializeData() {
  console.log('📊 Initializing data with admin privileges...');
  try {
    execSync('node ./scripts/initialize-firebase-data.js', { stdio: 'inherit' });
    console.log('✓ Data initialization completed');
  } catch (error) {
    console.error('✗ Error initializing data:', error.message);
    throw error;
  }
}

// Step 4: Restore secure rules
function restoreSecureRules() {
  console.log('🔒 Restoring secure rules...');
  
  const secureRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own data, read others for social features
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAuthenticated(); // Allow reading other users for social features
    }
    
    // Tasks collection - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Posts collection - public read, owner write
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Comments collection - public read, authenticated write
    match /comments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Achievements collection - users can only access their own achievements
    match /achievements/{achievementId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Time tracking collection - users can only access their own data
    match /timeTracking/{trackingId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Leaderboards collection - public read only
    match /leaderboards/{leaderboardId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only server functions can update leaderboards
    }
    
    // Notifications collection - users can only access their own notifications
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Categories collection - read public, write own custom ones
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        (resource.data.isDefault == true || 
         resource.data.userId == request.auth.uid);
    }
    
    // Tags collection - read public, write own custom ones
    match /tags/{tagId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        (request.resource.data.userId == request.auth.uid ||
         request.resource.data.userId == null);
      allow update, delete: if isAuthenticated() && 
        (resource.data.userId == null || 
         resource.data.userId == request.auth.uid);
    }
    
    // Achievement templates - read only
    match /achievementTemplates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if false; // Read-only for users
    }
    
    // User likes collection - authenticated users can manage their own likes
    match /userLikes/{likeId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User follows collection - authenticated users can manage their own follows
    match /userFollows/{followId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.followerId || 
         request.auth.uid == resource.data.followingId);
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.followerId;
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.followerId;
    }
    
    // Post media collection - public read, owner write
    match /postMedia/{mediaId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Subtasks collection - users can only access subtasks of their own tasks
    match /subtasks/{subtaskId} {
      allow read, write: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(resource.data.taskId)).data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)).data.userId == request.auth.uid;
    }
    
    // Task tags junction collection - users can only manage tags for their own tasks
    match /taskTags/{taskTagId} {
      allow read, write: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(resource.data.taskId)).data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        exists(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)) &&
        get(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)).data.userId == request.auth.uid;
    }
  }
}`;

  fs.writeFileSync('firestore.rules', secureRules);
  console.log('✓ Secure rules restored to file');
}

// Step 5: Deploy secure rules
function deploySecureRules() {
  console.log('🔒 Deploying secure rules...');
  try {
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✓ Secure rules deployed');
  } catch (error) {
    console.error('✗ Error deploying secure rules:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    createAdminRules();
    deployAdminRules();
    initializeData();
    restoreSecureRules();
    deploySecureRules();
    
    console.log('\n🎉 Data structure deployment completed successfully!');
    console.log('✅ Your Firebase database now has:');
    console.log('   📁 Default categories (Work, Personal, Health, etc.)');
    console.log('   🏷️  Default tags (urgent, important, review, etc.)');
    console.log('   🏆 Achievement templates');
    console.log('   🔒 Secure access rules');
    console.log('   📊 Optimized indexes');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.log('🔄 Attempting to restore secure rules...');
    try {
      restoreSecureRules();
      deploySecureRules();
      console.log('✅ Secure rules restored');
    } catch (restoreError) {
      console.error('❌ Failed to restore secure rules:', restoreError.message);
    }
    process.exit(1);
  }
}

main();
