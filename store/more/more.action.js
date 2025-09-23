import { MORE_ACTION_TYPES } from './more.types.js'

export const setMoreSections = (sections) => ({
  type: MORE_ACTION_TYPES.SET_MORE_SECTIONS,
  payload: sections
})

export const setQuickActions = (actions) => ({
  type: MORE_ACTION_TYPES.SET_QUICK_ACTIONS,
  payload: actions
})

export const setSearchQuery = (query) => ({
  type: MORE_ACTION_TYPES.SET_SEARCH_QUERY,
  payload: query
})

export const setFilteredSections = (sections) => ({
  type: MORE_ACTION_TYPES.SET_FILTERED_SECTIONS,
  payload: sections
})

export const setShowSearch = (show) => ({
  type: MORE_ACTION_TYPES.SET_SHOW_SEARCH,
  payload: show
})

export const setShowNotifications = (show) => ({
  type: MORE_ACTION_TYPES.SET_SHOW_NOTIFICATIONS,
  payload: show
})

export const filterSections = (query) => ({
  type: MORE_ACTION_TYPES.FILTER_SECTIONS,
  payload: query
})

export const clearSearch = () => ({
  type: MORE_ACTION_TYPES.CLEAR_SEARCH
})

// Simple action creators
export const handleSearchPress = () => {
  console.log('Search pressed')
  return setShowSearch(true)
}

export const handleNotificationPress = () => {
  console.log('Notifications pressed')
  return setShowNotifications(true)
}

export const handleQuickActionPress = (action) => {
  console.log('Quick Action:', action.title)
  
  // Handle different quick actions
  switch (action.id) {
    case 1: // Quick Add Task
      console.log('Navigating to add task')
      break
    case 2: // Start Timer
      console.log('Starting timer')
      break
    case 3: // Add Note
      console.log('Opening note editor')
      break
    case 4: // View Stats
      console.log('Opening stats view')
      break
    default:
      console.log('Unknown quick action')
  }
  
  return { type: 'NO_OP' }
}

export const handleItemPress = (item) => {
  console.log('Item pressed:', item.title)
  
  try {
    switch (item.action) {
      case 'navigate':
        console.log(`${item.title} - Coming soon!`)
        break
      case 'web':
        if (item.url) {
          try {
            // In a real app, you would use Linking.openURL here
            console.log('Opening URL:', item.url)
          } catch (error) {
            console.error('Could not open link:', error)
          }
        }
        break
      case 'email':
        try {
          // In a real app, you would use Linking.openURL('mailto:support@example.com')
          console.log('Opening email client')
        } catch (error) {
          console.error('Could not open email client:', error)
        }
        break
      case 'info':
        console.log('App Info: FinishIt v1.0.0\nBuilt with React Native & Expo')
        break
      default:
        console.log(`${item.title} pressed!`)
    }
  } catch (error) {
    console.error('Error handling item press:', error)
  }
  
  return { type: 'NO_OP' }
}

export const handleSearchQuery = (query) => {
  if (query.trim()) {
    return filterSections(query)
  } else {
    return clearSearch()
  }
}

export const loadMoreData = () => {
  // In a real app, this would load data from Firebase or API
  console.log('Loading more data...')
  
  // Data is already in initial state, so no need to dispatch anything
  // This is just for consistency with other modules
  return { type: 'NO_OP' }
}

export const addQuickAction = (action) => {
  console.log('Adding quick action:', action.title)
  return { type: 'NO_OP' }
}

export const removeQuickAction = (actionId) => {
  console.log('Removing quick action:', actionId)
  return { type: 'NO_OP' }
}

export const addMoreSection = (section) => {
  console.log('Adding more section:', section.title)
  return { type: 'NO_OP' }
}

export const updateMoreSection = (sectionId, updates) => {
  console.log('Updating more section:', sectionId, updates)
  return { type: 'NO_OP' }
}

export const removeMoreSection = (sectionId) => {
  console.log('Removing more section:', sectionId)
  return { type: 'NO_OP' }
}
