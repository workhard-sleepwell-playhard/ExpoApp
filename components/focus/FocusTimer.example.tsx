/**
 * Example Focus Timer Component
 * This demonstrates how to use the FocusSessionService
 * You can customize this to fit your UI/UX needs
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FocusSessionService } from '@/src/services/focus-session-service';
import { useSelector } from 'react-redux';

interface FocusTimerProps {
  taskId: string;
  taskName: string;
  defaultDuration?: number; // in minutes, default 25
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ 
  taskId, 
  taskName,
  defaultDuration = 25 
}) => {
  const userId = useSelector((state: any) => state.auth.user?.uid);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 60); // in seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start a new focus session
  const handleStart = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      // Check if there's already an active session
      const activeSession = await FocusSessionService.getActiveFocusSession(userId);
      if (activeSession) {
        Alert.alert(
          'Active Session',
          'You already have an active focus session. Complete it first.',
          [{ text: 'OK' }]
        );
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const newSessionId = await FocusSessionService.createFocusSession(
        userId,
        taskId,
        today
      );

      setSessionId(newSessionId);
      setIsActive(true);
      setTimeRemaining(defaultDuration * 60);
      setElapsedTime(0);

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
        setElapsedTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting focus session:', error);
      Alert.alert('Error', 'Failed to start focus session');
    }
  };

  // Pause the session
  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  };

  // Resume the session
  const handleResume = () => {
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  // Complete the session
  const handleComplete = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (sessionId) {
        await FocusSessionService.completeFocusSession(sessionId, 'completed');
        
        Alert.alert(
          'Session Complete!',
          `Great work! You focused for ${Math.floor(elapsedTime / 60)} minutes.`,
          [{ text: 'OK' }]
        );
      }

      resetTimer();
    } catch (error) {
      console.error('Error completing focus session:', error);
      Alert.alert('Error', 'Failed to complete focus session');
    }
  };

  // Interrupt/cancel the session
  const handleInterrupt = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (sessionId) {
        Alert.alert(
          'End Session?',
          'Do you want to mark this session as interrupted or cancel it?',
          [
            {
              text: 'Interrupted',
              onPress: async () => {
                await FocusSessionService.completeFocusSession(sessionId, 'interrupted');
                resetTimer();
              }
            },
            {
              text: 'Cancel',
              onPress: async () => {
                await FocusSessionService.completeFocusSession(sessionId, 'cancelled');
                resetTimer();
              }
            },
            {
              text: 'Resume',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error interrupting focus session:', error);
      Alert.alert('Error', 'Failed to end focus session');
    }
  };

  // Reset timer state
  const resetTimer = () => {
    setSessionId(null);
    setIsActive(false);
    setTimeRemaining(defaultDuration * 60);
    setElapsedTime(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Calculate progress percentage
  const progress = ((defaultDuration * 60 - timeRemaining) / (defaultDuration * 60)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.taskName}>{taskName}</Text>
        <Text style={styles.sessionType}>Focus Session ({defaultDuration} min)</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.progressRing}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.elapsedText}>
            {Math.floor(elapsedTime / 60)} min elapsed
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        {!sessionId ? (
          <TouchableOpacity 
            style={[styles.button, styles.startButton]} 
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Start Focus Session</Text>
          </TouchableOpacity>
        ) : (
          <>
            {isActive ? (
              <TouchableOpacity 
                style={[styles.button, styles.pauseButton]} 
                onPress={handlePause}
              >
                <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.resumeButton]} 
                onPress={handleResume}
              >
                <Text style={styles.buttonText}>Resume</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.completeButton]} 
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.stopButton]} 
              onPress={handleInterrupt}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {sessionId && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  taskName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#007AFF',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  elapsedText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
});

