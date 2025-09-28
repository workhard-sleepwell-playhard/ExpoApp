import { TASK_ACTION_TYPES } from './task.types.js'
import { SimpleRealtimeService } from '../../src/services/simple-realtime'

// Helper function to calculate points based on task priority
const getTaskPoints = (priority) => {
  switch (priority) {
    case 'high': return 50
    case 'medium': return 30
    case 'low': return 10
    default: return 20
  }
}

export const setTasks = (tasks) => ({
  type: TASK_ACTION_TYPES.SET_TASKS,
  payload: tasks
})

export const setIsCreateTaskOpen = (isOpen) => ({
  type: TASK_ACTION_TYPES.SET_IS_CREATE_TASK_OPEN,
  payload: isOpen
})

export const setTaskTitle = (title) => ({
  type: TASK_ACTION_TYPES.SET_TASK_TITLE,
  payload: title
})

export const setTaskDescription = (description) => ({
  type: TASK_ACTION_TYPES.SET_TASK_DESCRIPTION,
  payload: description
})

export const setSelectedCategory = (category) => ({
  type: TASK_ACTION_TYPES.SET_SELECTED_CATEGORY,
  payload: category
})

export const setSelectedPriority = (priority) => ({
  type: TASK_ACTION_TYPES.SET_SELECTED_PRIORITY,
  payload: priority
})

export const setDueDate = (date) => ({
  type: TASK_ACTION_TYPES.SET_DUE_DATE,
  payload: date
})

export const setDueTime = (time) => ({
  type: TASK_ACTION_TYPES.SET_DUE_TIME,
  payload: time
})

export const setTaskTags = (tags) => ({
  type: TASK_ACTION_TYPES.SET_TASK_TAGS,
  payload: tags
})

export const setNewTag = (tag) => ({
  type: TASK_ACTION_TYPES.SET_NEW_TAG,
  payload: tag
})

export const setShowOtherTasks = (show) => ({
  type: TASK_ACTION_TYPES.SET_SHOW_OTHER_TASKS,
  payload: show
})

export const setShowProductivityFeatures = (show) => ({
  type: TASK_ACTION_TYPES.SET_SHOW_PRODUCTIVITY_FEATURES,
  payload: show
})

export const addTask = (task) => ({
  type: TASK_ACTION_TYPES.ADD_TASK,
  payload: task
})

export const updateTask = (task) => ({
  type: TASK_ACTION_TYPES.UPDATE_TASK,
  payload: task
})

export const handleEditTask = (taskId, updatedTaskData) => {
  return async (dispatch, getState) => {
    try {
      const { task, auth } = getState()
      const currentUser = auth.currentUser
      const currentTask = task.tasks.find(t => t.id === taskId)
      
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found')
      }
      
      if (!currentTask) {
        throw new Error('Task not found')
      }

      // Update local state FIRST (optimistic UI)
      const updatedTask = { ...currentTask, ...updatedTaskData, updatedAt: Date.now() }
      dispatch(updateTask(updatedTask))
      
      // Then update Firebase in the background
      SimpleRealtimeService.updateTask(taskId, updatedTaskData).catch(error => {
        console.error('Background task update error:', error)
        // Revert the optimistic update on error
        dispatch(updateTask(currentTask))
      })
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert the optimistic update on error (if initial dispatch happened)
      const { task } = getState()
      const currentTask = task.tasks.find(t => t.id === taskId)
      if (currentTask) {
        dispatch(updateTask(currentTask))
      }
    }
  }
}

export const deleteTask = (taskId) => ({
  type: TASK_ACTION_TYPES.DELETE_TASK,
  payload: taskId
})

export const toggleTask = (taskId) => ({
  type: TASK_ACTION_TYPES.TOGGLE_TASK,
  payload: taskId
})

export const selectTask = (taskId) => ({
  type: TASK_ACTION_TYPES.SELECT_TASK,
  payload: taskId
})

export const addTag = (tag) => ({
  type: TASK_ACTION_TYPES.ADD_TAG,
  payload: tag
})

export const removeTag = (tag) => ({
  type: TASK_ACTION_TYPES.REMOVE_TAG,
  payload: tag
})

export const resetTaskForm = () => ({
  type: TASK_ACTION_TYPES.RESET_TASK_FORM
})

// Helper action creators
export const openCreateTask = () => setIsCreateTaskOpen(true)

export const closeCreateTask = () => {
  return (dispatch) => {
    dispatch(setIsCreateTaskOpen(false))
    dispatch(resetTaskForm())
  }
}

export const createTask = (taskData) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: TASK_ACTION_TYPES.CREATE_TASK_REQUEST })
      
      const { auth } = getState()
      const currentUser = auth.currentUser
      
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found')
      }

      const firebaseTaskData = {
        userId: currentUser.uid,
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category || 'work',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || '',
        dueTime: taskData.dueTime || '',
        tags: taskData.tags || [],
        completed: false,
        completedAt: null,
        pointsAwarded: false
      }

      const taskId = await SimpleRealtimeService.createTask(firebaseTaskData)
      
      // Initialize user points if not exists
      await SimpleRealtimeService.initializeUserPoints(currentUser.uid, {
        dailyTaskGoal: 5,
        dailyTimeGoal: 480
      })
      
      // Update task stats
      await SimpleRealtimeService.updateTaskCompletionStats(currentUser.uid, false, 0)
      
      const newTask = {
        id: taskId,
        taskId: taskId,
        ...firebaseTaskData,
        createdAt: new Date().toISOString().split('T')[0],
      }
      
      dispatch({ type: TASK_ACTION_TYPES.CREATE_TASK_SUCCESS, payload: newTask })
      dispatch(addTask(newTask))
      dispatch(closeCreateTask())
      
      return newTask
    } catch (error) {
      console.error('Error creating task:', error)
      dispatch({ 
        type: TASK_ACTION_TYPES.CREATE_TASK_ERROR, 
        payload: error.message 
      })
      throw error
    }
  }
}

export const handleTaskSelect = (taskId) => {
  return (dispatch) => {
    dispatch(selectTask(taskId))
  }
}

export const handleTaskToggle = (taskId) => {
  return async (dispatch, getState) => {
    try {
      const { task, auth } = getState()
      const currentUser = auth.currentUser
      const currentTask = task.tasks.find(t => t.id === taskId)
      
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found')
      }
      
      if (!currentTask) {
        throw new Error('Task not found')
      }

      const newCompleted = !currentTask.completed
      
      // Update local state ONLY (optimistic UI)
      dispatch(toggleTask(taskId))
      
      // Batch Firebase operations in background without triggering listeners
      // This prevents massive re-renders
      const operations = [
        SimpleRealtimeService.toggleTaskCompletion(taskId, newCompleted),
        SimpleRealtimeService.updateTaskCompletionStats(currentUser.uid, newCompleted, Math.abs(getTaskPoints(currentTask.priority)))
      ];

      // Only award points if task is being completed AND points haven't been awarded yet
      if (newCompleted && !currentTask.pointsAwarded) {
        operations.push(
          SimpleRealtimeService.addPointsActivity(currentUser.uid, {
            activity: `Completed task: ${currentTask.title}`,
            activityType: 'task',
            points: getTaskPoints(currentTask.priority),
            taskId: taskId,
            category: currentTask.category
          })
        );
        // Mark that points have been awarded for this task
        operations.push(
          SimpleRealtimeService.updateTask(taskId, { pointsAwarded: true })
        );
      }

      Promise.all(operations).catch(error => {
        console.error('Background sync error:', error)
        // Optionally revert on error, but don't block UI
      })
      
    } catch (error) {
      console.error('Error toggling task:', error)
      // Revert the optimistic update on error
      dispatch(toggleTask(taskId))
    }
  }
}

export const handleDeleteTask = (taskId) => {
  return async (dispatch) => {
    try {
      // Delete from Firebase
      await SimpleRealtimeService.deleteTask(taskId)
      
      // Update local state
      dispatch(deleteTask(taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      // Still update local state for optimistic UI
      dispatch(deleteTask(taskId))
    }
  }
}

export const handleToggleOtherTasks = () => {
  return (dispatch, getState) => {
    const { showOtherTasks } = getState().task
    dispatch(setShowOtherTasks(!showOtherTasks))
  }
}

export const openProductivityFeatures = () => setShowProductivityFeatures(true)

export const closeProductivityFeatures = () => setShowProductivityFeatures(false)

export const addTagToTask = (tag) => {
  return (dispatch, getState) => {
    const { taskTags } = getState().task
    if (tag.trim() && !taskTags.includes(tag.trim())) {
      dispatch(addTag(tag.trim()))
    }
  }
}

export const removeTagFromTask = (tag) => {
  return (dispatch) => {
    dispatch(removeTag(tag))
  }
}
