import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useCreateNotificationMutation,
  useSendTestNotificationMutation,
  useRegisterPushTokenMutation,
  useEnableAllNotificationsMutation,
  useDisableAllNotificationsMutation,
  useEnableEssentialNotificationsMutation,
  useGetNotificationStatsQuery,
  useRequestNotificationPermissionsMutation,
  useCheckNotificationPermissionsQuery,
} from '../services/notificationsApi';
import {
  UpdateNotificationSettingsRequest,
  CreateNotificationRequest,
  SendTestNotificationRequest,
  NotificationCategories,
  isQuietHoursActive,
} from '../types/notifications';

// Configurar comportamento padrão das notificações
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

export const useNotificationSettings = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useGetNotificationSettingsQuery();

  const [updateSettings, { isLoading: isUpdating }] = useUpdateNotificationSettingsMutation();
  const [enableAll, { isLoading: isEnabling }] = useEnableAllNotificationsMutation();
  const [disableAll, { isLoading: isDisabling }] = useDisableAllNotificationsMutation();
  const [enableEssential, { isLoading: isEnablingEssential }] = useEnableEssentialNotificationsMutation();

  const handleUpdateSettings = useCallback(async (data: UpdateNotificationSettingsRequest) => {
    try {
      const result = await updateSettings(data).unwrap();
      return { success: true, settings: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar configurações',
      };
    }
  }, [updateSettings]);

  const handleEnableAll = useCallback(async () => {
    try {
      const result = await enableAll().unwrap();
      return { success: true, settings: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao habilitar notificações',
      };
    }
  }, [enableAll]);

  const handleDisableAll = useCallback(async () => {
    try {
      const result = await disableAll().unwrap();
      return { success: true, settings: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao desabilitar notificações',
      };
    }
  }, [disableAll]);

  const handleEnableEssential = useCallback(async () => {
    try {
      const result = await enableEssential().unwrap();
      return { success: true, settings: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao configurar notificações essenciais',
      };
    }
  }, [enableEssential]);

  const isQuietTime = useMemo(() => {
    if (!settings?.quietHours) return false;
    return isQuietHoursActive(settings.quietHours);
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: handleUpdateSettings,
    enableAllNotifications: handleEnableAll,
    disableAllNotifications: handleDisableAll,
    enableEssentialNotifications: handleEnableEssential,
    isUpdating,
    isEnabling,
    isDisabling,
    isEnablingEssential,
    isQuietTime,
  };
};

export const useNotificationsList = (options: {
  page?: number;
  limit?: number;
  category?: string;
  read?: boolean;
} = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery(options);

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao marcar como lida',
      };
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead().unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao marcar todas como lidas',
      };
    }
  }, [markAllAsRead]);

  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao excluir notificação',
      };
    }
  }, [deleteNotification]);

  const handleClearAll = useCallback(async () => {
    try {
      await clearAll().unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao limpar notificações',
      };
    }
  }, [clearAll]);

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    clearAll: handleClearAll,
  };
};

export const useNotificationCreator = () => {
  const [createNotification, { isLoading: isCreating }] = useCreateNotificationMutation();
  const [sendTest, { isLoading: isSendingTest }] = useSendTestNotificationMutation();

  const handleCreate = useCallback(async (data: CreateNotificationRequest) => {
    try {
      const result = await createNotification(data).unwrap();
      return { success: true, notification: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao criar notificação',
      };
    }
  }, [createNotification]);

  const handleSendTest = useCallback(async (data: SendTestNotificationRequest) => {
    try {
      await sendTest(data).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao enviar notificação de teste',
      };
    }
  }, [sendTest]);

  return {
    createNotification: handleCreate,
    sendTestNotification: handleSendTest,
    isCreating,
    isSendingTest,
  };
};

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<any>(null);
  const [registerToken] = useRegisterPushTokenMutation();
  const [requestPermissions] = useRequestNotificationPermissionsMutation();
  const { data: permissionStatus } = useCheckNotificationPermissionsQuery();

  const registerForPushNotificationsAsync = useCallback(async () => {
    let token;

    console.log('Registrando para push notifications...');
    
    // Simulação para desenvolvimento
    // Em produção, usar bibliotecas específicas como @react-native-firebase/messaging
    
    // if (Platform.OS === 'android') {
    //   await Notifications.setNotificationChannelAsync('default', {
    //     name: 'default',
    //     importance: Notifications.AndroidImportance.MAX,
    //     vibrationPattern: [0, 250, 250, 250],
    //     lightColor: '#FF231F7C',
    //   });
    // }

    // if (Device.isDevice) {
    //   const { status: existingStatus } = await Notifications.getPermissionsAsync();
    //   let finalStatus = existingStatus;
      
    //   if (existingStatus !== 'granted') {
    //     const { status } = await Notifications.requestPermissionsAsync();
    //     finalStatus = status;
    //   }
      
    //   if (finalStatus !== 'granted') {
    //     Alert.alert(
    //       'Permissão Negada',
    //       'Não foi possível obter permissão para notificações push!'
    //     );
    //     return;
    //   }
      
    //   token = (await Notifications.getExpoPushTokenAsync({
    //     projectId: Constants.expoConfig?.extra?.eas?.projectId,
    //   })).data;
    // } else {
    //   Alert.alert('Erro', 'Deve usar um dispositivo físico para notificações push');
    // }

    // Simulação de token
    token = `mock_push_token_${Date.now()}`;

    if (token) {
      setExpoPushToken(token);
      
      // Registrar token no backend
      try {
        await registerToken({
          token,
          platform: Platform.OS as 'ios' | 'android',
          deviceId: 'mock_device_id',
          deviceName: 'Mock Device',
          appVersion: '1.0.0',
        }).unwrap();
      } catch (error) {
        console.error('Erro ao registrar push token:', error);
      }
    }

    return token;
  }, [registerToken]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    //   setNotification(notification);
    // });

    // const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    //   // Lidar com toque na notificação
    //   const data = response.notification.request.content.data;
    //   if (data?.actionUrl) {
    //     // Navegar para URL específica
    //     console.log('Navegando para:', data.actionUrl);
    //   }
    // });

    // return () => {
    //   Notifications.removeNotificationSubscription(notificationListener);
    //   Notifications.removeNotificationSubscription(responseListener);
    // };
  }, [registerForPushNotificationsAsync]);

  const schedulePushNotification = useCallback(async (
    title: string,
    body: string,
    data?: any,
    trigger?: any
  ) => {
    try {
      console.log('Agendando notificação push:', { title, body, data, trigger });
      
      // const id = await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title,
      //     body,
      //     data,
      //     sound: 'default',
      //   },
      //   trigger: trigger || { seconds: 1 },
      // });
      
      const mockId = `notification_${Date.now()}`;
      return { success: true, id: mockId };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao agendar notificação local',
      };
    }
  }, []);

  const cancelScheduledNotification = useCallback(async (notificationId: string) => {
    try {
      console.log('Cancelando notificação:', notificationId);
      // await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao cancelar notificação',
      };
    }
  }, []);

  const cancelAllScheduledNotifications = useCallback(async () => {
    try {
      console.log('Cancelando todas as notificações');
      // await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao cancelar todas as notificações',
      };
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const result = await requestPermissions().unwrap();
      return { success: true, ...result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao solicitar permissões',
      };
    }
  }, [requestPermissions]);

  return {
    expoPushToken,
    notification,
    permissionStatus,
    registerForPushNotifications: registerForPushNotificationsAsync,
    schedulePushNotification,
    cancelScheduledNotification,
    cancelAllScheduledNotifications,
    requestPermissions,
  };
};

export const useNotificationStats = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useGetNotificationStatsQuery({ period });

  const deliveryRate = useMemo(() => {
    if (!stats) return 0;
    return stats.deliveryRate;
  }, [stats]);

  const readRate = useMemo(() => {
    if (!stats) return 0;
    return stats.readRate;
  }, [stats]);

  const clickRate = useMemo(() => {
    if (!stats) return 0;
    return stats.clickRate;
  }, [stats]);

  const mostActiveCategory = useMemo(() => {
    if (!stats) return null;
    
    const categories = Object.entries(stats.sent);
    const sorted = categories.sort(([, a], [, b]) => b - a);
    
    return sorted[0] ? sorted[0][0] : null;
  }, [stats]);

  return {
    stats,
    deliveryRate,
    readRate,
    clickRate,
    mostActiveCategory,
    isLoading,
    error,
    refetch,
  };
};

export const useNotificationHelpers = () => {
  const { settings } = useNotificationSettings();

  const shouldShowNotification = useCallback((category: keyof NotificationCategories) => {
    if (!settings) return false;
    
    // Verificar se notificações estão habilitadas
    if (!settings.enabled) return false;
    
    // Verificar horário silencioso
    if (isQuietHoursActive(settings.quietHours)) return false;
    
    // Verificar se a categoria está habilitada
    return settings.push.categories[category] || settings.inApp.categories[category];
  }, [settings]);

  const getNotificationSound = useCallback((category: keyof NotificationCategories) => {
    if (!settings?.sound.enabled) return null;
    
    return settings.sound.customSounds[category] || 'default';
  }, [settings]);

  const shouldVibrate = useCallback(() => {
    return settings?.sound.vibration || false;
  }, [settings]);

  const getNotificationPriority = useCallback((category: keyof NotificationCategories) => {
    // Definir prioridades baseadas na categoria
    const highPriorityCategories: (keyof NotificationCategories)[] = [
      'timerAlerts',
      'temperatureAlerts',
      'securityAlerts',
    ];
    
    const mediumPriorityCategories: (keyof NotificationCategories)[] = [
      'mealReminders',
      'cookingStepReminders',
      'shoppingListReminders',
    ];
    
    if (highPriorityCategories.includes(category)) return 'high';
    if (mediumPriorityCategories.includes(category)) return 'normal';
    
    return 'low';
  }, []);

  return {
    shouldShowNotification,
    getNotificationSound,
    shouldVibrate,
    getNotificationPriority,
  };
};