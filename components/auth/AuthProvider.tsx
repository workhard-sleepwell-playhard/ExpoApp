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

    const inAuthGroup = segments[0] === 'auth';
    
    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not on auth screen, redirect to auth
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screen, redirect to home
      router.replace('/(tabs)/home');
    }
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
