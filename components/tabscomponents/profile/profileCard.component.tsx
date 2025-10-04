import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { AvatarRenderer, AvatarCustomizer, Avatar3DRenderer } from '@/components/avatar';
import { AvatarData } from '../../../src/services/avatar-service';
import { readyPlayerMeService, RPMAvatarOptions } from '../../../src/services/ready-player-me-service';

interface ProfileCardProps {
  name: string;
  avatar: string | AvatarData | null; // Support both emoji string and avatar data
  onCollectionPress: () => void;
  onEditAvatar: () => void;
  userId: string; // Add userId for avatar creation
  avatar3DUrl?: string; // Optional 3D avatar URL
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  avatar,
  onCollectionPress,
  onEditAvatar,
  userId,
  avatar3DUrl,
}) => {
  // Determine if avatar is emoji string or avatar data
  const isEmojiAvatar = typeof avatar === 'string';
  const avatarData = isEmojiAvatar ? null : avatar as AvatarData;
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [rpmAvatarUrl, setRpmAvatarUrl] = useState<string | undefined>(undefined);
  const [rpmAvatarResponse, setRpmAvatarResponse] = useState<any>(null); // Store full RPM response
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  useEffect(() => {
    const generateRPMAvatar = async () => {
      if (avatar3DUrl) {
        setRpmAvatarUrl(avatar3DUrl);
        return;
      }

      setIsGeneratingAvatar(true);
      try {
        const options: RPMAvatarOptions = {
          bodyType: 'female',
          outfitGender: 'feminine',
          style: 'cartoon',
          userId: userId || 'default_user'
        };

        const avatarResponse = await readyPlayerMeService.generateAvatar(options);
        if (avatarResponse) {
          const glbUrl = readyPlayerMeService.getAvatarGLBUrl(avatarResponse.id);
          setRpmAvatarUrl(glbUrl);
          setRpmAvatarResponse(avatarResponse); // Store the full response
          console.log('✅ RPM avatar generated:', glbUrl);
        } else {
          console.error('❌ Failed to generate RPM avatar');
        }
      } catch (error) {
        console.error('❌ Error generating RPM avatar:', error);
      } finally {
        setIsGeneratingAvatar(false);
      }
    };

    generateRPMAvatar();
  }, [avatar3DUrl]);

  const handleEditAvatar = () => {
    setShowAvatarCustomizer(true);
  };

  const handleSaveAvatar = async (newAvatarData: AvatarData) => {
    try {
      // Here you would dispatch the save action to Redux
      // For now, we'll just close the customizer
      setShowAvatarCustomizer(false);
      // Call the original onEditAvatar callback if needed
      onEditAvatar();
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  return (
    <ThemedView style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        {rpmAvatarUrl ? (
          <Avatar3DRenderer
            avatarUrl={rpmAvatarUrl}
            accessToken={rpmAvatarResponse?.accessToken} // Pass access token
            size={200}
            showBackground={true}
            isLoading={isGeneratingAvatar}
            onLoadComplete={() => console.log('3D Avatar loaded successfully')}
            onLoadError={(error) => console.error('3D Avatar load error:', error)}
          />
        ) : isEmojiAvatar ? (
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{avatar as string}</ThemedText>
          </View>
        ) : (
          <AvatarRenderer
            avatarData={avatarData}
            size={200}
            showBackground={true}
          />
        )}
        <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditAvatar}>
          <IconSymbol name="camera.fill" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <ThemedText type="subtitle" style={styles.userName}>{name}</ThemedText>
      
      <TouchableOpacity style={styles.collectionButton} onPress={onCollectionPress}>
        <IconSymbol name="folder.fill" size={16} color="white" />
        <ThemedText style={styles.collectionButtonText}>Collection</ThemedText>
      </TouchableOpacity>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizer
        visible={showAvatarCustomizer}
        onClose={() => setShowAvatarCustomizer(false)}
        onSave={handleSaveAvatar}
        initialAvatarData={avatarData}
        userId={userId}
      />
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
    width: 200,
    height: 200,
    borderRadius: 100,
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
