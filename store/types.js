// Redux store types
export const RootState = {
  home: {
    posts: [],
    isCreatePostOpen: false,
    postContent: '',
    selectedImages: [],
    selectedVideos: [],
    postType: 'general',
    isPublic: true,
    isLoading: false,
    error: null
  }
}
