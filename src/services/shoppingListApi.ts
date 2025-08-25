import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  ShoppingList,
  ShoppingListItem,
  ShoppingListTemplate,
  ShoppingListStats,
  ShoppingListPreferences,
  StoreLayout,
  CreateShoppingListRequest,
  AddShoppingListItemRequest,
  UpdateShoppingListItemRequest,
  GenerateFromMealPlanRequest,
  ShoppingListSummary,
  GroceryCategory,
} from '../types/shoppingList';

export const shoppingListApi = createApi({
  reducerPath: 'shoppingListApi',
  baseQuery,
  tagTypes: [
    'ShoppingList',
    'ShoppingListItem', 
    'ShoppingListTemplate',
    'ShoppingListPreferences',
    'ShoppingListStats'
  ],
  endpoints: builder => ({
    // Shopping Lists CRUD
    getShoppingLists: builder.query<
      ShoppingList[],
      {userId: string}
    >({
      query: ({userId}) => ({
        url: '/shopping-lists',
        params: {userId},
      }),
      providesTags: ['ShoppingList'],
    }),

    getShoppingList: builder.query<ShoppingList, string>({
      query: id => `/shopping-lists/${id}`,
      providesTags: ['ShoppingList', 'ShoppingListItem'],
    }),

    getShoppingListSummaries: builder.query<
      ShoppingListSummary[],
      {userId: string; limit?: number}
    >({
      query: ({userId, limit = 10}) => ({
        url: '/shopping-lists/summaries',
        params: {userId, limit},
      }),
      providesTags: ['ShoppingList'],
    }),

    createShoppingList: builder.mutation<
      ShoppingList,
      CreateShoppingListRequest & {userId: string}
    >({
      query: ({userId, ...body}) => ({
        url: '/shopping-lists',
        method: 'POST',
        body: {userId, ...body},
      }),
      invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
    }),

    updateShoppingList: builder.mutation<
      ShoppingList,
      {id: string; updates: Partial<ShoppingList>}
    >({
      query: ({id, updates}) => ({
        url: `/shopping-lists/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    deleteShoppingList: builder.mutation<void, string>({
      query: id => ({
        url: `/shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
    }),

    // Shopping List Items
    addShoppingListItem: builder.mutation<
      ShoppingListItem,
      AddShoppingListItemRequest
    >({
      query: body => ({
        url: '/shopping-lists/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShoppingList', 'ShoppingListItem'],
    }),

    updateShoppingListItem: builder.mutation<
      ShoppingListItem,
      UpdateShoppingListItemRequest
    >({
      query: ({id, ...updates}) => ({
        url: `/shopping-lists/items/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['ShoppingList', 'ShoppingListItem'],
    }),

    deleteShoppingListItem: builder.mutation<void, string>({
      query: id => ({
        url: `/shopping-lists/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingList', 'ShoppingListItem'],
    }),

    bulkUpdateShoppingListItems: builder.mutation<
      ShoppingListItem[],
      {items: UpdateShoppingListItemRequest[]}
    >({
      query: ({items}) => ({
        url: '/shopping-lists/items/bulk-update',
        method: 'PATCH',
        body: {items},
      }),
      invalidatesTags: ['ShoppingList', 'ShoppingListItem'],
    }),

    // Generate from meal plans
    generateFromMealPlan: builder.mutation<
      ShoppingList,
      GenerateFromMealPlanRequest & {userId: string; name: string}
    >({
      query: body => ({
        url: '/shopping-lists/generate-from-meal-plan',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    // Templates
    getShoppingListTemplates: builder.query<
      ShoppingListTemplate[],
      {userId?: string; isPublic?: boolean}
    >({
      query: ({userId, isPublic}) => ({
        url: '/shopping-lists/templates',
        params: {userId, isPublic},
      }),
    }),

    // Preferences
    getShoppingListPreferences: builder.query<
      ShoppingListPreferences,
      string
    >({
      query: userId => `/shopping-lists/preferences/${userId}`,
      providesTags: ['ShoppingListPreferences'],
    }),

    updateShoppingListPreferences: builder.mutation<
      ShoppingListPreferences,
      {userId: string; preferences: Partial<ShoppingListPreferences>}
    >({
      query: ({userId, preferences}) => ({
        url: `/shopping-lists/preferences/${userId}`,
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['ShoppingListPreferences'],
    }),

    // Statistics
    getShoppingListStats: builder.query<
      ShoppingListStats,
      {userId: string; period?: 'week' | 'month' | 'year'}
    >({
      query: ({userId, period = 'month'}) => ({
        url: '/shopping-lists/stats',
        params: {userId, period},
      }),
      providesTags: ['ShoppingListStats'],
    }),

    // Store layouts
    getStoreLayouts: builder.query<StoreLayout[], void>({
      query: () => '/shopping-lists/store-layouts',
    }),

    // Ingredient suggestions
    getIngredientSuggestions: builder.query<
      Array<{name: string; category: GroceryCategory}>,
      {query: string; category?: GroceryCategory; limit?: number}
    >({
      query: ({query, category, limit = 10}) => ({
        url: '/shopping-lists/ingredient-suggestions',
        params: {query, category, limit},
      }),
    }),
  }),
});

export const {
  useGetShoppingListsQuery,
  useGetShoppingListQuery,
  useGetShoppingListSummariesQuery,
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
  useDeleteShoppingListMutation,
  useAddShoppingListItemMutation,
  useUpdateShoppingListItemMutation,
  useDeleteShoppingListItemMutation,
  useBulkUpdateShoppingListItemsMutation,
  useGenerateFromMealPlanMutation,
  useGetShoppingListTemplatesQuery,
  useGetShoppingListPreferencesQuery,
  useUpdateShoppingListPreferencesMutation,
  useGetShoppingListStatsQuery,
  useGetStoreLayoutsQuery,
  useGetIngredientSuggestionsQuery,
} = shoppingListApi;