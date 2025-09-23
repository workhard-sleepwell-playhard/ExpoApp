import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface CreatePostButtonProps {
  onPress: () => void;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.createPostButton} onPress={onPress}>
      <ThemedText style={styles.createPostIcon}>✏️</ThemedText>
      <ThemedText style={styles.createPostText}>What's on your mind?</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  createPostIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  createPostText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
