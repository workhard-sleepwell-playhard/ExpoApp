import React from 'react';
import { ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Index() {
  const { isLoading } = useAuth();

  // Show loading screen only while auth state is being determined
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={{ marginTop: 16, fontSize: 16, color: '#8E8E93' }}>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }

  // AuthProvider will handle navigation, so this component doesn't need to render anything
  return null;
}
