import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged, } from 'firebase/auth';
import { SimpleRealtimeService } from '../../services/simple-realtime';
// Note: Firestore, Storage and Functions are not needed for this app
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUlkrFLVoOHY_C4f29egp0IFtw57876z4",
  authDomain: "finishit-c324d.firebaseapp.com",
  projectId: "finishit-c324d",
  storageBucket: "finishit-c324d.firebasestorage.app",
  messagingSenderId: "197633895426",
  appId: "1:197633895426:web:93c6d590262769ed108b1b",
  measurementId: "G-7B72X70Q1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
// Note: Only using Realtime Database and Auth for this app
// export const db = getFirestore(app); // Removed - using Realtime Database instead
// export const storage = getStorage(app); // Not needed for this app
// export const functions = getFunctions(app); // Not needed for this app

// Note: Google Auth requires additional setup for React Native
// For now, we'll disable Google Auth to prevent the window error
// You can enable it later by installing @react-native-google-signin/google-signin

// Google Auth functions (disabled for React Native compatibility)
export const signInWithGooglePopup = async () => {
  throw new Error('Google Sign In is not configured for React Native yet. Please use email/password authentication.');
};

export const signInWithGoogleRedirect = async () => {
  throw new Error('Google Sign In is not configured for React Native yet. Please use email/password authentication.');
};

export default app;

// Firestore utility functions removed - using Realtime Database instead
// Use SimpleRealtimeService for all data operations

export const createUserDocumentFromAuth = async (
  userAuth: any,
  additionalInformation: any = {}
) => {
  console.log('createUserDocumentFromAuth called with:', userAuth?.uid, additionalInformation);
  console.log('userAuth.displayName:', userAuth?.displayName);
  console.log('userAuth.email:', userAuth?.email);
  console.log('additionalInformation:', additionalInformation);
  
  if (!userAuth) {
    console.log('No userAuth provided');
    return;
  }

  // Check if user exists in Realtime Database
  const userProfile = await SimpleRealtimeService.getUserProfile(userAuth.uid);

  console.log('User document exists:', !!userProfile);

  if (!userProfile) {
    const { displayName, email } = userAuth;
    console.log('Creating new user document for:', userAuth.uid);

    try {
      // Use UserService to create a complete user document
      // For sign-in users without displayName, use email prefix as fallback
      const fallbackDisplayName = additionalInformation.displayName || 
                                 displayName || 
                                 (email ? email.split('@')[0] : 'User');
      
      await SimpleRealtimeService.createUser(userAuth.uid, {
        email: email || '',
        displayName: fallbackDisplayName,
        avatar: additionalInformation.avatar || '',
        username: additionalInformation.username || '',
        bio: additionalInformation.bio || '',
        ...additionalInformation,
      });
      console.log('User document creation completed successfully');
    } catch (error) {
      console.error('Error creating the user:', error);
      throw error; // Re-throw to let the calling code handle it
    }
  } else {
    console.log('User document already exists, skipping creation');
  }

  return userAuth.uid;
};

export const createAuthUserWithEmailAndPassword = async (email: string, password: string) => {
  if (!email || !password) return;

  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email: string, password: string) => {
  if (!email || !password) return;

  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = (callback: (user: any) => void) =>
  onAuthStateChanged(auth, callback);