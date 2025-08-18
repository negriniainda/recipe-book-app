import {isRejectedWithValue} from '@reduxjs/toolkit';
import type {Middleware} from '@reduxjs/toolkit';
import {showToast} from '@/store/slices/uiSlice';
// import { logoutUser } from '@/store/slices/authSlice';
import {ErrorCodes} from '@/types/enums';

// Middleware para tratamento global de erros da API
export const rtkQueryErrorLogger: Middleware = api => next => (action: any) => {
  // RTK Query usa `createAsyncThunk` internamente, então podemos capturar erros rejeitados
  if (isRejectedWithValue(action)) {
    const {payload, meta} = action;

    // Extrair informações do erro
    const error =
      (payload as any)?.data?.error || (payload as any)?.error || payload;
    const status = (payload as any)?.status;
    const endpointName = (meta as any)?.arg?.endpointName;

    console.warn('API Error:', {
      endpoint: endpointName,
      status,
      error,
      action: action.type,
    });

    // Tratamento específico por código de erro
    if (error?.code) {
      switch (error.code) {
        case ErrorCodes.TOKEN_EXPIRED:
        case ErrorCodes.UNAUTHORIZED:
          // Token expirado ou não autorizado - fazer logout
          api.dispatch({type: 'auth/logout'});
          api.dispatch(
            showToast({
              message: 'Sessão expirada. Faça login novamente.',
              type: 'warning',
            }),
          );
          break;

        case ErrorCodes.NETWORK_ERROR:
          api.dispatch(
            showToast({
              message: 'Erro de conexão. Verifique sua internet.',
              type: 'error',
            }),
          );
          break;

        case ErrorCodes.RATE_LIMIT_EXCEEDED:
          api.dispatch(
            showToast({
              message: 'Muitas tentativas. Tente novamente em alguns minutos.',
              type: 'warning',
            }),
          );
          break;

        case ErrorCodes.SERVICE_UNAVAILABLE:
          api.dispatch(
            showToast({
              message: 'Serviço temporariamente indisponível.',
              type: 'error',
            }),
          );
          break;

        default:
          // Erro genérico com mensagem específica
          if (error.message && !isAuthEndpoint(endpointName)) {
            api.dispatch(
              showToast({
                message: error.message,
                type: 'error',
              }),
            );
          }
      }
    } else if (status) {
      // Tratamento por status HTTP
      switch (status) {
        case 401:
          api.dispatch({type: 'auth/logout'});
          api.dispatch(
            showToast({
              message: 'Sessão expirada. Faça login novamente.',
              type: 'warning',
            }),
          );
          break;

        case 403:
          api.dispatch(
            showToast({
              message: 'Acesso negado.',
              type: 'error',
            }),
          );
          break;

        case 404:
          if (!isAuthEndpoint(endpointName)) {
            api.dispatch(
              showToast({
                message: 'Recurso não encontrado.',
                type: 'error',
              }),
            );
          }
          break;

        case 422:
          // Erro de validação - não mostrar toast genérico
          // O componente deve tratar especificamente
          break;

        case 429:
          api.dispatch(
            showToast({
              message: 'Muitas tentativas. Tente novamente em alguns minutos.',
              type: 'warning',
            }),
          );
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          api.dispatch(
            showToast({
              message: 'Erro interno do servidor. Tente novamente.',
              type: 'error',
            }),
          );
          break;

        default:
          if (status >= 400 && !isAuthEndpoint(endpointName)) {
            api.dispatch(
              showToast({
                message: error?.message || 'Erro inesperado.',
                type: 'error',
              }),
            );
          }
      }
    }
  }

  return next(action);
};

// Verificar se é um endpoint de autenticação (não mostrar toast para alguns erros)
const isAuthEndpoint = (endpointName?: string): boolean => {
  const authEndpoints = ['login', 'register', 'socialLogin', 'refreshToken'];
  return authEndpoints.includes(endpointName || '');
};

// Middleware para logging de ações (desenvolvimento)
export const actionLogger: Middleware = api => next => (action: any) => {
  if (__DEV__) {
    console.log('Action dispatched:', action.type, action.payload);
  }
  return next(action);
};

// Middleware para retry automático em caso de falha de rede
export const retryMiddleware: Middleware = api => next => action => {
  // Implementar retry logic se necessário
  // Por enquanto, apenas passa a ação adiante
  return next(action);
};
