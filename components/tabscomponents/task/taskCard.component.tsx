import React from 'react';
import { View, TouchableOpacity, Animated, PanResponder, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  dueTime: string | null;
  isSelected: boolean;
  tags: string[];
  subtasks: any[];
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  isMainTask?: boolean;
  onToggle: (taskId: number) => void;
  onSelect: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onProductivity: () => void;
  getPriorityColor: (priority: string) => string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isMainTask = false,
  onToggle,
  onSelect,
  onDelete,
  onProductivity,
  getPriorityColor,
}) => {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const leftActionOpacity = React.useRef(new Animated.Value(0)).current;
  const rightActionOpacity = React.useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      const { dx } = gestureState;
      
      if (dx > 0) {
        // Swiping right - show delete action
        translateX.setValue(Math.min(dx * 0.5, 100));
        leftActionOpacity.setValue(Math.min(dx / 100, 1));
      } else if (dx < 0) {
        // Swiping left - show productivity action
        translateX.setValue(Math.max(dx * 0.5, -100));
        rightActionOpacity.setValue(Math.min(Math.abs(dx) / 100, 1));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, vx } = gestureState;
      
      if (dx > 80 || vx > 0.5) {
        // Swiped right - delete task
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(leftActionOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          onDelete(task.id);
        });
      } else if (dx < -80 || vx < -0.5) {
        // Swiped left - open productivity features
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -300,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(rightActionOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          onProductivity();
          // Reset position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(leftActionOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rightActionOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start();
        });
      } else {
        // Return to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(leftActionOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(rightActionOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      }
    },
  });

  return (
    <View style={[isMainTask ? styles.mainTaskItem : styles.taskItem, { overflow: 'hidden' }]}>
      {/* Left Action - Delete */}
      <Animated.View 
        style={[
          styles.swipeAction,
          styles.deleteAction,
          { opacity: leftActionOpacity }
        ]}
      >
        <ThemedText style={styles.actionIcon}>🗑️</ThemedText>
        <ThemedText style={styles.actionText}>Delete</ThemedText>
      </Animated.View>

      {/* Right Action - Productivity */}
      <Animated.View 
        style={[
          styles.swipeAction,
          styles.productivityAction,
          { opacity: rightActionOpacity }
        ]}
      >
        <ThemedText style={styles.actionIcon}>⚡</ThemedText>
        <ThemedText style={styles.actionText}>Productivity</ThemedText>
      </Animated.View>

      {/* Task Content */}
      <Animated.View
        style={[
          styles.taskContent,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.taskContentInner}
          onPress={() => isMainTask ? onToggle(task.id) : onSelect(task.id)}
        >
          <View style={styles.taskLeft}>
            <ThemedText style={styles.taskIcon}>
              {task.completed ? '✅' : '⭕'}
            </ThemedText>
            <View style={styles.taskInfo}>
              <ThemedText 
                style={[
                  isMainTask ? styles.mainTaskTitle : styles.taskTitle,
                  task.completed && styles.completedTask
                ]}
              >
                {task.title}
              </ThemedText>
              <ThemedText style={styles.taskDueDate}>Due: {task.dueDate}</ThemedText>
            </View>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainTaskItem: {
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
    marginBottom: 8,
  },
  taskItem: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteAction: {
    left: 0,
    backgroundColor: '#FF3B30',
  },
  productivityAction: {
    right: 0,
    backgroundColor: '#007AFF',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taskContentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  taskInfo: {
    marginLeft: 12,
    flex: 1,
  },
  mainTaskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDueDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
