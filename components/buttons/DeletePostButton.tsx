import React, { useState } from 'react';
import { ViewStyle, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from './Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface DeletePostButtonProps {
  postId: string | number;
  onDelete: (postId: string | number) => void;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showConfirmation?: boolean;
}

export const DeletePostButton: React.FC<DeletePostButtonProps> = ({
  postId,
  onDelete,
  size = 'small',
  style,
  showConfirmation = true,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeletePress = () => {
    if (showConfirmation) {
      setShowConfirm(true);
    } else {
      onDelete(postId);
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete(postId);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <ThemedView style={styles.confirmationContainer}>
        <ThemedText style={styles.confirmationText}>
          Delete this post?
        </ThemedText>
        <View style={styles.confirmationButtons}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancelDelete}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmDelete}
          >
            <ThemedText style={styles.confirmButtonText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <Button
      title="Delete"
      icon="🗑️"
      variant="delete"
      size={size}
      onPress={handleDeletePress}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  confirmationContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF453A',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF453A',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
