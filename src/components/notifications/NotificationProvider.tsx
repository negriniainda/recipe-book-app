import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import InAppNotification from './InAppNotification';
import { useNotificationSettings, usePushNotifications } from '../../hooks/useNotifications';
import {
  Notification,
  CreateNotificationRequest,
  generateNotificationId,
} from '../../types/notifications';

interface NotificationContextType {
  showNotification: (notification: CreateNotificationRequest) => void;
  hideNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 3,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { settings } = useNotificationSettings();
  const { notification: pushNotification } = usePushNotifications();

  // Escutar notificações push recebidas
  useEffect(() => {
    if (pushNotification && settings?.inApp.enabled) {
      const inAppNotification: Notification = {
        id: generateNotificationId(),
        userId: 'current-user', // Seria obtido do estado de auth
        type: 'in_app',
        category: 'systemUpdates', // Categoria padrão para push
        title: pushNotification.request.content.title || 'Notificação',
        body: pushNotification.request.content.body || '',
        data: pushNotification.request.content.data,
        priority: 'normal',
        scheduled: false,
        sent: true,
        sentAt: new Date().toISOString(),
        read: false,
        clicked: false,
        createdAt: new Date().toISOString(),
      };

      showNotification(inAppNotification);
    }
  }, [pushNotification, settings]);

  const showNotification = useCallback((notificationData: CreateNotificationRequest | Notification) => {
    // Verificar se notificações in-app estão habilitadas
    if (!settings?.inApp.enabled) return;

    // Verificar se a categoria está habilitada
    if (!settings.inApp.categories[notificationData.category]) return;

    // Criar notificação completa se necessário
    const notification: Notification = 'id' in notificationData ? notificationData : {
      id: generateNotificationId(),
      userId: 'current-user',
      type: 'in_app',
      category: notificationData.category,
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data,
      imageUrl: notificationData.imageUrl,
      actionUrl: notificationData.actionUrl,
      actions: notificationData.actions,
      priority: notificationData.priority || 'normal',
      scheduled: notificationData.scheduled || false,
      scheduledFor: notificationData.scheduledFor,
      sent: true,
      sentAt: new Date().toISOString(),
      read: false,
      clicked: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => {
      const updated = [notification, ...prev];
      // Limitar número máximo de notificações
      return updated.slice(0, maxNotifications);
    });
  }, [settings, maxNotifications]);

  const hideNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Marcar como clicada
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, clicked: true, clickedAt: new Date().toISOString() }
          : n
      )
    );

    // Navegar para URL se especificada
    if (notification.actionUrl) {
      // Implementar navegação
      console.log('Navegando para:', notification.actionUrl);
    }

    // Remover notificação após clique
    setTimeout(() => {
      hideNotification(notification.id);
    }, 300);
  }, [hideNotification]);

  const handleNotificationDismiss = useCallback((notification: Notification) => {
    hideNotification(notification.id);
  }, [hideNotification]);

  const handleNotificationAction = useCallback((notification: Notification, actionId: string) => {
    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) return;

    // Executar ação
    switch (action.action) {
      case 'open_app':
        // App já está aberto
        break;
      case 'open_url':
        if (action.data?.url) {
          console.log('Abrindo URL:', action.data.url);
        }
        break;
      case 'dismiss':
        // Apenas dismiss
        break;
      case 'snooze':
        // Reagendar notificação
        const snoozeMinutes = action.data?.minutes || 10;
        setTimeout(() => {
          showNotification(notification);
        }, snoozeMinutes * 60 * 1000);
        break;
      case 'custom':
        // Ação customizada
        console.log('Ação customizada:', action.data);
        break;
    }

    hideNotification(notification.id);
  }, [showNotification, hideNotification]);

  const contextValue: NotificationContextType = {
    showNotification,
    hideNotification,
    clearAllNotifications,
    notifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      <View style={styles.container}>
        {children}
        
        {/* Renderizar notificações in-app */}
        {notifications.map((notification, index) => (
          <InAppNotification
            key={notification.id}
            notification={notification}
            position={settings?.inApp.position || 'top'}
            duration={settings?.inApp.duration || 5000}
            onPress={handleNotificationPress}
            onDismiss={handleNotificationDismiss}
            onAction={handleNotificationAction}
          />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};

// Hook para mostrar notificações facilmente
export const useShowNotification = () => {
  const { showNotification } = useNotificationContext();

  const showSuccess = useCallback((title: string, body: string, data?: any) => {
    showNotification({
      type: 'in_app',
      category: 'systemUpdates',
      title,
      body,
      data,
      priority: 'normal',
    });
  }, [showNotification]);

  const showError = useCallback((title: string, body: string, data?: any) => {
    showNotification({
      type: 'in_app',
      category: 'securityAlerts',
      title,
      body,
      data,
      priority: 'high',
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, body: string, data?: any) => {
    showNotification({
      type: 'in_app',
      category: 'systemUpdates',
      title,
      body,
      data,
      priority: 'low',
    });
  }, [showNotification]);

  const showMealReminder = useCallback((title: string, body: string, data?: any) => {
    showNotification({
      type: 'in_app',
      category: 'mealReminders',
      title,
      body,
      data,
      priority: 'normal',
    });
  }, [showNotification]);

  const showTimerAlert = useCallback((title: string, body: string, data?: any) => {
    showNotification({
      type: 'in_app',
      category: 'timerAlerts',
      title,
      body,
      data,
      priority: 'high',
    });
  }, [showNotification]);

  const showCommunityUpdate = useCallback((title: string, body: string, data?: any) => {
    showNotification({
      type: 'in_app',
      category: 'communityUpdates',
      title,
      body,
      data,
      priority: 'low',
    });
  }, [showNotification]);

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showMealReminder,
    showTimerAlert,
    showCommunityUpdate,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NotificationProvider;