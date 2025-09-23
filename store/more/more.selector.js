import { createSelector } from 'reselect'

const selectMoreReducer = state => state.more

export const selectMoreSections = createSelector(
  [selectMoreReducer],
  (more) => more.moreSections
)

export const selectQuickActions = createSelector(
  [selectMoreReducer],
  (more) => more.quickActions
)

export const selectSearchQuery = createSelector(
  [selectMoreReducer],
  (more) => more.searchQuery
)

export const selectFilteredSections = createSelector(
  [selectMoreReducer],
  (more) => more.filteredSections
)

export const selectShowSearch = createSelector(
  [selectMoreReducer],
  (more) => more.showSearch
)

export const selectShowNotifications = createSelector(
  [selectMoreReducer],
  (more) => more.showNotifications
)

export const selectIsLoading = createSelector(
  [selectMoreReducer],
  (more) => more.isLoading
)

export const selectError = createSelector(
  [selectMoreReducer],
  (more) => more.error
)

// Derived selectors
export const selectDisplaySections = createSelector(
  [selectMoreSections, selectFilteredSections, selectSearchQuery],
  (moreSections, filteredSections, searchQuery) => {
    return searchQuery ? filteredSections : moreSections
  }
)

export const selectHasSearchResults = createSelector(
  [selectSearchQuery, selectFilteredSections],
  (searchQuery, filteredSections) => {
    return searchQuery && filteredSections.length > 0
  }
)

export const selectIsSearchActive = createSelector(
  [selectSearchQuery],
  (searchQuery) => searchQuery.length > 0
)

export const selectTotalSections = createSelector(
  [selectMoreSections],
  (sections) => sections.length
)

export const selectTotalItems = createSelector(
  [selectMoreSections],
  (sections) => sections.reduce((total, section) => total + section.items.length, 0)
)

export const selectProductivitySection = createSelector(
  [selectMoreSections],
  (sections) => sections.find(section => section.title === 'Productivity')
)

export const selectToolsSection = createSelector(
  [selectMoreSections],
  (sections) => sections.find(section => section.title === 'Tools')
)

export const selectCommunitySection = createSelector(
  [selectMoreSections],
  (sections) => sections.find(section => section.title === 'Community')
)

export const selectAppInfoSection = createSelector(
  [selectMoreSections],
  (sections) => sections.find(section => section.title === 'App Info')
)

export const selectMoreStats = createSelector(
  [selectTotalSections, selectTotalItems, selectQuickActions],
  (totalSections, totalItems, quickActions) => ({
    totalSections,
    totalItems,
    quickActionsCount: quickActions.length
  })
)
