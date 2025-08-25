import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  SyncStatus,
  SyncConflict,
  SyncOperation,
  BackupInfo,
  RestoreInfo,
  SyncSettings,
  DeviceInfo,
  SyncStats,
  InitiateSyncRequest,
  CreateBackupRequest,
  RestoreBackupRequest,
  ResolveConflictRequest,
  UpdateSyncSettingsRequest,
} from '../types/sync';

export const syncApi = createApi({
  reducerPath: 'syncApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/sync',
    prepareHeaders: (headers, { getState }) => {
      // Adicionar token de autenticação
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Sync', 'Backup', 'Restore', 'Conflict', 'Settings', 'Device'],
  endpoints: (builder) => ({
    // Status de sincronização
    getSyncStatus: builder.query<SyncStatus, void>({
      query: () => '/status',
      providesTags: ['Sync'],
    }),

    // Iniciar sincronização
    initiateSync: builder.mutation<
      { syncId: string; message: string },
      InitiateSyncRequest
    >({
      query: (data) => ({
        url: '/sync',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sync'],
    }),

    // Pausar sincronização
    pauseSync: builder.mutation<void, void>({
      query: () => ({
        url: '/sync/pause',
        method: 'POST',
      }),
      invalidatesTags: ['Sync'],
    }),

    // Retomar sincronização
    resumeSync: builder.mutation<void, void>({
      query: () => ({
        url: '/sync/resume',
        method: 'POST',
      }),
      invalidatesTags: ['Sync'],
    }),

    // Operações de sincronização
    getSyncOperations: builder.query<
      { operations: SyncOperation[]; hasMore: boolean },
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 20, status }) => ({
        url: '/operations',
        params: { page, limit, ...(status && { status }) },
      }),
      providesTags: ['Sync'],
    }),

    // Retentar operação falhada
    retryOperation: builder.mutation<SyncOperation, string>({
      query: (operationId) => ({
        url: `/operations/${operationId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['Sync'],
    }),

    // Cancelar operação
    cancelOperation: builder.mutation<void, string>({
      query: (operationId) => ({
        url: `/operations/${operationId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Sync'],
    }),

    // Conflitos de sincronização
    getSyncConflicts: builder.query<
      { conflicts: SyncConflict[]; hasMore: boolean },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/conflicts',
        params: { page, limit },
      }),
      providesTags: ['Conflict'],
    }),

    // Resolver conflito
    resolveConflict: builder.mutation<SyncConflict, ResolveConflictRequest>({
      query: (data) => ({
        url: `/conflicts/${data.conflictId}/resolve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conflict', 'Sync'],
    }),

    // Resolver todos os conflitos
    resolveAllConflicts: builder.mutation<
      { resolved: number },
      { resolution: 'local' | 'remote' | 'newest' }
    >({
      query: (data) => ({
        url: '/conflicts/resolve-all',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conflict', 'Sync'],
    }),

    // Configurações de sincronização
    getSyncSettings: builder.query<SyncSettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),

    updateSyncSettings: builder.mutation<SyncSettings, UpdateSyncSettingsRequest>({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Backups
    getBackups: builder.query<
      { backups: BackupInfo[]; hasMore: boolean },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/backups',
        params: { page, limit },
      }),
      providesTags: ['Backup'],
    }),

    createBackup: builder.mutation<BackupInfo, CreateBackupRequest>({
      query: (data) => ({
        url: '/backups',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Backup'],
    }),

    downloadBackup: builder.query<Blob, string>({
      query: (backupId) => ({
        url: `/backups/${backupId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    deleteBackup: builder.mutation<void, string>({
      query: (backupId) => ({
        url: `/backups/${backupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Backup'],
    }),

    // Restauração
    getRestores: builder.query<
      { restores: RestoreInfo[]; hasMore: boolean },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/restores',
        params: { page, limit },
      }),
      providesTags: ['Restore'],
    }),

    restoreBackup: builder.mutation<RestoreInfo, RestoreBackupRequest>({
      query: (data) => ({
        url: '/restores',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Restore', 'Sync'],
    }),

    getRestoreStatus: builder.query<RestoreInfo, string>({
      query: (restoreId) => `/restores/${restoreId}`,
      providesTags: (result, error, arg) => [{ type: 'Restore', id: arg }],
    }),

    cancelRestore: builder.mutation<void, string>({
      query: (restoreId) => ({
        url: `/restores/${restoreId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Restore'],
    }),

    // Dispositivos
    getDevices: builder.query<DeviceInfo[], void>({
      query: () => '/devices',
      providesTags: ['Device'],
    }),

    updateDeviceName: builder.mutation<
      DeviceInfo,
      { deviceId: string; name: string }
    >({
      query: ({ deviceId, name }) => ({
        url: `/devices/${deviceId}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['Device'],
    }),

    removeDevice: builder.mutation<void, string>({
      query: (deviceId) => ({
        url: `/devices/${deviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Device'],
    }),

    // Estatísticas
    getSyncStats: builder.query<SyncStats, void>({
      query: () => '/stats',
      providesTags: ['Sync'],
    }),

    // Cache offline
    getCacheInfo: builder.query<
      {
        size: number;
        itemsCount: number;
        lastUpdated: string;
        version: string;
      },
      void
    >({
      query: () => '/cache/info',
    }),

    clearCache: builder.mutation<void, void>({
      query: () => ({
        url: '/cache/clear',
        method: 'POST',
      }),
    }),

    refreshCache: builder.mutation<void, void>({
      query: () => ({
        url: '/cache/refresh',
        method: 'POST',
      }),
    }),

    // Verificação de conectividade
    checkConnectivity: builder.query<
      {
        isOnline: boolean;
        latency: number;
        serverStatus: 'healthy' | 'degraded' | 'down';
      },
      void
    >({
      query: () => '/connectivity',
    }),

    // Sincronização forçada de entidade específica
    forceSyncEntity: builder.mutation<
      void,
      { entityType: 'recipe' | 'list' | 'plan' | 'profile'; entityId: string }
    >({
      query: ({ entityType, entityId }) => ({
        url: `/sync/entity/${entityType}/${entityId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Sync'],
    }),

    // Reset completo de sincronização
    resetSync: builder.mutation<void, void>({
      query: () => ({
        url: '/sync/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Sync', 'Conflict'],
    }),

    // Importar dados de backup externo
    importBackup: builder.mutation<
      RestoreInfo,
      { file: File; conflictResolution?: 'skip' | 'replace' | 'merge' }
    >({
      query: ({ file, conflictResolution }) => {
        const formData = new FormData();
        formData.append('backup', file);
        if (conflictResolution) {
          formData.append('conflictResolution', conflictResolution);
        }
        
        return {
          url: '/import',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Restore', 'Sync'],
    }),

    // Verificar integridade dos dados
    verifyDataIntegrity: builder.mutation<
      {
        isValid: boolean;
        issues: Array<{
          type: 'missing' | 'corrupted' | 'orphaned';
          entityType: string;
          entityId: string;
          description: string;
        }>;
      },
      void
    >({
      query: () => ({
        url: '/verify',
        method: 'POST',
      }),
    }),

    // Reparar dados corrompidos
    repairData: builder.mutation<
      { repaired: number; failed: number },
      { issueIds: string[] }
    >({
      query: ({ issueIds }) => ({
        url: '/repair',
        method: 'POST',
        body: { issueIds },
      }),
      invalidatesTags: ['Sync'],
    }),

    // Configurar sincronização automática
    configureAutoSync: builder.mutation<
      void,
      {
        enabled: boolean;
        interval: number;
        wifiOnly: boolean;
        batteryOptimization: boolean;
      }
    >({
      query: (data) => ({
        url: '/auto-sync',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Logs de sincronização
    getSyncLogs: builder.query<
      {
        logs: Array<{
          id: string;
          timestamp: string;
          level: 'info' | 'warning' | 'error';
          message: string;
          details?: any;
        }>;
        hasMore: boolean;
      },
      { page?: number; limit?: number; level?: string }
    >({
      query: ({ page = 1, limit = 50, level }) => ({
        url: '/logs',
        params: { page, limit, ...(level && { level }) },
      }),
    }),

    // Exportar logs
    exportLogs: builder.query<Blob, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/logs/export',
        params: { startDate, endDate },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetSyncStatusQuery,
  useInitiateSyncMutation,
  usePauseSyncMutation,
  useResumeSyncMutation,
  useGetSyncOperationsQuery,
  useRetryOperationMutation,
  useCancelOperationMutation,
  useGetSyncConflictsQuery,
  useResolveConflictMutation,
  useResolveAllConflictsMutation,
  useGetSyncSettingsQuery,
  useUpdateSyncSettingsMutation,
  useGetBackupsQuery,
  useCreateBackupMutation,
  useLazyDownloadBackupQuery,
  useDeleteBackupMutation,
  useGetRestoresQuery,
  useRestoreBackupMutation,
  useGetRestoreStatusQuery,
  useCancelRestoreMutation,
  useGetDevicesQuery,
  useUpdateDeviceNameMutation,
  useRemoveDeviceMutation,
  useGetSyncStatsQuery,
  useGetCacheInfoQuery,
  useClearCacheMutation,
  useRefreshCacheMutation,
  useCheckConnectivityQuery,
  useForceSyncEntityMutation,
  useResetSyncMutation,
  useImportBackupMutation,
  useVerifyDataIntegrityMutation,
  useRepairDataMutation,
  useConfigureAutoSyncMutation,
  useGetSyncLogsQuery,
  useLazyExportLogsQuery,
} = syncApi;