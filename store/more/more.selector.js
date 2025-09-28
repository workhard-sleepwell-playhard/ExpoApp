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

// Unused selectors removed for optimization

export const selectIsLoading = createSelector(
  [selectMoreReducer],
  (more) => more.isLoading
)

export const selectError = createSelector(
  [selectMoreReducer],
  (more) => more.error
)

// Derived selectors removed - not used in current UI

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

// selectMoreStats removed - not used in current UI
