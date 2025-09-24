import { createSelector } from 'reselect';

// Select the auth slice of state
const selectAuthReducer = (state) => state.auth;

// Basic selectors
export const selectCurrentUser = createSelector(
  [selectAuthReducer],
  (auth) => auth.currentUser
);

export const selectIsLoading = createSelector(
  [selectAuthReducer],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuthReducer],
  (auth) => auth.error
);

// Form data selectors
export const selectSignUpFormData = createSelector(
  [selectAuthReducer],
  (auth) => auth.signUpFormData
);

export const selectSignInFormData = createSelector(
  [selectAuthReducer],
  (auth) => auth.signInFormData
);

// Auth action loading states (only for operations that need them)
export const selectSignInLoading = createSelector(
  [selectAuthReducer],
  (auth) => auth.signInLoading
);

export const selectSignUpLoading = createSelector(
  [selectAuthReducer],
  (auth) => auth.signUpLoading
);

export const selectGoogleSignInLoading = createSelector(
  [selectAuthReducer],
  (auth) => auth.googleSignInLoading
);

export const selectUpdateProfileLoading = createSelector(
  [selectAuthReducer],
  (auth) => auth.updateProfileLoading
);

// Computed selectors
export const selectIsAuthenticated = createSelector(
  [selectCurrentUser],
  (currentUser) => !!currentUser
);

export const selectUserDisplayName = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'
);

export const selectUserEmail = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.email || ''
);

export const selectUserId = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.uid || null
);

export const selectUserAvatar = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.photoURL || null
);

// Combined loading state (any auth action is loading)
export const selectAnyAuthLoading = createSelector(
  [
    selectIsLoading,
    selectSignInLoading,
    selectSignUpLoading,
    selectGoogleSignInLoading,
    selectUpdateProfileLoading
  ],
  (isLoading, signInLoading, signUpLoading, googleSignInLoading, updateProfileLoading) =>
    isLoading || signInLoading || signUpLoading || googleSignInLoading || updateProfileLoading
);
