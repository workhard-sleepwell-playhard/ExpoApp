import { AUTH_ACTION_TYPES } from './auth.types';
import {
  createAuthUserWithEmailAndPassword,
  signInAuthUserWithEmailAndPassword,
  signOutUser,
  signInWithGooglePopup,
  createUserDocumentFromAuth,
  onAuthStateChangedListener
} from '../../src/utils/firebase/config';

// Basic action creators
export const setCurrentUser = (user) => ({
  type: AUTH_ACTION_TYPES.SET_CURRENT_USER,
  payload: user
});

export const setLoading = (loading) => ({
  type: AUTH_ACTION_TYPES.SET_LOADING,
  payload: loading
});

export const setError = (error) => ({
  type: AUTH_ACTION_TYPES.SET_ERROR,
  payload: error
});

export const clearError = () => ({
  type: AUTH_ACTION_TYPES.CLEAR_ERROR
});

// Form data action creators
export const updateSignUpForm = (field, value) => ({
  type: AUTH_ACTION_TYPES.UPDATE_SIGN_UP_FORM,
  payload: { [field]: value }
});

export const updateSignInForm = (field, value) => ({
  type: AUTH_ACTION_TYPES.UPDATE_SIGN_IN_FORM,
  payload: { [field]: value }
});

export const clearFormData = () => ({
  type: AUTH_ACTION_TYPES.CLEAR_FORM_DATA
});

// Async thunk for checking user session
export const checkUserSession = () => {
  return (dispatch) => {
    dispatch(setLoading(true));
    
    // Enable auth state listener for real authentication
    onAuthStateChangedListener((user) => {
      if (user) {
        dispatch(setCurrentUser(user));
      } else {
        dispatch(setCurrentUser(null));
      }
      dispatch(setLoading(false));
    });
  };
};

// Async thunk for email/password sign up
export const signUpStart = (email, password, displayName) => {
  return async (dispatch) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SIGN_UP_START });
      
      const { user } = await createAuthUserWithEmailAndPassword(email, password);
      await createUserDocumentFromAuth(user, { displayName });
      
      dispatch({ 
        type: AUTH_ACTION_TYPES.SIGN_UP_SUCCESS
      });
      dispatch(setCurrentUser(user));
      
      return user;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTION_TYPES.SIGN_UP_FAILED,
        payload: error.message
      });
      dispatch(setError(error.message));
      throw error;
    }
  };
};

// Async thunk for email/password sign in
export const signInStart = (email, password) => {
  return async (dispatch) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SIGN_IN_START });
      
      const { user } = await signInAuthUserWithEmailAndPassword(email, password);
      
      dispatch({ 
        type: AUTH_ACTION_TYPES.SIGN_IN_SUCCESS
      });
      dispatch(setCurrentUser(user));
      
      return user;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTION_TYPES.SIGN_IN_FAILED,
        payload: error.message
      });
      dispatch(setError(error.message));
      throw error;
    }
  };
};

// Async thunk for Google sign in
export const signInWithGoogle = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.GOOGLE_SIGN_IN_START });
      
      const { user } = await signInWithGooglePopup();
      await createUserDocumentFromAuth(user);
      
      dispatch({ 
        type: AUTH_ACTION_TYPES.GOOGLE_SIGN_IN_SUCCESS
      });
      dispatch(setCurrentUser(user));
      
      return user;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTION_TYPES.GOOGLE_SIGN_IN_FAILED,
        payload: error.message
      });
      dispatch(setError(error.message));
      throw error;
    }
  };
};

// Simple sign out action (no loading states needed)
export const signOutStart = () => {
  return async (dispatch) => {
    try {
      await signOutUser();
      dispatch(setCurrentUser(null));
      dispatch(clearError());
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };
};

// Async thunk for updating user profile
export const updateUserProfile = (userData) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.UPDATE_USER_PROFILE_START });
      
      const currentUser = getState().auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      // Here you would typically update the user document in Firestore
      // For now, we'll just update the local state
      
      dispatch({ 
        type: AUTH_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS
      });
      dispatch(setCurrentUser({ ...currentUser, ...userData }));
      
      return { ...currentUser, ...userData };
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED,
        payload: error.message
      });
      dispatch(setError(error.message));
      throw error;
    }
  };
};
