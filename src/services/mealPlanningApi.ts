import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  MealPlan,
  MealPlanSuggestion,
  WeeklyMealPlan,
  MealPlanningPreferences,
  MealPlanStats,
  MealPlanNotification,
  MealType,
  MealPlanFilter,
} from '../types/mealPlanning';

export const mealPlanningApi = createApi({
  reducerPath: 'mealPlanningApi',
  baseQuery,
  tagTypes: ['MealPlan', 'MealPlanPreferences', 'MealPlanStats'],
  endpoints: builder => ({
    // Get meal plans for a date range
    getMealPlans: builder.query<
      MealPlan[],
      {
        userId: string;
        startDate: string;
        endDate: string;
        filter?: Partial<MealPlanFilter>;
      }
    >({
      query: ({userId, startDate, endDate, filter}) => ({
        url: '/meal-plans',
        params: {
          userId,
          startDate,
          endDate,
          ...filter,
        },
      }),
      providesTags: ['MealPlan'],
    }),

    // Get weekly meal plan
    getWeeklyMealPlan: builder.query<
      WeeklyMealPlan,
      {userId: string; weekStart: string}
    >({
      query: ({userId, weekStart}) => ({
        url: '/meal-plans/weekly',
        params: {userId, weekStart},
      }),
      providesTags: ['MealPlan'],
    }),

    // Create meal plan
    createMealPlan: builder.mutation<
      MealPlan,
      Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: mealPlan => ({
        url: '/meal-plans',
        method: 'POST',
        body: mealPlan,
      }),
      invalidatesTags: ['MealPlan', 'MealPlanStats'],
    }),

    // Update meal plan
    updateMealPlan: builder.mutation<
      MealPlan,
      {id: string; updates: Partial<MealPlan>}
    >({
      query: ({id, updates}) => ({
        url: `/meal-plans/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['MealPlan', 'MealPlanStats'],
    }),

    // Delete meal plan
    deleteMealPlan: builder.mutation<void, string>({
      query: id => ({
        url: `/meal-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MealPlan', 'MealPlanStats'],
    }),

    // Bulk create meal plans (for drag & drop multiple)
    bulkCreateMealPlans: builder.mutation<
      MealPlan[],
      Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>[]
    >({
      query: mealPlans => ({
        url: '/meal-plans/bulk',
        method: 'POST',
        body: {mealPlans},
      }),
      invalidatesTags: ['MealPlan', 'MealPlanStats'],
    }),

    // Move meal plan to different date/time
    moveMealPlan: builder.mutation<
      MealPlan,
      {
        id: string;
        newDate: string;
        newMealType: MealType;
      }
    >({
      query: ({id, newDate, newMealType}) => ({
        url: `/meal-plans/${id}/move`,
        method: 'PATCH',
        body: {newDate, newMealType},
      }),
      invalidatesTags: ['MealPlan'],
    }),

    // Get meal plan suggestions
    getMealPlanSuggestions: builder.query<
      MealPlanSuggestion[],
      {
        userId: string;
        date: string;
        mealType?: MealType;
        limit?: number;
      }
    >({
      query: ({userId, date, mealType, limit = 10}) => ({
        url: '/meal-plans/suggestions',
        params: {userId, date, mealType, limit},
      }),
    }),

    // Get smart suggestions based on preferences and history
    getSmartSuggestions: builder.query<
      MealPlanSuggestion[],
      {
        userId: string;
        weekStart: string;
        preferences?: Partial<MealPlanningPreferences>;
      }
    >({
      query: ({userId, weekStart, preferences}) => ({
        url: '/meal-plans/smart-suggestions',
        method: 'POST',
        body: {userId, weekStart, preferences},
      }),
    }),

    // Get meal planning preferences
    getMealPlanningPreferences: builder.query<
      MealPlanningPreferences,
      string
    >({
      query: userId => `/meal-plans/preferences/${userId}`,
      providesTags: ['MealPlanPreferences'],
    }),

    // Update meal planning preferences
    updateMealPlanningPreferences: builder.mutation<
      MealPlanningPreferences,
      {userId: string; preferences: Partial<MealPlanningPreferences>}
    >({
      query: ({userId, preferences}) => ({
        url: `/meal-plans/preferences/${userId}`,
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['MealPlanPreferences'],
    }),

    // Get meal plan statistics
    getMealPlanStats: builder.query<
      MealPlanStats,
      {userId: string; period?: 'week' | 'month' | 'year'}
    >({
      query: ({userId, period = 'month'}) => ({
        url: '/meal-plans/stats',
        params: {userId, period},
      }),
      providesTags: ['MealPlanStats'],
    }),

    // Mark meal as completed
    markMealCompleted: builder.mutation<
      MealPlan,
      {id: string; completed: boolean; notes?: string}
    >({
      query: ({id, completed, notes}) => ({
        url: `/meal-plans/${id}/complete`,
        method: 'PATCH',
        body: {completed, notes},
      }),
      invalidatesTags: ['MealPlan', 'MealPlanStats'],
    }),

    // Generate meal plan for week
    generateWeeklyMealPlan: builder.mutation<
      WeeklyMealPlan,
      {
        userId: string;
        weekStart: string;
        preferences?: Partial<MealPlanningPreferences>;
        replaceExisting?: boolean;
      }
    >({
      query: ({userId, weekStart, preferences, replaceExisting = false}) => ({
        url: '/meal-plans/generate-weekly',
        method: 'POST',
        body: {userId, weekStart, preferences, replaceExisting},
      }),
      invalidatesTags: ['MealPlan', 'MealPlanStats'],
    }),

    // Get meal plan notifications
    getMealPlanNotifications: builder.query<
      MealPlanNotification[],
      {userId: string; upcoming?: boolean}
    >({
      query: ({userId, upcoming = true}) => ({
        url: '/meal-plans/notifications',
        params: {userId, upcoming},
      }),
    }),

    // Schedule meal plan notifications
    scheduleMealPlanNotifications: builder.mutation<
      MealPlanNotification[],
      {mealPlanIds: string[]; userId: string}
    >({
      query: ({mealPlanIds, userId}) => ({
        url: '/meal-plans/notifications/schedule',
        method: 'POST',
        body: {mealPlanIds, userId},
      }),
    }),

    // Copy meal plan to another date
    copyMealPlan: builder.mutation<
      MealPlan,
      {
        id: string;
        targetDate: string;
        targetMealType?: MealType;
      }
    >({
      query: ({id, targetDate, targetMealType}) => ({
        url: `/meal-plans/${id}/copy`,
        method: 'POST',
        body: {targetDate, targetMealType},
      }),
      invalidatesTags: ['MealPlan'],
    }),

    // Get meal plan conflicts (same recipe on same day)
    getMealPlanConflicts: builder.query<
      {
        conflicts: Array<{
          date: string;
          recipeId: string;
          mealPlans: MealPlan[];
        }>;
        suggestions: MealPlanSuggestion[];
      },
      {userId: string; startDate: string; endDate: string}
    >({
      query: ({userId, startDate, endDate}) => ({
        url: '/meal-plans/conflicts',
        params: {userId, startDate, endDate},
      }),
    }),
  }),
});

export const {
  useGetMealPlansQuery,
  useGetWeeklyMealPlanQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation,
  useBulkCreateMealPlansMutation,
  useMoveMealPlanMutation,
  useGetMealPlanSuggestionsQuery,
  useGetSmartSuggestionsQuery,
  useGetMealPlanningPreferencesQuery,
  useUpdateMealPlanningPreferencesMutation,
  useGetMealPlanStatsQuery,
  useMarkMealCompletedMutation,
  useGenerateWeeklyMealPlanMutation,
  useGetMealPlanNotificationsQuery,
  useScheduleMealPlanNotificationsMutation,
  useCopyMealPlanMutation,
  useGetMealPlanConflictsQuery,
} = mealPlanningApi;