import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  MealPlan,
  MealPlanItem,
  MealSuggestion,
  MealPlanPreferences,
  MealReminder,
  CalendarDay,
  WeekView,
  MonthView,
  CreateMealPlanRequest,
  AddMealPlanItemRequest,
  UpdateMealPlanItemRequest,
  GetMealSuggestionsRequest,
  MealPlanStats,
  MealType,
} from '../types/mealPlan';

export const mealPlanApi = createApi({
  reducerPath: 'mealPlanApi',
  baseQuery,
  tagTypes: ['MealPlan', 'MealPlanItem', 'MealSuggestion', 'MealPreferences'],
  endpoints: builder => ({
    // Meal Plans
    getMealPlans: builder.query<MealPlan[], {userId: string}>({
      query: ({userId}) => `/meal-plans?userId=${userId}`,
      providesTags: ['MealPlan'],
    }),

    getMealPlan: builder.query<MealPlan, string>({
      query: id => `/meal-plans/${id}`,
      providesTags: ['MealPlan'],
    }),

    createMealPlan: builder.mutation<MealPlan, CreateMealPlanRequest>({
      query: body => ({
        url: '/meal-plans',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MealPlan'],
    }),

    updateMealPlan: builder.mutation<
      MealPlan,
      {id: string; updates: Partial<MealPlan>}
    >({
      query: ({id, updates}) => ({
        url: `/meal-plans/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['MealPlan'],
    }),

    deleteMealPlan: builder.mutation<void, string>({
      query: id => ({
        url: `/meal-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MealPlan'],
    }),

    // Meal Plan Items
    addMealPlanItem: builder.mutation<MealPlanItem, AddMealPlanItemRequest>({
      query: body => ({
        url: '/meal-plan-items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MealPlan', 'MealPlanItem'],
    }),

    updateMealPlanItem: builder.mutation<
      MealPlanItem,
      UpdateMealPlanItemRequest
    >({
      query: ({id, ...updates}) => ({
        url: `/meal-plan-items/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['MealPlan', 'MealPlanItem'],
    }),

    deleteMealPlanItem: builder.mutation<void, string>({
      query: id => ({
        url: `/meal-plan-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MealPlan', 'MealPlanItem'],
    }),

    // Calendar Views
    getCalendarDay: builder.query<
      CalendarDay,
      {userId: string; date: string}
    >({
      query: ({userId, date}) =>
        `/meal-plans/calendar/day?userId=${userId}&date=${date}`,
      providesTags: ['MealPlanItem'],
    }),

    getWeekView: builder.query<
      WeekView,
      {userId: string; weekStart: string}
    >({
      query: ({userId, weekStart}) =>
        `/meal-plans/calendar/week?userId=${userId}&weekStart=${weekStart}`,
      providesTags: ['MealPlanItem'],
    }),

    getMonthView: builder.query<
      MonthView,
      {userId: string; month: number; year: number}
    >({
      query: ({userId, month, year}) =>
        `/meal-plans/calendar/month?userId=${userId}&month=${month}&year=${year}`,
      providesTags: ['MealPlanItem'],
    }),

    // Meal Suggestions
    getMealSuggestions: builder.query<
      MealSuggestion[],
      GetMealSuggestionsRequest & {userId: string}
    >({
      query: ({userId, ...params}) => ({
        url: '/meal-plans/suggestions',
        params: {userId, ...params},
      }),
      providesTags: ['MealSuggestion'],
    }),

    // Preferences
    getMealPlanPreferences: builder.query<MealPlanPreferences, string>({
      query: userId => `/meal-plans/preferences/${userId}`,
      providesTags: ['MealPreferences'],
    }),

    updateMealPlanPreferences: builder.mutation<
      MealPlanPreferences,
      {userId: string; preferences: Partial<MealPlanPreferences>}
    >({
      query: ({userId, preferences}) => ({
        url: `/meal-plans/preferences/${userId}`,
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['MealPreferences', 'MealSuggestion'],
    }),

    // Reminders
    getMealReminders: builder.query<MealReminder[], string>({
      query: userId => `/meal-plans/reminders?userId=${userId}`,
    }),

    createMealReminder: builder.mutation<
      MealReminder,
      Omit<MealReminder, 'id'>
    >({
      query: body => ({
        url: '/meal-plans/reminders',
        method: 'POST',
        body,
      }),
    }),

    updateMealReminder: builder.mutation<
      MealReminder,
      {id: string; updates: Partial<MealReminder>}
    >({
      query: ({id, updates}) => ({
        url: `/meal-plans/reminders/${id}`,
        method: 'PATCH',
        body: updates,
      }),
    }),

    deleteMealReminder: builder.mutation<void, string>({
      query: id => ({
        url: `/meal-plans/reminders/${id}`,
        method: 'DELETE',
      }),
    }),

    // Statistics
    getMealPlanStats: builder.query<
      MealPlanStats,
      {userId: string; startDate: string; endDate: string}
    >({
      query: ({userId, startDate, endDate}) =>
        `/meal-plans/stats?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['MealPlanItem'],
    }),

    // Bulk operations
    bulkAddMealPlanItems: builder.mutation<
      MealPlanItem[],
      {mealPlanId: string; items: Omit<MealPlanItem, 'id' | 'createdAt' | 'updatedAt'>[]}
    >({
      query: ({mealPlanId, items}) => ({
        url: `/meal-plans/${mealPlanId}/bulk-add-items`,
        method: 'POST',
        body: {items},
      }),
      invalidatesTags: ['MealPlan', 'MealPlanItem'],
    }),

    duplicateMealPlan: builder.mutation<
      MealPlan,
      {id: string; newStartDate: string; newEndDate: string; newName: string}
    >({
      query: ({id, ...body}) => ({
        url: `/meal-plans/${id}/duplicate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MealPlan'],
    }),

    // Smart planning
    generateMealPlan: builder.mutation<
      MealPlan,
      {
        userId: string;
        startDate: string;
        endDate: string;
        preferences?: Partial<MealPlanPreferences>;
        excludeRecipeIds?: string[];
      }
    >({
      query: body => ({
        url: '/meal-plans/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MealPlan', 'MealSuggestion'],
    }),
  }),
});

export const {
  useGetMealPlansQuery,
  useGetMealPlanQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation,
  useAddMealPlanItemMutation,
  useUpdateMealPlanItemMutation,
  useDeleteMealPlanItemMutation,
  useGetCalendarDayQuery,
  useGetWeekViewQuery,
  useGetMonthViewQuery,
  useGetMealSuggestionsQuery,
  useGetMealPlanPreferencesQuery,
  useUpdateMealPlanPreferencesMutation,
  useGetMealRemindersQuery,
  useCreateMealReminderMutation,
  useUpdateMealReminderMutation,
  useDeleteMealReminderMutation,
  useGetMealPlanStatsQuery,
  useBulkAddMealPlanItemsMutation,
  useDuplicateMealPlanMutation,
  useGenerateMealPlanMutation,
} = mealPlanApi;