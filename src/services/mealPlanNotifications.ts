import {Alert} from 'react-native';
import {MealReminder, MealType} from '../types/mealPlan';

// Mock notification service - In a real app, you would use react-native-push-notification
// or @react-native-async-storage/async-storage with background tasks

export interface NotificationScheduleOptions {
  id: string;
  title: string;
  message: string;
  date: Date;
  data?: any;
}

class MealPlanNotificationService {
  private scheduledNotifications: Map<string, NotificationScheduleOptions> = new Map();

  // Schedule a meal reminder notification
  async scheduleMealReminder(reminder: MealReminder): Promise<boolean> {
    try {
      const notification: NotificationScheduleOptions = {
        id: reminder.id,
        title: 'Lembrete de Refeição',
        message: reminder.message,
        date: reminder.reminderTime,
        data: {
          type: 'meal_reminder',
          mealPlanItemId: reminder.mealPlanItemId,
        },
      };

      // In a real implementation, you would use a push notification library
      this.scheduledNotifications.set(reminder.id, notification);
      
      console.log('Meal reminder scheduled:', notification);
      return true;
    } catch (error) {
      console.error('Error scheduling meal reminder:', error);
      return false;
    }
  }

  // Cancel a scheduled meal reminder
  async cancelMealReminder(reminderId: string): Promise<boolean> {
    try {
      this.scheduledNotifications.delete(reminderId);
      console.log('Meal reminder cancelled:', reminderId);
      return true;
    } catch (error) {
      console.error('Error cancelling meal reminder:', error);
      return false;
    }
  }

  // Schedule daily meal planning reminder
  async scheduleDailyPlanningReminder(
    userId: string,
    time: {hour: number; minute: number}
  ): Promise<boolean> {
    try {
      const notification: NotificationScheduleOptions = {
        id: `daily_planning_${userId}`,
        title: 'Planejamento de Refeições',
        message: 'Que tal planejar suas refeições para hoje?',
        date: this.getNextReminderTime(time.hour, time.minute),
        data: {
          type: 'daily_planning',
          userId,
        },
      };

      this.scheduledNotifications.set(notification.id, notification);
      console.log('Daily planning reminder scheduled:', notification);
      return true;
    } catch (error) {
      console.error('Error scheduling daily planning reminder:', error);
      return false;
    }
  }

  // Schedule weekly meal prep reminder
  async scheduleWeeklyPrepReminder(
    userId: string,
    dayOfWeek: number, // 0 = Sunday, 1 = Monday, etc.
    time: {hour: number; minute: number}
  ): Promise<boolean> {
    try {
      const notification: NotificationScheduleOptions = {
        id: `weekly_prep_${userId}`,
        title: 'Preparação Semanal',
        message: 'Hora de planejar suas refeições da semana!',
        date: this.getNextWeeklyReminderTime(dayOfWeek, time.hour, time.minute),
        data: {
          type: 'weekly_prep',
          userId,
        },
      };

      this.scheduledNotifications.set(notification.id, notification);
      console.log('Weekly prep reminder scheduled:', notification);
      return true;
    } catch (error) {
      console.error('Error scheduling weekly prep reminder:', error);
      return false;
    }
  }

  // Get all scheduled notifications for a user
  getScheduledNotifications(userId: string): NotificationScheduleOptions[] {
    return Array.from(this.scheduledNotifications.values()).filter(
      notification => 
        notification.data?.userId === userId ||
        notification.id.includes(userId)
    );
  }

  // Cancel all notifications for a user
  async cancelAllUserNotifications(userId: string): Promise<boolean> {
    try {
      const userNotifications = this.getScheduledNotifications(userId);
      
      for (const notification of userNotifications) {
        this.scheduledNotifications.delete(notification.id);
      }
      
      console.log(`Cancelled ${userNotifications.length} notifications for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling user notifications:', error);
      return false;
    }
  }

  // Helper method to get next reminder time for daily reminders
  private getNextReminderTime(hour: number, minute: number): Date {
    const now = new Date();
    const reminderTime = new Date();
    
    reminderTime.setHours(hour, minute, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    return reminderTime;
  }

  // Helper method to get next reminder time for weekly reminders
  private getNextWeeklyReminderTime(
    dayOfWeek: number,
    hour: number,
    minute: number
  ): Date {
    const now = new Date();
    const reminderTime = new Date();
    
    reminderTime.setHours(hour, minute, 0, 0);
    
    // Calculate days until target day of week
    const currentDayOfWeek = now.getDay();
    let daysUntilTarget = dayOfWeek - currentDayOfWeek;
    
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7; // Next week
    } else if (daysUntilTarget === 0 && reminderTime <= now) {
      daysUntilTarget = 7; // Same day but time passed, so next week
    }
    
    reminderTime.setDate(now.getDate() + daysUntilTarget);
    
    return reminderTime;
  }

  // Generate default reminder message based on meal type and time
  generateReminderMessage(
    mealType: MealType,
    recipeName?: string,
    minutesBefore: number = 30
  ): string {
    const mealTypeLabels = {
      breakfast: 'café da manhã',
      lunch: 'almoço',
      dinner: 'jantar',
      snack: 'lanche',
    };

    const mealLabel = mealTypeLabels[mealType];
    
    if (recipeName) {
      return `Em ${minutesBefore} minutos: ${recipeName} para o ${mealLabel}`;
    }
    
    return `Lembrete: ${mealLabel} em ${minutesBefore} minutos`;
  }

  // Check if notifications are enabled (mock implementation)
  async areNotificationsEnabled(): Promise<boolean> {
    // In a real app, you would check system notification permissions
    return true;
  }

  // Request notification permissions (mock implementation)
  async requestNotificationPermissions(): Promise<boolean> {
    try {
      // In a real app, you would request actual permissions
      Alert.alert(
        'Notificações',
        'Deseja receber lembretes sobre suas refeições planejadas?',
        [
          {text: 'Não', style: 'cancel'},
          {text: 'Sim', onPress: () => console.log('Notifications enabled')},
        ]
      );
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mealPlanNotifications = new MealPlanNotificationService();

// Helper functions for common notification scenarios
export const scheduleMealReminder = async (
  mealPlanItemId: string,
  mealType: MealType,
  scheduledTime: Date,
  minutesBefore: number = 30,
  recipeName?: string
): Promise<string | null> => {
  try {
    const reminderTime = new Date(scheduledTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

    const reminder: MealReminder = {
      id: `reminder_${mealPlanItemId}_${Date.now()}`,
      mealPlanItemId,
      reminderTime,
      message: mealPlanNotifications.generateReminderMessage(
        mealType,
        recipeName,
        minutesBefore
      ),
      isActive: true,
    };

    const success = await mealPlanNotifications.scheduleMealReminder(reminder);
    return success ? reminder.id : null;
  } catch (error) {
    console.error('Error scheduling meal reminder:', error);
    return null;
  }
};

export const scheduleDefaultReminders = async (userId: string): Promise<void> => {
  try {
    // Schedule daily planning reminder at 8 AM
    await mealPlanNotifications.scheduleDailyPlanningReminder(userId, {
      hour: 8,
      minute: 0,
    });

    // Schedule weekly prep reminder on Sunday at 6 PM
    await mealPlanNotifications.scheduleWeeklyPrepReminder(userId, 0, {
      hour: 18,
      minute: 0,
    });
  } catch (error) {
    console.error('Error scheduling default reminders:', error);
  }
};

export default mealPlanNotifications;