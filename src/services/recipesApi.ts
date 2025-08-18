import {api, transformApiResponse, transformPaginatedResponse} from './api';
import {
  Recipe,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeSearchParams,
} from '@/types';
import {
  PaginatedResponse,
  ImportRecipeRequest,
  ImportRecipeResponse,
} from '@/types/api';

export const recipesApi = api.injectEndpoints({
  endpoints: builder => ({
    // Buscar receitas com paginação
    getRecipes: builder.query<PaginatedResponse<Recipe>, RecipeSearchParams>({
      query: params => ({
        url: '/recipes',
        params,
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: result =>
        result
          ? [
              ...result.items.map(({id}) => ({type: 'Recipe' as const, id})),
              {type: 'Recipe', id: 'LIST'},
            ]
          : [{type: 'Recipe', id: 'LIST'}],
    }),

    // Buscar receita por ID
    getRecipe: builder.query<Recipe, string>({
      query: id => `/recipes/${id}`,
      transformResponse: transformApiResponse<Recipe>,
      providesTags: (result, error, id) => [{type: 'Recipe', id}],
    }),

    // Criar receita
    createRecipe: builder.mutation<Recipe, CreateRecipeInput>({
      query: recipe => ({
        url: '/recipes',
        method: 'POST',
        body: recipe,
      }),
      transformResponse: transformApiResponse<Recipe>,
      invalidatesTags: [{type: 'Recipe', id: 'LIST'}],
    }),

    // Atualizar receita
    updateRecipe: builder.mutation<Recipe, UpdateRecipeInput>({
      query: ({id, ...patch}) => ({
        url: `/recipes/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      transformResponse: transformApiResponse<Recipe>,
      invalidatesTags: (result, error, {id}) => [
        {type: 'Recipe', id},
        {type: 'Recipe', id: 'LIST'},
      ],
    }),

    // Deletar receita
    deleteRecipe: builder.mutation<void, string>({
      query: id => ({
        url: `/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        {type: 'Recipe', id},
        {type: 'Recipe', id: 'LIST'},
      ],
    }),

    // Buscar receitas favoritas
    getFavoriteRecipes: builder.query<
      PaginatedResponse<Recipe>,
      {page?: number; limit?: number}
    >({
      query: params => ({
        url: '/recipes/favorites',
        params,
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: [{type: 'Recipe', id: 'FAVORITES'}],
    }),

    // Favoritar/desfavoritar receita
    toggleFavorite: builder.mutation<{isFavorite: boolean}, string>({
      query: recipeId => ({
        url: `/recipes/${recipeId}/favorite`,
        method: 'POST',
      }),
      transformResponse: transformApiResponse<{isFavorite: boolean}>,
      invalidatesTags: (result, error, recipeId) => [
        {type: 'Recipe', id: recipeId},
        {type: 'Recipe', id: 'FAVORITES'},
      ],
    }),

    // Avaliar receita
    rateRecipe: builder.mutation<Recipe, {recipeId: string; rating: number}>({
      query: ({recipeId, rating}) => ({
        url: `/recipes/${recipeId}/rate`,
        method: 'POST',
        body: {rating},
      }),
      transformResponse: transformApiResponse<Recipe>,
      invalidatesTags: (result, error, {recipeId}) => [
        {type: 'Recipe', id: recipeId},
      ],
    }),

    // Buscar receitas por categoria
    getRecipesByCategory: builder.query<
      PaginatedResponse<Recipe>,
      {
        category: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({category, ...params}) => ({
        url: `/recipes/category/${category}`,
        params,
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: (result, error, {category}) => [
        {type: 'Recipe', id: `CATEGORY_${category}`},
      ],
    }),

    // Buscar receitas por ingredientes
    getRecipesByIngredients: builder.query<
      PaginatedResponse<Recipe>,
      {
        ingredients: string[];
        page?: number;
        limit?: number;
      }
    >({
      query: ({ingredients, ...params}) => ({
        url: '/recipes/by-ingredients',
        method: 'POST',
        body: {ingredients},
        params,
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: [{type: 'Recipe', id: 'BY_INGREDIENTS'}],
    }),

    // Buscar receitas (texto)
    searchRecipes: builder.query<
      PaginatedResponse<Recipe>,
      {
        query: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({query, ...params}) => ({
        url: '/recipes/search',
        params: {q: query, ...params},
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: (result, error, {query}) => [
        {type: 'Recipe', id: `SEARCH_${query}`},
      ],
    }),

    // Importar receita
    importRecipe: builder.mutation<ImportRecipeResponse, ImportRecipeRequest>({
      query: importData => ({
        url: '/recipes/import',
        method: 'POST',
        body: importData,
      }),
      transformResponse: transformApiResponse<ImportRecipeResponse>,
    }),

    // Obter categorias disponíveis
    getCategories: builder.query<string[], void>({
      query: () => '/recipes/categories',
      transformResponse: transformApiResponse<string[]>,
      providesTags: [{type: 'Recipe', id: 'CATEGORIES'}],
    }),

    // Obter tags populares
    getPopularTags: builder.query<string[], void>({
      query: () => '/recipes/tags/popular',
      transformResponse: transformApiResponse<string[]>,
      providesTags: [{type: 'Recipe', id: 'TAGS'}],
    }),

    // Obter receitas do usuário
    getUserRecipes: builder.query<
      PaginatedResponse<Recipe>,
      {
        userId: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({userId, ...params}) => ({
        url: `/users/${userId}/recipes`,
        params,
      }),
      transformResponse: transformPaginatedResponse<Recipe>,
      providesTags: (result, error, {userId}) => [
        {type: 'Recipe', id: `USER_${userId}`},
      ],
    }),

    // Duplicar receita
    duplicateRecipe: builder.mutation<Recipe, string>({
      query: recipeId => ({
        url: `/recipes/${recipeId}/duplicate`,
        method: 'POST',
      }),
      transformResponse: transformApiResponse<Recipe>,
      invalidatesTags: [{type: 'Recipe', id: 'LIST'}],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useGetFavoriteRecipesQuery,
  useToggleFavoriteMutation,
  useRateRecipeMutation,
  useGetRecipesByCategoryQuery,
  useGetRecipesByIngredientsQuery,
  useSearchRecipesQuery,
  useImportRecipeMutation,
  useGetCategoriesQuery,
  useGetPopularTagsQuery,
  useGetUserRecipesQuery,
  useDuplicateRecipeMutation,
  useLazyGetRecipesQuery,
  useLazySearchRecipesQuery,
} = recipesApi;
