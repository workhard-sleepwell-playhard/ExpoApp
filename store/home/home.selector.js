import { createSelector } from 'reselect'

const selectHomeReducer = state => state.home

// Consolidated selector to reduce re-renders
export const selectHomeState = createSelector(
  [selectHomeReducer],
  (home) => ({
    posts: home.posts,
    postContent: home.postContent,
    selectedImages: home.selectedImages,
    selectedVideos: home.selectedVideos,
    postType: home.postType,
    isPublic: home.isPublic
  })
)

// Individual selectors - kept for backward compatibility
export const selectPosts = createSelector(
  [selectHomeReducer],
  (home) => home.posts
)

export const selectIsCreatePostOpen = createSelector(
  [selectHomeReducer],
  (home) => home.isCreatePostOpen
)

export const selectIsLoading = createSelector(
  [selectHomeReducer],
  (home) => home.isLoading
)

export const selectError = createSelector(
  [selectHomeReducer],
  (home) => home.error
)

export const selectPostCount = createSelector(
  [selectPosts],
  (posts) => posts.length
)

export const selectTotalLikes = createSelector(
  [selectPosts],
  (posts) => posts.reduce((total, post) => total + post.likes, 0)
)

export const selectPublicPosts = createSelector(
  [selectPosts],
  (posts) => posts.filter(post => post.isPublic)
)
