export interface NotificationSettings {
  id: string;
  userId: string;
  
  // Configurações gerais
  enabled: boolean;
  quietHours: QuietHours;
  
  // Notificações push
  push: PushNotificationSettings;
  
  // Notificações por email
  email: EmailNotificationSettings;
  
  // Notificações in-app
  inApp: InAppNotificationSettings;
  
  // Configurações de som e vibração
  sound: SoundSettings;
  
  createdAt: string;
  updatedAt: string;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  weekdays: number[]; // 0-6 (Sunday-Saturday)
}

export interface PushNotificationSettings {
  enabled: boolean;
  token?: string;
  categories: NotificationCategories;
  priority: 'low' | 'normal' | 'high';
  grouping: boolean;
  badge: boolean;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  categories: NotificationCategories;
  digest: boolean;
  unsubscribeToken?: string;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  categories: NotificationCategories;
  position: 'top' | 'bottom' | 'center';
  duration: number; // milliseconds
  animation: boolean;
}

export interface NotificationCategories {
  // Planejamento de refeições
  mealReminders: boolean;
  mealPlanUpdates: boolean;
  shoppingListReminders: boolean;
  
  // Modo cozinha
  timerAlerts: boolean;
  cookingStepReminders: boolean;
  temperatureAlerts: boolean;
  
  // Comunidade
  newFollowers: boolean;
  comments: boolean;
  likes: boolean;
  mentions: boolean;
  communityUpdates: boolean;
  
  // Receitas
  recipeUpdates: boolean;
  newRecipeSuggestions: boolean;
  favoriteRecipeUpdates: boolean;
  
  // Sistema
  systemUpdates: boolean;
  securityAlerts: boolean;
  backupReminders: boolean;
  
  // Marketing
  promotions: boolean;
  newsletters: boolean;
  tips: boolean;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 - 1.0
  vibration: boolean;
  customSounds: Record<string, string>; // category -> sound file
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: keyof NotificationCategories;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  actions?: NotificationAction[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled: boolean;
  scheduledFor?: string;
  sent: boolean;
  sentAt?: string;
  read: boolean;
  readAt?: string;
  clicked: boolean;
  clickedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  action: 'open_app' | 'open_url' | 'dismiss' | 'snooze' | 'custom';
  data?: Record<string, any>;
}

export type NotificationType = 'push' | 'email' | 'in_app' | 'sms';

export interface NotificationTemplate {
  id: string;
  name: string;
  category: keyof NotificationCategories;
  type: NotificationType;
  title: string;
  body: string;
  variables: string[];
  defaultData?: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSchedule {
  id: string;
  userId: string;
  templateId: string;
  type: 'one_time' | 'recurring';
  scheduledFor: string;
  recurrence?: RecurrencePattern;
  data: Record<string, any>;
  active: boolean;
  lastSent?: string;
  nextSend?: string;
  createdAt: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  daysOfWeek?: number[]; // for weekly
  dayOfMonth?: number; // for monthly
  endDate?: string;
  maxOccurrences?: number;
}

export interface NotificationStats {
  id: string;
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  periodStart: string;
  periodEnd: string;
  
  sent: NotificationCategoryStats;
  delivered: NotificationCategoryStats;
  read: NotificationCategoryStats;
  clicked: NotificationCategoryStats;
  
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  
  deliveryRate: number; // percentage
  readRate: number; // percentage
  clickRate: number; // percentage
  
  createdAt: string;
}

export interface NotificationCategoryStats {
  mealReminders: number;
  mealPlanUpdates: number;
  shoppingListReminders: number;
  timerAlerts: number;
  cookingStepReminders: number;
  temperatureAlerts: number;
  newFollowers: number;
  comments: number;
  likes: number;
  mentions: number;
  communityUpdates: number;
  recipeUpdates: number;
  newRecipeSuggestions: number;
  favoriteRecipeUpdates: number;
  systemUpdates: number;
  securityAlerts: number;
  backupReminders: number;
  promotions: number;
  newsletters: number;
  tips: number;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  deviceName?: string;
  appVersion: string;
  active: boolean;
  lastUsed: string;
  createdAt: string;
}

// Tipos para APIs
export interface UpdateNotificationSettingsRequest {
  enabled?: boolean;
  quietHours?: Partial<QuietHours>;
  push?: Partial<PushNotificationSettings>;
  email?: Partial<EmailNotificationSettings>;
  inApp?: Partial<InAppNotificationSettings>;
  sound?: Partial<SoundSettings>;
}

export interface CreateNotificationRequest {
  type: NotificationType;
  category: keyof NotificationCategories;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  actions?: NotificationAction[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduled?: boolean;
  scheduledFor?: string;
  targetUsers?: string[];
}

export interface ScheduleNotificationRequest {
  templateId: string;
  type: 'one_time' | 'recurring';
  scheduledFor: string;
  recurrence?: RecurrencePattern;
  data: Record<string, any>;
}

export interface RegisterPushTokenRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  deviceName?: string;
  appVersion: string;
}

export interface SendTestNotificationRequest {
  type: NotificationType;
  category: keyof NotificationCategories;
  title?: string;
  body?: string;
}

// Estados para gerenciamento
export interface NotificationState {
  settings: NotificationSettings | null;
  notifications: Notification[];
  unreadCount: number;
  templates: NotificationTemplate[];
  schedules: NotificationSchedule[];
  stats: NotificationStats | null;
  pushTokens: PushToken[];
  loading: boolean;
  error: string | null;
}

// Constantes
export const NOTIFICATION_CATEGORIES = [
  { key: 'mealReminders', label: 'Lembretes de Refeição', icon: 'alarm', color: '#ff9800' },
  { key: 'mealPlanUpdates', label: 'Atualizações do Plano', icon: 'calendar', color: '#2196f3' },
  { key: 'shoppingListReminders', label: 'Lista de Compras', icon: 'shopping', color: '#4caf50' },
  { key: 'timerAlerts', label: 'Alertas de Timer', icon: 'timer', color: '#f44336' },
  { key: 'cookingStepReminders', label: 'Passos de Cozinha', icon: 'chef-hat', color: '#ff5722' },
  { key: 'temperatureAlerts', label: 'Alertas de Temperatura', icon: 'thermometer', color: '#e91e63' },
  { key: 'newFollowers', label: 'Novos Seguidores', icon: 'account-plus', color: '#9c27b0' },
  { key: 'comments', label: 'Comentários', icon: 'comment', color: '#607d8b' },
  { key: 'likes', label: 'Curtidas', icon: 'heart', color: '#e91e63' },
  { key: 'mentions', label: 'Menções', icon: 'at', color: '#795548' },
  { key: 'communityUpdates', label: 'Comunidade', icon: 'account-group', color: '#3f51b5' },
  { key: 'recipeUpdates', label: 'Receitas', icon: 'book-open', color: '#ff9800' },
  { key: 'newRecipeSuggestions', label: 'Sugestões', icon: 'lightbulb', color: '#ffeb3b' },
  { key: 'favoriteRecipeUpdates', label: 'Favoritos', icon: 'star', color: '#ffc107' },
  { key: 'systemUpdates', label: 'Sistema', icon: 'cog', color: '#9e9e9e' },
  { key: 'securityAlerts', label: 'Segurança', icon: 'shield', color: '#f44336' },
  { key: 'backupReminders', label: 'Backup', icon: 'backup-restore', color: '#607d8b' },
  { key: 'promotions', label: 'Promoções', icon: 'tag', color: '#4caf50' },
  { key: 'newsletters', label: 'Newsletter', icon: 'email-newsletter', color: '#2196f3' },
  { key: 'tips', label: 'Dicas', icon: 'lightbulb-on', color: '#ff9800' },
] as const;

export const NOTIFICATION_PRIORITIES = [
  { value: 'low', label: 'Baixa', color: '#9e9e9e' },
  { value: 'normal', label: 'Normal', color: '#2196f3' },
  { value: 'high', label: 'Alta', color: '#ff9800' },
  { value: 'urgent', label: 'Urgente', color: '#f44336' },
] as const;

export const EMAIL_FREQUENCIES = [
  { value: 'immediate', label: 'Imediato', description: 'Receber emails instantaneamente' },
  { value: 'hourly', label: 'A cada hora', description: 'Resumo a cada hora' },
  { value: 'daily', label: 'Diário', description: 'Resumo diário às 9h' },
  { value: 'weekly', label: 'Semanal', description: 'Resumo semanal às segundas' },
] as const;

export const QUIET_HOURS_PRESETS = [
  { name: 'Noite', startTime: '22:00', endTime: '08:00' },
  { name: 'Trabalho', startTime: '09:00', endTime: '17:00' },
  { name: 'Almoço', startTime: '12:00', endTime: '13:00' },
  { name: 'Personalizado', startTime: '00:00', endTime: '00:00' },
] as const;

// Utilitários
export const getCategoryInfo = (category: keyof NotificationCategories) => {
  return NOTIFICATION_CATEGORIES.find(cat => cat.key === category);
};

export const getPriorityInfo = (priority: string) => {
  return NOTIFICATION_PRIORITIES.find(p => p.value === priority);
};

export const getEmailFrequencyInfo = (frequency: string) => {
  return EMAIL_FREQUENCIES.find(f => f.value === frequency);
};

export const isQuietHoursActive = (quietHours: QuietHours, now: Date = new Date()): boolean => {
  if (!quietHours.enabled) return false;
  
  const currentDay = now.getDay();
  if (!quietHours.weekdays.includes(currentDay)) return false;
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (quietHours.startTime > quietHours.endTime) {
    return currentTime >= quietHours.startTime || currentTime <= quietHours.endTime;
  }
  
  return currentTime >= quietHours.startTime && currentTime <= quietHours.endTime;
};

export const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

export const generateNotificationId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const validateNotificationData = (notification: Partial<Notification>): string[] => {
  const errors: string[] = [];
  
  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Título é obrigatório');
  }
  
  if (!notification.body || notification.body.trim().length === 0) {
    errors.push('Corpo da mensagem é obrigatório');
  }
  
  if (notification.title && notification.title.length > 100) {
    errors.push('Título deve ter no máximo 100 caracteres');
  }
  
  if (notification.body && notification.body.length > 500) {
    errors.push('Corpo deve ter no máximo 500 caracteres');
  }
  
  if (notification.scheduledFor) {
    const scheduledDate = new Date(notification.scheduledFor);
    if (scheduledDate <= new Date()) {
      errors.push('Data de agendamento deve ser no futuro');
    }
  }
  
  return errors;
};