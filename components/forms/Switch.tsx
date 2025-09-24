import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface SwitchProps {
  label?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  labelStyle?: any;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  value,
  onToggle,
  size = 'medium',
  color,
  disabled = false,
  required = false,
  style,
  labelStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const getSwitchSizes = () => {
    switch (size) {
      case 'small':
        return {
          width: 36,
          height: 20,
          thumbSize: 16,
          margin: 2,
        };
      case 'medium':
        return {
          width: 44,
          height: 24,
          thumbSize: 20,
          margin: 2,
        };
      case 'large':
        return {
          width: 52,
          height: 28,
          thumbSize: 24,
          margin: 2,
        };
      default:
        return {
          width: 44,
          height: 24,
          thumbSize: 20,
          margin: 2,
        };
    }
  };

  const switchSizes = getSwitchSizes();

  const getTrackStyles = () => {
    const baseStyles = [
      styles.track,
      {
        width: switchSizes.width,
        height: switchSizes.height,
        borderRadius: switchSizes.height / 2,
      }
    ];
    
    if (disabled) baseStyles.push(styles.disabled);
    
    return baseStyles;
  };

  const getThumbStyles = () => {
    return [
      styles.thumb,
      {
        width: switchSizes.thumbSize,
        height: switchSizes.thumbSize,
        borderRadius: switchSizes.thumbSize / 2,
        margin: switchSizes.margin,
      }
    ];
  };

  const getLabelStyles = () => {
    const baseStyles = [styles.label];
    
    switch (size) {
      case 'small':
        baseStyles.push(styles.labelSmall);
        break;
      case 'medium':
        baseStyles.push(styles.labelMedium);
        break;
      case 'large':
        baseStyles.push(styles.labelLarge);
        break;
    }
    
    if (disabled) baseStyles.push(styles.labelDisabled);
    
    return baseStyles;
  };

  const handlePress = () => {
    if (!disabled) {
      onToggle(!value);
    }
  };

  const trackColor = value 
    ? (color || Colors[colorScheme ?? 'light'].tint)
    : isDark ? '#3A3A3C' : '#E5E5EA';

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, switchSizes.width - switchSizes.thumbSize - (switchSizes.margin * 2)],
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={getLabelStyles().length > 1 ? styles.labelContainer : styles.switchContainer}>
        {label && (
          <ThemedText style={[getLabelStyles(), labelStyle]}>
            {label}
            {required && <ThemedText style={styles.required}> *</ThemedText>}
          </ThemedText>
        )}
        
        <View style={getTrackStyles()}>
          <View
            style={[
              getTrackStyles(),
              { backgroundColor: trackColor }
            ]}
          />
          <Animated.View
            style={[
              getThumbStyles(),
              {
                transform: [{ translateX: thumbTranslateX }],
                backgroundColor: value 
                  ? '#FFFFFF' 
                  : isDark ? '#8E8E93' : '#FFFFFF',
              }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  track: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  // Label styles
  label: {
    marginRight: 12,
    flex: 1,
  },
  labelSmall: {
    fontSize: 14,
  },
  labelMedium: {
    fontSize: 16,
  },
  labelLarge: {
    fontSize: 18,
  },
  required: {
    color: '#FF3B30',
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});

