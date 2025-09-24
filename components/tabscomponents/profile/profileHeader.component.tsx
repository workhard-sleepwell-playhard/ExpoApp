import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface ProfileHeaderProps {
  onEditProfile: () => void;
  onMyPosts?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onEditProfile, onMyPosts }) => {
  return (
    <ThemedView style={styles.header}>
      <ThemedText type="title">Profile</ThemedText>
      <View style={styles.headerButtons}>
        {onMyPosts && (
          <TouchableOpacity style={styles.myPostsHeaderButton} onPress={onMyPosts}>
            <ThemedText style={styles.myPostsHeaderText}>My Posts</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editProfileHeaderButton} onPress={onEditProfile}>
          <ThemedText style={styles.editProfileHeaderText}>Edit Profile</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myPostsHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',

  },
  myPostsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  editProfileHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  editProfileHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
