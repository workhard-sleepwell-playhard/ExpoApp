import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface AuthToggleProps {
  onToggle?: (isSignUp: boolean) => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({ onToggle }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleToggle = () => {
    const newValue = !isSignUp;
    setIsSignUp(newValue);
    onToggle?.(newValue);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
      </ThemedText>
      <ThemedText 
        style={styles.toggleText} 
        onPress={handleToggle}
      >
        {isSignUp ? "Sign In" : "Sign Up"}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  toggleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
