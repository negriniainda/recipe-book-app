import { Platform, Alert } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';

// Configuração do Firebase Cloud Messaging
export class FirebaseNotificationService {
    private static instance: FirebaseNotificationService;
    private pushToken: string | null = null;

    static getInstance(): FirebaseNotificationService {
        if (!FirebaseNotificationService.instance) {
            FirebaseNotificationService.instance = new FirebaseNotificationService();
        }
        return FirebaseNotificationService.instance;
    }

    async initialize() {
        // Configurar canais de notificação para Android
        if (Platform.OS === 'android') {
            await this.setupAndroidChannels();
        }

        // Configurar handler de notificações
        // Notifications.setNotificationHandler({
        //   handleNotification: async (notification: any) => {
        //     const category = notification.request.content.data?.category || 'default';

        //     return {
        //       shouldShowAlert: true,
        //       shouldPlaySound: this.shouldPlaySound(category),
        //       shouldSetBadge: true,
        //     };
        //   },
        // });

        // Registrar para push notifications
        await this.registerForPushNotifications();
    }

    private async setupAndroidChannels() {
        // Canal para lembretes de refeição
        // await Notifications.setNotificationChannelAsync('meal-reminders', {
        //   name: 'Lembretes de Refeição',
        //   description: 'Notificações para lembretes de refeições planejadas',
        //   importance: Notifications.AndroidImportance.HIGH,
        //   vibrationPattern: [0, 250, 250, 250],
        //   lightColor: '#FF9800',
        //   sound: 'meal_reminder.wav',
        // });

        // Canal para alertas de timer
        // await Notifications.setNotificationChannelAsync('timer-alerts', {
        //   name: 'Alertas de Timer',
        //   description: 'Alertas quando timers de cozinha terminam',
        //   importance: Notifications.AndroidImportance.MAX,
        //   vibrationPattern: [0, 500, 200, 500],
        //   lightColor: '#F44336',
        //   sound: 'timer_alert.wav',
        // });

        // // Canal para atividade da comunidade
        // await Notifications.setNotificationChannelAsync('community', {
        //   name: 'Comunidade',
        //   description: 'Notificações sobre atividade da comunidade',
        //   importance: Notifications.AndroidImportance.DEFAULT,
        //   vibrationPattern: [0, 250],
        //   lightColor: '#2196F3',
        // });

        // // Canal para atualizações do sistema
        // await Notifications.setNotificationChannelAsync('system', {
        //   name: 'Sistema',
        //   description: 'Atualizações e alertas do sistema',
        //   importance: Notifications.AndroidImportance.LOW,
        //   vibrationPattern: [0, 100],
        //   lightColor: '#9E9E9E',
        // });

        // // Canal padrão
        // await Notifications.setNotificationChannelAsync('default', {
        //   name: 'Geral',
        //   description: 'Notificações gerais',
        //   importance: Notifications.AndroidImportance.DEFAULT,
        //   vibrationPattern: [0, 250, 250, 250],
        //   lightColor: '#2196F3',
        // });
    }

    private async registerForPushNotifications(): Promise<string | null> {
        try {
            // Simulação para desenvolvimento - em produção usar bibliotecas específicas
            console.log('Registrando para push notifications...');

            // Em produção, usar:
            // const { status: existingStatus } = await Notifications.getPermissionsAsync();
            // let finalStatus = existingStatus;

            // if (existingStatus !== 'granted') {
            //   const { status } = await Notifications.requestPermissionsAsync();
            //   finalStatus = status;
            // }

            // if (finalStatus !== 'granted') {
            //   console.warn('Permissão para notificações push negada');
            //   return null;
            // }

            // const token = (await Notifications.getExpoPushTokenAsync({
            //   projectId: Constants.expoConfig?.extra?.eas?.projectId,
            // })).data;

            const mockToken = `mock_token_${Date.now()}`;
            this.pushToken = mockToken;
            return mockToken;
        } catch (error) {
            console.error('Erro ao registrar para push notifications:', error);
            return null;
        }
    }

    private shouldPlaySound(category: string): boolean {
        // Categorias que devem sempre tocar som
        const soundCategories = [
            'timerAlerts',
            'temperatureAlerts',
            'mealReminders',
            'securityAlerts',
        ];

        return soundCategories.includes(category);
    }

    private getChannelId(category: string): string {
        switch (category) {
            case 'mealReminders':
            case 'mealPlanUpdates':
            case 'shoppingListReminders':
                return 'meal-reminders';

            case 'timerAlerts':
            case 'cookingStepReminders':
            case 'temperatureAlerts':
                return 'timer-alerts';

            case 'newFollowers':
            case 'comments':
            case 'likes':
            case 'mentions':
            case 'communityUpdates':
                return 'community';

            case 'systemUpdates':
            case 'securityAlerts':
            case 'backupReminders':
                return 'system';

            default:
                return 'default';
        }
    }

    async scheduleLocalNotification(
        title: string,
        body: string,
        data: any = {},
        trigger: any = { seconds: 1 }
    ): Promise<string | null> {
        try {
            const category = data.category || 'default';
            const channelId = this.getChannelId(category);

            console.log('Agendando notificação local:', { title, body, category, channelId });

            // Em produção, usar:
            // const notificationId = await Notifications.scheduleNotificationAsync({
            //   content: {
            //     title,
            //     body,
            //     data,
            //     sound: this.shouldPlaySound(category) ? 'default' : undefined,
            //     ...(Platform.OS === 'android' && { channelId }),
            //   },
            //   trigger,
            // });

            const mockNotificationId = `notification_${Date.now()}`;
            return mockNotificationId;
        } catch (error) {
            console.error('Erro ao agendar notificação local:', error);
            return null;
        }
    }

    async scheduleMealReminder(
        mealName: string,
        mealTime: Date,
        recipeNames: string[]
    ): Promise<string | null> {
        const title = `Hora do ${mealName}! 🍽️`;
        const body = recipeNames.length > 0
            ? `Você planejou: ${recipeNames.join(', ')}`
            : 'Não esqueça de se alimentar!';

        return this.scheduleLocalNotification(
            title,
            body,
            {
                category: 'mealReminders',
                mealName,
                recipeNames,
                actionUrl: '/meal-planning',
            },
            { date: mealTime }
        );
    }

    async scheduleTimerAlert(
        timerName: string,
        duration: number
    ): Promise<string | null> {
        const title = `Timer Finalizado! ⏰`;
        const body = `${timerName} - ${duration} minutos`;

        return this.scheduleLocalNotification(
            title,
            body,
            {
                category: 'timerAlerts',
                timerName,
                duration,
                actionUrl: '/cooking-mode',
            },
            { seconds: duration * 60 }
        );
    }

    async scheduleShoppingReminder(
        itemCount: number,
        scheduledFor: Date
    ): Promise<string | null> {
        const title = `Lista de Compras 🛒`;
        const body = `Você tem ${itemCount} itens na sua lista de compras`;

        return this.scheduleLocalNotification(
            title,
            body,
            {
                category: 'shoppingListReminders',
                itemCount,
                actionUrl: '/shopping-list',
            },
            { date: scheduledFor }
        );
    }

    async cancelNotification(notificationId: string): Promise<void> {
        try {
            console.log('Cancelando notificação:', notificationId);
            // await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Erro ao cancelar notificação:', error);
        }
    }

    async cancelAllNotifications(): Promise<void> {
        try {
            console.log('Cancelando todas as notificações');
            // await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Erro ao cancelar todas as notificações:', error);
        }
    }

    async getScheduledNotifications(): Promise<any[]> {
        try {
            console.log('Obtendo notificações agendadas');
            // return await Notifications.getAllScheduledNotificationsAsync();
            return [];
        } catch (error) {
            console.error('Erro ao obter notificações agendadas:', error);
            return [];
        }
    }

    getPushToken(): string | null {
        return this.pushToken;
    }

    // Listener para notificações recebidas
    addNotificationReceivedListener(
        listener: (notification: any) => void
    ): any {
        console.log('Adicionando listener para notificações recebidas');
        // return Notifications.addNotificationReceivedListener(listener);
        return { remove: () => console.log('Removendo listener') };
    }

    // Listener para resposta a notificações
    addNotificationResponseReceivedListener(
        listener: (response: any) => void
    ): any {
        console.log('Adicionando listener para resposta a notificações');
        // return Notifications.addNotificationResponseReceivedListener(listener);
        return { remove: () => console.log('Removendo listener') };
    }

    // Remover listener
    removeNotificationSubscription(subscription: any): void {
        console.log('Removendo subscription de notificação');
        // Notifications.removeNotificationSubscription(subscription);
        if (subscription?.remove) {
            subscription.remove();
        }
    }

    // Definir badge count
    async setBadgeCount(count: number): Promise<void> {
        try {
            console.log('Definindo badge count:', count);
            // await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Erro ao definir badge count:', error);
        }
    }

    // Obter badge count
    async getBadgeCount(): Promise<number> {
        try {
            console.log('Obtendo badge count');
            // return await Notifications.getBadgeCountAsync();
            return 0;
        } catch (error) {
            console.error('Erro ao obter badge count:', error);
            return 0;
        }
    }
}

// Instância singleton
export const firebaseNotificationService = FirebaseNotificationService.getInstance();