import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { selectIsAuthenticated, selectIsLoading, selectCurrentUser } from '../../store/auth/auth.selector';
import { checkUserSession } from '../../store/auth/auth.action';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const currentUser = useSelector(selectCurrentUser);

  // Check auth state on mount
  useEffect(() => {
    dispatch(checkUserSession() as any);
  }, [dispatch]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return; // Don't navigate while loading

    // Add a small delay to ensure the navigation tree is ready
    const navigationTimer = setTimeout(() => {
      try {
        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';
        
        console.log('Navigation check:', { isAuthenticated, segments, inAuthGroup, inTabsGroup });
        
        if (!isAuthenticated) {
          // Not authenticated - go to auth unless already there
          if (!inAuthGroup) {
            console.log('Redirecting to auth');
            router.replace('/auth');
          }
        } else {
          // Authenticated - go to home unless already in tabs or on my-posts
          if (inAuthGroup || (!inTabsGroup && segments[0] !== 'my-posts')) {
            console.log('Redirecting to home');
            router.replace('/(tabs)/home');
          }
        }
      } catch (error) {
        console.warn('Navigation error:', error);
        // If navigation fails, try again after a longer delay
        setTimeout(() => {
          try {
            if (!isAuthenticated) {
              router.replace('/auth');
            } else {
              router.replace('/(tabs)/home');
            }
          } catch (retryError) {
            console.error('Navigation retry failed:', retryError);
          }
        }, 500);
      }
    }, 100); // Small delay to ensure navigation tree is ready

    return () => clearTimeout(navigationTimer);
  }, [isAuthenticated, isLoading, segments, router]);

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
