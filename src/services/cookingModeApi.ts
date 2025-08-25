import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  CookingSession,
  CookingTimer,
  CookingModeSettings,
  CookingSessionStats,
  StartCookingSessionRequest,
  UpdateCookingStepRequest,
  CreateTimerRequest,
  UpdateTimerRequest,
  CookingModeNotification,
  StepAnalysis,
} from '../types/cookingMode';

export const cookingModeApi = createApi({
  reducerPath: 'cookingModeApi',
  baseQuery,
  tagTypes: [
    'CookingSession',
    'CookingTimer',
    'CookingModeSettings',
    'CookingStats',
    'CookingNotification'
  ],
  endpoints: builder => ({
    // Cooking Sessions
    getCookingSessions: builder.query<
      CookingSession[],
      {userId: string; active?: boolean}
    >({
      query: ({userId, active}) => ({
        url: '/cooking-mode/sessions',
        params: {userId, active},
      }),
      providesTags: ['CookingSession'],
    }),

    getCookingSession: builder.query<CookingSession, string>({
      query: sessionId => `/cooking-mode/sessions/${sessionId}`,
      providesTags: ['CookingSession', 'CookingTimer'],
    }),

    startCookingSession: builder.mutation<
      CookingSession,
      StartCookingSessionRequest & {userId: string}
    >({
      query: ({userId, ...body}) => ({
        url: '/cooking-mode/sessions',
        method: 'POST',
        body: {userId, ...body},
      }),
      invalidatesTags: ['CookingSession', 'CookingStats'],
    }),

    updateCookingSession: builder.mutation<
      CookingSession,
      {sessionId: string; updates: Partial<CookingSession>}
    >({
      query: ({sessionId, updates}) => ({
        url: `/cooking-mode/sessions/${sessionId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['CookingSession'],
    }),

    completeCookingSession: builder.mutation<
      CookingSession,
      {sessionId: string; rating?: number; notes?: string}
    >({
      query: ({sessionId, rating, notes}) => ({
        url: `/cooking-mode/sessions/${sessionId}/complete`,
        method: 'POST',
        body: {rating, notes},
      }),
      invalidatesTags: ['CookingSession', 'CookingStats'],
    }),

    pauseCookingSession: builder.mutation<
      CookingSession,
      {sessionId: string; pause: boolean}
    >({
      query: ({sessionId, pause}) => ({
        url: `/cooking-mode/sessions/${sessionId}/pause`,
        method: 'POST',
        body: {pause},
      }),
      invalidatesTags: ['CookingSession'],
    }),

    deleteCookingSession: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/cooking-mode/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CookingSession', 'CookingStats'],
    }),

    // Cooking Steps
    updateCookingStep: builder.mutation<
      CookingSession,
      UpdateCookingStepRequest
    >({
      query: ({sessionId, stepId, ...updates}) => ({
        url: `/cooking-mode/sessions/${sessionId}/steps/${stepId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['CookingSession'],
    }),

    navigateToStep: builder.mutation<
      CookingSession,
      {sessionId: string; stepIndex: number}
    >({
      query: ({sessionId, stepIndex}) => ({
        url: `/cooking-mode/sessions/${sessionId}/navigate`,
        method: 'POST',
        body: {stepIndex},
      }),
      invalidatesTags: ['CookingSession'],
    }),

    analyzeStep: builder.query<
      StepAnalysis,
      {stepText: string; recipeId?: string}
    >({
      query: ({stepText, recipeId}) => ({
        url: '/cooking-mode/analyze-step',
        params: {stepText, recipeId},
      }),
    }),

    // Timers
    getActiveTimers: builder.query<
      CookingTimer[],
      {userId: string; sessionId?: string}
    >({
      query: ({userId, sessionId}) => ({
        url: '/cooking-mode/timers',
        params: {userId, sessionId, active: true},
      }),
      providesTags: ['CookingTimer'],
    }),

    createTimer: builder.mutation<CookingTimer, CreateTimerRequest>({
      query: body => ({
        url: '/cooking-mode/timers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CookingTimer', 'CookingSession'],
    }),

    updateTimer: builder.mutation<CookingTimer, UpdateTimerRequest>({
      query: ({timerId, action}) => ({
        url: `/cooking-mode/timers/${timerId}`,
        method: 'PATCH',
        body: {action},
      }),
      invalidatesTags: ['CookingTimer'],
    }),

    deleteTimer: builder.mutation<void, string>({
      query: timerId => ({
        url: `/cooking-mode/timers/${timerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CookingTimer'],
    }),

    // Settings
    getCookingModeSettings: builder.query<CookingModeSettings, string>({
      query: userId => `/cooking-mode/settings/${userId}`,
      providesTags: ['CookingModeSettings'],
    }),

    updateCookingModeSettings: builder.mutation<
      CookingModeSettings,
      {userId: string; settings: Partial<CookingModeSettings>}
    >({
      query: ({userId, settings}) => ({
        url: `/cooking-mode/settings/${userId}`,
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['CookingModeSettings'],
    }),

    // Statistics
    getCookingStats: builder.query<
      CookingSessionStats,
      {userId: string; period?: 'week' | 'month' | 'year'}
    >({
      query: ({userId, period = 'month'}) => ({
        url: '/cooking-mode/stats',
        params: {userId, period},
      }),
      providesTags: ['CookingStats'],
    }),

    // Notifications
    getCookingNotifications: builder.query<
      CookingModeNotification[],
      {userId: string; sessionId?: string; dismissed?: boolean}
    >({
      query: ({userId, sessionId, dismissed}) => ({
        url: '/cooking-mode/notifications',
        params: {userId, sessionId, dismissed},
      }),
      providesTags: ['CookingNotification'],
    }),

    dismissNotification: builder.mutation<
      CookingModeNotification,
      {notificationId: string}
    >({
      query: ({notificationId}) => ({
        url: `/cooking-mode/notifications/${notificationId}/dismiss`,
        method: 'POST',
      }),
      invalidatesTags: ['CookingNotification'],
    }),

    // Voice Commands
    processVoiceCommand: builder.mutation<
      {action: string; parameters?: any; success: boolean},
      {sessionId: string; command: string; confidence: number}
    >({
      query: ({sessionId, command, confidence}) => ({
        url: '/cooking-mode/voice-command',
        method: 'POST',
        body: {sessionId, command, confidence},
      }),
      invalidatesTags: ['CookingSession', 'CookingTimer'],
    }),

    getSupportedVoiceCommands: builder.query<
      {commands: string[]; language: string},
      {language?: string}
    >({
      query: ({language = 'pt-BR'}) => ({
        url: '/cooking-mode/voice-commands',
        params: {language},
      }),
    }),

    // Recipe Analysis for Cooking Mode
    analyzeCookingRecipe: builder.query<
      {
        estimatedDuration: number;
        difficulty: 'easy' | 'medium' | 'hard';
        suggestedTimers: Array<{
          stepIndex: number;
          name: string;
          duration: number;
        }>;
        criticalSteps: number[];
        equipment: string[];
      },
      {recipeId: string}
    >({
      query: ({recipeId}) => ({
        url: `/cooking-mode/analyze-recipe/${recipeId}`,
      }),
    }),

    // Multi-session management
    getMultiSessionState: builder.query<
      {
        activeSessions: CookingSession[];
        maxConcurrent: number;
        canStartNew: boolean;
      },
      {userId: string}
    >({
      query: ({userId}) => ({
        url: '/cooking-mode/multi-session',
        params: {userId},
      }),
      providesTags: ['CookingSession'],
    }),

    switchActiveSession: builder.mutation<
      CookingSession,
      {userId: string; sessionId: string}
    >({
      query: ({userId, sessionId}) => ({
        url: '/cooking-mode/switch-session',
        method: 'POST',
        body: {userId, sessionId},
      }),
      invalidatesTags: ['CookingSession'],
    }),

    // Emergency actions
    pauseAllSessions: builder.mutation<
      {pausedSessions: string[]},
      {userId: string}
    >({
      query: ({userId}) => ({
        url: '/cooking-mode/pause-all',
        method: 'POST',
        body: {userId},
      }),
      invalidatesTags: ['CookingSession'],
    }),

    resumeAllSessions: builder.mutation<
      {resumedSessions: string[]},
      {userId: string}
    >({
      query: ({userId}) => ({
        url: '/cooking-mode/resume-all',
        method: 'POST',
        body: {userId},
      }),
      invalidatesTags: ['CookingSession'],
    }),
  }),
});

export const {
  useGetCookingSessionsQuery,
  useGetCookingSessionQuery,
  useStartCookingSessionMutation,
  useUpdateCookingSessionMutation,
  useCompleteCookingSessionMutation,
  usePauseCookingSessionMutation,
  useDeleteCookingSessionMutation,
  useUpdateCookingStepMutation,
  useNavigateToStepMutation,
  useAnalyzeStepQuery,
  useGetActiveTimersQuery,
  useCreateTimerMutation,
  useUpdateTimerMutation,
  useDeleteTimerMutation,
  useGetCookingModeSettingsQuery,
  useUpdateCookingModeSettingsMutation,
  useGetCookingStatsQuery,
  useGetCookingNotificationsQuery,
  useDismissNotificationMutation,
  useProcessVoiceCommandMutation,
  useGetSupportedVoiceCommandsQuery,
  useAnalyzeCookingRecipeQuery,
  useGetMultiSessionStateQuery,
  useSwitchActiveSessionMutation,
  usePauseAllSessionsMutation,
  useResumeAllSessionsMutation,
} = cookingModeApi;