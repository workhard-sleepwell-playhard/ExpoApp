import { TASK_ACTION_TYPES } from './task.types.js'

export const TASK_INITIAL_STATE = {
  tasks: [],
  isCreateTaskOpen: false,
  taskTitle: '',
  taskDescription: '',
  selectedCategory: 'work',
  selectedPriority: 'medium',
  dueDate: '',
  dueTime: '',
  taskTags: [],
  newTag: '',
  showOtherTasks: false,
  showProductivityFeatures: false,
  isLoading: false,
  error: null
}

export const taskReducer = (state = TASK_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case TASK_ACTION_TYPES.SET_TASKS:
      return {
        ...state,
        tasks: payload,
      }
    
    case TASK_ACTION_TYPES.SET_IS_CREATE_TASK_OPEN:
      return {
        ...state,
        isCreateTaskOpen: payload,
      }
    
    case TASK_ACTION_TYPES.SET_TASK_TITLE:
      return {
        ...state,
        taskTitle: payload,
      }
    
    case TASK_ACTION_TYPES.SET_TASK_DESCRIPTION:
      return {
        ...state,
        taskDescription: payload,
      }
    
    case TASK_ACTION_TYPES.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: payload,
      }
    
    case TASK_ACTION_TYPES.SET_SELECTED_PRIORITY:
      return {
        ...state,
        selectedPriority: payload,
      }
    
    case TASK_ACTION_TYPES.SET_DUE_DATE:
      return {
        ...state,
        dueDate: payload,
      }
    
    case TASK_ACTION_TYPES.SET_DUE_TIME:
      return {
        ...state,
        dueTime: payload,
      }
    
    case TASK_ACTION_TYPES.SET_TASK_TAGS:
      return {
        ...state,
        taskTags: payload,
      }
    
    case TASK_ACTION_TYPES.SET_NEW_TAG:
      return {
        ...state,
        newTag: payload,
      }
    
    case TASK_ACTION_TYPES.SET_SHOW_OTHER_TASKS:
      return {
        ...state,
        showOtherTasks: payload,
      }
    
    case TASK_ACTION_TYPES.SET_SHOW_PRODUCTIVITY_FEATURES:
      return {
        ...state,
        showProductivityFeatures: payload,
      }
    
    case TASK_ACTION_TYPES.ADD_TASK:
      return {
        ...state,
        tasks: [payload, ...state.tasks],
      }
    
    case TASK_ACTION_TYPES.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === payload.id ? { ...task, ...payload } : task
        ),
      }
    
    case TASK_ACTION_TYPES.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== payload),
      }
    
    case TASK_ACTION_TYPES.TOGGLE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === payload 
            ? { ...task, completed: !task.completed }
            : task
        ),
      }
    
    case TASK_ACTION_TYPES.SELECT_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => ({
          ...task,
          isSelected: task.id === payload
        })),
      }
    
    case TASK_ACTION_TYPES.ADD_TAG:
      return {
        ...state,
        taskTags: [...state.taskTags, payload],
        newTag: '',
      }
    
    case TASK_ACTION_TYPES.REMOVE_TAG:
      return {
        ...state,
        taskTags: state.taskTags.filter(tag => tag !== payload),
      }
    
    case TASK_ACTION_TYPES.RESET_TASK_FORM:
      return {
        ...state,
        taskTitle: '',
        taskDescription: '',
        selectedCategory: 'work',
        selectedPriority: 'medium',
        dueDate: '',
        dueTime: '',
        taskTags: [],
        newTag: '',
      }
    
    default:
      return state
  }
}
