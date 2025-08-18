import {api, transformApiResponse} from './api';
import {
  User,
  LoginCredentials,
  RegisterData,
  SocialLoginData,
  UpdateUserInput,
} from '@/types';
import {AuthResponse, RefreshTokenResponse} from '@/types/api';

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    // Login
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: transformApiResponse<AuthResponse>,
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Registro
    register: builder.mutation<AuthResponse, RegisterData>({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: transformApiResponse<AuthResponse>,
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Login social
    socialLogin: builder.mutation<AuthResponse, SocialLoginData>({
      query: socialData => ({
        url: '/auth/social',
        method: 'POST',
        body: socialData,
      }),
      transformResponse: transformApiResponse<AuthResponse>,
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Refresh token
    refreshToken: builder.mutation<
      RefreshTokenResponse,
      {refreshToken: string}
    >({
      query: ({refreshToken}) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: {refreshToken},
      }),
      transformResponse: transformApiResponse<RefreshTokenResponse>,
    }),

    // Logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Obter perfil atual
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: transformApiResponse<User>,
      providesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Atualizar perfil
    updateProfile: builder.mutation<User, UpdateUserInput>({
      query: userData => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: userData,
      }),
      transformResponse: transformApiResponse<User>,
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Alterar senha
    changePassword: builder.mutation<
      void,
      {
        currentPassword: string;
        newPassword: string;
      }
    >({
      query: passwordData => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Solicitar reset de senha
    requestPasswordReset: builder.mutation<void, {email: string}>({
      query: ({email}) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: {email},
      }),
    }),

    // Reset de senha
    resetPassword: builder.mutation<
      void,
      {
        token: string;
        newPassword: string;
      }
    >({
      query: resetData => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),

    // Verificar email
    verifyEmail: builder.mutation<void, {token: string}>({
      query: ({token}) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: {token},
      }),
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Reenviar verificação de email
    resendEmailVerification: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/resend-verification',
        method: 'POST',
      }),
    }),

    // Deletar conta
    deleteAccount: builder.mutation<void, {password: string}>({
      query: ({password}) => ({
        url: '/auth/delete-account',
        method: 'DELETE',
        body: {password},
      }),
      invalidatesTags: [{type: 'Auth', id: 'CURRENT'}],
    }),

    // Obter configurações de notificação
    getNotificationSettings: builder.query<User['notifications'], void>({
      query: () => '/auth/notifications',
      transformResponse: transformApiResponse<User['notifications']>,
      providesTags: [{type: 'Auth', id: 'NOTIFICATIONS'}],
    }),

    // Atualizar configurações de notificação
    updateNotificationSettings: builder.mutation<
      User['notifications'],
      Partial<User['notifications']>
    >({
      query: settings => ({
        url: '/auth/notifications',
        method: 'PATCH',
        body: settings,
      }),
      transformResponse: transformApiResponse<User['notifications']>,
      invalidatesTags: [
        {type: 'Auth', id: 'NOTIFICATIONS'},
        {type: 'Auth', id: 'CURRENT'},
      ],
    }),

    // Obter preferências do usuário
    getUserPreferences: builder.query<User['preferences'], void>({
      query: () => '/auth/preferences',
      transformResponse: transformApiResponse<User['preferences']>,
      providesTags: [{type: 'Auth', id: 'PREFERENCES'}],
    }),

    // Atualizar preferências do usuário
    updateUserPreferences: builder.mutation<
      User['preferences'],
      Partial<User['preferences']>
    >({
      query: preferences => ({
        url: '/auth/preferences',
        method: 'PATCH',
        body: preferences,
      }),
      transformResponse: transformApiResponse<User['preferences']>,
      invalidatesTags: [
        {type: 'Auth', id: 'PREFERENCES'},
        {type: 'Auth', id: 'CURRENT'},
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocialLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendEmailVerificationMutation,
  useDeleteAccountMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = authApi;
