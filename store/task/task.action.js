import { TASK_ACTION_TYPES } from './task.types.js'

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
  return (dispatch, getState) => {
    const { tasks } = getState().task
    const newTask = {
      id: tasks.length + 1,
      ...taskData,
      createdAt: new Date().toISOString().split('T')[0],
    }
    
    dispatch(addTask(newTask))
    dispatch(closeCreateTask())
  }
}

export const handleTaskSelect = (taskId) => {
  return (dispatch) => {
    dispatch(selectTask(taskId))
  }
}

export const handleTaskToggle = (taskId) => {
  return (dispatch) => {
    dispatch(toggleTask(taskId))
  }
}

export const handleDeleteTask = (taskId) => {
  return (dispatch) => {
    dispatch(deleteTask(taskId))
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
