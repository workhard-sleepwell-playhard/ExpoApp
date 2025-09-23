import { createSelector } from 'reselect'

const selectHomeReducer = state => state.home

export const selectPosts = createSelector(
  [selectHomeReducer],
  (home) => home.posts
)

export const selectIsCreatePostOpen = createSelector(
  [selectHomeReducer],
  (home) => home.isCreatePostOpen
)

export const selectPostContent = createSelector(
  [selectHomeReducer],
  (home) => home.postContent
)

export const selectSelectedImages = createSelector(
  [selectHomeReducer],
  (home) => home.selectedImages
)

export const selectSelectedVideos = createSelector(
  [selectHomeReducer],
  (home) => home.selectedVideos
)

export const selectPostType = createSelector(
  [selectHomeReducer],
  (home) => home.postType
)

export const selectIsPublic = createSelector(
  [selectHomeReducer],
  (home) => home.isPublic
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
