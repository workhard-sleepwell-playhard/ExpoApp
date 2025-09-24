import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

// Auth Components
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthToggle } from '@/components/auth/AuthToggle';

// Auth Form Components
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

// Auth Redux
import { selectIsAuthenticated, selectIsLoading } from '@/store/auth/auth.selector';
import { checkUserSession } from '@/store/auth/auth.action';

export default function AuthScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  const [isSignUp, setIsSignUp] = useState(false);

  // AuthProvider handles navigation, no need for local navigation logic

  const handleToggle = (isSignUpMode: boolean) => {
    setIsSignUp(isSignUpMode);
  };

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // Don't render auth forms if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader />
          
          <View style={styles.formContainer}>
            {isSignUp ? <SignUpForm /> : <SignInForm />}
            
            <View style={styles.divider}>
              <ThemedText style={styles.dividerText}>or</ThemedText>
            </View>
            
            <GoogleSignInButton />
          </View>
          
          <AuthToggle onToggle={handleToggle} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    marginBottom: 20,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 16,
    color: '#8E8E93',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});
