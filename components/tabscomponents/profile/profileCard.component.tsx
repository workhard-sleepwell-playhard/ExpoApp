import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

interface ProfileCardProps {
  name: string;
  avatar: string;
  onCollectionPress: () => void;
  onEditAvatar: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  avatar,
  onCollectionPress,
  onEditAvatar,
}) => {
  return (
    <ThemedView style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{avatar}</ThemedText>
        </View>
        <TouchableOpacity style={styles.editAvatarButton} onPress={onEditAvatar}>
          <IconSymbol name="camera.fill" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <ThemedText type="subtitle" style={styles.userName}>{name}</ThemedText>
      
      <TouchableOpacity style={styles.collectionButton} onPress={onCollectionPress}>
        <IconSymbol name="folder.fill" size={16} color="white" />
        <ThemedText style={styles.collectionButtonText}>Collection</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    marginBottom: 16,
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 8,
  },
  collectionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
