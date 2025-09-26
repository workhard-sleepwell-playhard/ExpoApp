import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, query, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged, } from 'firebase/auth';
import { UserService } from '../../services/firebase-service';
// Note: Storage and Functions might not be needed for basic auth
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
export const db = getFirestore(app);
export const auth = getAuth(app);
// export const storage = getStorage(app); // Commented out to prevent potential web dependencies
// export const functions = getFunctions(app); // Commented out to prevent potential web dependencies

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

export const addCollectionAndDocuments = async (
  collectionKey: string,
  objectsToAdd: any[],
  field?: string
) => {
  const collectionRef = collection(db, collectionKey);
  const batch = writeBatch(db);

  objectsToAdd.forEach((object: any) => {
    const docRef = doc(collectionRef, object.title.toLowerCase());
    batch.set(docRef, object);
  });

  await batch.commit();
  console.log('done');
};

export const getCategoriesAndDocuments = async () => {
  const collectionRef = collection(db, 'categories');
  const q = query(collectionRef);

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnapshot) => docSnapshot.data())
}

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

  const userDocRef = doc(db, 'users', userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);

  console.log('User document exists:', userSnapshot.exists());

  if (!userSnapshot.exists()) {
    const { displayName, email } = userAuth;
    console.log('Creating new user document for:', userAuth.uid);

    try {
      // Use UserService to create a complete user document
      // For sign-in users without displayName, use email prefix as fallback
      const fallbackDisplayName = additionalInformation.displayName || 
                                 displayName || 
                                 (email ? email.split('@')[0] : 'User');
      
      await UserService.createUser(userAuth.uid, {
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

  return userDocRef;
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