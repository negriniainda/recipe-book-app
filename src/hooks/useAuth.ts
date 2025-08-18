import {useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '@/store';
import {
  loginUser,
  registerUser,
  socialLogin,
  logoutUser,
  refreshToken,
  clearError,
  resetLoginAttempts,
  updateUser,
} from '@/store/slices/authSlice';
import {showToast} from '@/store/slices/uiSlice';
import {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from '@/services/authApi';
import {
  LoginCredentials,
  RegisterData,
  SocialLoginData,
  UpdateUserInput,
} from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(state => state.auth);

  // RTK Query hooks
  const {data: currentUser, refetch: refetchUser} = useGetCurrentUserQuery(
    undefined,
    {
      skip: !authState.isAuthenticated,
    },
  );

  const [updateProfile, {isLoading: isUpdatingProfile}] =
    useUpdateProfileMutation();
  const [changePassword, {isLoading: isChangingPassword}] =
    useChangePasswordMutation();
  const [deleteAccount, {isLoading: isDeletingAccount}] =
    useDeleteAccountMutation();

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const result = await dispatch(loginUser(credentials));

        if (loginUser.fulfilled.match(result)) {
          dispatch(
            showToast({
              message: 'Login realizado com sucesso!',
              type: 'success',
            }),
          );
          return {success: true, user: result.payload.user};
        } else {
          return {success: false, error: result.payload as string};
        }
      } catch (error) {
        return {success: false, error: 'Erro inesperado no login'};
      }
    },
    [dispatch],
  );

  // Registro
  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        const result = await dispatch(registerUser(userData));

        if (registerUser.fulfilled.match(result)) {
          dispatch(
            showToast({
              message: 'Conta criada com sucesso! Verifique seu email.',
              type: 'success',
            }),
          );
          return {success: true, user: result.payload.user};
        } else {
          return {success: false, error: result.payload as string};
        }
      } catch (error) {
        return {success: false, error: 'Erro inesperado no registro'};
      }
    },
    [dispatch],
  );

  // Login social
  const loginWithSocial = useCallback(
    async (socialData: SocialLoginData) => {
      try {
        const result = await dispatch(socialLogin(socialData));

        if (socialLogin.fulfilled.match(result)) {
          dispatch(
            showToast({
              message: 'Login social realizado com sucesso!',
              type: 'success',
            }),
          );
          return {success: true, user: result.payload.user};
        } else {
          return {success: false, error: result.payload as string};
        }
      } catch (error) {
        return {success: false, error: 'Erro inesperado no login social'};
      }
    },
    [dispatch],
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      dispatch(
        showToast({
          message: 'Logout realizado com sucesso!',
          type: 'success',
        }),
      );
      return {success: true};
    } catch (error) {
      return {success: false, error: 'Erro no logout'};
    }
  }, [dispatch]);

  // Atualizar perfil
  const updateUserProfile = useCallback(
    async (userData: UpdateUserInput) => {
      try {
        const result = await updateProfile(userData).unwrap();

        // Atualizar o estado local
        dispatch(updateUser(result));

        dispatch(
          showToast({
            message: 'Perfil atualizado com sucesso!',
            type: 'success',
          }),
        );

        return {success: true, user: result};
      } catch (error: any) {
        const errorMessage =
          error.data?.error?.message || 'Erro ao atualizar perfil';
        dispatch(
          showToast({
            message: errorMessage,
            type: 'error',
          }),
        );
        return {success: false, error: errorMessage};
      }
    },
    [updateProfile, dispatch],
  );

  // Alterar senha
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await changePassword({currentPassword, newPassword}).unwrap();

        dispatch(
          showToast({
            message: 'Senha alterada com sucesso!',
            type: 'success',
          }),
        );

        return {success: true};
      } catch (error: any) {
        const errorMessage =
          error.data?.error?.message || 'Erro ao alterar senha';
        dispatch(
          showToast({
            message: errorMessage,
            type: 'error',
          }),
        );
        return {success: false, error: errorMessage};
      }
    },
    [changePassword, dispatch],
  );

  // Deletar conta
  const removeAccount = useCallback(
    async (password: string) => {
      try {
        await deleteAccount({password}).unwrap();

        dispatch(
          showToast({
            message: 'Conta deletada com sucesso!',
            type: 'success',
          }),
        );

        return {success: true};
      } catch (error: any) {
        const errorMessage =
          error.data?.error?.message || 'Erro ao deletar conta';
        dispatch(
          showToast({
            message: errorMessage,
            type: 'error',
          }),
        );
        return {success: false, error: errorMessage};
      }
    },
    [deleteAccount, dispatch],
  );

  // Refresh token
  const refreshAuthToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshToken());

      if (refreshToken.fulfilled.match(result)) {
        return {success: true};
      } else {
        return {success: false, error: 'Token refresh failed'};
      }
    } catch (error) {
      return {success: false, error: 'Erro no refresh do token'};
    }
  }, [dispatch]);

  // Limpar erro
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Reset tentativas de login
  const resetAttempts = useCallback(() => {
    dispatch(resetLoginAttempts());
  }, [dispatch]);

  // Verificar se token está expirado
  const isTokenExpired = useCallback(() => {
    const {expiresAt} = authState.tokens;
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  }, [authState.tokens]);

  // Verificar se precisa fazer refresh
  const shouldRefreshToken = useCallback(() => {
    const {expiresAt} = authState.tokens;
    if (!expiresAt) return false;
    // Refresh 5 minutos antes de expirar
    return Date.now() >= expiresAt - 5 * 60 * 1000;
  }, [authState.tokens]);

  // Auto refresh token
  useEffect(() => {
    if (authState.isAuthenticated && shouldRefreshToken()) {
      refreshAuthToken();
    }
  }, [authState.isAuthenticated, shouldRefreshToken, refreshAuthToken]);

  // Verificar se usuário está bloqueado
  const isBlocked = authState.loginAttempts >= 5;
  const timeUntilUnblock =
    isBlocked && authState.lastLoginAttempt
      ? Math.max(0, authState.lastLoginAttempt + 15 * 60 * 1000 - Date.now())
      : 0;

  return {
    // Estado
    ...authState,
    currentUser,
    isBlocked,
    timeUntilUnblock,
    isTokenExpired: isTokenExpired(),
    shouldRefreshToken: shouldRefreshToken(),

    // Loading states
    isUpdatingProfile,
    isChangingPassword,
    isDeletingAccount,

    // Ações
    login,
    register,
    loginWithSocial,
    logout,
    updateUserProfile,
    updatePassword,
    removeAccount,
    refreshAuthToken,
    clearAuthError,
    resetAttempts,
    refetchUser,
  };
};

export default useAuth;
