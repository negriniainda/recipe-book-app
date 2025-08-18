import {Middleware} from '@reduxjs/toolkit';
import {RootState} from '@/types/store';
import {showToast} from '@/store/slices/uiSlice';

// Middleware para verificação automática de token
export const authMiddleware: Middleware<{}, RootState> =
  store => next => (action: any) => {
    const result = next(action);

    // Verificar token após cada ação
    const state = store.getState();
    const {isAuthenticated, tokens} = state.auth;

    if (isAuthenticated && tokens.expiresAt) {
      const now = Date.now();
      const expiresAt = tokens.expiresAt;
      const refreshThreshold = 5 * 60 * 1000; // 5 minutos

      // Se o token expirou
      if (now >= expiresAt) {
        console.warn('Token expired, logging out user');
        store.dispatch({type: 'auth/logout'});
        store.dispatch(
          showToast({
            message: 'Sessão expirada. Faça login novamente.',
            type: 'warning',
          }),
        );
      }
      // Se o token vai expirar em breve, tentar refresh
      else if (now >= expiresAt - refreshThreshold && tokens.refreshToken) {
        console.log('Token expiring soon, attempting refresh');
        store.dispatch({type: 'auth/refreshToken'});
      }
    }

    return result;
  };

// Middleware para persistir dados de autenticação
export const authPersistenceMiddleware: Middleware<{}, RootState> =
  store => next => (action: any) => {
    const result = next(action);

    // Salvar dados importantes no AsyncStorage quando necessário
    if (action.type && action.type.startsWith('auth/')) {
      const state = store.getState();
      const {user, isAuthenticated} = state.auth;

      // Aqui você pode implementar lógica adicional de persistência
      // Por exemplo, salvar preferências do usuário, configurações, etc.
      if (isAuthenticated && user) {
        // Salvar última atividade do usuário
        const lastActivity = {
          timestamp: Date.now(),
          userId: user.id,
        };

        // AsyncStorage.setItem('lastActivity', JSON.stringify(lastActivity));
      }
    }

    return result;
  };

// Middleware para logging de ações de autenticação
export const authLoggingMiddleware: Middleware<{}, RootState> =
  store => next => (action: any) => {
    // Log apenas ações de autenticação em desenvolvimento
    if (__DEV__ && action.type && action.type.startsWith('auth/')) {
      const state = store.getState();
      const {isAuthenticated, user} = state.auth;

      console.group(`🔐 Auth Action: ${action.type}`);
      console.log('Action:', action);
      console.log('Current auth state:', {isAuthenticated, userId: user?.id});
      console.groupEnd();
    }

    return next(action);
  };

// Middleware para validação de sessão
export const sessionValidationMiddleware: Middleware<{}, RootState> =
  store => next => (action: any) => {
    const result = next(action);

    // Validar sessão em ações críticas
    const criticalActions = [
      'recipes/createRecipe',
      'recipes/updateRecipe',
      'recipes/deleteRecipe',
      'planning/createMealPlan',
      'planning/createShoppingList',
    ];

    if (
      action.type &&
      criticalActions.some(actionType => action.type.startsWith(actionType))
    ) {
      const state = store.getState();
      const {isAuthenticated, tokens} = state.auth;

      if (!isAuthenticated || !tokens.accessToken) {
        console.warn('Attempted critical action without authentication');
        store.dispatch(
          showToast({
            message: 'Você precisa estar logado para realizar esta ação.',
            type: 'warning',
          }),
        );

        // Retornar ação de não autorizado
        return {type: 'auth/unauthorized'};
      }
    }

    return result;
  };

// Middleware combinado para autenticação
export const createAuthMiddleware = () => {
  const middlewares = [authMiddleware, authPersistenceMiddleware];

  if (__DEV__) {
    middlewares.push(authLoggingMiddleware);
  }

  middlewares.push(sessionValidationMiddleware);

  return middlewares;
};
