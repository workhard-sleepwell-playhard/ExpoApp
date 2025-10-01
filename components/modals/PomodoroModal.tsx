import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
  PanResponder,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import {
  startPomodoroSession,
  completePomodoroSession,
  pauseTimer,
  resumeTimer,
  tickTimer,
  setShowTimerModal,
  setDefaultDuration,
} from '@/store/pomodoro/pomodoro.action';
import {
  selectTimerState,
  selectFormattedTimeRemaining,
  selectFormattedElapsedTime,
  selectProgress,
  selectActiveSession,
  selectDefaultDuration,
} from '@/store/pomodoro/pomodoro.selector';
import { selectUserId } from '@/store/auth/auth.selector';

const { width, height } = Dimensions.get('window');

interface PomodoroModalProps {
  task: {
    id: string;
    title: string;
    category?: string;
    priority?: string;
  } | null;
  visible: boolean;
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ task, visible, onClose }) => {
  const dispatch = useDispatch();
  
  // Get userId from auth state using proper selector
  const userId = useSelector(selectUserId);
  
  // Redux state
  const timerState = useSelector(selectTimerState);
  const formattedTime = useSelector(selectFormattedTimeRemaining);
  const formattedElapsed = useSelector(selectFormattedElapsedTime);
  const progress = useSelector(selectProgress);
  const activeSession = useSelector(selectActiveSession);
  const defaultDuration = useSelector(selectDefaultDuration);
  
  // Animation
  const [slideAnim] = useState(new Animated.Value(height));
  const [fadeAnim] = useState(new Animated.Value(0));
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Local duration state for adjustment (only when no active session)
  const [customDuration, setCustomDuration] = useState(defaultDuration);
  
  // Animated value for progress ring rotation
  const progressRotation = useRef(new Animated.Value(0)).current;
  
  // Sync custom duration with default when modal opens
  useEffect(() => {
    if (visible && !activeSession) {
      setCustomDuration(defaultDuration);
    }
  }, [visible, defaultDuration, activeSession]);
  
  // Animate progress ring based on duration or timer progress
  useEffect(() => {
    const targetRotation = activeSession 
      ? (progress / 100) * 360  // During session: show timer progress
      : ((customDuration - 5) / 55) * 360;  // Idle: show selected duration
    
    Animated.timing(progressRotation, {
      toValue: targetRotation,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [customDuration, progress, activeSession, progressRotation]);
  
  // Pan responder for circular dial on timer ring (only when idle)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !activeSession,
      onMoveShouldSetPanResponder: () => !activeSession,
      onPanResponderGrant: (evt) => {
        // Set duration based on where user touches
        const touch = evt.nativeEvent;
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = touch.pageX - centerX;
        const dy = touch.pageY - centerY;
        
        // Calculate angle (0 = right, π/2 = down, -π/2 = up)
        let angle = Math.atan2(dy, dx);
        
        // Convert to 0-360 degrees starting from top (12 o'clock)
        // atan2 gives us -π to π, we want 0-2π starting from top
        let degrees = ((angle * 180) / Math.PI + 90 + 360) % 360;
        
        // Map 0-360 degrees to 5-60 minutes
        // 0° (top) = 5 min, 360° (full circle back to top) = 60 min
        const duration = Math.round(5 + (degrees / 360) * 55);
        const clampedDuration = Math.max(5, Math.min(60, duration));
        
        setCustomDuration(clampedDuration);
      },
      onPanResponderMove: (evt) => {
        // Update duration as user drags around the circle
        const touch = evt.nativeEvent;
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = touch.pageX - centerX;
        const dy = touch.pageY - centerY;
        
        // Calculate angle
        let angle = Math.atan2(dy, dx);
        
        // Convert to 0-360 degrees starting from top
        let degrees = ((angle * 180) / Math.PI + 90 + 360) % 360;
        
        // Map to minutes (0° = 5 min, 360° = 60 min)
        const duration = Math.round(5 + (degrees / 360) * 55);
        const clampedDuration = Math.max(5, Math.min(60, duration));
        
        if (clampedDuration !== customDuration) {
          setCustomDuration(clampedDuration);
        }
      },
      onPanResponderRelease: () => {
        // Save to Redux
        if (customDuration !== defaultDuration) {
          dispatch(setDefaultDuration(customDuration));
          console.log('⏱️ Duration set to:', customDuration, 'minutes');
        }
      },
    })
  ).current;
  
  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      slideAnim.stopAnimation();
      fadeAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [slideAnim, fadeAnim, pulseAnim]);

  // Debug: Log Redux state changes
  useEffect(() => {
    console.log('📊 Timer State Update:', {
      isRunning: timerState.isRunning,
      timeRemaining: timerState.timeRemaining,
      elapsedTime: timerState.elapsedTime,
      sessionStatus: timerState.sessionStatus,
      hasActiveSession: !!timerState.activeSession
    });
  }, [timerState]);

  // Show/hide animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // Pulse animation when timer is running
  useEffect(() => {
    if (timerState.isRunning) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
      
      Animated.loop(pulse).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timerState.isRunning, pulseAnim]);

  // Timer tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      interval = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    
    // Auto-complete when timer reaches 0
    if (timerState.isRunning && timerState.timeRemaining === 0 && activeSession) {
      handleComplete();
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.timeRemaining, activeSession]);

  const handleStart = async () => {
    if (!task) {
      console.log('❌ No task provided');
      return;
    }
    
    if (!userId) {
      console.log('❌ No userId');
      Alert.alert('Error', 'User not logged in');
      return;
    }
    
    console.log('🎯 Starting Pomodoro session:', {
      userId,
      taskId: task.id,
      taskTitle: task.title,
      duration: defaultDuration
    });
    
    try {
      const result = await (dispatch as any)(startPomodoroSession(
        userId,
        task.id,
        task.title,
        customDuration
      ));
      console.log('✅ Session started successfully:', result);
    } catch (error: any) {
      console.error('❌ Error starting session:', error);
      Alert.alert('Error', error.message || 'Failed to start focus session');
    }
  };

  const handlePause = () => {
    dispatch(pauseTimer());
  };

  const handleResume = () => {
    dispatch(resumeTimer());
  };

  const handleComplete = async () => {
    if (!activeSession) {
      console.log('❌ No active session to complete');
      return;
    }
    
    console.log('✅ Completing session:', activeSession.sessionId);
    
    try {
      await (dispatch as any)(completePomodoroSession(activeSession.sessionId, 'completed'));
      console.log('✅ Session completed successfully');
      Alert.alert(
        '🎉 Session Complete!',
        `Great work on "${task?.title}"! You focused for ${formattedElapsed}.`,
        [{ text: 'Awesome!', onPress: onClose }]
      );
    } catch (error: any) {
      console.error('❌ Error completing session:', error);
      Alert.alert('Error', error.message || 'Failed to complete session');
    }
  };

  const handleInterrupt = () => {
    if (!activeSession) return;
    
    Alert.alert(
      'End Session?',
      'How would you like to end this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Interrupted',
          style: 'default',
          onPress: async () => {
            try {
              console.log('⏸️ Interrupting session');
              await (dispatch as any)(completePomodoroSession(activeSession.sessionId, 'interrupted'));
              onClose();
            } catch (error: any) {
              console.error('❌ Error interrupting session:', error);
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Cancelling session');
              await (dispatch as any)(completePomodoroSession(activeSession.sessionId, 'cancelled'));
              onClose();
            } catch (error: any) {
              console.error('❌ Error cancelling session:', error);
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      {/* Modal Content - Fullscreen */}
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Focus Session</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskCategory}>
            {task.category?.toUpperCase() || 'TASK'}
          </Text>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
        </View>

        {/* Timer Circle */}
        <Animated.View 
          style={[
            styles.timerContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
          {...(!activeSession ? panResponder.panHandlers : {})}
        >
          {/* Progress Ring with SVG */}
          <View style={styles.progressRing}>
            {(() => {
              const radius = 142; // 300/2 - 16/2 (half size minus half border)
              const circumference = 2 * Math.PI * radius;
              
              // Calculate percentage: 5 min = 0%, 60 min = 100%
              const percentage = activeSession 
                ? progress  // During session: countdown progress
                : ((customDuration - 5) / 55) * 100;  // Idle: selected duration
              
              // Calculate stroke offset (0 = full fill, circumference = empty)
              const strokeDashoffset = circumference * (1 - percentage / 100);
              
              return (
                <Svg width={300} height={300} style={styles.svgContainer}>
                  {/* Gray background circle */}
                  <Circle
                    cx={150}
                    cy={150}
                    r={radius}
                    stroke="#F0F0F0"
                    strokeWidth={16}
                    fill="none"
                  />
                  
                  {/* Blue progress circle */}
                  <Circle
                    cx={150}
                    cy={150}
                    r={radius}
                    stroke="#007AFF"
                    strokeWidth={16}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="150, 150"
                  />
                </Svg>
              );
            })()}
          </View>
          
          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              {activeSession ? formattedTime : `${customDuration}:00`}
            </Text>
            <Text style={styles.statusText}>
              {timerState.sessionStatus === 'active' ? 'Focusing...' : 
               timerState.sessionStatus === 'paused' ? 'Paused' : 
               !activeSession ? 'Swipe around to adjust' : 'Ready'}
            </Text>
            {timerState.elapsedTime > 0 && (
              <Text style={styles.elapsedText}>
                {formattedElapsed} elapsed
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!activeSession ? (
            <TouchableOpacity 
              style={[styles.button, styles.startButton]}
              onPress={handleStart}
            >
              <Text style={styles.buttonIcon}>🎯</Text>
              <Text style={styles.buttonText}>Start {customDuration} min</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              {timerState.isRunning ? (
                <TouchableOpacity 
                  style={[styles.button, styles.pauseButton]}
                  onPress={handlePause}
                >
                  <Text style={styles.buttonIcon}>⏸️</Text>
                  <Text style={styles.buttonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.button, styles.resumeButton]}
                  onPress={handleResume}
                >
                  <Text style={styles.buttonIcon}>▶️</Text>
                  <Text style={styles.buttonText}>Resume</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.button, styles.completeButton]}
                onPress={handleComplete}
              >
                <Text style={styles.buttonIcon}>✅</Text>
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips */}
        {!activeSession && (
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>💡 Focus Tips</Text>
            <Text style={styles.tipsText}>• Silence notifications</Text>
            <Text style={styles.tipsText}>• Stay on this task</Text>
            <Text style={styles.tipsText}>• Take breaks between sessions</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  taskInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  progressRing: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
  },
  timeDisplay: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  elapsedText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  controls: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
    flex: 1,
  },
  resumeButton: {
    backgroundColor: '#34C759',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#34C759',
    flex: 1,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tips: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
});

