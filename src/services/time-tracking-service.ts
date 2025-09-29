/**
 * Time Tracking Service
 * Handles time tracking sessions and analytics generation
 * Following the same pattern as other services in the app
 */

import { SimpleRealtimeService } from './simple-realtime';

export class TimeTrackingService {
  private static activeSession: any = null;
  private static sessionInterval: NodeJS.Timeout | null = null;

  /**
   * Start a new time tracking session
   * @param sessionData Session configuration
   * @returns Promise with session ID
   */
  static async startSession(sessionData: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    description?: string;
    tags?: string[];
  }): Promise<string> {
    try {
      // Stop any existing session
      if (this.activeSession) {
        await this.stopSession();
      }

      const startTime = Date.now();
      
      const session = {
        ...sessionData,
        startTime,
        endTime: null,
        duration: 0,
        isActive: true,
        productivityRating: 0,
        breakTaken: false,
        breakDuration: 0
      };

      // Create session in Firebase
      const sessionId = await SimpleRealtimeService.createTimeTrackingSession(session);
      
      this.activeSession = {
        id: sessionId,
        ...session
      };

      // Start interval to update duration every minute
      this.startSessionInterval();

      return sessionId;
    } catch (error) {
      console.error('Error starting time tracking session:', error);
      throw new Error('Failed to start time tracking session');
    }
  }

  /**
   * Stop the current active session
   * @returns Promise with updated session data
   */
  static async stopSession(): Promise<any> {
    try {
      if (!this.activeSession) {
        throw new Error('No active session to stop');
      }

      const endTime = Date.now();
      const duration = Math.round((endTime - this.activeSession.startTime) / 60000); // Convert to minutes

      // Stop the interval
      this.stopSessionInterval();

      // Update session in Firebase
      const updatedSession = {
        ...this.activeSession,
        endTime,
        duration,
        isActive: false
      };

      await SimpleRealtimeService.updateTask(this.activeSession.id, {
        endTime,
        duration,
        isActive: false,
        updatedAt: Date.now()
      });

      // Generate analytics for this session
      await this.generateSessionAnalytics(updatedSession);

      const completedSession = updatedSession;
      this.activeSession = null;

      return completedSession;
    } catch (error) {
      console.error('Error stopping time tracking session:', error);
      throw new Error('Failed to stop time tracking session');
    }
  }

  /**
   * Get the current active session
   * @returns Active session data or null
   */
  static getActiveSession(): any {
    return this.activeSession;
  }

  /**
   * Check if there's an active session
   * @returns Boolean indicating if session is active
   */
  static isSessionActive(): boolean {
    return this.activeSession !== null;
  }

  /**
   * Get session duration in minutes
   * @returns Duration in minutes
   */
  static getSessionDuration(): number {
    if (!this.activeSession) return 0;
    
    const now = Date.now();
    return Math.round((now - this.activeSession.startTime) / 60000);
  }

  /**
   * Format duration for display
   * @param minutes Duration in minutes
   * @returns Formatted duration string
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Generate analytics for a completed session
   * @param session Completed session data
   */
  private static async generateSessionAnalytics(session: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get existing analytics for today
      const existingAnalytics = await SimpleRealtimeService.getDailyAnalytics(session.userId, today);
      
      if (existingAnalytics) {
        // Update existing analytics
        const updatedAnalytics = {
          ...existingAnalytics,
          totalHoursTracked: existingAnalytics.totalHoursTracked + (session.duration / 60),
          totalSessions: existingAnalytics.totalSessions + 1,
          categories: this.updateCategoriesInAnalytics(existingAnalytics.categories, session),
          updatedAt: Date.now()
        };

        await SimpleRealtimeService.updateTask(existingAnalytics.id, updatedAnalytics);
      } else {
        // Create new analytics for today
        const newAnalytics = {
          userId: session.userId,
          date: today,
          totalHoursTracked: session.duration / 60,
          totalSessions: 1,
          categories: [{
            categoryId: session.categoryId,
            categoryName: session.categoryName,
            categoryColor: session.categoryColor,
            categoryIcon: session.categoryIcon,
            hours: session.duration / 60,
            sessions: 1,
            productivityScore: 0
          }],
          tasksCompleted: 0,
          tasksPending: 0,
          tasksOverdue: 0,
          pointsEarned: 0,
          productivityScore: 0,
          goals: {
            dailyTaskGoal: 5,
            dailyTimeGoal: 480,
            tasksCompleted: 0,
            timeTracked: session.duration,
            tasksGoalMet: false,
            timeGoalMet: session.duration >= 480
          },
          insights: {
            mostProductiveHour: new Date(session.startTime).getHours(),
            mostProductiveCategory: session.categoryName,
            averageSessionLength: session.duration,
            longestBreak: 0,
            focusScore: 0
          }
        };

        await SimpleRealtimeService.createDailyAnalytics(newAnalytics);
      }
    } catch (error) {
      console.error('Error generating session analytics:', error);
    }
  }

  /**
   * Update categories in analytics data
   * @param categories Existing categories array
   * @param session Session data
   * @returns Updated categories array
   */
  private static updateCategoriesInAnalytics(categories: any[], session: any): any[] {
    const categoryIndex = categories.findIndex(cat => cat.categoryId === session.categoryId);
    
    if (categoryIndex >= 0) {
      // Update existing category
      categories[categoryIndex].hours += session.duration / 60;
      categories[categoryIndex].sessions += 1;
    } else {
      // Add new category
      categories.push({
        categoryId: session.categoryId,
        categoryName: session.categoryName,
        categoryColor: session.categoryColor,
        categoryIcon: session.categoryIcon,
        hours: session.duration / 60,
        sessions: 1,
        productivityScore: 0
      });
    }
    
    return categories;
  }

  /**
   * Start interval to update session duration
   */
  private static startSessionInterval(): void {
    this.sessionInterval = setInterval(() => {
      if (this.activeSession) {
        // Update duration in local state
        this.activeSession.duration = this.getSessionDuration();
      }
    }, 60000); // Update every minute
  }

  /**
   * Stop the session interval
   */
  private static stopSessionInterval(): void {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    this.stopSessionInterval();
    this.activeSession = null;
  }
}

export default TimeTrackingService;
