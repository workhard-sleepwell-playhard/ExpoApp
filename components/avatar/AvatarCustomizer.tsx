import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AvatarRenderer } from './AvatarRenderer';
import { AvatarData, AvatarBase, AvatarLayers } from '../../src/services/avatar-service';


interface AvatarCustomizerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (avatarData: AvatarData) => void;
  initialAvatarData?: AvatarData | null;
  userId: string;
}

// Ready Player Me compatible customization categories
const CUSTOMIZATION_CATEGORIES = [
  { id: 'base', name: 'Base', icon: 'person.fill' },
  { id: 'hair', name: 'Hair', icon: 'scissors' },
  { id: 'face', name: 'Face', icon: 'eye.fill' },
  { id: 'clothing', name: 'Clothing', icon: 'tshirt.fill' },
  { id: 'accessories', name: 'Accessories', icon: 'star.fill' },
];

// Ready Player Me style options (these would map to their API)
const CUSTOMIZATION_OPTIONS = {
  base: {
    skinTone: [
      { id: 'light', name: 'Light', color: '#FDBCB4' },
      { id: 'medium', name: 'Medium', color: '#E8A87C' },
      { id: 'dark', name: 'Dark', color: '#C68642' },
      { id: 'very-dark', name: 'Very Dark', color: '#8D5524' },
    ],
    bodyType: [
      { id: 'slim', name: 'Slim' },
      { id: 'average', name: 'Average' },
      { id: 'athletic', name: 'Athletic' },
      { id: 'curvy', name: 'Curvy' },
    ],
  },
  hair: {
    styles: [
      { id: 'short_01', name: 'Short Hair 1', category: 'short' },
      { id: 'short_02', name: 'Short Hair 2', category: 'short' },
      { id: 'long_01', name: 'Long Hair 1', category: 'long' },
      { id: 'long_02', name: 'Long Hair 2', category: 'long' },
      { id: 'curly_01', name: 'Curly Hair 1', category: 'curly' },
      { id: 'bald', name: 'Bald', category: 'bald' },
    ],
    colors: [
      { id: 'black', name: 'Black', color: '#000000' },
      { id: 'brown', name: 'Brown', color: '#8B4513' },
      { id: 'blonde', name: 'Blonde', color: '#DAA520' },
      { id: 'red', name: 'Red', color: '#A52A2A' },
      { id: 'gray', name: 'Gray', color: '#808080' },
      { id: 'white', name: 'White', color: '#FFFFFF' },
    ],
  },
  face: {
    eyes: {
      styles: [
        { id: 'default', name: 'Default Eyes' },
        { id: 'narrow', name: 'Narrow Eyes' },
        { id: 'wide', name: 'Wide Eyes' },
        { id: 'asian', name: 'Asian Eyes' },
      ],
      colors: [
        { id: 'brown', name: 'Brown', color: '#8B4513' },
        { id: 'blue', name: 'Blue', color: '#4A90E2' },
        { id: 'green', name: 'Green', color: '#4CAF50' },
        { id: 'hazel', name: 'Hazel', color: '#8B4513' },
        { id: 'gray', name: 'Gray', color: '#808080' },
      ],
    },
    mouth: {
      styles: [
        { id: 'default', name: 'Default Mouth' },
        { id: 'smile', name: 'Smile' },
        { id: 'neutral', name: 'Neutral' },
        { id: 'wide', name: 'Wide Mouth' },
      ],
      colors: [
        { id: 'natural', name: 'Natural', color: '#E91E63' },
        { id: 'pink', name: 'Pink', color: '#FF69B4' },
        { id: 'red', name: 'Red', color: '#F44336' },
      ],
    },
    eyebrows: {
      styles: [
        { id: 'default', name: 'Default Eyebrows' },
        { id: 'thick', name: 'Thick Eyebrows' },
        { id: 'thin', name: 'Thin Eyebrows' },
        { id: 'arched', name: 'Arched Eyebrows' },
      ],
      colors: [
        { id: 'black', name: 'Black', color: '#000000' },
        { id: 'brown', name: 'Brown', color: '#8B4513' },
        { id: 'blonde', name: 'Blonde', color: '#DAA520' },
      ],
    },
  },
  clothing: {
    top: [
      { id: 'tshirt_01', name: 'T-Shirt', category: 'casual' },
      { id: 'shirt_01', name: 'Button Shirt', category: 'formal' },
      { id: 'hoodie_01', name: 'Hoodie', category: 'casual' },
      { id: 'dress_01', name: 'Dress', category: 'formal' },
      { id: 'tank_01', name: 'Tank Top', category: 'casual' },
    ],
    bottom: [
      { id: 'jeans_01', name: 'Jeans', category: 'casual' },
      { id: 'shorts_01', name: 'Shorts', category: 'casual' },
      { id: 'pants_01', name: 'Pants', category: 'formal' },
      { id: 'skirt_01', name: 'Skirt', category: 'formal' },
    ],
    shoes: [
      { id: 'sneakers_01', name: 'Sneakers', category: 'casual' },
      { id: 'boots_01', name: 'Boots', category: 'casual' },
      { id: 'heels_01', name: 'Heels', category: 'formal' },
      { id: 'sandals_01', name: 'Sandals', category: 'casual' },
    ],
    colors: [
      { id: 'black', name: 'Black', color: '#000000' },
      { id: 'white', name: 'White', color: '#FFFFFF' },
      { id: 'blue', name: 'Blue', color: '#2196F3' },
      { id: 'red', name: 'Red', color: '#F44336' },
      { id: 'green', name: 'Green', color: '#4CAF50' },
      { id: 'yellow', name: 'Yellow', color: '#FFEB3B' },
      { id: 'purple', name: 'Purple', color: '#9C27B0' },
      { id: 'orange', name: 'Orange', color: '#FF9800' },
    ],
  },
  accessories: [
    { id: 'glasses_01', name: 'Glasses', category: 'eyewear' },
    { id: 'sunglasses_01', name: 'Sunglasses', category: 'eyewear' },
    { id: 'hat_01', name: 'Hat', category: 'headwear' },
    { id: 'cap_01', name: 'Cap', category: 'headwear' },
    { id: 'necklace_01', name: 'Necklace', category: 'jewelry' },
    { id: 'earrings_01', name: 'Earrings', category: 'jewelry' },
    { id: 'watch_01', name: 'Watch', category: 'jewelry' },
  ],
};

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  visible,
  onClose,
  onSave,
  initialAvatarData,
  userId,
}) => {
  const colorScheme = useColorScheme();
  const [currentCategory, setCurrentCategory] = useState('base');
  const [avatarData, setAvatarData] = useState<AvatarData | null>(initialAvatarData || null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize avatar data with defaults if none provided
  useEffect(() => {
    if (!avatarData && visible) {
      const defaultAvatar: AvatarData = {
        userId,
        avatarId: `avatar_${userId}_${Date.now()}`,
        base: {
          skinTone: 'medium',
          bodyType: 'average',
        },
        layers: {
          hair: {
            asset: 'short_01',
            color: '#8B4513',
          },
          face: {
            eyes: {
              asset: 'default',
              color: '#4A90E2',
            },
            mouth: {
              asset: 'smile',
              color: '#E91E63',
            },
            eyebrows: {
              asset: 'default',
              color: '#8B4513',
            },
          },
          clothing: {
            top: {
              asset: 'tshirt_01',
              color: '#2196F3',
            },
            bottom: {
              asset: 'jeans_01',
              color: '#1976D2',
            },
            shoes: {
              asset: 'sneakers_01',
              color: '#FFFFFF',
            },
          },
          accessories: [],
        },
        version: '1.0',
        lastUpdated: new Date(),
      };
      setAvatarData(defaultAvatar);
    }
  }, [visible, userId, avatarData]);


  const updateBase = (field: keyof AvatarBase, value: string) => {
    if (!avatarData) return;
    
    setAvatarData({
      ...avatarData,
      base: {
        ...avatarData.base,
        [field]: value,
      },
    });
  };

  const updateLayer = (layerType: keyof AvatarLayers, layerData: any) => {
    if (!avatarData) return;
    
    setAvatarData({
      ...avatarData,
      layers: {
        ...avatarData.layers,
        [layerType]: layerData,
      },
    });
  };

  const updateFaceFeature = (feature: 'eyes' | 'mouth' | 'eyebrows', featureData: any) => {
    if (!avatarData) return;
    
    setAvatarData({
      ...avatarData,
      layers: {
        ...avatarData.layers,
        face: {
          ...avatarData.layers.face,
          [feature]: featureData,
        },
      },
    });
  };

  const addAccessory = (accessory: any) => {
    if (!avatarData) return;
    
    const currentAccessories = avatarData.layers.accessories || [];
    setAvatarData({
      ...avatarData,
      layers: {
        ...avatarData.layers,
        accessories: [...currentAccessories, accessory],
      },
    });
  };

  const removeAccessory = (index: number) => {
    if (!avatarData) return;
    
    const currentAccessories = avatarData.layers.accessories || [];
    setAvatarData({
      ...avatarData,
      layers: {
        ...avatarData.layers,
        accessories: currentAccessories.filter((_, i) => i !== index),
      },
    });
  };

  const handleSave = async () => {
    if (!avatarData) return;
    
    setIsLoading(true);
    try {
      // Here you would integrate with Ready Player Me API
      // For now, we'll just save to our database
      await onSave(avatarData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save avatar. Please try again.');
      console.error('Avatar save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryTabs = () => (
    <View style={styles.categoryTabs}>
      {CUSTOMIZATION_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            currentCategory === category.id && styles.activeCategoryTab,
          ]}
          onPress={() => setCurrentCategory(category.id)}
        >
          <IconSymbol
            name={category.icon as any}
            size={20}
            color={
              currentCategory === category.id
                ? Colors[colorScheme ?? 'light'].tint
                : Colors[colorScheme ?? 'light'].text
            }
          />
          <ThemedText
            style={[
              styles.categoryTabText,
              currentCategory === category.id && styles.activeCategoryTabText,
            ]}
          >
            {category.name}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBaseCustomization = () => (
    <ScrollView style={styles.customizationContent}>
      {/* Skin Tone */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Skin Tone</ThemedText>
        <View style={styles.colorGrid}>
          {CUSTOMIZATION_OPTIONS.base.skinTone.map((tone) => (
            <TouchableOpacity
              key={tone.id}
              style={[
                styles.colorOption,
                { backgroundColor: tone.color },
                avatarData?.base?.skinTone === tone.id && styles.selectedColorOption,
              ]}
              onPress={() => updateBase('skinTone', tone.id)}
            >
              {avatarData?.base?.skinTone === tone.id && (
                <IconSymbol name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Body Type */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Body Type</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.base.bodyType.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                avatarData?.base?.bodyType === type.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateBase('bodyType', type.id)}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.base?.bodyType === type.id && styles.selectedOptionButtonText,
                ]}
              >
                {type.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderHairCustomization = () => (
    <ScrollView style={styles.customizationContent}>
      {/* Hair Style */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Hair Style</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.hair.styles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.hair?.asset === style.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateLayer('hair', { ...avatarData?.layers?.hair, asset: style.id })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.hair?.asset === style.id && styles.selectedOptionButtonText,
                ]}
              >
                {style.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hair Color */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Hair Color</ThemedText>
        <View style={styles.colorGrid}>
          {CUSTOMIZATION_OPTIONS.hair.colors.map((color) => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorOption,
                { backgroundColor: color.color },
                avatarData?.layers?.hair?.color === color.color && styles.selectedColorOption,
              ]}
              onPress={() => updateLayer('hair', { ...avatarData?.layers?.hair, color: color.color })}
            >
              {avatarData?.layers?.hair?.color === color.color && (
                <IconSymbol name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderFaceCustomization = () => (
    <ScrollView style={styles.customizationContent}>
      {/* Eyes */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Eyes</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.face.eyes.styles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.face?.eyes?.asset === style.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateFaceFeature('eyes', { ...avatarData?.layers?.face?.eyes, asset: style.id })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.face?.eyes?.asset === style.id && styles.selectedOptionButtonText,
                ]}
              >
                {style.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.colorGrid}>
          {CUSTOMIZATION_OPTIONS.face.eyes.colors.map((color) => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorOption,
                { backgroundColor: color.color },
                avatarData?.layers?.face?.eyes?.color === color.color && styles.selectedColorOption,
              ]}
              onPress={() => updateFaceFeature('eyes', { ...avatarData?.layers?.face?.eyes, color: color.color })}
            >
              {avatarData?.layers?.face?.eyes?.color === color.color && (
                <IconSymbol name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mouth */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mouth</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.face.mouth.styles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.face?.mouth?.asset === style.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateFaceFeature('mouth', { ...avatarData?.layers?.face?.mouth, asset: style.id })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.face?.mouth?.asset === style.id && styles.selectedOptionButtonText,
                ]}
              >
                {style.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Eyebrows */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Eyebrows</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.face.eyebrows.styles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.face?.eyebrows?.asset === style.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateFaceFeature('eyebrows', { ...avatarData?.layers?.face?.eyebrows, asset: style.id })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.face?.eyebrows?.asset === style.id && styles.selectedOptionButtonText,
                ]}
              >
                {style.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderClothingCustomization = () => (
    <ScrollView style={styles.customizationContent}>
      {/* Top */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Top</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.clothing.top.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.clothing?.top?.asset === item.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateLayer('clothing', { ...avatarData?.layers?.clothing, top: { ...avatarData?.layers?.clothing?.top, asset: item.id } })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.clothing?.top?.asset === item.id && styles.selectedOptionButtonText,
                ]}
              >
                {item.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Bottom</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.clothing.bottom.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.clothing?.bottom?.asset === item.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateLayer('clothing', { ...avatarData?.layers?.clothing, bottom: { ...avatarData?.layers?.clothing?.bottom, asset: item.id } })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.clothing?.bottom?.asset === item.id && styles.selectedOptionButtonText,
                ]}
              >
                {item.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Shoes */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Shoes</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.clothing.shoes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionButton,
                avatarData?.layers?.clothing?.shoes?.asset === item.id && styles.selectedOptionButton,
              ]}
              onPress={() => updateLayer('clothing', { ...avatarData?.layers?.clothing, shoes: { ...avatarData?.layers?.clothing?.shoes, asset: item.id } })}
            >
              <ThemedText
                style={[
                  styles.optionButtonText,
                  avatarData?.layers?.clothing?.shoes?.asset === item.id && styles.selectedOptionButtonText,
                ]}
              >
                {item.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clothing Colors */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Clothing Colors</ThemedText>
        <View style={styles.colorGrid}>
          {CUSTOMIZATION_OPTIONS.clothing.colors.map((color) => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorOption,
                { backgroundColor: color.color },
              ]}
              onPress={() => {
                // Update all clothing colors
                updateLayer('clothing', {
                  ...avatarData?.layers?.clothing,
                  top: { ...avatarData?.layers?.clothing?.top, color: color.color },
                  bottom: { ...avatarData?.layers?.clothing?.bottom, color: color.color },
                });
              }}
            >
              {avatarData?.layers?.clothing?.top?.color === color.color && (
                <IconSymbol name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAccessoriesCustomization = () => (
    <ScrollView style={styles.customizationContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Accessories</ThemedText>
        <View style={styles.optionGrid}>
          {CUSTOMIZATION_OPTIONS.accessories.map((accessory) => (
            <TouchableOpacity
              key={accessory.id}
              style={styles.optionButton}
              onPress={() => addAccessory({ asset: accessory.id, color: '#000000' })}
            >
              <ThemedText style={styles.optionButtonText}>{accessory.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Current Accessories */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Current Accessories</ThemedText>
        {avatarData?.layers?.accessories?.map((accessory, index) => (
          <View key={index} style={styles.accessoryItem}>
            <ThemedText style={styles.accessoryText}>
              {CUSTOMIZATION_OPTIONS.accessories.find(a => a.id === accessory.asset)?.name || 'Unknown'}
            </ThemedText>
            <TouchableOpacity
              style={styles.removeAccessoryButton}
              onPress={() => removeAccessory(index)}
            >
              <IconSymbol name="xmark" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderCustomizationContent = () => {
    switch (currentCategory) {
      case 'base':
        return renderBaseCustomization();
      case 'hair':
        return renderHairCustomization();
      case 'face':
        return renderFaceCustomization();
      case 'clothing':
        return renderClothingCustomization();
      case 'accessories':
        return renderAccessoriesCustomization();
      default:
        return renderBaseCustomization();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Customize Avatar</ThemedText>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <ThemedText style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </ThemedText>
          </TouchableOpacity>
        </View>

         {/* Avatar Preview */}
         <View style={styles.avatarPreview}>
           <AvatarRenderer
             avatarData={avatarData}
             size={200}
             showBackground={true}
           />
         </View>

        {/* Category Tabs */}
        {renderCategoryTabs()}

        {/* Customization Content */}
        {renderCustomizationContent()}
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPreview: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeCategoryTab: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  categoryTabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666666',
  },
  activeCategoryTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  customizationContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOptionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedOptionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  accessoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  accessoryText: {
    fontSize: 14,
    color: '#333333',
  },
  removeAccessoryButton: {
    padding: 4,
  },
});
