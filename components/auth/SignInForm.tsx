import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/buttons';
import { Input } from '@/components/forms';
import { signInStart, clearError, updateSignInForm } from '../../store/auth/auth.action';
import { selectSignInLoading, selectAuthError, selectSignInFormData } from '../../store/auth/auth.selector';

export const SignInForm: React.FC = () => {
  const dispatch = useDispatch();
  const signInLoading = useSelector(selectSignInLoading);
  const authError = useSelector(selectAuthError);
  const formData = useSelector(selectSignInFormData);

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateSignInForm(field, value));
  };

  // Clear error when component mounts or form changes
  useEffect(() => {
    if (authError) {
      dispatch(clearError());
    }
  }, [dispatch, authError]);

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(signInStart(formData.email, formData.password) as any);
      // Success will be handled by auth state change and navigation
    } catch (error) {
      // Error is already handled by Redux and will show in UI
      console.error('Sign in error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Sign In
      </ThemedText>
      
      <View style={styles.form}>
        <Input
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        <Input
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
          autoComplete="password"
        />
        
        {authError && (
          <ThemedText style={styles.errorText}>
            {authError}
          </ThemedText>
        )}
        
        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={signInLoading}
          disabled={signInLoading}
          style={styles.signInButton}
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  signInButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
