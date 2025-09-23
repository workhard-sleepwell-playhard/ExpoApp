import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const { height: screenHeight } = Dimensions.get('window');

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  slideAnimation: Animated.Value;
  overlayOpacity: Animated.Value;
  // Form state
  taskTitle: string;
  setTaskTitle: (title: string) => void;
  taskDescription: string;
  setTaskDescription: (description: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  dueTime: string;
  setDueTime: (time: string) => void;
  taskTags: string[];
  setTaskTags: (tags: string[]) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

const taskCategories = [
  { id: 'work', name: 'Work', icon: '💼', color: '#FF3B30' },
  { id: 'personal', name: 'Personal', icon: '🏠', color: '#34C759' },
  { id: 'health', name: 'Health', icon: '💪', color: '#FF9500' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#007AFF' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#5856D6' },
  { id: 'other', name: 'Other', icon: '📝', color: '#8E8E93' },
];

const priorityLevels = [
  { id: 'low', name: 'Low', color: '#34C759', icon: '🟢' },
  { id: 'medium', name: 'Medium', color: '#FF9500', icon: '🟡' },
  { id: 'high', name: 'High', color: '#FF3B30', icon: '🔴' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  slideAnimation,
  overlayOpacity,
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  dueDate,
  setDueDate,
  dueTime,
  setDueTime,
  taskTags,
  setTaskTags,
  newTag,
  setNewTag,
  onAddTag,
  onRemoveTag,
}) => {
  if (!visible) return null;

  return (
    <Animated.View style={[styles.taskModalOverlay, { opacity: overlayOpacity }]}>
      <TouchableOpacity 
        style={styles.modalBackground}
        onPress={onClose}
        activeOpacity={1}
      >
        <Animated.View 
          style={[
            styles.createTaskModal,
            { transform: [{ translateY: slideAnimation }] }
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Create Task</ThemedText>
            <TouchableOpacity 
              onPress={onSave}
              style={[styles.createButton, { opacity: taskTitle.trim() ? 1 : 0.5 }]}
              disabled={!taskTitle.trim()}
            >
              <ThemedText style={styles.createButtonText}>Create</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.taskFormContent}>
            {/* Task Title */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Task Title *</ThemedText>
              <TextInput
                style={styles.titleInput}
                placeholder="What needs to be done?"
                placeholderTextColor="#999"
                value={taskTitle}
                onChangeText={setTaskTitle}
                maxLength={100}
              />
            </View>

            {/* Task Description */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Description</ThemedText>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Add details, notes, or context..."
                placeholderTextColor="#999"
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Category</ThemedText>
              <ScrollView horizontal style={styles.categoryContainer} showsHorizontalScrollIndicator={false}>
                {taskCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.selectedCategory,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                    <ThemedText style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority Selection */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Priority</ThemedText>
              <View style={styles.priorityContainer}>
                {priorityLevels.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityButton,
                      selectedPriority === priority.id && styles.selectedPriority,
                      { borderColor: priority.color }
                    ]}
                    onPress={() => setSelectedPriority(priority.id)}
                  >
                    <ThemedText style={styles.priorityIcon}>{priority.icon}</ThemedText>
                    <ThemedText style={[
                      styles.priorityText,
                      selectedPriority === priority.id && styles.selectedPriorityText
                    ]}>
                      {priority.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Due Date & Time */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Due Date & Time</ThemedText>
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateInputGroup}>
                  <ThemedText style={styles.dateLabel}>Date</ThemedText>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                    value={dueDate}
                    onChangeText={setDueDate}
                  />
                </View>
                <View style={styles.dateInputGroup}>
                  <ThemedText style={styles.dateLabel}>Time (Optional)</ThemedText>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="HH:MM"
                    placeholderTextColor="#999"
                    value={dueTime}
                    onChangeText={setDueTime}
                  />
                </View>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Tags</ThemedText>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add a tag..."
                  placeholderTextColor="#999"
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={onAddTag}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addTagButton} onPress={onAddTag}>
                  <ThemedText style={styles.addTagIcon}>➕</ThemedText>
                </TouchableOpacity>
              </View>
              
              {taskTags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {taskTags.map((tag, index) => (
                    <View key={index} style={styles.tagItem}>
                      <ThemedText style={styles.tagText}>{tag}</ThemedText>
                      <TouchableOpacity onPress={() => onRemoveTag(tag)} style={styles.removeTagButton}>
                        <ThemedText style={styles.removeTagIcon}>✕</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createTaskModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.2,
    minHeight: 'auto',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  taskFormContent: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  descriptionInput: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  selectedPriority: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  selectedPriorityText: {
    color: 'white',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  dateInput: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagIcon: {
    fontSize: 16,
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    marginRight: 6,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagIcon: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});
