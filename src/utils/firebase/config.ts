import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (__DEV__) {
  // Firestore emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator already connected
  }

  // Auth emulator
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // Emulator already connected
  }

  // Storage emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulator already connected
  }

  // Functions emulator
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    // Emulator already connected
  }
}

export default app;
