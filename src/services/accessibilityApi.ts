import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  AccessibilitySettings,
  AccessibilityAnnouncement,
  VoiceCommand,
  AccessibilityReport,
  AccessibilityTest,
  UpdateAccessibilitySettingsRequest,
  CreateAnnouncementRequest,
  RegisterVoiceCommandRequest,
} from '../types/accessibility';

export const accessibilityApi = createApi({
  reducerPath: 'accessibilityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/accessibility',
    prepareHeaders: (headers, { getState }) => {
      // Adicionar token de autenticação
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Settings', 'Announcement', 'VoiceCommand', 'Report', 'Test'],
  endpoints: (builder) => ({
    // Configurações de acessibilidade
    getAccessibilitySettings: builder.query<AccessibilitySettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),

    updateAccessibilitySettings: builder.mutation<
      AccessibilitySettings,
      UpdateAccessibilitySettingsRequest
    >({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    resetAccessibilitySettings: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/settings/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Anúncios para leitores de tela
    getAnnouncements: builder.query<
      { announcements: AccessibilityAnnouncement[]; hasMore: boolean },
      { page?: number; limit?: number; type?: string }
    >({
      query: ({ page = 1, limit = 50, type }) => ({
        url: '/announcements',
        params: { page, limit, ...(type && { type }) },
      }),
      providesTags: ['Announcement'],
    }),

    createAnnouncement: builder.mutation<
      AccessibilityAnnouncement,
      CreateAnnouncementRequest
    >({
      query: (data) => ({
        url: '/announcements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Announcement'],
    }),

    markAnnouncementAsRead: builder.mutation<void, string>({
      query: (announcementId) => ({
        url: `/announcements/${announcementId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Announcement'],
    }),

    clearAnnouncements: builder.mutation<void, void>({
      query: () => ({
        url: '/announcements/clear',
        method: 'POST',
      }),
      invalidatesTags: ['Announcement'],
    }),

    // Comandos de voz
    getVoiceCommands: builder.query<VoiceCommand[], void>({
      query: () => '/voice-commands',
      providesTags: ['VoiceCommand'],
    }),

    registerVoiceCommand: builder.mutation<
      VoiceCommand,
      RegisterVoiceCommandRequest
    >({
      query: (data) => ({
        url: '/voice-commands',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VoiceCommand'],
    }),

    updateVoiceCommand: builder.mutation<
      VoiceCommand,
      { commandId: string; data: Partial<RegisterVoiceCommandRequest> }
    >({
      query: ({ commandId, data }) => ({
        url: `/voice-commands/${commandId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['VoiceCommand'],
    }),

    deleteVoiceCommand: builder.mutation<void, string>({
      query: (commandId) => ({
        url: `/voice-commands/${commandId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VoiceCommand'],
    }),

    enableVoiceCommand: builder.mutation<VoiceCommand, string>({
      query: (commandId) => ({
        url: `/voice-commands/${commandId}/enable`,
        method: 'POST',
      }),
      invalidatesTags: ['VoiceCommand'],
    }),

    disableVoiceCommand: builder.mutation<VoiceCommand, string>({
      query: (commandId) => ({
        url: `/voice-commands/${commandId}/disable`,
        method: 'POST',
      }),
      invalidatesTags: ['VoiceCommand'],
    }),

    // Relatórios de acessibilidade
    getAccessibilityReport: builder.query<AccessibilityReport, void>({
      query: () => '/report',
      providesTags: ['Report'],
    }),

    generateAccessibilityReport: builder.mutation<AccessibilityReport, void>({
      query: () => ({
        url: '/report/generate',
        method: 'POST',
      }),
      invalidatesTags: ['Report'],
    }),

    // Testes de acessibilidade
    getAccessibilityTests: builder.query<
      { tests: AccessibilityTest[]; hasMore: boolean },
      { page?: number; limit?: number; category?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, category, status }) => ({
        url: '/tests',
        params: {
          page,
          limit,
          ...(category && { category }),
          ...(status && { status }),
        },
      }),
      providesTags: ['Test'],
    }),

    runAccessibilityTest: builder.mutation<
      AccessibilityTest,
      { testId: string; elementId?: string }
    >({
      query: ({ testId, elementId }) => ({
        url: `/tests/${testId}/run`,
        method: 'POST',
        body: elementId ? { elementId } : {},
      }),
      invalidatesTags: ['Test', 'Report'],
    }),

    runAllAccessibilityTests: builder.mutation<
      { completed: number; failed: number },
      void
    >({
      query: () => ({
        url: '/tests/run-all',
        method: 'POST',
      }),
      invalidatesTags: ['Test', 'Report'],
    }),

    fixAccessibilityIssue: builder.mutation<
      void,
      { testId: string; issueId: string; fix: any }
    >({
      query: ({ testId, issueId, fix }) => ({
        url: `/tests/${testId}/issues/${issueId}/fix`,
        method: 'POST',
        body: { fix },
      }),
      invalidatesTags: ['Test', 'Report'],
    }),

    // Verificação de contraste
    checkContrast: builder.query<
      {
        ratio: number;
        wcagAA: boolean;
        wcagAAA: boolean;
        recommendation?: string;
      },
      { foreground: string; background: string; fontSize?: number }
    >({
      query: ({ foreground, background, fontSize }) => ({
        url: '/contrast/check',
        params: { foreground, background, ...(fontSize && { fontSize }) },
      }),
    }),

    // Validação de elementos
    validateElement: builder.mutation<
      {
        isValid: boolean;
        issues: Array<{
          type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          message: string;
          suggestion: string;
        }>;
      },
      {
        elementType: string;
        properties: any;
      }
    >({
      query: ({ elementType, properties }) => ({
        url: '/validate/element',
        method: 'POST',
        body: { elementType, properties },
      }),
    }),

    // Configurações do sistema
    getSystemAccessibilityInfo: builder.query<
      {
        screenReaderActive: boolean;
        voiceOverActive: boolean;
        talkBackActive: boolean;
        highContrastEnabled: boolean;
        reduceMotionEnabled: boolean;
        largeTextEnabled: boolean;
        boldTextEnabled: boolean;
      },
      void
    >({
      query: () => '/system/info',
    }),

    // Feedback de acessibilidade
    submitAccessibilityFeedback: builder.mutation<
      void,
      {
        type: 'bug' | 'suggestion' | 'compliment';
        category: 'visual' | 'auditory' | 'motor' | 'cognitive';
        description: string;
        severity?: 'low' | 'medium' | 'high';
        elementId?: string;
        screenshot?: string;
      }
    >({
      query: (data) => ({
        url: '/feedback',
        method: 'POST',
        body: data,
      }),
    }),

    // Configurações rápidas
    enableHighContrast: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/quick-actions/high-contrast/enable',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    disableHighContrast: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/quick-actions/high-contrast/disable',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    increaseFontSize: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/quick-actions/font-size/increase',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    decreaseFontSize: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/quick-actions/font-size/decrease',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    enableScreenReader: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/quick-actions/screen-reader/enable',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    disableScreenReader: builder.mutation<AccessibilitySettings, void>({
      query: () => ({
        url: '/quick-actions/screen-reader/disable',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Treinamento e tutoriais
    getAccessibilityTutorials: builder.query<
      Array<{
        id: string;
        title: string;
        description: string;
        category: 'visual' | 'auditory' | 'motor' | 'cognitive';
        duration: number;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        completed: boolean;
      }>,
      void
    >({
      query: () => '/tutorials',
    }),

    markTutorialAsCompleted: builder.mutation<void, string>({
      query: (tutorialId) => ({
        url: `/tutorials/${tutorialId}/complete`,
        method: 'POST',
      }),
    }),

    // Estatísticas de uso
    getAccessibilityUsageStats: builder.query<
      {
        screenReaderUsage: number;
        voiceControlUsage: number;
        keyboardNavigationUsage: number;
        highContrastUsage: number;
        fontSizeChanges: number;
        mostUsedFeatures: Array<{
          feature: string;
          usage: number;
        }>;
      },
      { period?: 'day' | 'week' | 'month' | 'year' }
    >({
      query: ({ period = 'month' }) => ({
        url: '/stats/usage',
        params: { period },
      }),
    }),

    // Exportar configurações
    exportAccessibilitySettings: builder.query<Blob, void>({
      query: () => ({
        url: '/settings/export',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Importar configurações
    importAccessibilitySettings: builder.mutation<
      AccessibilitySettings,
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
  }),
});

export const {
  useGetAccessibilitySettingsQuery,
  useUpdateAccessibilitySettingsMutation,
  useResetAccessibilitySettingsMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useMarkAnnouncementAsReadMutation,
  useClearAnnouncementsMutation,
  useGetVoiceCommandsQuery,
  useRegisterVoiceCommandMutation,
  useUpdateVoiceCommandMutation,
  useDeleteVoiceCommandMutation,
  useEnableVoiceCommandMutation,
  useDisableVoiceCommandMutation,
  useGetAccessibilityReportQuery,
  useGenerateAccessibilityReportMutation,
  useGetAccessibilityTestsQuery,
  useRunAccessibilityTestMutation,
  useRunAllAccessibilityTestsMutation,
  useFixAccessibilityIssueMutation,
  useCheckContrastQuery,
  useValidateElementMutation,
  useGetSystemAccessibilityInfoQuery,
  useSubmitAccessibilityFeedbackMutation,
  useEnableHighContrastMutation,
  useDisableHighContrastMutation,
  useIncreaseFontSizeMutation,
  useDecreaseFontSizeMutation,
  useEnableScreenReaderMutation,
  useDisableScreenReaderMutation,
  useGetAccessibilityTutorialsQuery,
  useMarkTutorialAsCompletedMutation,
  useGetAccessibilityUsageStatsQuery,
  useLazyExportAccessibilitySettingsQuery,
  useImportAccessibilitySettingsMutation,
} = accessibilityApi;