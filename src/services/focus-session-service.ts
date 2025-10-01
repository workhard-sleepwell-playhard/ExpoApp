import { ref, onValue, push, set, get, update, remove } from 'firebase/database';
import { realtimeDb } from '../utils/firebase/config';
import { SimpleRealtimeService } from './simple-realtime';

/**
 * Focus Session Tracking Service
 * Handles all focus session operations for time tracking
 */
export class FocusSessionService {
  private static listeners = new Map<string, () => void>();

  /**
   * Create a new focus session
   * @param userId - User ID
   * @param taskId - Task ID
   * @param date - Session date (YYYY-MM-DD)
   * @returns Session ID
   */
  static async createFocusSession(
    userId: string, 
    taskId: string, 
    date: string
  ): Promise<string> {
    try {
      const sessionsRef = ref(realtimeDb, 'focusSessionSnapshots');
      const newSessionRef = push(sessionsRef);
      const sessionId = newSessionRef.key;

      if (!sessionId) {
        throw new Error('Failed to generate session ID');
      }

      const sessionData = {
        sessionId,
        userId,
        taskId,
        date,
        startTime: new Date().toISOString(),
        endTime: null,
        durationMinutes: 0,
        status: 'active', // active, completed, interrupted, cancelled
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newSessionRef, sessionData);
      console.log('Focus session created:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error creating focus session:', error);
      throw error;
    }
  }

  /**
   * Complete a focus session
   * @param sessionId - Session ID
   * @param status - Final status (completed, interrupted, cancelled)
   * @returns Updated session data
   */
  static async completeFocusSession(
    sessionId: string,
    status: 'completed' | 'interrupted' | 'cancelled' = 'completed'
  ): Promise<any> {
    try {
      const sessionRef = ref(realtimeDb, `focusSessionSnapshots/${sessionId}`);
      const snapshot = await get(sessionRef);

      if (!snapshot.exists()) {
        throw new Error('Session not found');
      }

      const sessionData = snapshot.val();
      const endTime = new Date().toISOString();
      const startTime = new Date(sessionData.startTime);
      const endTimeDate = new Date(endTime);
      const durationMinutes = Math.round((endTimeDate.getTime() - startTime.getTime()) / 60000);

      const updates = {
        endTime,
        durationMinutes,
        status,
        updatedAt: new Date().toISOString()
      };

      await update(sessionRef, updates);
      console.log('Focus session completed:', sessionId, status);

      // Update task daily snapshot with new session data
      await SimpleRealtimeService.updateTaskSnapshotWithSessions(
        sessionData.userId,
        sessionData.taskId,
        sessionData.date
      );

      return {
        ...sessionData,
        ...updates
      };
    } catch (error) {
      console.error('Error completing focus session:', error);
      throw error;
    }
  }

  /**
   * Update a focus session (e.g., to pause, resume, or update duration)
   * @param sessionId - Session ID
   * @param updates - Partial session data to update
   */
  static async updateFocusSession(
    sessionId: string,
    updates: Partial<{
      status: string;
      durationMinutes: number;
      endTime: string;
    }>
  ): Promise<void> {
    try {
      const sessionRef = ref(realtimeDb, `focusSessionSnapshots/${sessionId}`);
      
      await update(sessionRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      console.log('Focus session updated:', sessionId);
    } catch (error) {
      console.error('Error updating focus session:', error);
      throw error;
    }
  }

  /**
   * Get a specific focus session
   * @param sessionId - Session ID
   * @returns Session data
   */
  static async getFocusSession(sessionId: string): Promise<any> {
    try {
      const sessionRef = ref(realtimeDb, `focusSessionSnapshots/${sessionId}`);
      const snapshot = await get(sessionRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: sessionId,
        sessionId,
        ...snapshot.val()
      };
    } catch (error) {
      console.error('Error getting focus session:', error);
      throw error;
    }
  }

  /**
   * Get all focus sessions for a user
   * @param userId - User ID
   * @param startDate - Optional start date filter (YYYY-MM-DD)
   * @param endDate - Optional end date filter (YYYY-MM-DD)
   * @returns Array of sessions
   */
  static async getUserFocusSessions(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    try {
      const sessionsRef = ref(realtimeDb, 'focusSessionSnapshots');
      const snapshot = await get(sessionsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const allSessions = snapshot.val();
      const userSessions = Object.keys(allSessions)
        .filter(key => allSessions[key].userId === userId)
        .map(key => ({
          id: key,
          sessionId: key,
          ...allSessions[key]
        }));

      // Filter by date range if provided
      if (startDate || endDate) {
        return userSessions.filter(session => {
          const sessionDate = session.date;
          if (startDate && sessionDate < startDate) return false;
          if (endDate && sessionDate > endDate) return false;
          return true;
        });
      }

      return userSessions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error('Error getting user focus sessions:', error);
      throw error;
    }
  }

  /**
   * Get focus sessions for a specific task
   * @param taskId - Task ID
   * @param userId - User ID
   * @returns Array of sessions
   */
  static async getTaskFocusSessions(
    taskId: string,
    userId: string
  ): Promise<any[]> {
    try {
      const sessionsRef = ref(realtimeDb, 'focusSessionSnapshots');
      const snapshot = await get(sessionsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const allSessions = snapshot.val();
      const taskSessions = Object.keys(allSessions)
        .filter(key => 
          allSessions[key].taskId === taskId && 
          allSessions[key].userId === userId
        )
        .map(key => ({
          id: key,
          sessionId: key,
          ...allSessions[key]
        }));

      return taskSessions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error('Error getting task focus sessions:', error);
      throw error;
    }
  }

  /**
   * Get the active focus session for a user (if any)
   * @param userId - User ID
   * @returns Active session or null
   */
  static async getActiveFocusSession(userId: string): Promise<any> {
    try {
      const sessionsRef = ref(realtimeDb, 'focusSessionSnapshots');
      const snapshot = await get(sessionsRef);

      if (!snapshot.exists()) {
        return null;
      }

      const allSessions = snapshot.val();
      const activeSession = Object.keys(allSessions).find(key => 
        allSessions[key].userId === userId && 
        allSessions[key].status === 'active'
      );

      if (!activeSession) {
        return null;
      }

      return {
        id: activeSession,
        sessionId: activeSession,
        ...allSessions[activeSession]
      };
    } catch (error) {
      console.error('Error getting active focus session:', error);
      throw error;
    }
  }

  /**
   * Delete a focus session
   * @param sessionId - Session ID
   */
  static async deleteFocusSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = ref(realtimeDb, `focusSessionSnapshots/${sessionId}`);
      const snapshot = await get(sessionRef);
      
      if (!snapshot.exists()) {
        console.log('Session not found for deletion:', sessionId);
        return;
      }
      
      const sessionData = snapshot.val();
      
      await remove(sessionRef);
      console.log('Focus session deleted:', sessionId);
      
      // Update task daily snapshot after deletion
      await SimpleRealtimeService.updateTaskSnapshotWithSessions(
        sessionData.userId,
        sessionData.taskId,
        sessionData.date
      );
    } catch (error) {
      console.error('Error deleting focus session:', error);
      throw error;
    }
  }

  /**
   * Listen to focus sessions for a user in real-time
   * @param userId - User ID
   * @param callback - Callback function to receive sessions
   * @returns Unsubscribe function
   */
  static listenToUserFocusSessions(
    userId: string,
    callback: (sessions: any[]) => void
  ): () => void {
    const sessionsRef = ref(realtimeDb, 'focusSessionSnapshots');
    
    const listenerKey = `focusSessions_${userId}`;
    this.cleanupListener(listenerKey);
    
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }

        const userSessions = Object.keys(data)
          .filter(key => data[key].userId === userId)
          .map(key => ({
            id: key,
            sessionId: key,
            ...data[key]
          }))
          .sort((a, b) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );

        callback(userSessions);
      } catch (error) {
        console.error('Error processing focus sessions:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to focus sessions:', error);
      callback([]);
    });
    
    this.listeners.set(listenerKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Listen to the active focus session for a user
   * @param userId - User ID
   * @param callback - Callback function to receive active session
   * @returns Unsubscribe function
   */
  static listenToActiveFocusSession(
    userId: string,
    callback: (session: any | null) => void
  ): () => void {
    const sessionsRef = ref(realtimeDb, 'focusSessionSnapshots');
    
    const listenerKey = `activeFocusSession_${userId}`;
    this.cleanupListener(listenerKey);
    
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (!data) {
          callback(null);
          return;
        }

        const activeSessionKey = Object.keys(data).find(key => 
          data[key].userId === userId && 
          data[key].status === 'active'
        );

        if (!activeSessionKey) {
          callback(null);
          return;
        }

        callback({
          id: activeSessionKey,
          sessionId: activeSessionKey,
          ...data[activeSessionKey]
        });
      } catch (error) {
        console.error('Error processing active focus session:', error);
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to active focus session:', error);
      callback(null);
    });
    
    this.listeners.set(listenerKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Get focus session statistics for a user
   * @param userId - User ID
   * @param startDate - Optional start date (YYYY-MM-DD)
   * @param endDate - Optional end date (YYYY-MM-DD)
   * @returns Session statistics
   */
  static async getFocusSessionStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalSessions: number;
    totalMinutes: number;
    completedSessions: number;
    interruptedSessions: number;
    cancelledSessions: number;
    averageSessionMinutes: number;
    sessionsByTask: Map<string, number>;
    sessionsByDate: Map<string, number>;
  }> {
    try {
      const sessions = await this.getUserFocusSessions(userId, startDate, endDate);
      
      const stats = {
        totalSessions: sessions.length,
        totalMinutes: 0,
        completedSessions: 0,
        interruptedSessions: 0,
        cancelledSessions: 0,
        averageSessionMinutes: 0,
        sessionsByTask: new Map<string, number>(),
        sessionsByDate: new Map<string, number>()
      };

      sessions.forEach(session => {
        stats.totalMinutes += session.durationMinutes || 0;
        
        if (session.status === 'completed') stats.completedSessions++;
        if (session.status === 'interrupted') stats.interruptedSessions++;
        if (session.status === 'cancelled') stats.cancelledSessions++;

        // Track sessions by task
        const taskCount = stats.sessionsByTask.get(session.taskId) || 0;
        stats.sessionsByTask.set(session.taskId, taskCount + 1);

        // Track sessions by date
        const dateCount = stats.sessionsByDate.get(session.date) || 0;
        stats.sessionsByDate.set(session.date, dateCount + 1);
      });

      stats.averageSessionMinutes = stats.totalSessions > 0 
        ? Math.round(stats.totalMinutes / stats.totalSessions) 
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting focus session stats:', error);
      throw error;
    }
  }

  /**
   * Cleanup a specific listener
   */
  private static cleanupListener(key: string): void {
    const existingListener = this.listeners.get(key);
    if (existingListener) {
      existingListener();
      this.listeners.delete(key);
    }
  }

  /**
   * Cleanup all listeners
   */
  static cleanupAllListeners(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

