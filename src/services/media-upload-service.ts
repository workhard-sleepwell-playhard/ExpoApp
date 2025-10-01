import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { storage } from '../utils/firebase/config';

/**
 * Media Upload Service
 * Handles image/video uploads to Firebase Storage with optimization
 */
export class MediaUploadService {
  
  /**
   * Upload an image with compression and resizing
   * @param uri - Local image URI
   * @param userId - User ID
   * @param postId - Post ID
   * @returns Download URL
   */
  static async uploadImage(uri: string, userId: string, postId: string): Promise<string> {
    try {
      // Resize and compress image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to max 1080px width (Instagram standard)
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to blob
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();

      // Upload to Storage
      const filename = `image_${Date.now()}.jpg`;
      const storagePath = `postMedia/${userId}/${postId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload a video
   * @param uri - Local video URI
   * @param userId - User ID
   * @param postId - Post ID
   * @returns Download URL
   */
  static async uploadVideo(uri: string, userId: string, postId: string): Promise<string> {
    try {
      // Convert to blob (no compression for videos - too complex)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Storage
      const filename = `video_${Date.now()}.mp4`;
      const storagePath = `postMedia/${userId}/${postId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading video:', error);
      throw error;
    }
  }

  /**
   * Upload multiple media files
   * @param images - Array of image URIs
   * @param videos - Array of video URIs
   * @param userId - User ID
   * @param postId - Post ID
   * @returns Object with image and video URLs
   */
  static async uploadPostMedia(
    images: string[],
    videos: string[],
    userId: string,
    postId: string
  ): Promise<{ imageUrls: string[]; videoUrls: string[] }> {
    try {
      // Upload all images in parallel
      const imageUrls = images.length > 0
        ? await Promise.all(images.map(uri => this.uploadImage(uri, userId, postId)))
        : [];

      // Upload all videos in parallel
      const videoUrls = videos.length > 0
        ? await Promise.all(videos.map(uri => this.uploadVideo(uri, userId, postId)))
        : [];

      return { imageUrls, videoUrls };
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      throw error;
    }
  }
}

