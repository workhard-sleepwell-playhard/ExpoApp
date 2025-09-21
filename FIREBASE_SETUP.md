# Firebase Setup Guide for FinishIt

This guide will help you connect your FinishIt app to Firebase and set up the data structure.

## Prerequisites

1. **Firebase Account**: Create a Firebase account at [firebase.google.com](https://firebase.google.com)
2. **Firebase CLI**: Install Firebase CLI globally
   ```bash
   npm install -g firebase-tools
   ```
3. **Node.js**: Make sure you have Node.js installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name: `finishit-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create the project

## Step 2: Configure Firebase Services

### Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - Email/Password
   - Google (optional)
   - Anonymous (for testing)

### Enable Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select a location close to your users

### Enable Storage
1. Go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore

## Step 3: Get Firebase Configuration

### For React Native/Expo Apps:
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → **Android** (🤖) or **iOS** (🍎) icon
4. For **Android**: Enter your package name (e.g., `com.yourcompany.finishit`)
5. For **iOS**: Enter your bundle ID (e.g., `com.yourcompany.finishit`)
6. Download the configuration file:
   - **Android**: Download `google-services.json`
   - **iOS**: Download `GoogleService-Info.plist`

### Alternative: Use Web Config for Expo (Recommended)
If you're using Expo, you can also use the Web app configuration:
1. Click "Add app" → **Web app** (</>) icon
2. Register your app with a nickname like "finishit-expo"
3. Copy the Firebase configuration object

**Recommendation**: For Expo/React Native apps, using the **Web config** is simpler and works perfectly with the Firebase Web SDK. The native Android/iOS configs are only needed if you're using `@react-native-firebase` instead of the standard Firebase Web SDK.

## Step 4: Update Configuration Files

### Option A: Using Web Config (Recommended for Expo)
Replace the configuration in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Option B: Using Native Config Files
If you created Android/iOS apps:

**For Android:**
1. Place `google-services.json` in your project root
2. Install Firebase Android SDK:
   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/firestore
   ```

**For iOS:**
1. Place `GoogleService-Info.plist` in your iOS project
2. Install Firebase iOS SDK:
   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/firestore
   ```

### Update Initialization Script
Update the configuration in `scripts/initialize-firebase-data.js` with the same values.

## Step 5: Deploy Firebase Configuration

### Login to Firebase CLI
```bash
firebase login
```

### Initialize Firebase in your project
```bash
cd finishit
firebase init
```

Select the following services:
- ✅ Firestore: Configure security rules and indexes files
- ✅ Storage: Configure a security rules file
- ✅ Functions: Configure a Cloud Functions directory (optional)

When prompted:
- Use existing project: Select your Firebase project
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`
- Storage rules file: `storage.rules`

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

### Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

## Step 6: Initialize Default Data

Run the initialization script to populate default categories, tags, and achievements:

```bash
npm run init-firebase
```

## Step 7: Install Dependencies

Install the updated dependencies:

```bash
npm install
```

## Step 8: Test the Connection

### Start Firebase Emulators (for development)
```bash
npm run firebase:emulators
```

This will start local emulators for:
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Storage: http://localhost:9199
- Functions: http://localhost:5001
- Emulator UI: http://localhost:4000

### Start your React Native app
```bash
npm start
```

## Step 9: Verify Setup

1. **Check Firestore**: Go to Firebase Console → Firestore Database and verify collections are created
2. **Check Data**: Run the app and try creating a user account
3. **Check Rules**: Try accessing data without authentication (should be blocked)

## Available Scripts

- `npm run init-firebase` - Initialize default data
- `npm run firebase:emulators` - Start local emulators
- `npm run firebase:deploy` - Deploy to production
- `npm run firebase:deploy:rules` - Deploy only security rules
- `npm run firebase:deploy:indexes` - Deploy only Firestore indexes

## Security Rules Overview

The security rules ensure:
- Users can only access their own data (tasks, time tracking, etc.)
- Public data (posts, categories, tags) is readable by authenticated users
- Social features (likes, follows) are properly secured
- Only authenticated users can create content

## Data Structure

Your Firebase project will have these collections:
- `users` - User profiles and settings
- `tasks` - User tasks with categories and tags
- `posts` - Social feed posts
- `comments` - Post comments
- `categories` - Task categories
- `tags` - Task tags
- `achievements` - User achievements
- `timeTracking` - Time tracking sessions
- `leaderboards` - Competition rankings
- `notifications` - User notifications
- `userLikes` - Post/comment likes
- `userFollows` - User follow relationships

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if security rules are deployed and user is authenticated
2. **Index Errors**: Make sure Firestore indexes are deployed
3. **Emulator Issues**: Restart emulators and clear browser cache
4. **Configuration Errors**: Verify Firebase config matches your project

### Useful Commands

```bash
# Check Firebase project
firebase projects:list

# View current project
firebase use

# Switch between projects
firebase use --add

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore,storage

# View logs
firebase functions:log
```

## Next Steps

1. **Authentication**: Implement user sign-up/sign-in
2. **Data Integration**: Connect your React Native components to Firebase services
3. **Real-time Updates**: Use Firestore listeners for live data
4. **Offline Support**: Firestore works offline by default
5. **Analytics**: Add Firebase Analytics for user insights

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Support](https://firebase.google.com/support)

For FinishIt app issues, refer to the main README.md file.
