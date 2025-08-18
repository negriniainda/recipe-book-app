import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {RootState} from '../types/store';
import {ApiResponse, PaginatedResponse} from '../types/api';

// Base query com configuração de autenticação
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  prepareHeaders: (headers, {getState}) => {
    // Adicionar token de autenticação se disponível
    const token = (getState() as RootState).auth.tokens.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Headers padrão
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');

    return headers;
  },
});

// Base query com retry e refresh token
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Se receber 401, tentar refresh do token
  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.tokens.refreshToken;

    if (refreshToken) {
      // Tentar refresh do token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: {refreshToken},
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        // Atualizar tokens no store
        api.dispatch({
          type: 'auth/setTokens',
          payload: refreshResult.data,
        });

        // Tentar novamente a requisição original
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh falhou, fazer logout
        api.dispatch({type: 'auth/logout'});
      }
    }
  }

  return result;
};

// Exportar baseQuery para uso em outras APIs
export {baseQuery, baseQueryWithReauth};

// API principal
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Recipe',
    'User',
    'MealPlan',
    'ShoppingList',
    'CommunityPost',
    'KitchenSession',
    'List',
    'Auth',
  ],
  endpoints: () => ({}),
});

// Tipos utilitários para endpoints
export type ApiEndpoint<T = any> = {
  query: (arg: any) => any;
  transformResponse?: (response: ApiResponse<T>) => T;
  transformErrorResponse?: (response: any) => any;
  providesTags?: any;
  invalidatesTags?: any;
};

export type PaginatedEndpoint<T = any> = {
  query: (arg: {page?: number; limit?: number; [key: string]: any}) => any;
  transformResponse?: (
    response: ApiResponse<PaginatedResponse<T>>,
  ) => PaginatedResponse<T>;
  providesTags?: any;
  invalidatesTags?: any;
};

// Transformadores de resposta padrão
export const transformApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.error?.message || 'API Error');
  }
  return response.data as T;
};

export const transformPaginatedResponse = <T>(
  response: ApiResponse<PaginatedResponse<T>>,
): PaginatedResponse<T> => {
  if (!response.success) {
    throw new Error(response.error?.message || 'API Error');
  }
  return response.data as PaginatedResponse<T>;
};

// Hook para invalidar tags
export const useInvalidateApiTags = () => {
  const dispatch = api.util.invalidateTags;
  return dispatch;
};
