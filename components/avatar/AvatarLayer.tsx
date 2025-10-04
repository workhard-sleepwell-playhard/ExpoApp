import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AvatarBase, AvatarLayer as AvatarLayerData } from '../../src/services/avatar-service';

interface AvatarLayerProps {
  type: 'base' | 'hair' | 'eyes' | 'mouth' | 'eyebrows' | 'clothing-top' | 'clothing-bottom' | 'clothing-shoes' | 'accessory' | 'emoji';
  data?: AvatarBase | AvatarLayerData;
  asset?: string;
  color?: string;
  size: number;
  zIndex?: number;
}

export const AvatarLayer: React.FC<AvatarLayerProps> = ({
  type,
  data,
  asset,
  color,
  size,
  zIndex = 0
}) => {
  const layerStyle = {
    width: size,
    height: size,
    zIndex,
    ...getPositioning(type, data),
  };

  // Handle emoji fallback
  if (type === 'emoji' && asset) {
    return (
      <View style={[styles.layer, layerStyle]}>
        <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>
          {asset}
        </Text>
      </View>
    );
  }

  // Handle base layer (body/skin)
  if (type === 'base' && data) {
    const baseData = data as AvatarBase;
    return (
      <View style={[styles.layer, layerStyle, { backgroundColor: getSkinToneColor(baseData?.skinTone || 'medium') }]}>
        {/* Base body shape - this would be replaced with actual SVG/PNG assets */}
        <View style={styles.baseBody} />
      </View>
    );
  }

  // Handle all other layers
  if (data) {
    const layerData = data as AvatarLayerData;
    return (
      <View style={[styles.layer, layerStyle]}>
        {renderLayerAsset(type, layerData, size)}
      </View>
    );
  }

  return null;
};

// Helper function to get positioning based on layer type
function getPositioning(type: string, data?: any) {
  const basePosition = { x: 0, y: 0 };
  
  if (data?.position) {
    return {
      transform: [
        { translateX: data.position?.x || 0 },
        { translateY: data.position?.y || 0 }
      ]
    };
  }

  // Default positioning for different layer types
  switch (type) {
    case 'hair':
      return { transform: [{ translateY: -5 }] };
    case 'eyes':
      return { transform: [{ translateY: -10 }] };
    case 'mouth':
      return { transform: [{ translateY: 5 }] };
    case 'eyebrows':
      return { transform: [{ translateY: -15 }] };
    case 'clothing-top':
      return { transform: [{ translateY: 10 }] };
    case 'clothing-bottom':
      return { transform: [{ translateY: 20 }] };
    case 'clothing-shoes':
      return { transform: [{ translateY: 30 }] };
    case 'accessory':
      return { transform: [{ translateY: -5 }] };
    default:
      return basePosition;
  }
}

// Helper function to get skin tone color
function getSkinToneColor(skinTone: string): string {
  const skinTones = {
    'light': '#FDBCB4',
    'medium': '#E8A87C',
    'dark': '#C68642',
    'very-dark': '#8D5524'
  };
  return skinTones[skinTone as keyof typeof skinTones] || '#E8A87C';
}

// Helper function to render layer assets
function renderLayerAsset(type: string, data: AvatarLayerData, size: number) {
  // For now, we'll use colored shapes as placeholders
  // In production, these would be actual SVG/PNG assets
  
  const assetColor = data?.color || '#000000';
  const scale = (data as any)?.scale || 1.0;
  
  switch (type) {
    case 'hair':
      return (
        <View style={[
          styles.hairAsset,
          { 
            backgroundColor: assetColor,
            transform: [{ scale }]
          }
        ]} />
      );
    
    case 'eyes':
      return (
        <View style={styles.eyesContainer}>
          <View style={[styles.eye, { backgroundColor: assetColor }]} />
          <View style={[styles.eye, { backgroundColor: assetColor }]} />
        </View>
      );
    
    case 'mouth':
      return (
        <View style={[styles.mouth, { backgroundColor: assetColor }]} />
      );
    
    case 'eyebrows':
      return (
        <View style={styles.eyebrowsContainer}>
          <View style={[styles.eyebrow, { backgroundColor: assetColor }]} />
          <View style={[styles.eyebrow, { backgroundColor: assetColor }]} />
        </View>
      );
    
    case 'clothing-top':
      return (
        <View style={[styles.clothingTop, { backgroundColor: assetColor }]} />
      );
    
    case 'clothing-bottom':
      return (
        <View style={[styles.clothingBottom, { backgroundColor: assetColor }]} />
      );
    
    case 'clothing-shoes':
      return (
        <View style={[styles.shoes, { backgroundColor: assetColor }]} />
      );
    
    case 'accessory':
      return (
        <View style={[styles.accessory, { backgroundColor: assetColor }]} />
      );
    
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  baseBody: {
    width: '80%',
    height: '90%',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Hair styles
  hairAsset: {
    width: '90%',
    height: '40%',
    borderRadius: 20,
    top: -10,
  },
  // Face features
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    top: -10,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mouth: {
    width: 20,
    height: 8,
    borderRadius: 10,
    top: 5,
  },
  eyebrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    top: -15,
  },
  eyebrow: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  // Clothing styles
  clothingTop: {
    width: '85%',
    height: '50%',
    borderRadius: 10,
    top: 10,
  },
  clothingBottom: {
    width: '70%',
    height: '40%',
    borderRadius: 5,
    top: 20,
  },
  shoes: {
    width: '60%',
    height: '15%',
    borderRadius: 3,
    top: 30,
  },
  // Accessories
  accessory: {
    width: '30%',
    height: '30%',
    borderRadius: 15,
    top: -5,
  },
});
