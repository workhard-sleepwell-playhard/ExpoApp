import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button } from '@/components/buttons';

export const GoogleSignInButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    // Simulate API call - will be connected to Firebase later
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Google Sign In', 'Google Sign In functionality will be connected to Firebase soon!');
    }, 1000);
  };

  return (
    <Button
      title="Continue with Google"
      onPress={handleGoogleSignIn}
      loading={isLoading}
      disabled={isLoading}
      variant="secondary"
      icon="🔍"
      style={styles.googleButton}
    />
  );
};

const styles = StyleSheet.create({
  googleButton: {
    borderColor: '#4285F4',
    borderWidth: 1,
  },
});
