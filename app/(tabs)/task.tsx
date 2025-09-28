import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Import Redux selectors and actions
import { 
  selectTaskState, // Consolidated selector
  selectIsCreateTaskOpen, 
  selectTaskStats
} from '../../store/task/task.selector';
import { 
  openCreateTask, 
  closeCreateTask, 
  createTask, 
  handleEditTask,
  openProductivityFeatures,
  addTagToTask,
  removeTagFromTask,
  setTaskTitle,
  setTaskDescription,
  setSelectedCategory,
  setSelectedPriority,
  setDueDate,
  setDueTime,
  setTaskTags,
  setNewTag,
  handleTaskSelect,
  handleTaskToggle,
  handleToggleOtherTasks
} from '../../store/task/task.action';
// selectUserData removed - not used in this component
import { useCentralizedListener } from '../../hooks/use-centralized-listener';

// Import new components
import { TaskHeader } from '../../components/tabscomponents/task/taskHeader.component';
import { TaskStats } from '../../components/tabscomponents/task/taskStats.component';
import { TaskCard } from '../../components/tabscomponents/task/taskCard.component';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { Colors } from '@/constants/theme';

const { height: screenHeight } = Dimensions.get('window');

// Task categories and priorities - moved to CreateTaskModal component

const TaskScreen = React.memo(function TaskScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Redux state - Optimized to reduce re-renders
  const taskState = useSelector(selectTaskState); // Consolidated selector
  const isCreateTaskOpen = useSelector(selectIsCreateTaskOpen);
  const taskStats = useSelector(selectTaskStats);
  
  // Extract loading and error states
  const { isLoading, error } = taskState;
  
  // Extract values from taskState to avoid multiple selectors
  const {
    taskTitle,
    taskDescription,
    selectedCategory,
    selectedPriority,
    dueDate,
    dueTime,
    taskTags,
    newTag,
    selectedTask,
    otherTasks,
    showOtherTasks
  } = taskState;
  
  // Initialize only task-related listeners (not all listeners)
  // This prevents unnecessary re-renders from posts/leaderboards updates
  useCentralizedListener({
    enablePosts: false,        // Task tab doesn't need posts
    enableUserData: false,     // Don't need userData updates on task tab
    enableTasks: true,         // Need tasks for this tab
    enableLeaderboards: false  // Task tab doesn't need leaderboards
  });
  
  // Animation state
  const [slideAnimation] = useState(new Animated.Value(screenHeight));
  const [overlayOpacity] = useState(new Animated.Value(0));
  
  // Container animation - only animate padding, let height be natural
  const containerPadding = React.useRef(new Animated.Value(0)).current;
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  // Cleanup animations on unmount
  React.useEffect(() => {
    return () => {
      slideAnimation.stopAnimation();
      overlayOpacity.stopAnimation();
      containerPadding.stopAnimation();
    };
  }, [slideAnimation, overlayOpacity, containerPadding]);
  
  // Handle modal opening animation
  React.useEffect(() => {
    if (isCreateTaskOpen) {
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
    }
  }, [isCreateTaskOpen, slideAnimation, overlayOpacity]);

  // Initialize container padding when a task is selected
  React.useEffect(() => {
    if (selectedTask) {
      // Set initial padding for selected task - minimal padding
      Animated.timing(containerPadding, {
        toValue: 8,
        duration: 0,
        useNativeDriver: false,
      }).start();
    } else {
      // No selected task, no padding
      Animated.timing(containerPadding, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedTask, containerPadding]);
  

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return Colors[colorScheme ?? 'light'].text;
    }
  };

  const onTaskSelect = (taskId: string | number) => {
    dispatch(handleTaskSelect(taskId));
  };

  const onTaskToggle = (taskId: string | number) => {
    dispatch(handleTaskToggle(taskId));
  };

  const onToggleOtherTasks = () => {
    const newShowOtherTasks = !showOtherTasks;
    dispatch(handleToggleOtherTasks());
    
    // Only animate padding if there's a selected task - minimal padding
    if (selectedTask) {
      Animated.timing(containerPadding, {
        toValue: newShowOtherTasks ? 12 : 8,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
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

  const resetTaskForm = () => {
    dispatch(setTaskTitle(''));
    dispatch(setTaskDescription(''));
    dispatch(setSelectedCategory('work'));
    dispatch(setSelectedPriority('medium'));
    dispatch(setDueDate(''));
    dispatch(setDueTime(''));
    dispatch(setTaskTags([]));
    dispatch(setNewTag(''));
    setIsEditMode(false);
    setEditingTask(null);
  };

  const handleEditTaskClick = (taskId: string | number) => {
    const taskToEdit = taskState.tasks.find((task: any) => task.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setIsEditMode(true);
      
      // Populate form with task data
      dispatch(setTaskTitle(taskToEdit.title));
      dispatch(setTaskDescription(taskToEdit.description || ''));
      dispatch(setSelectedCategory(taskToEdit.category));
      dispatch(setSelectedPriority(taskToEdit.priority));
      dispatch(setDueDate(taskToEdit.dueDate || ''));
      dispatch(setDueTime(taskToEdit.dueTime || ''));
      dispatch(setTaskTags(taskToEdit.tags || []));
      dispatch(setNewTag(''));
      
      // Open modal
      dispatch(openCreateTask());
    }
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
      // Reset form after closing
      resetTaskForm();
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
      if (isEditMode && editingTask) {
        // Edit existing task
        const updatedTaskData = {
          title: taskTitle,
          description: taskDescription,
          priority: selectedPriority,
          category: selectedCategory,
          dueDate: dueDate || '2024-12-31',
          dueTime: dueTime || null,
          tags: taskTags,
        };
        
        dispatch(handleEditTask(editingTask.id, updatedTaskData));
      } else {
        // Create new task
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
      
      // Close modal after successful task creation/update
      handleCloseCreateTask();
    }
  };

  const handleDeleteTask = (taskId: string | number) => {
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

  // handleCloseProductivityFeatures removed - not used in UI

  // Stats are now calculated in Redux selector

  return (
    <>
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
            paddingVertical: containerPadding,
          }]}>
            <ThemedText style={styles.sectionTitle}>Current Focus</ThemedText>
            <TaskCard
              task={selectedTask}
              isMainTask={true}
              onToggle={onTaskToggle}
              onSelect={onTaskSelect}
              onDelete={handleDeleteTask}
              onEdit={handleEditTaskClick}
              onProductivity={handleOpenProductivityFeatures}
              getPriorityColor={getPriorityColor}
            />
          </Animated.View>
        )}
        {/* Toggle Button for Other Tasks - Always Visible */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={onToggleOtherTasks}
        >
          <ThemedText style={styles.toggleButtonText}>
            {showOtherTasks ? 'Hide Tasks' : 'Show Tasks'} ({otherTasks.length})
          </ThemedText>
        </TouchableOpacity>

      

        {/* Other Tasks (Inline Toggleable) */}
        {showOtherTasks && (
          <>
            {otherTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                isMainTask={false}
                onToggle={onTaskToggle}
                onSelect={onTaskSelect}
                onDelete={handleDeleteTask}
                onEdit={handleEditTaskClick}
                onProductivity={handleOpenProductivityFeatures}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Create Task Modal - Outside ScrollView for independent positioning */}
      <CreateTaskModal
        visible={isCreateTaskOpen}
        onClose={handleCloseCreateTask}
        onSave={handleCreateTask}
        slideAnimation={slideAnimation}
        overlayOpacity={overlayOpacity}
        isLoading={isLoading}
        error={error}
        isEditMode={isEditMode}
        editTask={editingTask}
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
    </>
  );
});

export default TaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainTaskContainer: {
    paddingHorizontal: 20,
    marginBottom: 4,  // Reduced from 20 to 4
    overflow: 'hidden',
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,  // Reduced from 12
    color: '#333333',
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,  // Reduced from 12
    paddingHorizontal: 16,
    marginTop: 2,  // Reduced from 8
    marginBottom: 4,  // Reduced from 8
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});