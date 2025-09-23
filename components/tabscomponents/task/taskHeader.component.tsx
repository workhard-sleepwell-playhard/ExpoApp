import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface TaskHeaderProps {
  onAddTask: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ onAddTask }) => {
  return (
    <ThemedView style={styles.header}>
      <ThemedText type="title">My Tasks</ThemedText>
      <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
        <ThemedText style={styles.addIcon}>➕</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  addButton: {
    padding: 8,
  },
  addIcon: {
    fontSize: 24,
  },
});
