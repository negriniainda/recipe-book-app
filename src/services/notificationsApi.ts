import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  NotificationSettings,
  Notification,
  NotificationTemplate,
  NotificationSchedule,
  NotificationStats,
  PushToken,
  UpdateNotificationSettingsRequest,
  CreateNotificationRequest,
  ScheduleNotificationRequest,
  RegisterPushTokenRequest,
  SendTestNotificationRequest,
} from '../types/notifications';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/notifications',
    prepareHeaders: (headers, { getState }) => {
      // Adicionar token de autenticação
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Settings', 'Notification', 'Template', 'Schedule', 'Stats', 'PushToken'],
  endpoints: (builder) => ({
    // Configurações de notificação
    getNotificationSettings: builder.query<NotificationSettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),

    updateNotificationSettings: builder.mutation<
      NotificationSettings,
      UpdateNotificationSettingsRequest
    >({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    resetNotificationSettings: builder.mutation<NotificationSettings, void>({
      query: () => ({
        url: '/settings/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Notificações
    getNotifications: builder.query<
      { notifications: Notification[]; hasMore: boolean; unreadCount: number },
      { page?: number; limit?: number; category?: string; read?: boolean }
    >({
      query: ({ page = 1, limit = 20, category, read }) => ({
        url: '/notifications',
        params: {
          page,
          limit,
          ...(category && { category }),
          ...(read !== undefined && { read }),
        },
      }),
      providesTags: ['Notification'],
    }),

    getNotificationById: builder.query<Notification, string>({
      query: (notificationId) => `/notifications/${notificationId}`,
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    markNotificationAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    clearAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/clear',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Criar e enviar notificações
    createNotification: builder.mutation<Notification, CreateNotificationRequest>({
      query: (data) => ({
        url: '/notifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    sendNotification: builder.mutation<void, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `/notifications/${notificationId}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    sendTestNotification: builder.mutation<void, SendTestNotificationRequest>({
      query: (data) => ({
        url: '/notifications/test',
        method: 'POST',
        body: data,
      }),
    }),

    // Templates de notificação
    getNotificationTemplates: builder.query<
      { templates: NotificationTemplate[]; hasMore: boolean },
      { page?: number; limit?: number; category?: string; active?: boolean }
    >({
      query: ({ page = 1, limit = 50, category, active }) => ({
        url: '/templates',
        params: {
          page,
          limit,
          ...(category && { category }),
          ...(active !== undefined && { active }),
        },
      }),
      providesTags: ['Template'],
    }),

    getNotificationTemplateById: builder.query<NotificationTemplate, string>({
      query: (templateId) => `/templates/${templateId}`,
      providesTags: (result, error, id) => [{ type: 'Template', id }],
    }),

    createNotificationTemplate: builder.mutation<
      NotificationTemplate,
      Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: (data) => ({
        url: '/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),

    updateNotificationTemplate: builder.mutation<
      NotificationTemplate,
      { templateId: string; data: Partial<NotificationTemplate> }
    >({
      query: ({ templateId, data }) => ({
        url: `/templates/${templateId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),

    deleteNotificationTemplate: builder.mutation<void, string>({
      query: (templateId) => ({
        url: `/templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),

    // Agendamento de notificações
    getNotificationSchedules: builder.query<
      { schedules: NotificationSchedule[]; hasMore: boolean },
      { page?: number; limit?: number; active?: boolean }
    >({
      query: ({ page = 1, limit = 20, active }) => ({
        url: '/schedules',
        params: {
          page,
          limit,
          ...(active !== undefined && { active }),
        },
      }),
      providesTags: ['Schedule'],
    }),

    scheduleNotification: builder.mutation<
      NotificationSchedule,
      ScheduleNotificationRequest
    >({
      query: (data) => ({
        url: '/schedules',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),

    updateNotificationSchedule: builder.mutation<
      NotificationSchedule,
      { scheduleId: string; data: Partial<NotificationSchedule> }
    >({
      query: ({ scheduleId, data }) => ({
        url: `/schedules/${scheduleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),

    deleteNotificationSchedule: builder.mutation<void, string>({
      query: (scheduleId) => ({
        url: `/schedules/${scheduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedule'],
    }),

    pauseNotificationSchedule: builder.mutation<NotificationSchedule, string>({
      query: (scheduleId) => ({
        url: `/schedules/${scheduleId}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['Schedule'],
    }),

    resumeNotificationSchedule: builder.mutation<NotificationSchedule, string>({
      query: (scheduleId) => ({
        url: `/schedules/${scheduleId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['Schedule'],
    }),

    // Push tokens
    getPushTokens: builder.query<PushToken[], void>({
      query: () => '/push-tokens',
      providesTags: ['PushToken'],
    }),

    registerPushToken: builder.mutation<PushToken, RegisterPushTokenRequest>({
      query: (data) => ({
        url: '/push-tokens',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PushToken'],
    }),

    updatePushToken: builder.mutation<
      PushToken,
      { tokenId: string; data: Partial<PushToken> }
    >({
      query: ({ tokenId, data }) => ({
        url: `/push-tokens/${tokenId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PushToken'],
    }),

    deletePushToken: builder.mutation<void, string>({
      query: (tokenId) => ({
        url: `/push-tokens/${tokenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PushToken'],
    }),

    // Estatísticas
    getNotificationStats: builder.query<
      NotificationStats,
      { period?: 'day' | 'week' | 'month' | 'year'; startDate?: string; endDate?: string }
    >({
      query: ({ period = 'month', startDate, endDate }) => ({
        url: '/stats',
        params: {
          period,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
      providesTags: ['Stats'],
    }),

    // Ações rápidas
    enableAllNotifications: builder.mutation<NotificationSettings, void>({
      query: () => ({
        url: '/quick-actions/enable-all',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    disableAllNotifications: builder.mutation<NotificationSettings, void>({
      query: () => ({
        url: '/quick-actions/disable-all',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    enableEssentialNotifications: builder.mutation<NotificationSettings, void>({
      query: () => ({
        url: '/quick-actions/enable-essential',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Configurações específicas por categoria
    updateCategorySettings: builder.mutation<
      NotificationSettings,
      { category: string; settings: any }
    >({
      query: ({ category, settings }) => ({
        url: `/categories/${category}/settings`,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Permissões do sistema
    requestNotificationPermissions: builder.mutation<
      { granted: boolean; settings: any },
      void
    >({
      query: () => ({
        url: '/permissions/request',
        method: 'POST',
      }),
    }),

    checkNotificationPermissions: builder.query<
      { granted: boolean; settings: any },
      void
    >({
      query: () => '/permissions/check',
    }),

    // Configurações de som
    getAvailableSounds: builder.query<
      Array<{ id: string; name: string; preview: string }>,
      void
    >({
      query: () => '/sounds',
    }),

    previewSound: builder.mutation<void, { soundId: string }>({
      query: ({ soundId }) => ({
        url: `/sounds/${soundId}/preview`,
        method: 'POST',
      }),
    }),

    // Exportar/Importar configurações
    exportNotificationSettings: builder.query<Blob, void>({
      query: () => ({
        url: '/settings/export',
        responseHandler: (response) => response.blob(),
      }),
    }),

    importNotificationSettings: builder.mutation<
      NotificationSettings,
      { file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('settings', file);
        
        return {
          url: '/settings/import',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Settings'],
    }),

    // Análise e insights
    getNotificationInsights: builder.query<
      {
        bestTimeToSend: string;
        mostEngagingCategories: string[];
        recommendedFrequency: string;
        userBehaviorPatterns: any;
      },
      void
    >({
      query: () => '/insights',
    }),

    // Feedback de notificações
    submitNotificationFeedback: builder.mutation<
      void,
      {
        notificationId: string;
        rating: number;
        feedback?: string;
        helpful: boolean;
      }
    >({
      query: (data) => ({
        url: '/feedback',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useResetNotificationSettingsMutation,
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useCreateNotificationMutation,
  useSendNotificationMutation,
  useSendTestNotificationMutation,
  useGetNotificationTemplatesQuery,
  useGetNotificationTemplateByIdQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useGetNotificationSchedulesQuery,
  useScheduleNotificationMutation,
  useUpdateNotificationScheduleMutation,
  useDeleteNotificationScheduleMutation,
  usePauseNotificationScheduleMutation,
  useResumeNotificationScheduleMutation,
  useGetPushTokensQuery,
  useRegisterPushTokenMutation,
  useUpdatePushTokenMutation,
  useDeletePushTokenMutation,
  useGetNotificationStatsQuery,
  useEnableAllNotificationsMutation,
  useDisableAllNotificationsMutation,
  useEnableEssentialNotificationsMutation,
  useUpdateCategorySettingsMutation,
  useRequestNotificationPermissionsMutation,
  useCheckNotificationPermissionsQuery,
  useGetAvailableSoundsQuery,
  usePreviewSoundMutation,
  useLazyExportNotificationSettingsQuery,
  useImportNotificationSettingsMutation,
  useGetNotificationInsightsQuery,
  useSubmitNotificationFeedbackMutation,
} = notificationsApi;