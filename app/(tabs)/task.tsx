import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Animated, TextInput, Dimensions, PanResponder, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { height: screenHeight } = Dimensions.get('window');

// Task categories and priorities
const taskCategories = [
  { id: 'work', name: 'Work', icon: '💼', color: '#FF3B30' },
  { id: 'personal', name: 'Personal', icon: '🏠', color: '#34C759' },
  { id: 'health', name: 'Health', icon: '💪', color: '#FF9500' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#007AFF' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#5856D6' },
  { id: 'other', name: 'Other', icon: '📝', color: '#8E8E93' },
];

const priorityLevels = [
  { id: 'low', name: 'Low', color: '#34C759', icon: '🟢' },
  { id: 'medium', name: 'Medium', color: '#FF9500', icon: '🟡' },
  { id: 'high', name: 'High', color: '#FF3B30', icon: '🔴' },
];

// Dummy data for tasks
const allTasks = [
  { id: 1, title: 'Complete project proposal', description: 'Write and finalize the Q1 project proposal document', completed: false, priority: 'high', category: 'work', dueDate: '2024-01-15', dueTime: '17:00', isSelected: true, tags: ['urgent', 'client'], subtasks: [], createdAt: '2024-01-10' },
  { id: 2, title: 'Review team feedback', description: 'Go through all team member feedback on the latest sprint', completed: true, priority: 'medium', category: 'work', dueDate: '2024-01-12', dueTime: null as string | null, isSelected: false, tags: ['review'], subtasks: [], createdAt: '2024-01-09' },
  { id: 3, title: 'Update documentation', description: 'Update API documentation with new endpoints', completed: false, priority: 'low', category: 'work', dueDate: '2024-01-20', dueTime: null as string | null, isSelected: false, tags: ['documentation'], subtasks: [], createdAt: '2024-01-08' },
  { id: 4, title: 'Schedule team meeting', description: 'Set up weekly team standup meeting', completed: false, priority: 'high', category: 'work', dueDate: '2024-01-14', dueTime: '10:00', isSelected: false, tags: ['meeting'], subtasks: [], createdAt: '2024-01-07' },
  { id: 5, title: 'Prepare presentation slides', description: 'Create slides for the quarterly review presentation', completed: true, priority: 'medium', category: 'work', dueDate: '2024-01-11', dueTime: null as string | null, isSelected: false, tags: ['presentation'], subtasks: [], createdAt: '2024-01-06' },
];

export default function TaskScreen() {
  const colorScheme = useColorScheme();
  const [tasks, setTasks] = React.useState(allTasks);
  const [showOtherTasks, setShowOtherTasks] = React.useState(false);
  const [showCreateTask, setShowCreateTask] = React.useState(false);
  const [showProductivityFeatures, setShowProductivityFeatures] = React.useState(false);
  
  // Task creation state
  const [taskTitle, setTaskTitle] = React.useState('');
  const [taskDescription, setTaskDescription] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('work');
  const [selectedPriority, setSelectedPriority] = React.useState('medium');
  const [dueDate, setDueDate] = React.useState('');
  const [dueTime, setDueTime] = React.useState('');
  const [taskTags, setTaskTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');
  
  // Animation values
  const containerHeight = React.useRef(new Animated.Value(200)).current;
  const containerPadding = React.useRef(new Animated.Value(16)).current;
  const slideAnimation = React.useRef(new Animated.Value(screenHeight * 0.9)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return Colors[colorScheme ?? 'light'].text;
    }
  };

  const selectedTask = tasks.find(task => task.isSelected);
  const otherTasks = tasks.filter(task => !task.isSelected);

  const handleTaskSelect = (taskId: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        isSelected: task.id === taskId
      }))
    );
  };

  const handleTaskToggle = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleToggleOtherTasks = () => {
    const newShowState = !showOtherTasks;
    setShowOtherTasks(newShowState);
    
    // Animate container expansion/collapse
    Animated.parallel([
      Animated.timing(containerHeight, {
        toValue: newShowState ? 350 : 200,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(containerPadding, {
        toValue: newShowState ? 32 : 16,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const openCreateTask = () => {
    setShowCreateTask(true);
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCreateTask = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: screenHeight * 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCreateTask(false);
      resetTaskForm();
    });
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setSelectedCategory('work');
    setSelectedPriority('medium');
    setDueDate('');
    setDueTime('');
    setTaskTags([]);
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !taskTags.includes(newTag.trim())) {
      setTaskTags([...taskTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTaskTags(taskTags.filter(tag => tag !== tagToRemove));
  };

  const createTask = () => {
    if (taskTitle.trim()) {
      const newTask = {
        id: tasks.length + 1,
        title: taskTitle,
        description: taskDescription,
        completed: false,
        priority: selectedPriority,
        category: selectedCategory,
        dueDate: dueDate || '2024-12-31',
        dueTime: dueTime || null,
        isSelected: false,
        tags: taskTags,
        subtasks: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      closeCreateTask();
    }
  };

  const handleDeleteTask = (taskId: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          }
        }
      ]
    );
  };

  const openProductivityFeatures = () => {
    setShowProductivityFeatures(true);
  };

  const closeProductivityFeatures = () => {
    setShowProductivityFeatures(false);
  };

  // Swipeable Task Component
  const SwipeableTask = ({ task, isMainTask = false }: { task: any, isMainTask?: boolean }) => {
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
            handleDeleteTask(task.id);
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
            openProductivityFeatures();
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
            onPress={() => isMainTask ? handleTaskToggle(task.id) : handleTaskSelect(task.id)}
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

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">My Tasks</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={openCreateTask}>
          <ThemedText style={styles.addIcon}>➕</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>3</ThemedText>
          <ThemedText style={styles.statLabel}>Pending</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>2</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>80%</ThemedText>
          <ThemedText style={styles.statLabel}>Progress</ThemedText>
        </View>
      </ThemedView>

      {/* Main Selected Task */}
      {selectedTask && (
        <Animated.View style={[styles.mainTaskContainer, {
          height: containerHeight,
          paddingVertical: containerPadding,
        }]}>
          <ThemedText style={styles.sectionTitle}>Current Focus</ThemedText>
          <SwipeableTask task={selectedTask} isMainTask={true} />

          {/* Toggle Button for Other Tasks */}
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={handleToggleOtherTasks}
          >
            <ThemedText style={styles.toggleButtonText}>
              {showOtherTasks ? 'Hide Tasks' : 'Show Tasks'} ({otherTasks.length})
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}

          {/* Other Tasks (Inline Toggleable) */}
          {showOtherTasks && (
            <>
              {otherTasks.map((task) => (
                <SwipeableTask key={task.id} task={task} isMainTask={false} />
              ))}
            </>
          )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <Animated.View style={[styles.taskModalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={closeCreateTask}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.createTaskModal,
                { transform: [{ translateY: slideAnimation }] }
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeCreateTask}>
                  <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Create Task</ThemedText>
                <TouchableOpacity 
                  onPress={createTask}
                  style={[styles.createButton, { opacity: taskTitle.trim() ? 1 : 0.5 }]}
                  disabled={!taskTitle.trim()}
                >
                  <ThemedText style={styles.createButtonText}>Create</ThemedText>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.taskFormContent}>
                {/* Task Title */}
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Task Title *</ThemedText>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="What needs to be done?"
                    placeholderTextColor="#999"
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    maxLength={100}
                  />
                </View>

                {/* Task Description */}
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Description</ThemedText>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Add details, notes, or context..."
                    placeholderTextColor="#999"
                    value={taskDescription}
                    onChangeText={setTaskDescription}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                  />
                </View>

                {/* Category Selection */}
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Category</ThemedText>
                  <ScrollView horizontal style={styles.categoryContainer} showsHorizontalScrollIndicator={false}>
                    {taskCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category.id && styles.selectedCategory,
                          { borderColor: category.color }
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                        <ThemedText style={[
                          styles.categoryText,
                          selectedCategory === category.id && styles.selectedCategoryText
                        ]}>
                          {category.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Priority Selection */}
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Priority</ThemedText>
                  <View style={styles.priorityContainer}>
                    {priorityLevels.map((priority) => (
                      <TouchableOpacity
                        key={priority.id}
                        style={[
                          styles.priorityButton,
                          selectedPriority === priority.id && styles.selectedPriority,
                          { borderColor: priority.color }
                        ]}
                        onPress={() => setSelectedPriority(priority.id)}
                      >
                        <ThemedText style={styles.priorityIcon}>{priority.icon}</ThemedText>
                        <ThemedText style={[
                          styles.priorityText,
                          selectedPriority === priority.id && styles.selectedPriorityText
                        ]}>
                          {priority.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Due Date & Time */}
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Due Date & Time</ThemedText>
                  <View style={styles.dateTimeContainer}>
                    <View style={styles.dateInputGroup}>
                      <ThemedText style={styles.dateLabel}>Date</ThemedText>
                      <TextInput
                        style={styles.dateInput}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#999"
                        value={dueDate}
                        onChangeText={setDueDate}
                      />
                    </View>
                    <View style={styles.dateInputGroup}>
                      <ThemedText style={styles.dateLabel}>Time (Optional)</ThemedText>
                      <TextInput
                        style={styles.dateInput}
                        placeholder="HH:MM"
                        placeholderTextColor="#999"
                        value={dueTime}
                        onChangeText={setDueTime}
                      />
                    </View>
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Tags</ThemedText>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={styles.tagInput}
                      placeholder="Add a tag..."
                      placeholderTextColor="#999"
                      value={newTag}
                      onChangeText={setNewTag}
                      onSubmitEditing={addTag}
                      returnKeyType="done"
                    />
                    <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                      <ThemedText style={styles.addTagIcon}>➕</ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  {taskTags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {taskTags.map((tag, index) => (
                        <View key={index} style={styles.tagItem}>
                          <ThemedText style={styles.tagText}>{tag}</ThemedText>
                          <TouchableOpacity onPress={() => removeTag(tag)} style={styles.removeTagButton}>
                            <ThemedText style={styles.removeTagIcon}>✕</ThemedText>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Productivity Features Modal */}
      {showProductivityFeatures && (
        <Animated.View style={[styles.taskModalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={closeProductivityFeatures}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.createTaskModal,
                { transform: [{ translateY: slideAnimation }] }
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeProductivityFeatures}>
                  <ThemedText style={styles.cancelButton}>Close</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>⚡ Productivity Features</ThemedText>
                <View style={{ width: 60 }} />
              </View>

              <ScrollView style={styles.taskFormContent}>
                {/* Focus Timer */}
                <View style={styles.productivitySection}>
                  <ThemedText style={styles.productivityTitle}>🍅 Pomodoro Timer</ThemedText>
                  <ThemedText style={styles.productivityDescription}>
                    Stay focused with 25-minute work sessions followed by 5-minute breaks
                  </ThemedText>
                  <TouchableOpacity style={styles.productivityButton}>
                    <ThemedText style={styles.productivityButtonText}>Start Timer</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Task Breakdown */}
                <View style={styles.productivitySection}>
                  <ThemedText style={styles.productivityTitle}>📋 Task Breakdown</ThemedText>
                  <ThemedText style={styles.productivityDescription}>
                    Break down complex tasks into smaller, manageable subtasks
                  </ThemedText>
                  <TouchableOpacity style={styles.productivityButton}>
                    <ThemedText style={styles.productivityButtonText}>Add Subtasks</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Time Tracking */}
                <View style={styles.productivitySection}>
                  <ThemedText style={styles.productivityTitle}>⏱️ Time Tracking</ThemedText>
                  <ThemedText style={styles.productivityDescription}>
                    Track how much time you spend on each task to improve productivity
                  </ThemedText>
                  <TouchableOpacity style={styles.productivityButton}>
                    <ThemedText style={styles.productivityButtonText}>Start Tracking</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Focus Mode */}
                <View style={styles.productivitySection}>
                  <ThemedText style={styles.productivityTitle}>🎯 Focus Mode</ThemedText>
                  <ThemedText style={styles.productivityDescription}>
                    Block distracting apps and notifications while working on this task
                  </ThemedText>
                  <TouchableOpacity style={styles.productivityButton}>
                    <ThemedText style={styles.productivityButtonText}>Enable Focus</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Reminder */}
                <View style={styles.productivitySection}>
                  <ThemedText style={styles.productivityTitle}>🔔 Smart Reminders</ThemedText>
                  <ThemedText style={styles.productivityDescription}>
                    Set intelligent reminders based on your work patterns and deadlines
                  </ThemedText>
                  <TouchableOpacity style={styles.productivityButton}>
                    <ThemedText style={styles.productivityButtonText}>Set Reminder</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Progress Tracking */}
                <View style={styles.productivitySection}>
                  <ThemedText style={styles.productivityTitle}>📊 Progress Analytics</ThemedText>
                  <ThemedText style={styles.productivityDescription}>
                    View detailed analytics and insights about your task completion patterns
                  </ThemedText>
                  <TouchableOpacity style={styles.productivityButton}>
                    <ThemedText style={styles.productivityButtonText}>View Analytics</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  // Main task section
  mainTaskContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  mainTaskItem: {
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
    marginBottom: 8,
  },
  mainTaskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  taskIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskInfo: {
    marginLeft: 12,
    flex: 1,
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
  // Toggle button
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  taskItem: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  // Create Task Modal Styles
  taskModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createTaskModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.2,
    minHeight: 'auto',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Form Content
  taskFormContent: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  // Title Input
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  // Description Input
  descriptionInput: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  // Category Selection
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  // Priority Selection
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  selectedPriority: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  selectedPriorityText: {
    color: 'white',
  },
  // Date & Time
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  dateInput: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  // Tags
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagIcon: {
    fontSize: 16,
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    marginRight: 6,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagIcon: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  // Swipe Actions Styles
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
  taskContentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  // Productivity Features Styles
  productivitySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  productivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  productivityDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  productivityButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  productivityButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
