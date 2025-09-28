import { createSelector } from 'reselect'

const selectTaskReducer = state => state.task
const selectUserData = state => state.profile.userData

// Consolidated selector to reduce re-renders
export const selectTaskState = createSelector(
  [selectTaskReducer],
  (task) => ({
    tasks: task.tasks,
    taskTitle: task.taskTitle,
    taskDescription: task.taskDescription,
    selectedCategory: task.selectedCategory,
    selectedPriority: task.selectedPriority,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    taskTags: task.taskTags,
    newTag: task.newTag,
    showOtherTasks: task.showOtherTasks,
    showProductivityFeatures: task.showProductivityFeatures,
    isLoading: task.isLoading,
    error: task.error,
    selectedTask: (task.tasks || []).find(t => t.isSelected) || null, // Find selected task
    otherTasks: (task.tasks || []).filter(t => !t.isSelected) // Filter out selected task
  })
)

export const selectTasks = createSelector(
  [selectTaskReducer],
  (task) => task.tasks
)

export const selectIsCreateTaskOpen = createSelector(
  [selectTaskReducer],
  (task) => task.isCreateTaskOpen
)

// Individual selectors removed - use selectTaskState for better performance

export const selectShowOtherTasks = createSelector(
  [selectTaskReducer],
  (task) => task.showOtherTasks
)

export const selectShowProductivityFeatures = createSelector(
  [selectTaskReducer],
  (task) => task.showProductivityFeatures
)

export const selectIsLoading = createSelector(
  [selectTaskReducer],
  (task) => task.isLoading
)

export const selectError = createSelector(
  [selectTaskReducer],
  (task) => task.error
)

// Derived selectors
export const selectSelectedTask = createSelector(
  [selectTasks],
  (tasks) => tasks.find(task => task.isSelected)
)

export const selectOtherTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter(task => !task.isSelected)
)

export const selectPendingTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter(task => !task.completed)
)

export const selectCompletedTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter(task => task.completed)
)

export const selectTaskStats = createSelector(
  [selectTasks],
  (tasks) => {
    const pendingCount = tasks.filter(task => !task.completed).length
    const completedCount = tasks.filter(task => task.completed).length
    const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
    
    return {
      pendingCount,
      completedCount,
      progressPercentage,
      totalTasks: tasks.length
    }
  }
)
