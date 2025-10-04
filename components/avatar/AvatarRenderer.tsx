import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AvatarLayer } from './AvatarLayer';
import { AvatarData } from '../../src/services/avatar-service';

interface AvatarRendererProps {
  avatarData: AvatarData | null;
  size?: number;
  style?: any;
  showBackground?: boolean;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatarData,
  size = 120,
  style,
  showBackground = true
}) => {
  // If no avatar data, show default emoji
  if (!avatarData) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        {showBackground && (
          <View style={[styles.background, { width: size, height: size }]} />
        )}
        <View style={[styles.defaultAvatar, { width: size, height: size }]}>
          <AvatarLayer
            type="emoji"
            asset="👤"
            size={size}
            color="#CCCCCC"
          />
        </View>
      </View>
    );
  }

  // Define layer rendering order (z-index)
  const layerOrder = [
    'base',      // Base body/skin (bottom layer)
    'hair',      // Hair behind face
    'face',      // Face features
    'clothing',  // Clothing layers
    'accessories' // Accessories on top
  ];

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {showBackground && (
        <View style={[styles.background, { width: size, height: size }]} />
      )}
      
      {layerOrder.map((layerType) => {
        switch (layerType) {
          case 'base':
            return avatarData.base ? (
              <AvatarLayer
                key="base"
                type="base"
                data={avatarData.base}
                size={size}
              />
            ) : null;
          
          case 'hair':
            return avatarData.layers?.hair ? (
              <AvatarLayer
                key="hair"
                type="hair"
                data={avatarData.layers.hair}
                size={size}
              />
            ) : null;
          
          case 'face':
            return avatarData.layers?.face ? (
              <View key="face" style={styles.faceContainer}>
                {avatarData.layers.face.eyes && (
                  <AvatarLayer
                    type="eyes"
                    data={avatarData.layers.face.eyes}
                    size={size}
                  />
                )}
                {avatarData.layers.face.mouth && (
                  <AvatarLayer
                    type="mouth"
                    data={avatarData.layers.face.mouth}
                    size={size}
                  />
                )}
                {avatarData.layers.face.eyebrows && (
                  <AvatarLayer
                    type="eyebrows"
                    data={avatarData.layers.face.eyebrows}
                    size={size}
                  />
                )}
              </View>
            ) : null;
          
          case 'clothing':
            return avatarData.layers?.clothing ? (
              <View key="clothing" style={styles.clothingContainer}>
                {avatarData.layers.clothing.top && (
                  <AvatarLayer
                    type="clothing-top"
                    data={avatarData.layers.clothing.top}
                    size={size}
                  />
                )}
                {avatarData.layers.clothing.bottom && (
                  <AvatarLayer
                    type="clothing-bottom"
                    data={avatarData.layers.clothing.bottom}
                    size={size}
                  />
                )}
                {avatarData.layers.clothing.shoes && (
                  <AvatarLayer
                    type="clothing-shoes"
                    data={avatarData.layers.clothing.shoes}
                    size={size}
                  />
                )}
              </View>
            ) : null;
          
          case 'accessories':
            return avatarData.layers?.accessories ? (
              <View key="accessories" style={styles.accessoriesContainer}>
                {avatarData.layers.accessories.map((accessory, index) => (
                  <AvatarLayer
                    key={`accessory-${index}`}
                    type="accessory"
                    data={accessory}
                    size={size}
                    zIndex={index + 1}
                  />
                ))}
              </View>
            ) : null;
          
          default:
            return null;
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    backgroundColor: '#F5F5F5',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
  },
  faceContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  clothingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  accessoriesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
