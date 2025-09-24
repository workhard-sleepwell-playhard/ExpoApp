import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/buttons';
import { Input } from '@/components/forms';
import { signUpStart, clearError, updateSignUpForm } from '../../store/auth/auth.action';
import { selectSignUpLoading, selectAuthError, selectSignUpFormData } from '../../store/auth/auth.selector';

export const SignUpForm: React.FC = () => {
  const dispatch = useDispatch();
  const signUpLoading = useSelector(selectSignUpLoading);
  const authError = useSelector(selectAuthError);
  const formData = useSelector(selectSignUpFormData);

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateSignUpForm(field, value));
  };

  // Clear error when component mounts or form changes
  useEffect(() => {
    if (authError) {
      dispatch(clearError());
    }
  }, [dispatch, authError]);

  const handleSignUp = async () => {
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(signUpStart(formData.email, formData.password, formData.displayName) as any);
      // Success will be handled by auth state change and navigation
    } catch (error) {
      // Error is already handled by Redux and will show in UI
      console.error('Sign up error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Create Account
      </ThemedText>
      
      <View style={styles.form}>
        <Input
          placeholder="Full Name"
          value={formData.displayName}
          onChangeText={(value) => handleInputChange('displayName', value)}
          autoCapitalize="words"
          autoComplete="name"
        />
        
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
          autoComplete="new-password"
        />
        
        <Input
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          secureTextEntry
          autoComplete="new-password"
        />
        
        {authError && (
          <ThemedText style={styles.errorText}>
            {authError}
          </ThemedText>
        )}
        
        <Button
          title="Create Account"
          onPress={handleSignUp}
          loading={signUpLoading}
          disabled={signUpLoading}
          style={styles.signUpButton}
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
  signUpButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
