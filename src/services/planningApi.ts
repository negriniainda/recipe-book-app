import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  MealPlan,
  CreateMealPlanInput,
  UpdateMealPlanInput,
  GetMealPlansParams,
  PaginatedResponse,
  ShoppingList,
  CreateShoppingListInput,
  UpdateShoppingListInput,
  GetShoppingListsParams,
} from '@/types';

export const planningApi = createApi({
  reducerPath: 'planningApi',
  baseQuery,
  tagTypes: ['MealPlan', 'ShoppingList'],
  endpoints: builder => ({
    // Meal Plans
    getMealPlans: builder.query<PaginatedResponse<MealPlan>, GetMealPlansParams>({
      query: params => ({
        url: '/meal-plans',
        params: {
          ...params,
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
        },
      }),
      providesTags: ['MealPlan'],
    }),

    getMealPlan: builder.query<MealPlan, string>({
      query: id => `/meal-plans/${id}`,
      providesTags: (_result, _error, id) => [{type: 'MealPlan', id}],
    }),

    createMealPlan: builder.mutation<MealPlan, CreateMealPlanInput>({
      query: data => ({
        url: '/meal-plans',
        method: 'POST',
        body: {
          ...data,
          date: data.date.toISOString(),
        },
      }),
      invalidatesTags: ['MealPlan'],
    }),

    updateMealPlan: builder.mutation<MealPlan, UpdateMealPlanInput>({
      query: ({id, ...data}) => ({
        url: `/meal-plans/${id}`,
        method: 'PUT',
        body: {
          ...data,
          date: data.date?.toISOString(),
        },
      }),
      invalidatesTags: (_result, _error, {id}) => [
        {type: 'MealPlan', id},
        'MealPlan',
      ],
    }),

    deleteMealPlan: builder.mutation<void, string>({
      query: id => ({
        url: `/meal-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        {type: 'MealPlan', id},
        'MealPlan',
      ],
    }),

    duplicateMealPlan: builder.mutation<MealPlan, {id: string; newDate: Date}>({
      query: ({id, newDate}) => ({
        url: `/meal-plans/${id}/duplicate`,
        method: 'POST',
        body: {
          date: newDate.toISOString(),
        },
      }),
      invalidatesTags: ['MealPlan'],
    }),

    // Shopping Lists
    getShoppingLists: builder.query<PaginatedResponse<ShoppingList>, GetShoppingListsParams>({
      query: params => ({
        url: '/shopping-lists',
        params,
      }),
      providesTags: ['ShoppingList'],
    }),

    getShoppingList: builder.query<ShoppingList, string>({
      query: id => `/shopping-lists/${id}`,
      providesTags: (_result, _error, id) => [{type: 'ShoppingList', id}],
    }),

    createShoppingList: builder.mutation<ShoppingList, CreateShoppingListInput>({
      query: data => ({
        url: '/shopping-lists',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    updateShoppingList: builder.mutation<ShoppingList, UpdateShoppingListInput>({
      query: ({id, ...data}) => ({
        url: `/shopping-lists/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, {id}) => [
        {type: 'ShoppingList', id},
        'ShoppingList',
      ],
    }),

    deleteShoppingList: builder.mutation<void, string>({
      query: id => ({
        url: `/shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        {type: 'ShoppingList', id},
        'ShoppingList',
      ],
    }),

    generateShoppingListFromMealPlans: builder.mutation<
      ShoppingList,
      {
        name: string;
        mealPlanIds: string[];
        userId: string;
      }
    >({
      query: data => ({
        url: '/shopping-lists/generate-from-meal-plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    addIngredientsToShoppingList: builder.mutation<
      ShoppingList,
      {
        listId: string;
        mealPlanId: string;
      }
    >({
      query: ({listId, mealPlanId}) => ({
        url: `/shopping-lists/${listId}/add-ingredients`,
        method: 'POST',
        body: {mealPlanId},
      }),
      invalidatesTags: (_result, _error, {listId}) => [
        {type: 'ShoppingList', id: listId},
        'ShoppingList',
      ],
    }),

    toggleShoppingListItem: builder.mutation<
      ShoppingList,
      {
        listId: string;
        itemId: string;
        completed: boolean;
      }
    >({
      query: ({listId, itemId, completed}) => ({
        url: `/shopping-lists/${listId}/items/${itemId}/toggle`,
        method: 'PATCH',
        body: {completed},
      }),
      invalidatesTags: (_result, _error, {listId}) => [
        {type: 'ShoppingList', id: listId},
      ],
    }),

    // Meal Planning Analytics
    getMealPlanningStats: builder.query<
      {
        totalMealsPlanned: number;
        favoriteCategories: Array<{category: string; count: number}>;
        weeklyPlanningRate: number;
        averageCookingTime: number;
      },
      {userId: string; startDate: Date; endDate: Date}
    >({
      query: ({userId, startDate, endDate}) => ({
        url: '/meal-plans/stats',
        params: {
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }),
    }),
  }),
});

export const {
  // Meal Plans
  useGetMealPlansQuery,
  useGetMealPlanQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation,
  useDuplicateMealPlanMutation,
  
  // Shopping Lists
  useGetShoppingListsQuery,
  useGetShoppingListQuery,
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
  useDeleteShoppingListMutation,
  useGenerateShoppingListFromMealPlansMutation,
  useAddIngredientsToShoppingListMutation,
  useToggleShoppingListItemMutation,
  
  // Analytics
  useGetMealPlanningStatsQuery,
} = planningApi;