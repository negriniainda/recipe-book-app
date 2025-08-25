import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  PrivacySettings,
  NotificationSettings,
  BlockedUser,
  DataExportRequest,
  AccountDeletionRequest,
  RecipePrivacySettings,
  UpdatePrivacySettingsRequest,
  UpdateNotificationSettingsRequest,
  UpdateRecipePrivacyRequest,
  BlockUserRequest,
  RequestDataExportRequest,
  RequestAccountDeletionRequest,
} from '../types/privacy';

export const privacyApi = createApi({
  reducerPath: 'privacyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/privacy',
    prepareHeaders: (headers, { getState }) => {
      // Adicionar token de autenticação
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Privacy', 'Notifications', 'BlockedUsers', 'DataExport', 'AccountDeletion'],
  endpoints: (builder) => ({
    // Configurações de privacidade
    getPrivacySettings: builder.query<PrivacySettings, void>({
      query: () => '/settings',
      providesTags: ['Privacy'],
    }),

    updatePrivacySettings: builder.mutation<
      PrivacySettings,
      UpdatePrivacySettingsRequest
    >({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Privacy'],
    }),

    // Configurações de notificações
    getNotificationSettings: builder.query<NotificationSettings, void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),

    updateNotificationSettings: builder.mutation<
      NotificationSettings,
      UpdateNotificationSettingsRequest
    >({
      query: (data) => ({
        url: '/notifications',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Privacidade de receitas
    getRecipePrivacySettings: builder.query<
      RecipePrivacySettings[],
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 50 }) => ({
        url: '/recipes',
        params: { page, limit },
      }),
      providesTags: ['Privacy'],
    }),

    updateRecipePrivacy: builder.mutation<
      RecipePrivacySettings,
      UpdateRecipePrivacyRequest
    >({
      query: (data) => ({
        url: `/recipes/${data.recipeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Privacy'],
    }),

    bulkUpdateRecipePrivacy: builder.mutation<
      { updated: number },
      { recipeIds: string[]; settings: Omit<UpdateRecipePrivacyRequest, 'recipeId'> }
    >({
      query: ({ recipeIds, settings }) => ({
        url: '/recipes/bulk',
        method: 'PUT',
        body: { recipeIds, ...settings },
      }),
      invalidatesTags: ['Privacy'],
    }),

    // Usuários bloqueados
    getBlockedUsers: builder.query<
      { users: BlockedUser[]; hasMore: boolean },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/blocked-users',
        params: { page, limit },
      }),
      providesTags: ['BlockedUsers'],
    }),

    blockUser: builder.mutation<BlockedUser, BlockUserRequest>({
      query: (data) => ({
        url: '/blocked-users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BlockedUsers'],
    }),

    unblockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/blocked-users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BlockedUsers'],
    }),

    // Exportação de dados
    getDataExports: builder.query<DataExportRequest[], void>({
      query: () => '/data-exports',
      providesTags: ['DataExport'],
    }),

    requestDataExport: builder.mutation<
      DataExportRequest,
      RequestDataExportRequest
    >({
      query: (data) => ({
        url: '/data-exports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DataExport'],
    }),

    downloadDataExport: builder.query<Blob, string>({
      query: (exportId) => ({
        url: `/data-exports/${exportId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    deleteDataExport: builder.mutation<void, string>({
      query: (exportId) => ({
        url: `/data-exports/${exportId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DataExport'],
    }),

    // Exclusão de conta
    getAccountDeletionRequest: builder.query<AccountDeletionRequest | null, void>({
      query: () => '/account-deletion',
      providesTags: ['AccountDeletion'],
    }),

    requestAccountDeletion: builder.mutation<
      AccountDeletionRequest,
      RequestAccountDeletionRequest
    >({
      query: (data) => ({
        url: '/account-deletion',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AccountDeletion'],
    }),

    cancelAccountDeletion: builder.mutation<void, void>({
      query: () => ({
        url: '/account-deletion',
        method: 'DELETE',
      }),
      invalidatesTags: ['AccountDeletion'],
    }),

    // Verificação de privacidade
    checkRecipeAccess: builder.query<
      { canView: boolean; canEdit: boolean; canComment: boolean },
      { recipeId: string; userId?: string }
    >({
      query: ({ recipeId, userId }) => ({
        url: `/check-access/recipe/${recipeId}`,
        params: userId ? { userId } : {},
      }),
    }),

    checkUserAccess: builder.query<
      { canView: boolean; canMessage: boolean; canFollow: boolean },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/check-access/user/${userId}`,
      }),
    }),

    // Relatórios de privacidade
    getPrivacyReport: builder.query<
      {
        totalRecipes: number;
        publicRecipes: number;
        privateRecipes: number;
        friendsRecipes: number;
        blockedUsers: number;
        dataExports: number;
        lastExport?: string;
        accountCreated: string;
      },
      void
    >({
      query: () => '/report',
      providesTags: ['Privacy'],
    }),

    // Configurações rápidas
    setAllRecipesPrivate: builder.mutation<{ updated: number }, void>({
      query: () => ({
        url: '/quick-actions/make-all-private',
        method: 'POST',
      }),
      invalidatesTags: ['Privacy'],
    }),

    setAllRecipesPublic: builder.mutation<{ updated: number }, void>({
      query: () => ({
        url: '/quick-actions/make-all-public',
        method: 'POST',
      }),
      invalidatesTags: ['Privacy'],
    }),

    disableAllNotifications: builder.mutation<NotificationSettings, void>({
      query: () => ({
        url: '/quick-actions/disable-notifications',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    enableEssentialNotifications: builder.mutation<NotificationSettings, void>({
      query: () => ({
        url: '/quick-actions/enable-essential',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Auditoria de privacidade
    getPrivacyAuditLog: builder.query<
      {
        logs: Array<{
          id: string;
          action: string;
          details: string;
          ipAddress: string;
          userAgent: string;
          createdAt: string;
        }>;
        hasMore: boolean;
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/audit-log',
        params: { page, limit },
      }),
    }),

    // Configurações de terceiros
    getThirdPartyConnections: builder.query<
      Array<{
        id: string;
        provider: string;
        name: string;
        permissions: string[];
        connectedAt: string;
        lastUsed?: string;
      }>,
      void
    >({
      query: () => '/third-party-connections',
    }),

    revokeThirdPartyConnection: builder.mutation<void, string>({
      query: (connectionId) => ({
        url: `/third-party-connections/${connectionId}`,
        method: 'DELETE',
      }),
    }),

    // Configurações de cookies e tracking
    getCookieSettings: builder.query<
      {
        essential: boolean;
        analytics: boolean;
        marketing: boolean;
        personalization: boolean;
        updatedAt: string;
      },
      void
    >({
      query: () => '/cookies',
    }),

    updateCookieSettings: builder.mutation<
      {
        essential: boolean;
        analytics: boolean;
        marketing: boolean;
        personalization: boolean;
        updatedAt: string;
      },
      {
        analytics?: boolean;
        marketing?: boolean;
        personalization?: boolean;
      }
    >({
      query: (data) => ({
        url: '/cookies',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetRecipePrivacySettingsQuery,
  useUpdateRecipePrivacyMutation,
  useBulkUpdateRecipePrivacyMutation,
  useGetBlockedUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetDataExportsQuery,
  useRequestDataExportMutation,
  useLazyDownloadDataExportQuery,
  useDeleteDataExportMutation,
  useGetAccountDeletionRequestQuery,
  useRequestAccountDeletionMutation,
  useCancelAccountDeletionMutation,
  useCheckRecipeAccessQuery,
  useCheckUserAccessQuery,
  useGetPrivacyReportQuery,
  useSetAllRecipesPrivateMutation,
  useSetAllRecipesPublicMutation,
  useDisableAllNotificationsMutation,
  useEnableEssentialNotificationsMutation,
  useGetPrivacyAuditLogQuery,
  useGetThirdPartyConnectionsQuery,
  useRevokeThirdPartyConnectionMutation,
  useGetCookieSettingsQuery,
  useUpdateCookieSettingsMutation,
} = privacyApi;