import { AUTH_ACTION_TYPES } from './auth.types';

const AUTH_INITIAL_STATE = {
  currentUser: null,
  isLoading: true, // Start with loading true to prevent premature navigation
  error: null,
  // Form data
  signUpFormData: {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  signInFormData: {
    email: '',
    password: '',
  },
  // Only for operations that need loading states
  signInLoading: false,
  signUpLoading: false,
  googleSignInLoading: false,
  updateProfileLoading: false
};

export const authReducer = (state = AUTH_INITIAL_STATE, action = {}) => {
  const { type, payload } = action;
  
  switch (type) {
    // User state management
    case AUTH_ACTION_TYPES.SET_CURRENT_USER:
      return { ...state, currentUser: payload };
      
    case AUTH_ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: payload };
      
    case AUTH_ACTION_TYPES.SET_ERROR:
      return { ...state, error: payload };
      
    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Sign In actions
    case AUTH_ACTION_TYPES.SIGN_IN_START:
      return { 
        ...state, 
        signInLoading: true, 
        error: null 
      };
    case AUTH_ACTION_TYPES.SIGN_IN_SUCCESS:
      return { 
        ...state, 
        signInLoading: false, 
        error: null 
      };
    case AUTH_ACTION_TYPES.SIGN_IN_FAILED:
      return { 
        ...state, 
        signInLoading: false, 
        error: payload 
      };
    
    // Sign Up actions
    case AUTH_ACTION_TYPES.SIGN_UP_START:
      return { 
        ...state, 
        signUpLoading: true, 
        error: null 
      };
    case AUTH_ACTION_TYPES.SIGN_UP_SUCCESS:
      return { 
        ...state, 
        signUpLoading: false, 
        error: null 
      };
    case AUTH_ACTION_TYPES.SIGN_UP_FAILED:
      return { 
        ...state, 
        signUpLoading: false, 
        error: payload 
      };
    
    
    // Google Sign In actions
    case AUTH_ACTION_TYPES.GOOGLE_SIGN_IN_START:
      return { 
        ...state, 
        googleSignInLoading: true, 
        error: null 
      };
    case AUTH_ACTION_TYPES.GOOGLE_SIGN_IN_SUCCESS:
      return { 
        ...state, 
        googleSignInLoading: false, 
        error: null 
      };
    case AUTH_ACTION_TYPES.GOOGLE_SIGN_IN_FAILED:
      return { 
        ...state, 
        googleSignInLoading: false, 
        error: payload 
      };
    
    // Update Profile actions
    case AUTH_ACTION_TYPES.UPDATE_USER_PROFILE_START:
      return { 
        ...state, 
        updateProfileLoading: true, 
        error: null 
      };
    case AUTH_ACTION_TYPES.UPDATE_USER_PROFILE_SUCCESS:
      return { 
        ...state, 
        updateProfileLoading: false, 
        error: null,
        currentUser: payload
      };
        case AUTH_ACTION_TYPES.UPDATE_USER_PROFILE_FAILED:
          return {
            ...state,
            updateProfileLoading: false,
            error: payload
          };
        
        // Form data management
        case AUTH_ACTION_TYPES.UPDATE_SIGN_UP_FORM:
          return {
            ...state,
            signUpFormData: {
              ...state.signUpFormData,
              ...payload
            }
          };
          
        case AUTH_ACTION_TYPES.UPDATE_SIGN_IN_FORM:
          return {
            ...state,
            signInFormData: {
              ...state.signInFormData,
              ...payload
            }
          };
          
        case AUTH_ACTION_TYPES.CLEAR_FORM_DATA:
          return {
            ...state,
            signUpFormData: {
              displayName: '',
              email: '',
              password: '',
              confirmPassword: '',
            },
            signInFormData: {
              email: '',
              password: '',
            }
          };
          
        default:
          return state;
  }
};
