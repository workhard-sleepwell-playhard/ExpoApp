import { MORE_ACTION_TYPES } from './more.types.js'

export const MORE_INITIAL_STATE = {
  moreSections: [
    {
      title: 'Productivity',
      items: [
        { id: 1, title: 'Pomodoro Timer', icon: 'timer', action: 'navigate' },
        { id: 2, title: 'Focus Mode', icon: 'eye.fill', action: 'navigate' },
        { id: 3, title: 'Habit Tracker', icon: 'calendar', action: 'navigate' },
        { id: 4, title: 'Goal Setting', icon: 'target', action: 'navigate' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: 5, title: 'Notes & Journal', icon: 'note.text', action: 'navigate' },
        { id: 6, title: 'Calendar Integration', icon: 'calendar.badge.plus', action: 'navigate' },
        { id: 7, title: 'File Manager', icon: 'folder.fill', action: 'navigate' },
        { id: 8, title: 'Backup & Sync', icon: 'icloud.fill', action: 'navigate' },
      ]
    },
    {
      title: 'Community',
      items: [
        { id: 9, title: 'Team Chat', icon: 'message.fill', action: 'navigate' },
        { id: 10, title: 'Share Progress', icon: 'square.and.arrow.up', action: 'navigate' },
        { id: 11, title: 'Feedback', icon: 'star.fill', action: 'navigate' },
        { id: 12, title: 'Report Bug', icon: 'ant.fill', action: 'navigate' },
      ]
    },
    {
      title: 'App Info',
      items: [
        { id: 13, title: 'Version 1.0.0', icon: 'info.circle.fill', action: 'info' },
        { id: 14, title: 'Privacy Policy', icon: 'hand.raised.fill', action: 'web', url: 'https://example.com/privacy' },
        { id: 15, title: 'Terms of Service', icon: 'doc.text.fill', action: 'web', url: 'https://example.com/terms' },
        { id: 16, title: 'Contact Support', icon: 'envelope.fill', action: 'email' },
      ]
    }
  ],
  quickActions: [
    { id: 1, title: 'Quick Add Task', icon: 'plus.circle.fill', color: '#34C759' },
    { id: 2, title: 'Start Timer', icon: 'timer', color: '#FF9500' },
    { id: 3, title: 'Add Note', icon: 'note.text', color: '#007AFF' },
    { id: 4, title: 'View Stats', icon: 'chart.bar.fill', color: '#5856D6' },
  ],
  searchQuery: '',
  filteredSections: [],
  showSearch: false,
  showNotifications: false,
  isLoading: false,
  error: null
}

export const moreReducer = (state = MORE_INITIAL_STATE, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case MORE_ACTION_TYPES.SET_MORE_SECTIONS:
      return {
        ...state,
        moreSections: payload,
      }
    
    case MORE_ACTION_TYPES.SET_QUICK_ACTIONS:
      return {
        ...state,
        quickActions: payload,
      }
    
    case MORE_ACTION_TYPES.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: payload,
      }
    
    case MORE_ACTION_TYPES.SET_FILTERED_SECTIONS:
      return {
        ...state,
        filteredSections: payload,
      }
    
    case MORE_ACTION_TYPES.SET_SHOW_SEARCH:
      return {
        ...state,
        showSearch: payload,
      }
    
    case MORE_ACTION_TYPES.SET_SHOW_NOTIFICATIONS:
      return {
        ...state,
        showNotifications: payload,
      }
    
    case MORE_ACTION_TYPES.FILTER_SECTIONS:
      const query = payload.toLowerCase()
      if (!query) {
        return {
          ...state,
          filteredSections: [],
          searchQuery: '',
        }
      }
      
      const filtered = state.moreSections.map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.title.toLowerCase().includes(query)
        )
      })).filter(section => section.items.length > 0)
      
      return {
        ...state,
        filteredSections: filtered,
        searchQuery: payload,
      }
    
    case MORE_ACTION_TYPES.CLEAR_SEARCH:
      return {
        ...state,
        searchQuery: '',
        filteredSections: [],
      }
    
    default:
      return state
  }
}
