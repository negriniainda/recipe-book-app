import React, {useEffect, useCallback} from 'react';
import {Alert, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {MealPlan, MealPlanNotification} from '../../types/mealPlanning';

interface MealPlanNotificationsProps {
  mealPlans: MealPlan[];
  onNotificationPress?: (mealPlanId: string) => void;
}

const MealPlanNotifications: React.FC<MealPlanNotificationsProps> = ({
  mealPlans,
  onNotificationPress,
}) => {
  
  useEffect(() => {
    // Configure push notifications
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'meal-planning',
          channelName: 'Meal Planning',
          channelDescription: 'Notifications for meal planning reminders',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Meal planning channel created: ${created}`)
      );
    }

    // Request permissions
    PushNotification.requestPermissions();
  }, []);

  const scheduleMealReminder = useCallback((mealPlan: MealPlan) => {
    const mealDate = new Date(mealPlan.date);
    const reminderTime = new Date(mealDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    
    if (reminderTime > new Date()) {
      PushNotification.localNotificationSchedule({
        id: `meal-${mealPlan.id}`,
        channelId: 'meal-planning',
        title: 'Lembrete de Refeição',
        message: `Hora de preparar: ${getMealTypeName(mealPlan.mealType)}`,
        date: reminderTime,
        allowWhileIdle: true,
        userInfo: {
          mealPlanId: mealPlan.id,
          type: 'meal-reminder',
        },
      });
    }
  }, []);

  const scheduleShoppingReminder = useCallback((mealPlans: MealPlan[]) => {
    // Schedule shopping reminder for the day before the first meal
    const sortedMeals = mealPlans
      .filter(meal => new Date(meal.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedMeals.length > 0) {
      const firstMealDate = new Date(sortedMeals[0].date);
      const shoppingReminderTime = new Date(firstMealDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
      
      if (shoppingReminderTime > new Date()) {
        PushNotification.localNotificationSchedule({
          id: 'shopping-reminder',
          channelId: 'meal-planning',
          title: 'Lista de Compras',
          message: `Não esqueça de fazer as compras para suas refeições planejadas!`,
          date: shoppingReminderTime,
          allowWhileIdle: true,
          userInfo: {
            type: 'shopping-reminder',
            mealCount: sortedMeals.length,
          },
        });
      }
    }
  }, []);

  const schedulePrepReminder = useCallback((mealPlan: MealPlan) => {
    // Schedule prep reminder based on recipe prep time
    const mealDate = new Date(mealPlan.date);
    const prepTime = 60; // TODO: Get actual prep time from recipe
    const prepReminderTime = new Date(mealDate.getTime() - (prepTime + 15) * 60 * 1000);
    
    if (prepReminderTime > new Date()) {
      PushNotification.localNotificationSchedule({
        id: `prep-${mealPlan.id}`,
        channelId: 'meal-planning',
        title: 'Hora de Preparar',
        message: `Comece a preparar: ${getMealTypeName(mealPlan.mealType)}`,
        date: prepReminderTime,
        allowWhileIdle: true,
        userInfo: {
          mealPlanId: mealPlan.id,
          type: 'prep-reminder',
        },
      });
    }
  }, []);

  const cancelMealNotifications = useCallback((mealPlanId: string) => {
    PushNotification.cancelLocalNotifications({
      id: `meal-${mealPlanId}`,
    });
    PushNotification.cancelLocalNotifications({
      id: `prep-${mealPlanId}`,
    });
  }, []);

  const scheduleAllNotifications = useCallback(() => {
    // Clear existing notifications
    PushNotification.cancelAllLocalNotifications();

    // Schedule notifications for all upcoming meals
    const upcomingMeals = mealPlans.filter(meal => 
      new Date(meal.date) > new Date() && !meal.completed
    );

    upcomingMeals.forEach(meal => {
      scheduleMealReminder(meal);
      schedulePrepReminder(meal);
    });

    // Schedule shopping reminder
    scheduleShoppingReminder(upcomingMeals);
  }, [mealPlans, scheduleMealReminder, schedulePrepReminder, scheduleShoppingReminder]);

  useEffect(() => {
    scheduleAllNotifications();
  }, [scheduleAllNotifications]);

  useEffect(() => {
    // Handle notification press
    const handleNotificationPress = (notification: any) => {
      const {mealPlanId, type} = notification.userInfo || {};
      
      if (mealPlanId && onNotificationPress) {
        onNotificationPress(mealPlanId);
      }

      // Handle different notification types
      switch (type) {
        case 'meal-reminder':
          Alert.alert(
            'Lembrete de Refeição',
            'Está na hora de preparar sua refeição!',
            [
              {text: 'Marcar como Concluída', onPress: () => {/* TODO: Mark as completed */}},
              {text: 'Lembrar em 15 min', onPress: () => {/* TODO: Snooze */}},
              {text: 'OK', style: 'cancel'},
            ]
          );
          break;
        case 'prep-reminder':
          Alert.alert(
            'Hora de Preparar',
            'Comece a preparar sua refeição agora!',
            [
              {text: 'Ver Receita', onPress: () => onNotificationPress?.(mealPlanId)},
              {text: 'OK', style: 'cancel'},
            ]
          );
          break;
        case 'shopping-reminder':
          Alert.alert(
            'Lista de Compras',
            'Não esqueça de fazer as compras para suas refeições planejadas!',
            [
              {text: 'Ver Lista', onPress: () => {/* TODO: Navigate to shopping list */}},
              {text: 'OK', style: 'cancel'},
            ]
          );
          break;
      }
    };

    PushNotification.configure({
      onNotification: handleNotificationPress,
      requestPermissions: Platform.OS === 'ios',
    });

    return () => {
      // Cleanup if needed
    };
  }, [onNotificationPress]);

  // This component doesn't render anything visible
  return null;
};

function getMealTypeName(mealType: string): string {
  const names = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
  };
  return names[mealType as keyof typeof names] || mealType;
}

export default MealPlanNotifications;