import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export interface FormGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'outlined';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  required?: boolean;
  error?: string;
  style?: ViewStyle;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  children,
  variant = 'default',
  spacing = 'medium',
  required = false,
  error,
  style,
}) => {
  const getContainerStyles = () => {
    const baseStyles = [styles.container];
    
    // Spacing
    switch (spacing) {
      case 'none':
        baseStyles.push(styles.spacingNone);
        break;
      case 'small':
        baseStyles.push(styles.spacingSmall);
        break;
      case 'medium':
        baseStyles.push(styles.spacingMedium);
        break;
      case 'large':
        baseStyles.push(styles.spacingLarge);
        break;
    }
    
    // Variants
    switch (variant) {
      case 'card':
        baseStyles.push(styles.card);
        break;
      case 'outlined':
        baseStyles.push(styles.outlined);
        break;
      default:
        baseStyles.push(styles.default);
        break;
    }
    
    return baseStyles;
  };

  return (
    <View style={[getContainerStyles(), style]}>
      {(title || description) && (
        <View style={styles.header}>
          {title && (
            <ThemedText style={styles.title}>
              {title}
              {required && <ThemedText style={styles.required}> *</ThemedText>}
            </ThemedText>
          )}
          {description && (
            <ThemedText style={styles.description}>
              {description}
            </ThemedText>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        {children}
      </View>
      
      {error && (
        <ThemedText style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // Spacing variants
  spacingNone: {
    marginBottom: 0,
  },
  spacingSmall: {
    marginBottom: 12,
  },
  spacingMedium: {
    marginBottom: 16,
  },
  spacingLarge: {
    marginBottom: 24,
  },
  // Visual variants
  default: {
    // No additional styling
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  outlined: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  // Header styles
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  required: {
    color: '#FF3B30',
  },
  // Content styles
  content: {
    // No additional styling
  },
  // Error styles
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 8,
  },
});

