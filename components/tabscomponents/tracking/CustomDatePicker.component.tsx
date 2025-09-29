import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (fromDate: string, toDate: string) => void;
  initialFromDate?: string;
  initialToDate?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  onApply,
  initialFromDate = '',
  initialToDate = ''
}) => {
  const [selectedFromDate, setSelectedFromDate] = useState<string>('');
  const [selectedToDate, setSelectedToDate] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'from' | 'to'>('from');

  useEffect(() => {
    if (visible) {
      setSelectedFromDate(initialFromDate);
      setSelectedToDate(initialToDate);
      setSelectionMode('from');
    }
  }, [visible, initialFromDate, initialToDate]);

  const handleDatePress = (day: DateData) => {
    const dateString = day.dateString;
    
    if (selectionMode === 'from') {
      setSelectedFromDate(dateString);
      setSelectionMode('to');
    } else {
      // Validate that to date is after from date
      if (selectedFromDate && dateString < selectedFromDate) {
        Alert.alert('Invalid Date', 'End date must be after start date');
        return;
      }
      setSelectedToDate(dateString);
    }
  };

  const handleApply = () => {
    if (!selectedFromDate || !selectedToDate) {
      Alert.alert('Missing Dates', 'Please select both start and end dates');
      return;
    }
    
    onApply(selectedFromDate, selectedToDate);
    onClose();
  };

  const handleReset = () => {
    setSelectedFromDate('');
    setSelectedToDate('');
    setSelectionMode('from');
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    if (selectedFromDate) {
      marked[selectedFromDate] = {
        selected: true,
        selectedColor: '#007AFF',
        startingDay: true,
        endingDay: selectedFromDate === selectedToDate
      };
    }
    
    if (selectedToDate && selectedToDate !== selectedFromDate) {
      marked[selectedToDate] = {
        selected: true,
        selectedColor: '#007AFF',
        endingDay: true
      };
      
      // Mark dates in between
      const fromDate = new Date(selectedFromDate);
      const toDate = new Date(selectedToDate);
      const currentDate = new Date(fromDate);
      
      while (currentDate <= toDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (dateString !== selectedFromDate && dateString !== selectedToDate) {
          marked[dateString] = {
            selected: true,
            selectedColor: '#E3F2FD',
            color: '#007AFF'
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return marked;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not selected';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Select Date Range</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.dateSelection}>
            <View style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>From:</ThemedText>
              <TouchableOpacity 
                style={[
                  styles.dateButton, 
                  selectionMode === 'from' && styles.activeDateButton
                ]}
                onPress={() => setSelectionMode('from')}
              >
                <ThemedText style={[
                  styles.dateButtonText,
                  selectionMode === 'from' && styles.activeDateButtonText
                ]}>
                  {formatDate(selectedFromDate)}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>To:</ThemedText>
              <TouchableOpacity 
                style={[
                  styles.dateButton,
                  selectionMode === 'to' && styles.activeDateButton
                ]}
                onPress={() => setSelectionMode('to')}
              >
                <ThemedText style={[
                  styles.dateButtonText,
                  selectionMode === 'to' && styles.activeDateButtonText
                ]}>
                  {formatDate(selectedToDate)}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.instructions}>
            <ThemedText style={styles.instructionText}>
              {selectionMode === 'from' 
                ? 'Select start date' 
                : 'Select end date'
              }
            </ThemedText>
          </View>

          <Calendar
            onDayPress={handleDatePress}
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#666',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#007AFF',
              dayTextColor: '#333',
              textDisabledColor: '#999',
              dotColor: '#007AFF',
              selectedDotColor: '#FFFFFF',
              arrowColor: '#007AFF',
              monthTextColor: '#333',
              indicatorColor: '#007AFF',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
            style={styles.calendar}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.applyActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  dateSelection: {
    marginBottom: 16,
  },
  dateItem: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
  },
  activeDateButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  activeDateButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  instructions: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default CustomDatePicker;
