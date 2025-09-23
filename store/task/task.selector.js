import { createSelector } from 'reselect'

const selectTaskReducer = state => state.task

export const selectTasks = createSelector(
  [selectTaskReducer],
  (task) => task.tasks
)

export const selectIsCreateTaskOpen = createSelector(
  [selectTaskReducer],
  (task) => task.isCreateTaskOpen
)

export const selectTaskTitle = createSelector(
  [selectTaskReducer],
  (task) => task.taskTitle
)

export const selectTaskDescription = createSelector(
  [selectTaskReducer],
  (task) => task.taskDescription
)

export const selectSelectedCategory = createSelector(
  [selectTaskReducer],
  (task) => task.selectedCategory
)

export const selectSelectedPriority = createSelector(
  [selectTaskReducer],
  (task) => task.selectedPriority
)

export const selectDueDate = createSelector(
  [selectTaskReducer],
  (task) => task.dueDate
)

export const selectDueTime = createSelector(
  [selectTaskReducer],
  (task) => task.dueTime
)

export const selectTaskTags = createSelector(
  [selectTaskReducer],
  (task) => task.taskTags
)

export const selectNewTag = createSelector(
  [selectTaskReducer],
  (task) => task.newTag
)

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
