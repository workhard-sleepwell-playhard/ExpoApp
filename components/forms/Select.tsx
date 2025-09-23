import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string | number | null;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  style?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  variant = 'default',
  size = 'medium',
  error,
  helperText,
  disabled = false,
  required = false,
  searchable = false,
  multiple = false,
  maxHeight = 300,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(option => option.value === value);
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const getContainerStyles = () => {
    const baseStyles = [styles.container];
    
    if (disabled) baseStyles.push(styles.disabled);
    if (error) baseStyles.push(styles.error);
    
    switch (variant) {
      case 'outlined':
        baseStyles.push([
          styles.outlined,
          {
            borderColor: error ? '#FF3B30' : isDark ? '#3A3A3C' : '#E5E5EA',
          }
        ]);
        break;
      case 'filled':
        baseStyles.push([
          styles.filled,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]);
        break;
      default:
        baseStyles.push([
          styles.default,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]);
        break;
    }
    
    return baseStyles;
  };

  const getTextStyles = () => {
    const baseStyles = [styles.text];
    
    switch (size) {
      case 'small':
        baseStyles.push(styles.textSmall);
        break;
      case 'medium':
        baseStyles.push(styles.textMedium);
        break;
      case 'large':
        baseStyles.push(styles.textLarge);
        break;
    }
    
    if (error) baseStyles.push({ color: '#FF3B30' });
    if (disabled) baseStyles.push({ color: isDark ? '#8E8E93' : '#8E8E93' });
    if (!selectedOption) baseStyles.push({ opacity: 0.5 });
    
    return baseStyles;
  };

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onSelect(option);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.disabled && styles.optionDisabled,
        item.value === value && styles.optionSelected,
      ]}
      onPress={() => handleSelect(item)}
      disabled={item.disabled}
    >
      <ThemedText style={[
        styles.optionText,
        item.disabled && styles.optionTextDisabled,
        item.value === value && styles.optionTextSelected,
      ]}>
        {item.label}
      </ThemedText>
      {item.value === value && (
        <IconSymbol 
          name="checkmark" 
          size={16} 
          color={Colors[colorScheme ?? 'light'].tint} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[style]}>
      {label && (
        <ThemedText style={[
          styles.label,
          error && styles.errorLabel,
          disabled && styles.disabledLabel
        ]}>
          {label}
          {required && <ThemedText style={styles.required}> *</ThemedText>}
        </ThemedText>
      )}
      
      <TouchableOpacity
        style={getContainerStyles()}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <ThemedText style={getTextStyles()}>
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        
        <IconSymbol 
          name={isOpen ? "chevron.up" : "chevron.down"} 
          size={16} 
          color={isDark ? '#8E8E93' : '#8E8E93'} 
        />
      </TouchableOpacity>
      
      {(error || helperText) && (
        <ThemedText style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {error || helperText}
        </ThemedText>
      )}
      
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              maxHeight,
            }
          ]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {label || 'Select Option'}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsOpen(false)}
              >
                <IconSymbol name="xmark" size={20} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </View>
            
            {searchable && (
              <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" size={16} color={isDark ? '#8E8E93' : '#8E8E93'} />
                <ThemedText style={styles.searchPlaceholder}>
                  Search...
                </ThemedText>
              </View>
            )}
            
            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.value.toString()}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Variants
  default: {
    // Already included in container
  },
  outlined: {
    borderWidth: 1,
  },
  filled: {
    // Background color set dynamically
  },
  // Text styles
  text: {
    flex: 1,
    fontSize: 16,
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  required: {
    color: '#FF3B30',
  },
  // States
  error: {
    borderColor: '#FF3B30',
  },
  errorLabel: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    margin: 20,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  searchPlaceholder: {
    marginLeft: 8,
    opacity: 0.5,
  },
  optionsList: {
    maxHeight: 200,
  },
  // Option styles
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  optionTextDisabled: {
    opacity: 0.5,
  },
});
