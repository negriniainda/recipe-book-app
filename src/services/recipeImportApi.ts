import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  ImportRecipeRequest,
  ImportRecipeResponse,
  Recipe,
  CreateRecipeInput,
} from '../types';

export const recipeImportApi = createApi({
  reducerPath: 'recipeImportApi',
  baseQuery,
  tagTypes: ['Import'],
  endpoints: builder => ({
    // Importar receita de URL
    importFromUrl: builder.mutation<ImportRecipeResponse, {url: string; options?: any}>({
      query: ({url, options}) => ({
        url: '/recipes/import/url',
        method: 'POST',
        body: {
          source: 'url',
          data: url,
          options: {
            extractNutrition: true,
            autoCategories: true,
            language: 'pt-BR',
            ...options,
          },
        } as ImportRecipeRequest,
      }),
    }),

    // Importar receita de texto
    importFromText: builder.mutation<ImportRecipeResponse, {text: string; options?: any}>({
      query: ({text, options}) => ({
        url: '/recipes/import/text',
        method: 'POST',
        body: {
          source: 'text',
          data: text,
          options: {
            extractNutrition: false,
            autoCategories: true,
            language: 'pt-BR',
            ...options,
          },
        } as ImportRecipeRequest,
      }),
    }),

    // Importar receita de imagem
    importFromImage: builder.mutation<ImportRecipeResponse, {imageBase64: string; options?: any}>({
      query: ({imageBase64, options}) => ({
        url: '/recipes/import/image',
        method: 'POST',
        body: {
          source: 'image',
          data: imageBase64,
          options: {
            extractNutrition: false,
            autoCategories: true,
            language: 'pt-BR',
            ...options,
          },
        } as ImportRecipeRequest,
      }),
    }),

    // Importar de redes sociais
    importFromSocial: builder.mutation<
      ImportRecipeResponse,
      {
        platform: 'instagram' | 'tiktok' | 'youtube';
        url: string;
        options?: any;
      }
    >({
      query: ({platform, url, options}) => ({
        url: `/recipes/import/social/${platform}`,
        method: 'POST',
        body: {
          url,
          options: {
            extractVideo: true,
            extractImages: true,
            extractHashtags: true,
            language: 'pt-BR',
            ...options,
          },
        },
      }),
    }),

    // Validar URL antes da importação
    validateUrl: builder.query<
      {
        isValid: boolean;
        isSupported: boolean;
        platform?: string;
        title?: string;
        description?: string;
        image?: string;
      },
      string
    >({
      query: url => ({
        url: '/recipes/import/validate',
        params: {url},
      }),
    }),

    // Obter sites suportados
    getSupportedSites: builder.query<
      Array<{
        name: string;
        domain: string;
        logo?: string;
        features: string[];
        popular: boolean;
      }>,
      void
    >({
      query: () => '/recipes/import/supported-sites',
    }),

    // Salvar receita importada
    saveImportedRecipe: builder.mutation<Recipe, CreateRecipeInput>({
      query: recipeData => ({
        url: '/recipes',
        method: 'POST',
        body: recipeData,
      }),
      invalidatesTags: ['Import'],
    }),

    // Histórico de importações
    getImportHistory: builder.query<
      Array<{
        id: string;
        source: string;
        url?: string;
        title: string;
        status: 'success' | 'failed' | 'pending';
        createdAt: Date;
        recipe?: Recipe;
      }>,
      {page?: number; limit?: number}
    >({
      query: ({page = 1, limit = 20}) => ({
        url: '/recipes/import/history',
        params: {page, limit},
      }),
      providesTags: ['Import'],
    }),

    // Retry importação falhada
    retryImport: builder.mutation<ImportRecipeResponse, string>({
      query: importId => ({
        url: `/recipes/import/retry/${importId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Import'],
    }),
  }),
});

export const {
  useImportFromUrlMutation,
  useImportFromTextMutation,
  useImportFromImageMutation,
  useImportFromSocialMutation,
  useValidateUrlQuery,
  useGetSupportedSitesQuery,
  useSaveImportedRecipeMutation,
  useGetImportHistoryQuery,
  useRetryImportMutation,
} = recipeImportApi;