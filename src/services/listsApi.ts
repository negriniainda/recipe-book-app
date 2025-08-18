import {api, transformApiResponse, transformPaginatedResponse} from './api';
import {
  CustomList,
  CreateCustomListInput,
  UpdateCustomListInput,
  AddRecipeToListInput,
  RemoveRecipeFromListInput,
  ReorderListRecipesInput,
  ShareListInput,
  ListFilters,
  ListStats,
} from '@/types/lists';
import {PaginatedResponse} from '@/types/api';
import {Recipe} from '@/types';

export const listsApi = api.injectEndpoints({
  endpoints: builder => ({
    // Buscar listas do usuário
    getUserLists: builder.query<
      PaginatedResponse<CustomList>,
      {
        userId?: string;
        page?: number;
        limit?: number;
        filters?: ListFilters;
      }
    >({
      query: ({userId, ...params}) => ({
        url: userId ? `/users/${userId}/lists` : '/lists',
        params,
      }),
      transformResponse: transformPaginatedResponse<CustomList>,
      providesTags: result =>
        result
          ? [
              ...result.items.map(({id}) => ({type: 'List' as const, id})),
              {type: 'List', id: 'USER_LISTS'},
            ]
          : [{type: 'List', id: 'USER_LISTS'}],
    }),

    // Buscar lista por ID
    getList: builder.query<CustomList, string>({
      query: id => `/lists/${id}`,
      transformResponse: transformApiResponse<CustomList>,
      providesTags: (result, error, id) => [{type: 'List', id}],
    }),

    // Criar nova lista
    createList: builder.mutation<CustomList, CreateCustomListInput>({
      query: list => ({
        url: '/lists',
        method: 'POST',
        body: list,
      }),
      transformResponse: transformApiResponse<CustomList>,
      invalidatesTags: [{type: 'List', id: 'USER_LISTS'}],
    }),

    // Atualizar lista
    updateList: builder.mutation<CustomList, UpdateCustomListInput>({
      query: ({id, ...patch}) => ({
        url: `/lists/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      transformResponse: transformApiResponse<CustomList>,
      invalidatesTags: (result, error, {id}) => [
        {type: 'List', id},
        {type: 'List', id: 'USER_LISTS'},
      ],
    }),

    // Deletar lista
    deleteList: builder.mutation<void, string>({
      query: id => ({
        url: `/lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        {type: 'List', id},
        {type: 'List', id: 'USER_LISTS'},
      ],
    }),

    // Adicionar receita à lista
    addRecipeToList: builder.mutation<CustomList, AddRecipeToListInput>({
      query: ({listId, ...body}) => ({
        url: `/lists/${listId}/recipes`,
        method: 'POST',
        body,
      }),
      transformResponse: transformApiResponse<CustomList>,
      invalidatesTags: (result, error, {listId}) => [
        {type: 'List', id: listId},
        {type: 'List', id: 'USER_LISTS'},
        {type: 'Recipe', id: 'LIST'},
      ],
    }),

    // Remover receita da lista
    removeRecipeFromList: builder.mutation<CustomList, RemoveRecipeFromListInput>({
      query: ({listId, recipeId}) => ({
        url: `/lists/${listId}/recipes/${recipeId}`,
        method: 'DELETE',
      }),
      transformResponse: transformApiResponse<CustomList>,
      invalidatesTags: (result, error, {listId}) => [
        {type: 'List', id: listId},
        {type: 'List', id: 'USER_LISTS'},
        {type: 'Recipe', id: 'LIST'},
      ],
    }),

    // Reordenar receitas na lista
    reorderListRecipes: builder.mutation<CustomList, ReorderListRecipesInput>({
      query: ({listId, recipeIds}) => ({
        url: `/lists/${listId}/reorder`,
        method: 'PATCH',
        body: {recipeIds},
      }),
      transformResponse: transformApiResponse<CustomList>,
      invalidatesTags: (result, error, {listId}) => [{type: 'List', id: listId}],
    }),

    // Buscar receitas de uma lista
    getListRecipes: builder.query<
      PaginatedResponse<Recipe>,
      {
        listId: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({listId, ...params}) => ({
        url: `/lists/${listId}/recipes`,
        params,
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: (result, error, {listId}) => [
        {type: 'List', id: `${listId}_RECIPES`},
      ],
    }),

    // Compartilhar lista
    shareList: builder.mutation<{shareCode: string}, ShareListInput>({
      query: ({listId, ...body}) => ({
        url: `/lists/${listId}/share`,
        method: 'POST',
        body,
      }),
      transformResponse: transformApiResponse<{shareCode: string}>,
      invalidatesTags: (result, error, {listId}) => [{type: 'List', id: listId}],
    }),

    // Acessar lista compartilhada
    getSharedList: builder.query<CustomList, string>({
      query: shareCode => `/lists/shared/${shareCode}`,
      transformResponse: transformApiResponse<CustomList>,
      providesTags: (result, error, shareCode) => [
        {type: 'List', id: `SHARED_${shareCode}`},
      ],
    }),

    // Duplicar lista
    duplicateList: builder.mutation<CustomList, {listId: string; name?: string}>({
      query: ({listId, name}) => ({
        url: `/lists/${listId}/duplicate`,
        method: 'POST',
        body: name ? {name} : {},
      }),
      transformResponse: transformApiResponse<CustomList>,
      invalidatesTags: [{type: 'List', id: 'USER_LISTS'}],
    }),

    // Buscar listas públicas
    getPublicLists: builder.query<
      PaginatedResponse<CustomList>,
      {
        page?: number;
        limit?: number;
        search?: string;
        tags?: string[];
      }
    >({
      query: params => ({
        url: '/lists/public',
        params,
      }),
      transformResponse: transformPaginatedResponse<CustomList>,
      providesTags: [{type: 'List', id: 'PUBLIC_LISTS'}],
    }),

    // Buscar estatísticas das listas do usuário
    getListStats: builder.query<ListStats, string | void>({
      query: userId => ({
        url: userId ? `/users/${userId}/lists/stats` : '/lists/stats',
      }),
      transformResponse: transformApiResponse<ListStats>,
      providesTags: [{type: 'List', id: 'STATS'}],
    }),

    // Buscar listas que contêm uma receita específica
    getListsWithRecipe: builder.query<CustomList[], string>({
      query: recipeId => `/recipes/${recipeId}/lists`,
      transformResponse: transformApiResponse<CustomList[]>,
      providesTags: (result, error, recipeId) => [
        {type: 'Recipe', id: `${recipeId}_LISTS`},
      ],
    }),

    // Adicionar receita a múltiplas listas
    addRecipeToMultipleLists: builder.mutation<
      void,
      {recipeId: string; listIds: string[]}
    >({
      query: ({recipeId, listIds}) => ({
        url: `/recipes/${recipeId}/lists`,
        method: 'POST',
        body: {listIds},
      }),
      invalidatesTags: (result, error, {listIds}) => [
        ...listIds.map(id => ({type: 'List' as const, id})),
        {type: 'List', id: 'USER_LISTS'},
        {type: 'Recipe', id: 'LIST'},
      ],
    }),

    // Remover receita de múltiplas listas
    removeRecipeFromMultipleLists: builder.mutation<
      void,
      {recipeId: string; listIds: string[]}
    >({
      query: ({recipeId, listIds}) => ({
        url: `/recipes/${recipeId}/lists`,
        method: 'DELETE',
        body: {listIds},
      }),
      invalidatesTags: (result, error, {listIds}) => [
        ...listIds.map(id => ({type: 'List' as const, id})),
        {type: 'List', id: 'USER_LISTS'},
        {type: 'Recipe', id: 'LIST'},
      ],
    }),
  }),
});

export const {
  useGetUserListsQuery,
  useGetListQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useAddRecipeToListMutation,
  useRemoveRecipeFromListMutation,
  useReorderListRecipesMutation,
  useGetListRecipesQuery,
  useShareListMutation,
  useGetSharedListQuery,
  useDuplicateListMutation,
  useGetPublicListsQuery,
  useGetListStatsQuery,
  useGetListsWithRecipeQuery,
  useAddRecipeToMultipleListsMutation,
  useRemoveRecipeFromMultipleListsMutation,
  useLazyGetUserListsQuery,
  useLazyGetListRecipesQuery,
} = listsApi;