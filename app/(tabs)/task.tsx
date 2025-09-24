import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Import Redux selectors and actions
import { 
  selectTasks, 
  selectIsCreateTaskOpen, 
  selectTaskTitle, 
  selectTaskDescription, 
  selectSelectedCategory, 
  selectSelectedPriority, 
  selectDueDate, 
  selectDueTime, 
  selectTaskTags, 
  selectNewTag, 
  selectShowOtherTasks, 
  selectShowProductivityFeatures,
  selectSelectedTask,
  selectOtherTasks,
  selectTaskStats
} from '../../store/task/task.selector';
import { 
  openCreateTask, 
  closeCreateTask, 
  createTask, 
  handleTaskSelect,
  handleTaskToggle,
  handleDeleteTask,
  handleToggleOtherTasks,
  openProductivityFeatures,
  closeProductivityFeatures,
  addTagToTask,
  removeTagFromTask,
  setTaskTitle,
  setTaskDescription,
  setSelectedCategory,
  setSelectedPriority,
  setDueDate,
  setDueTime,
  setTaskTags,
  setNewTag
} from '../../store/task/task.action';

// Import new components
import { TaskHeader } from '../../components/tabscomponents/task/taskHeader.component';
import { TaskStats } from '../../components/tabscomponents/task/taskStats.component';
import { TaskCard } from '../../components/tabscomponents/task/taskCard.component';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';

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

export default function TaskScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Redux state
  const tasks = useSelector(selectTasks);
  const isCreateTaskOpen = useSelector(selectIsCreateTaskOpen);
  const taskTitle = useSelector(selectTaskTitle);
  const taskDescription = useSelector(selectTaskDescription);
  const selectedCategory = useSelector(selectSelectedCategory);
  const selectedPriority = useSelector(selectSelectedPriority);
  const dueDate = useSelector(selectDueDate);
  const dueTime = useSelector(selectDueTime);
  const taskTags = useSelector(selectTaskTags);
  const newTag = useSelector(selectNewTag);
  const showOtherTasks = useSelector(selectShowOtherTasks);
  const showProductivityFeatures = useSelector(selectShowProductivityFeatures);
  const selectedTask = useSelector(selectSelectedTask);
  const otherTasks = useSelector(selectOtherTasks);
  const taskStats = useSelector(selectTaskStats);
  
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

  const handleTaskSelect = (taskId: number) => {
    dispatch(handleTaskSelect(taskId));
  };

  const handleTaskToggle = (taskId: number) => {
    dispatch(handleTaskToggle(taskId));
  };

  const handleToggleOtherTasks = () => {
    dispatch(handleToggleOtherTasks());
    
    // Animate container expansion/collapse
    Animated.parallel([
      Animated.timing(containerHeight, {
        toValue: !showOtherTasks ? 350 : 200,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(containerPadding, {
        toValue: !showOtherTasks ? 32 : 16,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handleOpenCreateTask = () => {
    dispatch(openCreateTask());
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

  const handleCloseCreateTask = () => {
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
      dispatch(closeCreateTask());
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      dispatch(addTagToTask(newTag.trim()));
    }
  };

  const removeTag = (tagToRemove: string) => {
    dispatch(removeTagFromTask(tagToRemove));
  };

  const handleCreateTask = () => {
    if (taskTitle.trim()) {
      const taskData = {
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
      };
      
      dispatch(createTask(taskData));
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
            dispatch(handleDeleteTask(taskId));
          }
        }
      ]
    );
  };

  const handleOpenProductivityFeatures = () => {
    dispatch(openProductivityFeatures());
  };

  const handleCloseProductivityFeatures = () => {
    dispatch(closeProductivityFeatures());
  };

  // Stats are now calculated in Redux selector

  return (
    <ScrollView style={styles.container}>
      <TaskHeader onAddTask={handleOpenCreateTask} />
      <TaskStats 
        pendingCount={taskStats.pendingCount}
        completedCount={taskStats.completedCount}
        progressPercentage={taskStats.progressPercentage}
      />

      {/* Main Selected Task */}
      {selectedTask && (
        <Animated.View style={[styles.mainTaskContainer, {
          height: containerHeight,
          paddingVertical: containerPadding,
        }]}>
          <ThemedText style={styles.sectionTitle}>Current Focus</ThemedText>
          <TaskCard
            task={selectedTask}
            isMainTask={true}
            onToggle={handleTaskToggle}
            onSelect={handleTaskSelect}
            onDelete={handleDeleteTask}
            onProductivity={handleOpenProductivityFeatures}
            getPriorityColor={getPriorityColor}
          />

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
          {otherTasks.map((task: any) => (
            <TaskCard
              key={task.id}
              task={task}
              isMainTask={false}
              onToggle={handleTaskToggle}
              onSelect={handleTaskSelect}
              onDelete={handleDeleteTask}
              onProductivity={handleOpenProductivityFeatures}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={isCreateTaskOpen}
        onClose={handleCloseCreateTask}
        onSave={handleCreateTask}
        slideAnimation={slideAnimation}
        overlayOpacity={overlayOpacity}
        taskTitle={taskTitle}
        setTaskTitle={(title) => dispatch(setTaskTitle(title))}
        taskDescription={taskDescription}
        setTaskDescription={(description) => dispatch(setTaskDescription(description))}
        selectedCategory={selectedCategory}
        setSelectedCategory={(category) => dispatch(setSelectedCategory(category))}
        selectedPriority={selectedPriority}
        setSelectedPriority={(priority) => dispatch(setSelectedPriority(priority))}
        dueDate={dueDate}
        setDueDate={(date) => dispatch(setDueDate(date))}
        dueTime={dueTime}
        setDueTime={(time) => dispatch(setDueTime(time))}
        taskTags={taskTags}
        setTaskTags={(tags) => dispatch(setTaskTags(tags))}
        newTag={newTag}
        setNewTag={(tag) => dispatch(setNewTag(tag))}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
});